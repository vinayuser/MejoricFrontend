import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaSlidersH } from "react-icons/fa";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import MentorPlatformLayout from "../MentorPlatformLayout";
import MentorDomainSidebar from "./MentorDomainSidebar";
import MentorCardGrid from "./MentorCardGrid";
import { CareerMentorHero } from "../career/CareerMentorLandingSections";
import MentorSoulSection from "../career/MentorSoulSection";
import { getConfig } from "../../../data/mentorPlatformConfig";
import {
  fetchPlatformMentors,
  filterMentorsByDomain,
  countMentorsPerDomain,
  getMentorFromPrice,
} from "../../../utils/mentorPlatformApi";

function parseExperienceYears(mentor) {
  const raw = mentor?.exp ?? mentor?.yearsOfExperience ?? "";
  const match = String(raw).match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function mentorMatchesExperience(mentor, experienceFilter) {
  if (!experienceFilter || experienceFilter === "any") return true;
  const years = parseExperienceYears(mentor);
  if (years == null) return false;
  if (experienceFilter === "0-5") return years < 5;
  if (experienceFilter === "5-10") return years >= 5 && years < 10;
  if (experienceFilter === "10+") return years >= 10;
  return true;
}

function mentorMatchesPriceRange(mentor, priceRange) {
  if (!priceRange || priceRange === "any") return true;
  const price = getMentorFromPrice(mentor);
  if (!Number.isFinite(price)) return false;
  if (priceRange === "0-500") return price < 500;
  if (priceRange === "500-1500") return price >= 500 && price <= 1500;
  if (priceRange === "1500-3000") return price > 1500 && price <= 3000;
  if (priceRange === "3000+") return price > 3000;
  return true;
}

export default function MentorDomainsPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cfg = getConfig(type);
  const base = `/mentors/${type}`;
  const isEmotional = type === "emotional";
  const filtersRef = useRef(null);

  const domainFromUrl = searchParams.get("domain") || "all";
  const [activeDomainId, setActiveDomainId] = useState(domainFromUrl);
  const [allMentors, setAllMentors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("any");
  const [priceRange, setPriceRange] = useState("any");
  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setActiveDomainId(domainFromUrl);
  }, [domainFromUrl]);

  // Full list for sidebar counts
  useEffect(() => {
    let cancelled = false;
    fetchPlatformMentors(type).then((list) => {
      if (!cancelled) setAllMentors(list);
    });
    return () => {
      cancelled = true;
    };
  }, [type]);

  // Listing fetch — API filtered by selected category/specification
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const domain = cfg.domains.find((d) => d.id === activeDomainId);
    const specification =
      activeDomainId === "all" ? undefined : domain?.name || undefined;

    fetchPlatformMentors(type, { specification }).then((list) => {
      if (cancelled) return;
      setMentors(list);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [type, activeDomainId, cfg.domains]);

  useEffect(() => {
    if (!filtersOpen) return undefined;
    const onPointerDown = (event) => {
      if (!filtersRef.current?.contains(event.target)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [filtersOpen]);

  const domainsWithCounts = useMemo(
    () => countMentorsPerDomain(allMentors, cfg.domains),
    [allMentors, cfg.domains],
  );

  const activeDomain = domainsWithCounts.find((d) => d.id === activeDomainId);
  const activeFilterCount =
    (experienceFilter !== "any" ? 1 : 0) + (priceRange !== "any" ? 1 : 0);

  const filteredMentors = useMemo(() => {
    // Prefer API category results; fall back to client filter of full list
    let list =
      activeDomainId === "all"
        ? mentors.length
          ? mentors
          : allMentors
        : mentors.length
          ? mentors
          : filterMentorsByDomain(
              allMentors,
              activeDomainId,
              activeDomain?.name,
            );

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const hay = `${m.name || ""} ${m.domain || ""} ${m.category || ""} ${(m.domains || []).join(" ")} ${m.skills || ""} ${m.qual || ""} ${m.bio || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    list = list.filter(
      (m) =>
        mentorMatchesExperience(m, experienceFilter) &&
        mentorMatchesPriceRange(m, priceRange),
    );

    if (sortBy === "price-asc" || sortBy === "price-desc") {
      list = [...list].sort((a, b) => {
        const pa = getMentorFromPrice(a);
        const pb = getMentorFromPrice(b);
        return sortBy === "price-asc" ? pa - pb : pb - pa;
      });
    } else if (sortBy === "exp-desc" || sortBy === "exp-asc") {
      list = [...list].sort((a, b) => {
        const ea = parseExperienceYears(a) ?? -1;
        const eb = parseExperienceYears(b) ?? -1;
        return sortBy === "exp-asc" ? ea - eb : eb - ea;
      });
    } else if (sortBy === "rating") {
      list = [...list].sort(
        (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0),
      );
    }

    return list;
  }, [
    mentors,
    allMentors,
    activeDomainId,
    activeDomain?.name,
    searchQuery,
    experienceFilter,
    priceRange,
    sortBy,
  ]);

  const handleDomainSelect = (domainId) => {
    setActiveDomainId(domainId);
    if (domainId === "all") {
      searchParams.delete("domain");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ domain: domainId }, { replace: true });
    }
  };

  const handleSelectMentor = (mentor) => {
    navigate(`${base}/mentor/${mentor.id || mentor._id}`);
  };

  const scrollToMentors = () => {
    document.getElementById("mentors")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const clearFilters = () => {
    setExperienceFilter("any");
    setPriceRange("any");
  };

  /* Emotional mentors — HTML platform design (sidebar domains + cards) */
  if (isEmotional) {
    const activePage = "Emotional Mentors";
    return (
      <MentorPlatformLayout activePage={activePage} type={type}>
        <div className="mp-domains-layout">
          <MentorDomainSidebar
            type={type}
            domains={domainsWithCounts}
            activeDomainId={activeDomainId}
            onSelectDomain={handleDomainSelect}
            totalCount={allMentors.length}
          />
          <main className="mp-domains-main">
            <div className="mp-dm-header">
              <h1 className="mp-dm-title">
                {activeDomain?.name || "All Emotional Mentors"}
              </h1>
              <p className="mp-dm-sub">
                {activeDomainId === "all"
                  ? "All emotional mentors — browse and find your match."
                  : `Mentors specializing in ${activeDomain?.name || "this area"}.`}
              </p>
            </div>
            <MentorCardGrid
              mentors={filteredMentors}
              onSelectMentor={handleSelectMentor}
              loading={loading}
              variant="domains"
            />
          </main>
        </div>
      </MentorPlatformLayout>
    );
  }

  /* Professional — hero, then categories + listing, then supporting sections */
  return (
    <MentorPlatformLayout activePage="Mentors" type={type}>
      <CareerMentorHero onExplore={scrollToMentors} />

      <section id="mentors" className="mp-browse">
        <div className="mp-browse-inner">
          <header className="mp-browse-head">
            <h2 className="mp-browse-title">Expert Mentorship for Every Stage</h2>
            <p className="mp-browse-sub">
              Find a safe harbor for your professional growth with mentors who
              have walked your path.
            </p>
          </header>

          <div className="mp-browse-layout">
            <MentorDomainSidebar
              type={type}
              domains={domainsWithCounts}
              activeDomainId={activeDomainId}
              onSelectDomain={handleDomainSelect}
              totalCount={allMentors.length}
              variant="browse"
            />

            <div className="mp-browse-main">
              <div className="mp-browse-toolbar">
                <label className="mp-browse-search">
                  <FaSearch aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search mentors by name, company, or specialty..."
                  />
                </label>

                <div className="mp-browse-actions">
                  <div className="mp-browse-filters-wrap" ref={filtersRef}>
                    <button
                      type="button"
                      className={`mp-browse-filters-btn${
                        filtersOpen || activeFilterCount ? " active" : ""
                      }`}
                      onClick={() => setFiltersOpen((open) => !open)}
                      aria-expanded={filtersOpen}
                    >
                      <FaSlidersH aria-hidden="true" />
                      Filters
                      {activeFilterCount > 0 ? (
                        <span className="mp-browse-filters-count">
                          {activeFilterCount}
                        </span>
                      ) : null}
                    </button>

                    {filtersOpen ? (
                      <div className="mp-browse-filters-panel" role="dialog">
                        <div className="mp-browse-filters-head">
                          <strong>Filters</strong>
                          <button
                            type="button"
                            className="mp-browse-filters-clear"
                            onClick={clearFilters}
                          >
                            Clear
                          </button>
                        </div>

                        <label className="mp-browse-filters-field">
                          <span>Years of experience</span>
                          <select
                            value={experienceFilter}
                            onChange={(e) =>
                              setExperienceFilter(e.target.value)
                            }
                          >
                            <option value="any">Any</option>
                            <option value="0-5">Under 5 years</option>
                            <option value="5-10">5–10 years</option>
                            <option value="10+">10+ years</option>
                          </select>
                        </label>

                        <label className="mp-browse-filters-field">
                          <span>Price range</span>
                          <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                          >
                            <option value="any">Any range</option>
                            <option value="0-500">Under ₹500 / session</option>
                            <option value="500-1500">₹500–₹1,500 / session</option>
                            <option value="1500-3000">₹1,500–₹3,000 / session</option>
                            <option value="3000+">₹3,000+ / session</option>
                          </select>
                        </label>

                        <button
                          type="button"
                          className="mp-browse-filters-apply"
                          onClick={() => setFiltersOpen(false)}
                        >
                          Apply filters
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {/* <select
                    className="mp-browse-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort mentors"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Top Rated</option>
                    <option value="exp-desc">Most Experienced</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="exp-asc">Experience: Low to High</option>
                  </select> */}
                </div>
              </div>

              <MentorCardGrid
                mentors={filteredMentors}
                onSelectMentor={handleSelectMentor}
                loading={loading}
                variant="listing"
              />
            </div>
          </div>
        </div>
      </section>

      <MentorSoulSection onFindMentor={scrollToMentors} />
    </MentorPlatformLayout>
  );
}
