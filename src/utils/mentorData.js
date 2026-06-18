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

export const transformMateData = (matesData) => {
  if (!Array.isArray(matesData)) return [];

  return matesData.map((user) => {
    const mate = user.mate || {};
    const specifications = mate.specifications || [];
    return {
      _id: user._id,
      name: mate.name || user.name || "Unknown",
      img: user.image || "/favicon.png",
      category: specifications[0] || "Mentor",
      skills: specifications.join(", ") || "General guidance",
      tags: specifications.slice(0, 3),
      bio: mate.bio || "",
      isAvailable: mate.isAvailable || false,
    };
  });
};

export const getMentorSearchText = (mentor) =>
  `${mentor.category} ${mentor.skills} ${mentor.bio} ${(mentor.tags || []).join(" ")}`.toLowerCase();

export const matchesKeywords = (mentor, keywords) => {
  const text = getMentorSearchText(mentor);
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
};

export const filterByType = (mentors, type) => {
  const keywords =
    type === "professional" ? PROFESSIONAL_TYPE_KEYWORDS : EMOTIONAL_TYPE_KEYWORDS;
  const filtered = mentors.filter((mentor) => matchesKeywords(mentor, keywords));
  return filtered.length > 0 ? filtered : mentors;
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
