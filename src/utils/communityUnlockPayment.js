import { apiPost, getAuthToken } from "./api";
import {
  isMockPaymentsEnabled,
  buildMockBookingVerifyPayload,
} from "./mockPayments";

const RAZORPAY_KEY =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SVXnEDUa7IpGc8";

async function verifyUnlockPayment(verifyData) {
  const result = await apiPost("/communities/access/verify", verifyData);
  if (!result?.success) {
    throw new Error(result?.message || "Payment verification failed");
  }
  return result.data;
}

async function runMockPayment(orderId) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return verifyUnlockPayment(buildMockBookingVerifyPayload(orderId));
}

function openRazorpayCheckout({ orderId, amount, keyId, user }) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(
        new Error("Payment gateway is loading. Please try again in a moment."),
      );
      return;
    }

    const options = {
      key: keyId || RAZORPAY_KEY,
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "Mejoric",
      description: "Community access — one-time unlock",
      image: "https://mejoric.com/logo512.png",
      order_id: orderId,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.mobile ? String(user.mobile) : "",
      },
      handler: async (response) => {
        try {
          const data = await verifyUnlockPayment({
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
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      reject(new Error(response.error?.description || "Payment failed"));
    });
    razorpay.open();
  });
}

/**
 * Ensure community access is unlocked.
 * Tries wallet (excludes welcome balance on server); falls back to Razorpay ₹100.
 */
export async function ensureCommunityUnlocked(user) {
  if (!getAuthToken()) {
    throw new Error("Please log in to unlock communities");
  }

  const unlockResult = await apiPost("/communities/access/unlock", {});
  if (!unlockResult?.success) {
    throw new Error(unlockResult?.message || "Failed to unlock community");
  }

  if (unlockResult.data?.unlocked) {
    return unlockResult.data;
  }

  if (!unlockResult.data?.requiresPayment) {
    throw new Error(unlockResult.message || "Unable to unlock community");
  }

  const orderResult = await apiPost("/communities/access/create-order", {});
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
    return runMockPayment(razorpayOrderId);
  }

  return openRazorpayCheckout({
    orderId: razorpayOrderId,
    amount: amount || 100,
    keyId,
    user,
  });
}
