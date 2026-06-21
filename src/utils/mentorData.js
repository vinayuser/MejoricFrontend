export const EMOTIONAL_TYPE_KEYWORDS = [
  "relationship",
  "emotional",
  "life",
  "psychologist",
  "coach",
  "wellness",
  "mental",
  "stress",
  "burnout",
  "healing",
];

export const PROFESSIONAL_TYPE_KEYWORDS = [
  "career",
  "finance",
  "law",
  "business",
  "professional",
  "legal",
  "strategy",
  "marketing",
  "entrepreneur",
  "industry",
];

export function isMentorProfile(user) {
  return user?.role === "mentor";
}

export function buildMentorsApiQuery({ type, page = 1, limit = 100 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    role: "mentor",
    isActive: "true",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (type) {
    params.set("mentorType", type);
  }

  return `/users/getAll?${params.toString()}`;
}

function transformMentorUser(user) {
  const profile = user.mentor || {};
  const specifications = profile.specifications || [];
  const mentorType = profile.mentorType || null;
  const typeLabel =
    mentorType === "professional"
      ? "Professional Mentor"
      : mentorType === "emotional"
        ? "Emotional Mentor"
        : "Mentor";

  return {
    _id: user._id,
    name: profile.name || user.name || "Unknown",
    img: user.image || "/favicon.png",
    category: specifications[0] || typeLabel,
    typeLabel,
    skills: specifications.join(", ") || typeLabel,
    tags: specifications.slice(0, 3),
    bio: profile.bio || "",
    isAvailable: false,
    mentorType,
  };
}

/** Only admin-created appointment mentors — excludes chat mates. */
export const transformMentorData = (users) => {
  if (!Array.isArray(users)) return [];
  return users.filter(isMentorProfile).map(transformMentorUser);
};

export const getMentorSearchText = (mentor) =>
  `${mentor.category} ${mentor.skills} ${mentor.bio} ${(mentor.tags || []).join(" ")}`.toLowerCase();

export const matchesKeywords = (mentor, keywords) => {
  const text = getMentorSearchText(mentor);
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
};

export const filterByType = (mentors, type) => {
  if (!type) return mentors;

  const typed = mentors.filter((mentor) => mentor.mentorType === type);
  if (typed.length > 0) return typed;

  const keywords =
    type === "professional" ? PROFESSIONAL_TYPE_KEYWORDS : EMOTIONAL_TYPE_KEYWORDS;
  return mentors.filter(
    (mentor) => !mentor.mentorType && matchesKeywords(mentor, keywords),
  );
};

export const FILTER_KEYWORDS = {
  career: ["career", "job", "work", "role"],
  law: ["law", "legal", "litigation"],
  finance: ["finance", "financial", "money", "investment"],
  business: ["business", "startup", "enterprise"],
  marketing: ["marketing", "brand", "growth"],
  entrepreneurship: ["entrepreneur", "founder", "startup"],
  "industry experts": ["industry", "domain", "expert"],
  "career switch": ["switch", "transition", "career change"],
  "role growth": ["growth", "promotion", "leadership", "level up"],
  "interview prep": ["interview", "resume", "preparation"],
  strategy: ["strategy", "planning", "roadmap"],
  "legal clarity": ["legal", "law", "compliance"],
  "money decisions": ["money", "finance", "budget", "investment"],
  psychologists: ["psychologist", "psychology", "therapy", "mental"],
  "relationship coaches": ["relationship", "couple", "communication"],
  "life coaches": ["life coach", "life", "habits", "confidence"],
  "emotional wellbeing guides": ["wellbeing", "wellness", "emotional"],
  stress: ["stress", "anxiety", "overwhelm"],
  relationships: ["relationship", "partner", "family"],
  "self-worth": ["self-worth", "confidence", "esteem"],
  "emotional healing": ["healing", "recovery", "grief"],
  "life transitions": ["transition", "change", "phase"],
  burnout: ["burnout", "exhaustion", "fatigue"],
};
