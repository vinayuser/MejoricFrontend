import { apiGet } from "./api";
import { isCorporateUser, canCorporateUserChat } from "./corporateAccess";

const CHAT_PRICE_PER_MIN =
  parseInt(import.meta.env.VITE_CHAT_PRICE_PER_MIN, 10) || 8;

export function canStartUserChat({
  user,
  guestTrialExhausted,
  walletBalance,
  corporateUsage,
}) {
  if (!user) return false;
  if (user.role === "guest") return !guestTrialExhausted;
  if (user.role === "user") {
    if (isCorporateUser(user)) {
      return canCorporateUserChat(corporateUsage);
    }
    return walletBalance >= CHAT_PRICE_PER_MIN;
  }
  return true;
}

export function getSignupChatBlockMessage(_signupTrialExhausted, walletBalance = 0, user = null) {
  if (isCorporateUser(user)) {
    return "Your company's chat minutes have been used up. Please contact your administrator.";
  }
  if (walletBalance < CHAT_PRICE_PER_MIN) {
    return `You need at least ₹${CHAT_PRICE_PER_MIN} in your wallet to chat (₹${CHAT_PRICE_PER_MIN} per minute). Please recharge to continue.`;
  }
  return "Please recharge your wallet to start chat sessions.";
}

/** Fetch latest wallet state from server (use before blocking chat). */
export async function resolveUserChatAccess(user, corporateUsage = null) {
  if (!user || user.role !== "user") {
    return {
      canChat: false,
      walletBalance: 0,
      corporateUsage,
    };
  }

  if (isCorporateUser(user)) {
    let usage = corporateUsage;
    if (!usage) {
      try {
        const usageRes = await apiGet("/corporate/me/usage");
        usage = usageRes?.data ?? null;
      } catch {
        usage = null;
      }
    }
    return {
      canChat: canCorporateUserChat(usage),
      walletBalance: 0,
      corporateUsage: usage,
    };
  }

  const walletRes = await apiGet("/wallet");
  const walletBalance = walletRes?.data?.balances?.INR ?? 0;

  const canChat = canStartUserChat({
    user,
    guestTrialExhausted: false,
    walletBalance,
    corporateUsage: null,
  });

  return {
    canChat,
    walletBalance,
    corporateUsage: null,
  };
}
