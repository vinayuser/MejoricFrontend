import { apiPost, getAuthToken } from "./api";
import {
  isMockPaymentsEnabled,
  buildMockBookingVerifyPayload,
} from "./mockPayments";

const RAZORPAY_KEY =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SVXnEDUa7IpGc8";

async function verifyTherapyPayment(verifyData) {
  const result = await apiPost("/therapy/verify-payment", verifyData);
  if (!result?.success) {
    throw new Error(result?.message || "Payment verification failed");
  }
  return result.data;
}

function openRazorpayCheckout({ orderId, amount, keyId, theme, user }) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(
        new Error("Payment gateway is loading. Please try again in a moment."),
      );
      return;
    }
    const razorpay = new window.Razorpay({
      key: keyId || RAZORPAY_KEY,
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "Mejoric",
      description: `Group therapy: ${theme}`,
      image: "https://mejoric.com/logo512.png",
      order_id: orderId,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.mobile ? String(user.mobile) : "",
      },
      handler: async (response) => {
        try {
          const data = await verifyTherapyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });
    razorpay.on("payment.failed", (response) => {
      reject(new Error(response.error?.description || "Payment failed"));
    });
    razorpay.open();
  });
}

/**
 * Enroll in therapy cohort: wallet first (excl. welcome), else Razorpay.
 */
export async function enrollInTherapyCohort({ cohortId, theme, price, user }) {
  if (!getAuthToken()) {
    throw new Error("Please log in to enrol in group therapy");
  }

  const walletResult = await apiPost(`/therapy/${cohortId}/enroll-wallet`, {});
  if (!walletResult?.success) {
    throw new Error(walletResult?.message || "Enrollment failed");
  }
  if (walletResult.data?.enrolled || walletResult.data?.waitlisted) {
    return walletResult.data;
  }
  if (!walletResult.data?.requiresPayment) {
    throw new Error(walletResult.message || "Unable to enrol");
  }

  const orderResult = await apiPost(`/therapy/${cohortId}/order/create`, {});
  if (!orderResult?.success) {
    throw new Error(orderResult?.message || "Failed to create payment order");
  }

  const { razorpayOrderId, amount, keyId, mockPayments } = orderResult.data;
  const useMock = isMockPaymentsEnabled();

  if (mockPayments === true && !useMock) {
    throw new Error(
      "Server is still in mock payment mode. Set ALLOW_MOCK_PAYMENTS=false and IS_STAGING=false on the API, then restart.",
    );
  }

  if (useMock || mockPayments) {
    await new Promise((r) => setTimeout(r, 600));
    return verifyTherapyPayment(buildMockBookingVerifyPayload(razorpayOrderId));
  }

  return openRazorpayCheckout({
    orderId: razorpayOrderId,
    amount: amount || price,
    keyId,
    theme: theme || "Group therapy",
    user,
  });
}
