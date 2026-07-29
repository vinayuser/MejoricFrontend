import { apiGet } from "./api";
import { buildMentorsApiQuery } from "./mentorData";
import {
  getInitials,
  mentorMatchesDomain,
} from "../data/mentorPlatformConfig";
import { capitalizeName } from "./formatters";

const DEFAULT_AUDIO_SESSION_45 = 540;
const DEFAULT_VIDEO_SESSION_45 = 675;

const FORMAT_DURATIONS = {
  audio: 45,
  video: 45,
  video60: 60,
};

/**
 * Stored value is the full amount for that slot (e.g. 20 = ₹20 for 45 min).
 * No duration multiplication.
 */
function toSessionTotal(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return Math.round(num);
}

function resolveMentorSessionPrices(profile = {}) {
  const videoCallPrice = toSessionTotal(
    profile.videoCallPrice,
    DEFAULT_VIDEO_SESSION_45,
  );
  const audioCallPrice = toSessionTotal(
    profile.audioCallPrice,
    DEFAULT_AUDIO_SESSION_45,
  );
  const video60CallPrice = toSessionTotal(
    profile.video60CallPrice,
    videoCallPrice,
  );

  return { audioCallPrice, videoCallPrice, video60CallPrice };
}

function mapApiMentor(user, type) {
  const profile = user.mentor || {};
  const specs = profile.specifications || [];
  const domainIds = profile.domainIds?.length
    ? profile.domainIds
    : profile.domainId
      ? [profile.domainId]
      : [];
  const domainNames = profile.domains?.length
    ? profile.domains
    : profile.domain
      ? [profile.domain]
      : specs;
  const name = capitalizeName(profile.name || user.name || "Unknown");
  const prices = resolveMentorSessionPrices(profile);
  const fromSession = Math.min(prices.audioCallPrice, prices.videoCallPrice);

  return {
    id: user._id,
    _id: user._id,
    name,
    domain: domainNames[0] || specs[0] || "Mentor",
    domainId: domainIds[0] || "all",
    domainIds,
    domains: domainNames,
    exp: profile.experience || profile.yearsOfExperience || "—",
    rate: `From ₹${fromSession.toLocaleString("en-IN")}`,
    // These are session totals (45 / 45 / 60 min), not per-minute
    audioCallPrice: prices.audioCallPrice,
    videoCallPrice: prices.videoCallPrice,
    video60CallPrice: prices.video60CallPrice,
    qual:
      profile.qualification ||
      profile.education ||
      specs.join(", ") ||
      "Verified mentor",
    tags: domainNames.slice(0, 3).length
      ? domainNames.slice(0, 3)
      : specs.slice(0, 3).length
        ? specs.slice(0, 3)
        : ["Mentor"],
    bio: profile.bio || "",
    img: user.image || null,
    av: getInitials(name),
    avColor: type === "professional" ? "#2D2D6B" : "#2D5C42",
    slots: profile.availableSlots || ["Mon 10am", "Wed 2pm", "Fri 4pm"],
    specs: domainNames.length
      ? domainNames
      : specs.length
        ? specs
        : ["Personalised 1-to-1 guidance"],
    approach:
      profile.approach ||
      "Focused, practical sessions tailored to your situation.",
    mentorType: profile.mentorType || type,
    category: domainNames[0] || specs[0] || "",
    skills: domainNames.join(", ") || specs.join(", "),
    isDemo: false,
  };
}

export async function fetchPlatformMentors(type, { specification } = {}) {
  try {
    const data = await apiGet(
      buildMentorsApiQuery({ type, specification }),
      true,
    );
    if (data?.success && Array.isArray(data?.data?.data)) {
      return data.data.data
        .filter((u) => u.role === "mentor")
        .map((u) => mapApiMentor(u, type));
    }
  } catch (err) {
    console.error("Failed to fetch mentors:", err);
  }

  return [];
}

export function getFormatDuration(formatId) {
  return FORMAT_DURATIONS[formatId] ?? 45;
}

export function getFormatPrice(mentor, formatId) {
  const prices = resolveMentorSessionPrices(mentor || {});
  if (formatId === "audio") return prices.audioCallPrice;
  if (formatId === "video60") return prices.video60CallPrice;
  return prices.videoCallPrice;
}

export function getFormatPricePerMin(mentor, formatId) {
  const session = getFormatPrice(mentor, formatId);
  const duration = getFormatDuration(formatId);
  return Math.max(1, Math.round(session / duration));
}

/** Lowest 45-min session total (audio vs video). Never a per-minute rate. */
export function getMentorFromPrice(mentor) {
  return Math.min(
    getFormatPrice(mentor, "audio"),
    getFormatPrice(mentor, "video"),
  );
}

export function filterMentorsByDomain(mentors, domainId, domainName) {
  if (!domainId || domainId === "all") return mentors;
  return mentors.filter((m) => {
    const ids = m.domainIds?.length
      ? m.domainIds
      : m.domainId
        ? [m.domainId]
        : [];
    if (ids.includes(domainId)) return true;
    return mentorMatchesDomain(m, domainId, domainName);
  });
}

export function countMentorsPerDomain(mentors, domains) {
  return domains.map((d) => ({
    ...d,
    count:
      d.id === "all"
        ? mentors.length
        : filterMentorsByDomain(mentors, d.id, d.name).length,
  }));
}

export function getFormatLabel(formatId) {
  const mins = getFormatDuration(formatId);
  if (formatId === "audio") return `Audio · ${mins} min`;
  if (formatId === "video60") return `Video · ${mins} min`;
  return `Video · ${mins} min`;
}

export async function fetchMentorProfile(mentorId, type) {
  if (!mentorId) return null;

  try {
    const data = await apiGet(`/users/profile/${mentorId}`, true);
    if (data?.success && data?.data) {
      return mapApiMentor(data.data, type);
    }
  } catch (err) {
    console.error("Failed to fetch mentor profile:", err);
  }

  return null;
}
