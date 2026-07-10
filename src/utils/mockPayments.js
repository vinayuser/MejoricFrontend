/** Use mock checkout when staging flag is set or running on localhost. */
export function isMockPaymentsEnabled() {
  return (
    import.meta.env.VITE_ALLOW_MOCK_PAYMENTS === "true" ||
    import.meta.env.VITE_IS_STAGING === "true" ||
    import.meta.env.VITE_APP_ENV === "local" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

export function buildMockWalletVerifyPayload(orderId, amount, currency = "INR") {
  return {
    razorpayOrderId: orderId,
    razorpayPaymentId: `mock_pay_${Date.now()}`,
    razorpaySignature: "mock_signature",
    amount: parseFloat(amount),
    currency,
  };
}

export function buildMockBookingVerifyPayload(orderId) {
  return {
    razorpayOrderId: orderId,
    razorpayPaymentId: `mock_${Date.now()}`,
    razorpaySignature: "mock_signature",
  };
}
