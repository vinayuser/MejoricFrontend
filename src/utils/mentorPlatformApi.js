import { apiGet } from "./api";
import {
  filterByType,
  transformMentorData,
  buildMentorsApiQuery,
} from "./mentorData";
import { DEMO_MENTORS } from "../data/demoMentors";
import {
  getInitials,
  parseRateNumber,
  mentorMatchesDomain,
} from "../data/mentorPlatformConfig";

const DEFAULT_AUDIO_PER_MIN = 12;
const DEFAULT_VIDEO_PER_MIN = 15;

const FORMAT_DURATIONS = {
  audio: 45,
  video: 45,
  video60: 60,
};

/** Treat large stored values as legacy session totals (÷ duration). */
function normalizePerMinPrice(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  if (num > 100) return Math.max(1, Math.round(num / 45));
  return Math.round(num);
}

function resolveMentorPrices(profile = {}) {
  const videoCallPrice = normalizePerMinPrice(profile.videoCallPrice, DEFAULT_VIDEO_PER_MIN);
  const audioCallPrice = normalizePerMinPrice(
    profile.audioCallPrice,
    DEFAULT_AUDIO_PER_MIN,
  );
  const video60CallPrice = normalizePerMinPrice(
    profile.video60CallPrice,
    videoCallPrice,
  );

  return { audioCallPrice, videoCallPrice, video60CallPrice };
}

function enrichDemoMentor(mentor) {
  if (mentor.audioCallPrice && mentor.videoCallPrice) return mentor;
  const legacy = parseRateNumber(mentor.rate);
  const perMin = legacy > 100 ? Math.max(1, Math.round(legacy / 45)) : legacy || DEFAULT_VIDEO_PER_MIN;
  return {
    ...mentor,
    audioCallPrice: mentor.audioCallPrice ?? Math.max(1, perMin - 2),
    videoCallPrice: mentor.videoCallPrice ?? perMin,
    video60CallPrice: mentor.video60CallPrice ?? perMin,
  };
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
  const name = profile.name || user.name || "Unknown";
  const prices = resolveMentorPrices(profile);
  const fromPrice = Math.min(prices.audioCallPrice, prices.videoCallPrice);

  return {
    id: user._id,
    _id: user._id,
    name,
    domain: domainNames[0] || specs[0] || "Mentor",
    domainId: domainIds[0] || "all",
    domainIds,
    domains: domainNames,
    exp: profile.experience || profile.yearsOfExperience || "—",
    rate: `From ₹${fromPrice}/min`,
    audioCallPrice: prices.audioCallPrice,
    videoCallPrice: prices.videoCallPrice,
    video60CallPrice: prices.video60CallPrice,
    qual:
      profile.qualification ||
      profile.education ||
      specs.join(", ") ||
      "Verified mentor",
    tags: domainNames.slice(0, 3).length ? domainNames.slice(0, 3) : specs.slice(0, 3).length ? specs.slice(0, 3) : ["Mentor"],
    bio: profile.bio || "",
    img: user.image || null,
    av: getInitials(name),
    avColor: type === "professional" ? "#2D2D6B" : "#2D5C42",
    slots: profile.availableSlots || ["Mon 10am", "Wed 2pm", "Fri 4pm"],
    specs: domainNames.length ? domainNames : specs.length ? specs : ["Personalised 1-to-1 guidance"],
    approach:
      profile.approach ||
      "Focused, practical sessions tailored to your situation.",
    mentorType: profile.mentorType || type,
    category: domainNames[0] || specs[0] || "",
    skills: domainNames.join(", ") || specs.join(", "),
    isDemo: false,
  };
}

export async function fetchPlatformMentors(type) {
  try {
    const data = await apiGet(buildMentorsApiQuery({ type }), true);
    if (data?.success && Array.isArray(data?.data?.data)) {
      const apiUsers = data.data.data;
      if (apiUsers.length > 0) {
        return apiUsers
          .filter((u) => u.role === "mentor")
          .map((u) => mapApiMentor(u, type));
      }
    }
  } catch (err) {
    console.error("Failed to fetch mentors:", err);
  }

  return (DEMO_MENTORS[type] || []).map((m) => enrichDemoMentor({ ...m, isDemo: true }));
}

export function getFormatDuration(formatId) {
  return FORMAT_DURATIONS[formatId] ?? 45;
}

export function getFormatPricePerMin(mentor, formatId) {
  const m = mentor?.isDemo ? enrichDemoMentor(mentor) : mentor;
  if (formatId === "audio") {
    return normalizePerMinPrice(m?.audioCallPrice, DEFAULT_AUDIO_PER_MIN);
  }
  if (formatId === "video60") {
    return normalizePerMinPrice(
      m?.video60CallPrice ?? m?.videoCallPrice,
      DEFAULT_VIDEO_PER_MIN,
    );
  }
  return normalizePerMinPrice(m?.videoCallPrice, DEFAULT_VIDEO_PER_MIN);
}

export function getFormatPrice(mentor, formatId) {
  return getFormatPricePerMin(mentor, formatId) * getFormatDuration(formatId);
}

export function getMentorFromPrice(mentor) {
  return Math.min(
    getFormatPricePerMin(mentor, "audio"),
    getFormatPricePerMin(mentor, "video"),
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
  const isObjectId = /^[a-f0-9]{24}$/i.test(String(mentorId || ""));

  if (isObjectId) {
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

  const demo = [
    ...(DEMO_MENTORS.emotional || []),
    ...(DEMO_MENTORS.professional || []),
  ].find((m) => m.id === mentorId || m._id === mentorId);
  if (demo) return enrichDemoMentor({ ...demo, isDemo: true });

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
