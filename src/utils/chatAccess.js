import { apiGet } from "./api";

export function canStartUserChat({
  user,
  guestTrialExhausted,
  isWithinSignupTrial,
  hasPaidRecharge,
  walletBalance,
}) {
  if (!user) return false;
  if (user.role === "guest") return !guestTrialExhausted;
  if (user.role === "user") {
    if (isWithinSignupTrial) return true;
    // After free trial: paid recharge + balance required (server enforces the same)
    if (hasPaidRecharge && walletBalance > 0) return true;
    return false;
  }
  return true;
}

export function getSignupChatBlockMessage(signupTrialExhausted, walletBalance = 0) {
  if (signupTrialExhausted) {
    if (walletBalance > 0) {
      return "Your free chat period has ended. Refresh the page to continue with your wallet balance.";
    }
    return "Your free 10-minute signup chat period has ended. Please recharge your wallet to continue chatting.";
  }
  return "Please recharge your wallet to start chat sessions.";
}

/** Fetch latest trial + wallet state from server (use before blocking chat). */
export async function resolveUserChatAccess(user) {
  if (!user || user.role !== "user") {
    return {
      canChat: false,
      isWithinSignupTrial: false,
      hasPaidRecharge: false,
      signupTrialExhausted: false,
      walletBalance: 0,
    };
  }

  const [trialRes, walletRes] = await Promise.all([
    apiGet("/auth/check-signup-trial"),
    apiGet("/wallet"),
  ]);

  const isWithinSignupTrial = Boolean(trialRes?.data?.isWithinTrial);
  const hasPaidRecharge = Boolean(trialRes?.data?.hasPaidRecharge);
  const signupTrialExhausted = Boolean(trialRes?.data?.isExhausted);
  const walletBalance = walletRes?.data?.balances?.INR ?? 0;

  const canChat = canStartUserChat({
    user,
    guestTrialExhausted: false,
    isWithinSignupTrial,
    hasPaidRecharge,
    walletBalance,
  });

  return {
    canChat,
    isWithinSignupTrial,
    hasPaidRecharge,
    signupTrialExhausted,
    walletBalance,
  };
}
