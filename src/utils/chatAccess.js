import { apiGet } from "./api";

const CHAT_PRICE_PER_MIN =
  parseInt(import.meta.env.VITE_CHAT_PRICE_PER_MIN, 10) || 8;

export function canStartUserChat({
  user,
  guestTrialExhausted,
  walletBalance,
}) {
  if (!user) return false;
  if (user.role === "guest") return !guestTrialExhausted;
  if (user.role === "user") {
    return walletBalance >= CHAT_PRICE_PER_MIN;
  }
  return true;
}

export function getSignupChatBlockMessage(_signupTrialExhausted, walletBalance = 0) {
  if (walletBalance < CHAT_PRICE_PER_MIN) {
    return `You need at least ₹${CHAT_PRICE_PER_MIN} in your wallet to chat (₹${CHAT_PRICE_PER_MIN} per minute). Please recharge to continue.`;
  }
  return "Please recharge your wallet to start chat sessions.";
}

/** Fetch latest wallet state from server (use before blocking chat). */
export async function resolveUserChatAccess(user) {
  if (!user || user.role !== "user") {
    return {
      canChat: false,
      walletBalance: 0,
    };
  }

  const walletRes = await apiGet("/wallet");
  const walletBalance = walletRes?.data?.balances?.INR ?? 0;

  const canChat = canStartUserChat({
    user,
    guestTrialExhausted: false,
    walletBalance,
  });

  return {
    canChat,
    walletBalance,
  };
}
