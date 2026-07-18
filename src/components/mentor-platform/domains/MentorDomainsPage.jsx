import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import MentorPlatformLayout from "../MentorPlatformLayout";
import MentorCardGrid from "./MentorCardGrid";
import {
  CareerMentorHero,
  CareerNeedsSection,
  MentorExplanationSection,
  HowItWorksSection,
  SessionOutcomesSection,
  WhyMejoricSection,
  ExpectationsSection,
  CareerMentorFaqSection,
  CareerMentorFinalCta,
} from "../career/CareerMentorLandingSections";
import { getConfig } from "../../../data/mentorPlatformConfig";
import {
  fetchPlatformMentors,
  filterMentorsByDomain,
  countMentorsPerDomain,
} from "../../../utils/mentorPlatformApi";

export default function MentorDomainsPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cfg = getConfig(type);
  const base = `/mentors/${type}`;

  const domainFromUrl = searchParams.get("domain") || "all";
  const [activeDomainId, setActiveDomainId] = useState(domainFromUrl);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveDomainId(domainFromUrl);
  }, [domainFromUrl]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPlatformMentors(type).then((list) => {
      if (!cancelled) {
        setMentors(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [type]);

  const domainsWithCounts = useMemo(
    () => countMentorsPerDomain(mentors, cfg.domains),
    [mentors, cfg.domains],
  );

  const activeDomain = domainsWithCounts.find((d) => d.id === activeDomainId);
  const filteredMentors = useMemo(
    () => filterMentorsByDomain(mentors, activeDomainId, activeDomain?.name),
    [mentors, activeDomainId, activeDomain?.name],
  );

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

  return (
    <MentorPlatformLayout activePage="Mentors" type={type}>
      <CareerMentorHero onExplore={scrollToMentors} />
      <CareerNeedsSection onSelectNeed={scrollToMentors} />
      <MentorExplanationSection />
      <HowItWorksSection />

      <section id="mentors" className="mp-disc">
        <div className="mp-disc-inner">
          <div className="mp-disc-hero">
            <span className="mp-disc-eyebrow">Career mentorship</span>
            <h2 className="mp-disc-heading">Meet Your Mentors</h2>
            <p className="mp-disc-sub">
              Our network includes industry experts, executives, and seasoned
              professionals ready to guide you.
            </p>

            <div
              className="mp-disc-filters"
              role="tablist"
              aria-label="Mentor categories"
            >
              {domainsWithCounts.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  role="tab"
                  aria-selected={activeDomainId === domain.id}
                  className={`mp-disc-filter${
                    activeDomainId === domain.id ? " active" : ""
                  }`}
                  onClick={() => handleDomainSelect(domain.id)}
                >
                  {domain.id === "all" ? "All" : domain.name}
                  {domain.id !== "all" ? (
                    <span className="mp-disc-filter-count">{domain.count}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <MentorCardGrid
            mentors={filteredMentors}
            onSelectMentor={handleSelectMentor}
            loading={loading}
          />
        </div>
      </section>

      <SessionOutcomesSection />
      <WhyMejoricSection />
      <ExpectationsSection />
      <CareerMentorFaqSection />
      <CareerMentorFinalCta onFindMentor={scrollToMentors} />
    </MentorPlatformLayout>
  );
}
