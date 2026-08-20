export function isCorporateUser(user) {
  return Boolean(user?.corporateId);
}

export function canCorporateUserChat(corporateUsage) {
  return (corporateUsage?.chatMinutesRemaining ?? 0) >= 1;
}

export function canCorporateUserCall(corporateUsage, callType = "AUDIO") {
  const key =
    callType === "VIDEO" ? "videoMinutesRemaining" : "audioMinutesRemaining";
  return (corporateUsage?.[key] ?? 0) >= 1;
}

export function getCorporateChatBlockMessage() {
  return "Your company's chat minutes have been used up. Please contact your administrator.";
}

export function getCorporateCallBlockMessage(callType = "AUDIO") {
  const label = callType === "VIDEO" ? "video" : "audio";
  return `Your company's ${label} minutes have been used up. Please contact your administrator.`;
}

export function formatCorporateUsageSummary(usage) {
  if (!usage) return "";
  return `Audio ${usage.audioMinutesRemaining ?? 0}m · Video ${usage.videoMinutesRemaining ?? 0}m · Chat ${usage.chatMinutesRemaining ?? 0}m`;
}
