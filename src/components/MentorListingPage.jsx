import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaFilter, FaTimes } from "react-icons/fa";
import Layout from "./Layout";
import Footer from "./Footer";
import MentorLandingCard from "./MentorLandingCard";
import { apiGet } from "../utils/api";
import {
  transformMateData,
  filterByType,
  matchesKeywords,
  FILTER_KEYWORDS,
} from "../utils/mentorData";

const PAGE_CONFIG = {
  professional: {
    activePage: "Professional Mentors",
    headline: "Learn from people who help you grow bigger, move smarter, and achieve more.",
    subheadline:
      "Professional growth often begins with the right perspective. Mejoric professional mentors are experienced people across career, law, finance, business, and other domains who help users make stronger decisions, unlock better opportunities, and move toward greater success with more confidence.",
    supportingLines: [
      "Make better career decisions.",
      "Prepare for bigger roles and opportunities.",
      "Get expert guidance in law, finance, and business.",
      "Move toward greater achievement with clarity and confidence.",
    ],
    primaryLabel: "Domain",
    primaryOptions: [
      "Career",
      "Law",
      "Finance",
      "Business",
      "Marketing",
      "Entrepreneurship",
      "Industry Experts",
    ],
    secondaryLabel: "Goal",
    secondaryOptions: [
      "Career switch",
      "Role growth",
      "Interview prep",
      "Strategy",
      "Legal clarity",
      "Money decisions",
    ],
  },
  emotional: {
    activePage: "Emotional Mentors",
    headline: "Find the support that helps you feel stronger, lighter, and clearer.",
    subheadline:
      "When life feels heavy, confusing, or emotionally draining, the right mentor can help you process what you are going through and move ahead with more balance, confidence, and inner strength. Mejoric emotional mentors are here to help users feel heard, supported, and empowered.",
    supportingLines: [
      "Feel emotionally supported.",
      "Understand relationships better.",
      "Regain confidence after difficult phases.",
      "Move forward with peace and personal clarity.",
    ],
    primaryLabel: "Category",
    primaryOptions: [
      "Psychologists",
      "Relationship Coaches",
      "Life Coaches",
      "Emotional wellbeing guides",
    ],
    secondaryLabel: "Focus Area",
    secondaryOptions: [
      "Stress",
      "Relationships",
      "Self-worth",
      "Emotional healing",
      "Life transitions",
      "Burnout",
    ],
  },
};

function FilterOption({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
      />
      <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
    </label>
  );
}

function FilterSidebar({
  config,
  selectedPrimary,
  selectedSecondary,
  onPrimaryChange,
  onSecondaryChange,
  onClear,
  resultCount,
}) {
  return (
    <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit lg:sticky lg:top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Filter mentors</h3>
        {(selectedPrimary.length > 0 || selectedSecondary.length > 0) && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          {config.primaryLabel}
        </p>
        <div className="space-y-3">
          {config.primaryOptions.map((option) => (
            <FilterOption
              key={option}
              label={option}
              checked={selectedPrimary.includes(option)}
              onChange={() => onPrimaryChange(option)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          {config.secondaryLabel}
        </p>
        <div className="space-y-3">
          {config.secondaryOptions.map((option) => (
            <FilterOption
              key={option}
              label={option}
              checked={selectedSecondary.includes(option)}
              onChange={() => onSecondaryChange(option)}
            />
          ))}
        </div>
      </div>

      <p className="mt-6 pt-6 border-t border-slate-100 text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-800">{resultCount}</span> mentors
      </p>
    </aside>
  );
}

const toggleFilter = (current, value) =>
  current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

const applySidebarFilters = (mentors, selectedPrimary, selectedSecondary) => {
  let result = mentors;

  if (selectedPrimary.length > 0) {
    result = result.filter((mentor) =>
      selectedPrimary.some((option) => {
        const keywords = FILTER_KEYWORDS[option.toLowerCase()] || [option.toLowerCase()];
        return matchesKeywords(mentor, keywords);
      }),
    );
  }

  if (selectedSecondary.length > 0) {
    result = result.filter((mentor) =>
      selectedSecondary.some((option) => {
        const keywords = FILTER_KEYWORDS[option.toLowerCase()] || [option.toLowerCase()];
        return matchesKeywords(mentor, keywords);
      }),
    );
  }

  return result;
};

export default function MentorListingPage({ type }) {
  const navigate = useNavigate();
  const config = PAGE_CONFIG[type];
  const [mates, setMates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrimary, setSelectedPrimary] = useState([]);
  const [selectedSecondary, setSelectedSecondary] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchMates = async () => {
      try {
        const data = await apiGet(
          "/users/getAll?page=1&limit=100&role=mate&sortBy=isAvailable",
          true,
        );
        if (data?.success && Array.isArray(data?.data?.data)) {
          setMates(data.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch mentors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMates();
  }, []);

  const mentorsList = useMemo(() => transformMateData(mates), [mates]);

  const typeMentors = useMemo(
    () => filterByType(mentorsList, type),
    [mentorsList, type],
  );

  const filteredMentors = useMemo(
    () => applySidebarFilters(typeMentors, selectedPrimary, selectedSecondary),
    [typeMentors, selectedPrimary, selectedSecondary],
  );

  const clearFilters = () => {
    setSelectedPrimary([]);
    setSelectedSecondary([]);
  };

  const filterSidebar = (
    <FilterSidebar
      config={config}
      selectedPrimary={selectedPrimary}
      selectedSecondary={selectedSecondary}
      onPrimaryChange={(option) =>
        setSelectedPrimary((prev) => toggleFilter(prev, option))
      }
      onSecondaryChange={(option) =>
        setSelectedSecondary((prev) => toggleFilter(prev, option))
      }
      onClear={clearFilters}
      resultCount={filteredMentors.length}
    />
  );

  return (
    <Layout activePage={config.activePage}>
      {/* Banner */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_#c084fc_0%,_transparent_55%)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_right,_#e9d5ff_0%,_transparent_45%)]" />
        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <nav className="flex flex-wrap items-center gap-3 text-sm mb-8">
            <Link to="/mentors" className="text-purple-200 hover:text-white transition-colors">
              Mentors Home
            </Link>
            <span className="text-purple-300/60">/</span>
            <Link
              to="/mentors/emotional"
              className={`transition-colors ${
                type === "emotional"
                  ? "text-purple-200 font-semibold"
                  : "text-purple-200/70 hover:text-white"
              }`}
            >
              Emotional Mentors
            </Link>
            <span className="text-purple-300/60">/</span>
            <Link
              to="/mentors/professional"
              className={`transition-colors ${
                type === "professional"
                  ? "text-purple-200 font-semibold"
                  : "text-purple-200/70 hover:text-white"
              }`}
            >
              Professional Mentors
            </Link>
          </nav>
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-5">
              {config.headline}
            </h1>
            <p className="text-base md:text-lg text-purple-100 leading-relaxed mb-8">
              {config.subheadline}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.supportingLines.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 text-sm md:text-base text-purple-50"
                >
                  <span className="text-purple-200 mt-1">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Listing */}
      <section className="py-10 md:py-14 bg-purple-50 min-h-[60vh]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-xl font-bold text-slate-900">
              {type === "professional" ? "Professional Mentors" : "Emotional Mentors"}
            </h2>
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-sm shadow-sm"
            >
              <FaFilter />
              Filters
            </button>
          </div>

          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">Filter mentors</h3>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 text-slate-500"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="p-4">{filterSidebar}</div>
                <div className="p-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold"
                  >
                    Show {filteredMentors.length} mentors
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <div className="hidden lg:block">{filterSidebar}</div>

            <div>
              <div className="hidden lg:flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {type === "professional" ? "Professional Mentors" : "Emotional Mentors"}
                </h2>
                <p className="text-slate-500 text-sm">
                  {filteredMentors.length} mentor{filteredMentors.length !== 1 ? "s" : ""} found
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
                  ))}
                </div>
              ) : filteredMentors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredMentors.map((mentor) => (
                    <MentorLandingCard
                      key={mentor._id}
                      mentor={mentor}
                      navigate={navigate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
                  <p className="text-slate-600 mb-4">
                    No mentors match your filters right now. Try adjusting filters or browse all
                    mentors.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 mb-4">
            {type === "emotional"
              ? "Looking for career, business, or professional guidance?"
              : "Looking for emotional support, relationships, or personal clarity?"}
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(
                type === "emotional" ? "/mentors/professional" : "/mentors/emotional",
              )
            }
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-purple-500 text-purple-600 font-semibold hover:bg-purple-50 transition-colors"
          >
            {type === "emotional"
              ? "Browse Professional Mentors →"
              : "Browse Emotional Mentors →"}
          </button>
        </div>
      </section>

      <Footer />
    </Layout>
  );
}
