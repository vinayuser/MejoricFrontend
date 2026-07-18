export const MENTOR_TYPES = {
  emotional: "emotional",
  professional: "professional",
};

export const TYPE_ROUTE = {
  emotional: "emotional",
  professional: "professional",
};

export const LANDING_CHIPS = [
  // { label: "I'm anxious or overwhelmed", type: "emotional" },
  // { label: "Going through a breakup or loss", type: "emotional" },
  // { label: "Burnt out from work", type: "emotional" },
  { label: "Want to switch careers", type: "professional" },
  { label: "Preparing for an interview", type: "professional" },
  { label: "Confused about my next role", type: "professional" },
];

export const TRUST_CONTENT = {
  yes: [
    "Real, credentialed people who have lived through what you're facing, emotionally or professionally.",
    "A private, 1-to-1 conversation you can book in minutes, on your schedule.",
    "Honest, specific, and practical guidance built around your exact situation, not a generic script.",
    "A safe space to rehearse a hard conversation, process a hard feeling, or plan a hard decision.",
  ],
  no: [
    "Not licensed therapy or clinical treatment. Emotional Mentors will guide you toward that if you need it.",
    "Not a job guarantee. Professional Mentors give direction, not placement.",
    "Not a chatbot or script. Every Mentor is a verified human, and every session is private.",
    "Not a long-term commitment. Book one session, see if it helps, and decide from there.",
  ],
};

export const PROOF_CARDS = [
  {
    type: "emotional",
    before: '"I don\'t even know why I feel this anxious all the time. I just push through it."',
    after: '"I can finally name what\'s happening in my body, and I have one tool to use tonight."',
  },
  {
    type: "professional",
    before: '"I want to move into product management but I don\'t even know where to start."',
    after: '"I have a 90-day plan, three skills to build first, and someone who\'ll check my progress."',
  },
];

export const MENTOR_PLATFORM_CONFIG = {
  emotional: {
    label: "Emotional Mentors",
    breadcrumbLabel: "Emotional Support",
    pill: "🌿 Emotional Support",
    title: "Emotional Mentor",
    tagline:
      "A trained, credentialed guide who holds space for your emotional life. Not a therapist, not a friend. Something more useful than both.",
    grid: [
      {
        dark: false,
        head: "WHO THEY ARE",
        body: "MPhil/PhD Psychology graduates, RCI-registered professionals, and certified counsellors with real-world experience holding space for people in distress.",
      },
      {
        dark: false,
        head: "WHAT THEY DO",
        body: "They provide structured emotional guidance across 22 domains including anxiety, grief, relationships, confidence, burnout, and identity, in private 1-to-1 sessions.",
      },
      {
        dark: true,
        head: "WHAT THEY ARE NOT",
        body: "They are not therapists and will not diagnose, treat, or prescribe. If you need clinical support, they will guide you toward it clearly, without making you feel dismissed.",
      },
      {
        dark: false,
        head: "HOW IT WORKS",
        body: "You book a session, choose your slot, and meet your mentor on video or audio. The conversation is confidential. You set the pace.",
      },
    ],
    steps: [
      { n: "01", t: "Choose a domain", b: "Pick the area of your life you want to focus on." },
      { n: "02", t: "Browse mentors", b: "Read profiles and find someone whose background fits." },
      { n: "03", t: "Book a slot", b: "Pick a time that works. First session from ₹199." },
      { n: "04", t: "Show up", b: "Video or audio. Private. You set the pace." },
    ],
    cta: "Browse Emotional Mentors →",
    domains: [
      { id: "all", name: "All Emotional Mentors", count: 0 },
      { id: "e01", name: "Venting & Immediate Support", count: 0, section: "Immediate Support" },
      { id: "e02", name: "Stress & Overthinking", count: 0, section: "Immediate Support" },
      { id: "e03", name: "Confidence & Self-Worth", count: 0, section: "Self & Identity" },
      { id: "e04", name: "Anxiety & Emotional Burnout", count: 0, section: "Self & Identity" },
      { id: "e05", name: "Emotional Healing & Inner Child", count: 0, section: "Self & Identity" },
      { id: "e06", name: "Anger & Emotional Control", count: 0, section: "Self & Identity" },
      { id: "e07", name: "Grief & Loss", count: 0, section: "Life Transitions" },
      { id: "e08", name: "Life Transitions & Change", count: 0, section: "Life Transitions" },
      { id: "e09", name: "Loneliness & Social Anxiety", count: 0, section: "Life Transitions" },
      { id: "e10", name: "Relationships & Communication", count: 0, section: "Relationships" },
      { id: "e11", name: "Family Dynamics", count: 0, section: "Relationships" },
      { id: "e12", name: "Romantic Relationships & Heartbreak", count: 0, section: "Relationships" },
      { id: "e13", name: "Workplace Stress & Conflict", count: 0, section: "Work & Career" },
      { id: "e14", name: "Burnout & Recovery", count: 0, section: "Work & Career" },
      { id: "e15", name: "Career Anxiety & Imposter Syndrome", count: 0, section: "Work & Career" },
      { id: "e16", name: "Student & Academic Pressure", count: 0, section: "Work & Career" },
      { id: "e17", name: "Purpose & Meaning", count: 0, section: "Deeper Work" },
      { id: "e18", name: "Identity & Self-Discovery", count: 0, section: "Deeper Work" },
      { id: "e19", name: "Trauma-Informed Support", count: 0, section: "Deeper Work" },
      { id: "e20", name: "Emotional Regulation & Mindfulness", count: 0, section: "Deeper Work" },
      { id: "e21", name: "Life Coaching", count: 0, section: "Coaching" },
      { id: "e22", name: "Relationship Coaching", count: 0, section: "Coaching" },
    ],
  },
  professional: {
    label: "Mentors",
    breadcrumbLabel: "Mentors",
    pill: "💼 Career Mentors",
    title: "Mentor",
    tagline:
      "An experienced professional who gives you the honest picture of your career: what to do next, how to get there, and what the path actually feels like from the inside.",
    grid: [
      {
        dark: false,
        head: "WHO THEY ARE",
        body: "Senior professionals with 10+ years of real experience across HR, IT, data, product management, and business analysis. People who have done the work, not just studied it.",
      },
      {
        dark: false,
        head: "WHAT THEY DO",
        body: "They map your current skills, identify your gap, and give you a concrete plan for your next career move in 2 to 3 focused sessions.",
      },
      {
        dark: true,
        head: "WHAT THEY ARE NOT",
        body: "They are not teachers or coaches. They will not run a curriculum or give you assignments. They give direction, clarity, and the honest perspective that saves you 6 months of going the wrong way.",
      },
      {
        dark: false,
        head: "HOW IT WORKS",
        body: "Choose your domain, find a mentor whose background matches where you want to go, book your slot, and arrive with your specific question or situation.",
      },
    ],
    steps: [
      { n: "01", t: "Choose a domain", b: "HR, IT, data, UX, product, or BA. Pick yours." },
      { n: "02", t: "Browse mentors", b: "Each mentor shows their background and specialisation." },
      { n: "03", t: "Book a slot", b: "First session from ₹199." },
      { n: "04", t: "Come prepared", b: "One clear question or situation. Leave with a plan." },
    ],
    cta: "Browse Mentors →",
    domains: [
      { id: "all", name: "All Mentors", count: 0 },
      { id: "p01", name: "Career Transition Coach", count: 0, section: "Career & Leadership" },
      { id: "p02", name: "HR & Workplace Mentor", count: 0, section: "Career & Leadership" },
      { id: "p03", name: "CA / Financial Clarity Mentor", count: 0, section: "Career & Leadership" },
      { id: "p04", name: "Legal Clarity Mentor", count: 0, section: "Career & Leadership" },
      { id: "p05", name: "Executive & Leadership Coach", count: 0, section: "Career & Leadership" },
      { id: "p06", name: "Startup & Entrepreneurship Mentor", count: 0, section: "Career & Leadership" },
      { id: "p07", name: "Sales & Business Development", count: 0, section: "Career & Leadership" },
      { id: "p08", name: "MBA & Higher Education Guidance", count: 0, section: "Education & Growth" },
      { id: "p09", name: "Study Abroad & Academic Mentor", count: 0, section: "Education & Growth" },
      { id: "p10", name: "Personal Finance & Wealth Planning", count: 0, section: "Education & Growth" },
      { id: "p11", name: "Communication & Public Speaking", count: 0, section: "Education & Growth" },
      { id: "hr-startup", name: "HR Mentor (Startup)", count: 0, section: "Human Resources" },
      { id: "hr-mnc", name: "HR Mentor (MNC)", count: 0, section: "Human Resources" },
      { id: "hr-switch", name: "HR Mentor (Career Switcher)", count: 0, section: "Human Resources" },
      { id: "p12", name: "Product Management", count: 0, section: "Information Technology" },
      { id: "p13", name: "Data Analytics & Business Intelligence", count: 0, section: "Information Technology" },
      { id: "p14", name: "UX & Product Design", count: 0, section: "Information Technology" },
      { id: "p15", name: "Business Analyst", count: 0, section: "Information Technology" },
      { id: "p16", name: "Cloud & DevOps", count: 0, section: "Information Technology" },
      { id: "p17", name: "Cybersecurity Career Path", count: 0, section: "Information Technology" },
    ],
  },
};

export const SESSION_FORMATS = [
  { id: "audio", icon: "🎙", name: "Audio call", dur: "45 min", priceOffset: -400 },
  { id: "video", icon: "📹", name: "Video call", dur: "45 min", priceOffset: 0 },
  { id: "video60", icon: "📹", name: "Video call", dur: "60 min", priceOffset: 600 },
];

export function getConfig(type) {
  return MENTOR_PLATFORM_CONFIG[type] || MENTOR_PLATFORM_CONFIG.professional;
}

export function mentorMatchesDomain(mentor, domainId, domainName) {
  if (!domainId || domainId === "all") return true;
  const ids = mentor.domainIds?.length
    ? mentor.domainIds
    : mentor.domainId
      ? [mentor.domainId]
      : [];
  if (ids.includes(domainId)) return true;
  const text = `${mentor.domain || ""} ${(mentor.domains || []).join(" ")} ${mentor.category || ""} ${mentor.skills || ""} ${(mentor.tags || []).join(" ")}`.toLowerCase();
  const nameWords = (domainName || "").toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  return nameWords.some((word) => text.includes(word));
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function parseRateNumber(rateStr) {
  if (typeof rateStr === "number") return rateStr;
  return parseInt(String(rateStr || "").replace(/[^\d]/g, ""), 10) || 1999;
}
