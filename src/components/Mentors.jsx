import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronUp,
  FaLightbulb,
  FaRocket,
  FaHeart,
  FaBriefcase,
} from "react-icons/fa";
import Layout from "./Layout";
import Footer from "./Footer";
import MentorLandingCard from "./MentorLandingCard";
import MentorBookingModal from "./MentorBooking";
import { apiGet } from "../utils/api";
import { trackPixel } from "../utils/metaPixel";
import {
  transformMentorData,
  filterByType,
  buildMentorsApiQuery,
} from "../utils/mentorData";
import segmentImage from "../assets/img/segment.webp";

const TRUST_ITEMS = [
  "Psychologists",
  "Life Coaches",
  "Relationship Coaches",
  "Career Mentors",
  "Finance Mentors",
  "Law Mentors",
  "1:1 Sessions",
];

const ACHIEVEMENT_CARDS = [
  {
    title: "Clarity",
    desc: "Understand your current challenge, cut through overwhelm, and see the next step with more confidence.",
  },
  {
    title: "Confidence",
    desc: "Build the belief and emotional strength to act on the life, relationship, or career goals that matter most.",
  },
  {
    title: "Growth",
    desc: "Move toward bigger outcomes with support that feels personal, practical, and deeply relevant to your journey.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Know what you need",
    desc: "Start with what matters most right now, emotional support, life clarity, career direction, or professional growth.",
  },
  {
    step: "2",
    title: "Choose your mentor",
    desc: "Find someone whose experience, style, and focus align with the outcome you want to create.",
  },
  {
    step: "3",
    title: "Book a session",
    desc: "Select an available slot that works for you and move forward without friction or uncertainty.",
  },
  {
    step: "4",
    title: "Grow from the conversation",
    desc: "Leave with perspective, practical next steps, and a stronger sense of where you are going next.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I came in feeling overwhelmed and emotionally stuck. After speaking to a mentor, I felt calmer, clearer, and finally able to think about what I needed next.",
  },
  {
    quote:
      "The guidance was practical but also motivating. I stopped doubting my next move and started planning my career with more confidence.",
  },
  {
    quote:
      "What stood out was how personal the conversation felt. I did not just get advice — I got clarity, reassurance, and a way forward.",
  },
];

const FAQS = [
  {
    q: "How do I know whether I need an emotional mentor or a professional mentor?",
    a: "If you are looking for personal support, emotional clarity, relationship guidance, or inner balance, start with emotional mentors. If you are focused on career growth, decisions, planning, business, finance, or professional progress, start with professional mentors.",
  },
  {
    q: "Can a single conversation really make a difference?",
    a: "Yes. One strong conversation can give users clarity, perspective, and practical next steps that shift how they think, feel, and move forward.",
  },
  {
    q: "How does booking work?",
    a: "Users can browse mentors, review their strengths, choose an available slot, and book a session that fits their schedule and current need.",
  },
];

const COMPANY_LOGOS = [
  "Google",
  "Meta",
  "Microsoft",
  "Amazon",
  "Flipkart",
  "Swiggy",
  "Zomato",
  "Paytm",
];

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-slate-900">{question}</span>
        {open ? (
          <FaChevronUp className="text-purple-600 shrink-0" />
        ) : (
          <FaChevronDown className="text-slate-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-slate-600 leading-relaxed">{answer}</div>
      )}
    </div>
  );
}

function MentorTabsSection({
  id,
  activeTab,
  onTabChange,
  emotionalMentors,
  professionalMentors,
  loading,
  navigate,
  onBook,
}) {
  const isEmotional = activeTab === "emotional";
  const mentors = isEmotional ? emotionalMentors : professionalMentors;
  const subtitle = isEmotional
    ? "Connect with mentors who help you feel heard, regain balance, and move forward with emotional clarity."
    : "Find mentors who help you make smarter career moves, navigate transitions, and reach bigger professional goals.";
  const ctaLabel = isEmotional
    ? "View All Emotional Mentors"
    : "View All Professional Mentors";

  return (
    <section id={id} className="py-16 md:py-20 bg-white scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              {isEmotional ? "Emotional Mentors" : "Professional Mentors"}
            </h2>
            <p className="text-slate-600 leading-relaxed">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(isEmotional ? "/mentors/emotional" : "/mentors/professional")
            }
            className="self-start md:self-auto px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors shrink-0"
          >
            {ctaLabel}
          </button>
        </div>

        <div className="flex border-b border-slate-200 mb-10">
          <button
            type="button"
            onClick={() => onTabChange("emotional")}
            className={`flex items-center gap-2 px-6 py-4 text-sm md:text-base font-semibold border-b-2 transition-colors -mb-px ${
              isEmotional
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FaHeart className="text-sm" />
            Emotional Mentors
          </button>
          <button
            type="button"
            onClick={() => onTabChange("professional")}
            className={`flex items-center gap-2 px-6 py-4 text-sm md:text-base font-semibold border-b-2 transition-colors -mb-px ${
              !isEmotional
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FaBriefcase className="text-sm" />
            Professional Mentors
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : mentors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mentors.map((mentor) => (
              <MentorLandingCard
                key={mentor._id}
                mentor={mentor}
                navigate={navigate}
                onBook={onBook}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-purple-50 border border-slate-100">
            <p className="text-slate-600">
              Mentors are being onboarded. Check back soon or explore all mentors.
            </p>
            <button
              type="button"
              onClick={() =>
                navigate(isEmotional ? "/mentors/emotional" : "/mentors/professional")
              }
              className="mt-4 px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
            >
              Browse {isEmotional ? "Emotional" : "Professional"} Mentors
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Mentors() {
  const navigate = useNavigate();
  const [mates, setMates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMentorTab, setActiveMentorTab] = useState("emotional");
  const [bookingMentorId, setBookingMentorId] = useState(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await apiGet(buildMentorsApiQuery(), true);
        if (data?.success && Array.isArray(data?.data?.data)) {
          setMates(data.data.data);
        } else {
          setMates([]);
        }
      } catch (err) {
        console.error("Failed to fetch mentors:", err);
        setMates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const mentorsList = useMemo(() => transformMentorData(mates), [mates]);

  const emotionalMentors = useMemo(
    () => filterByType(mentorsList, "emotional").slice(0, 4),
    [mentorsList],
  );

  const professionalMentors = useMemo(
    () => filterByType(mentorsList, "professional").slice(0, 4),
    [mentorsList],
  );

  const handleCtaClick = (tab) => {
    trackPixel("ViewContent");
    navigate(tab === "professional" ? "/mentors/professional" : "/mentors/emotional");
  };

  const handleTabChange = (tab) => {
    setActiveMentorTab(tab);
  };

  return (
    <Layout activePage="Mentors">
      {/* Floating ticker */}
      <div className="bg-purple-950 border-b border-purple-800">
        <div className="container mx-auto px-4 py-2 flex justify-end">
          <p className="text-purple-300 text-sm font-medium italic">
            Guidance that helps you rise.
          </p>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_#c084fc_0%,_transparent_55%)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_left,_#e9d5ff_0%,_transparent_45%)]" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Get the right mentor to move{" "}
              <span className="text-purple-200">higher</span> in life and career.
            </h1>
            <p className="text-lg md:text-xl text-purple-100 leading-relaxed mb-10 max-w-3xl mx-auto">
              Whether you are looking for emotional clarity or professional direction,
              Mejoric connects you with mentors who help you feel supported, think
              clearly, and move toward bigger goals with more confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => handleCtaClick("professional")}
                className="px-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg transition-all hover:scale-105"
              >
                Find Professional Mentors
              </button>
              <button
                type="button"
                onClick={() => handleCtaClick("emotional")}
                className="px-8 py-4 rounded-lg border-2 border-white/80 hover:bg-white hover:text-slate-900 text-white font-semibold text-lg transition-all"
              >
                Find Emotional Mentors
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-8 bg-purple-50 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {TRUST_ITEMS.map((item) => (
              <span
                key={item}
                className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why mentorship matters */}
      <section className="py-16 md:py-20 bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Why mentorship on Mejoric matters?
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Some people come to Mejoric because they need to feel heard, lighter,
                and stronger. Others come because they want to make smarter career moves
                and achieve more. This mentors page brings both together with one
                simple promise: the right conversation can change how you move forward.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src={segmentImage}
                alt="Mentorship on Mejoric"
                className="rounded-2xl shadow-xl w-full max-w-md object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What mentors help you achieve */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">
            What mentors help you achieve?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {ACHIEVEMENT_CARDS.map((card, index) => (
              <div
                key={card.title}
                className="bg-purple-50 rounded-2xl p-8 text-center border border-slate-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-5 text-xl">
                  {index === 0 ? (
                    <FaLightbulb />
                  ) : index === 1 ? (
                    <FaHeart />
                  ) : (
                    <FaRocket />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two paths intro */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Choose the guidance that fits your next step
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Some people come looking for emotional strength. Others come looking for
            professional direction. Mejoric is built to support both journeys with
            mentors who understand the path and help users move forward with purpose.
          </p>
        </div>
      </section>

      {/* Emotional mentors path */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="bg-rose-50 rounded-2xl p-8 border border-rose-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <FaHeart />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Emotional Mentors</h3>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">
                For people who want to feel stronger inside, heal better, improve
                relationships, regain balance, and move ahead with emotional clarity.
                This is where support becomes strength and conversations become turning
                points.
              </p>
              <p className="font-semibold text-slate-800 mb-3">Included mentors:</p>
              <ul className="space-y-2 text-slate-600 mb-6 list-disc pl-5">
                <li>
                  Psychologists who help users understand emotions and move through
                  difficult phases.
                </li>
                <li>
                  Relationship coaches who guide healthier connections and more secure
                  communication.
                </li>
                <li>
                  Life coaches who help users rebuild confidence, habits, and personal
                  direction.
                </li>
              </ul>
              <button
                type="button"
                onClick={() => handleCtaClick("emotional")}
                className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
              >
                View Emotional Mentors
              </button>
            </div>

            <div className="bg-purple-50 rounded-2xl p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                  <FaBriefcase />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Professional Mentors</h3>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">
                For people who want to achieve more in their career, make better
                decisions, navigate transitions, and reach bigger professional goals.
                This is where ambition meets insight and potential turns into progress.
              </p>
              <p className="font-semibold text-slate-800 mb-3">Included mentors:</p>
              <ul className="space-y-2 text-slate-600 mb-6 list-disc pl-5">
                <li>
                  Career mentors who help users grow, switch, prepare, and level up with
                  purpose.
                </li>
                <li>
                  Law and finance mentors who simplify important decisions with expert
                  perspective.
                </li>
                <li>
                  Business and domain mentors who help users think bigger and move
                  smarter.
                </li>
              </ul>
              <button
                type="button"
                onClick={() => handleCtaClick("professional")}
                className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
              >
                View Professional Mentors
              </button>
            </div>
          </div>
        </div>
      </section>

      <MentorTabsSection
        id="mentors-tabs"
        activeTab={activeMentorTab}
        onTabChange={handleTabChange}
        emotionalMentors={emotionalMentors}
        professionalMentors={professionalMentors}
        loading={loading}
        navigate={navigate}
        onBook={(mentor) => setBookingMentorId(mentor._id)}
      />

      {/* How it works */}
      <section className="py-16 md:py-20 bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              How mentoring works on Mejoric
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company logos */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-slate-500 text-sm font-medium mb-8 uppercase tracking-wider">
            Mentors from leading companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {COMPANY_LOGOS.map((name) => (
              <span
                key={name}
                className="text-xl md:text-2xl font-bold text-slate-400 grayscale"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">
            Stories of progress and possibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {TESTIMONIALS.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
              >
                <div className="flex gap-1 text-amber-400 mb-4 text-sm">★★★★★</div>
                <p className="text-slate-600 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,_#c084fc_0%,_transparent_60%)]" />
        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            From emotional support to career growth, Mejoric mentors help people build
            confidence, clarity, and momentum.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              type="button"
              onClick={() => handleCtaClick("professional")}
              className="px-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg transition-all"
            >
              Find Your Professional Mentor
            </button>
            <button
              type="button"
              onClick={() => handleCtaClick("emotional")}
              className="px-8 py-4 rounded-lg border-2 border-white/80 hover:bg-white hover:text-slate-900 text-white font-semibold text-lg transition-all"
            >
              Find Your Emotional Mentor
            </button>
          </div>
          <p className="text-purple-100 text-lg">
            Your next step starts with one conversation.
          </p>
        </div>
      </section>

      <Footer />

      <MentorBookingModal
        mentorId={bookingMentorId}
        isOpen={Boolean(bookingMentorId)}
        onClose={() => setBookingMentorId(null)}
      />
    </Layout>
  );
}
