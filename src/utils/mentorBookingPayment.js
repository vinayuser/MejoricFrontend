import { apiPost, getAuthToken } from "./api";
import {
  isMockPaymentsEnabled,
  buildMockBookingVerifyPayload,
} from "./mockPayments";

const RAZORPAY_KEY =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SVXnEDUa7IpGc8";

function buildBookingPayload({
  mentorId,
  slot,
  sessionFormat,
  sessionPrice,
  guestDetails,
}) {
  return {
    mentorId,
    scheduledAt: slot.startsAt,
    slotLabel: slot.label,
    dateKey: slot.dateKey,
    slotId: slot.id,
    sessionFormat,
    sessionPrice,
    guestDetails: {
      fullName: guestDetails.fullName,
      email: guestDetails.email,
      phone: guestDetails.phone,
      gender: guestDetails.gender,
      age: guestDetails.age,
      budget: guestDetails.budget,
      referral: guestDetails.referral,
      supportNeeds: guestDetails.supportNeeds || "",
    },
  };
}

async function verifyBookingPayment(verifyData) {
  const result = await apiPost("/bookings/verify-payment", verifyData);
  if (!result?.success) {
    throw new Error(result?.message || "Payment verification failed");
  }
  return result.data;
}

async function runMockPayment(orderId) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return verifyBookingPayment(buildMockBookingVerifyPayload(orderId));
}

function openRazorpayCheckout({
  orderId,
  amount,
  keyId,
  mentorName,
  user,
}) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Payment gateway is loading. Please try again in a moment."));
      return;
    }

    const options = {
      key: keyId || RAZORPAY_KEY,
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "Mejoric",
      description: `Mentor session with ${mentorName}`,
      image: "https://mejoric.com/logo512.png",
      order_id: orderId,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.mobile ? String(user.mobile) : "",
      },
      handler: async (response) => {
        try {
          const booking = await verifyBookingPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          resolve(booking);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment cancelled"));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      reject(new Error(response.error?.description || "Payment failed"));
    });
    razorpay.open();
  });
}

export async function payAndBookMentorSession({
  mentorId,
  slot,
  sessionFormat,
  sessionPrice,
  guestDetails,
  mentorName = "Mentor",
  user,
}) {
  if (!getAuthToken()) {
    throw new Error("Please log in to book a session");
  }

  const payload = buildBookingPayload({
    mentorId,
    slot,
    sessionFormat,
    sessionPrice,
    guestDetails,
  });

  const orderResult = await apiPost("/bookings/order/create", payload);
  if (!orderResult?.success) {
    throw new Error(orderResult?.message || "Failed to create payment order");
  }

  const { razorpayOrderId, amount, keyId, mockPayments } = orderResult.data;
  const payAmount = amount ?? sessionPrice;
  const useMock = mockPayments === true || isMockPaymentsEnabled();

  if (useMock) {
    return runMockPayment(razorpayOrderId);
  }

  return openRazorpayCheckout({
    orderId: razorpayOrderId,
    amount: payAmount,
    keyId,
    mentorName,
    user,
  });
}
