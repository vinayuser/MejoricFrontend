import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import MentorPlatformLayout from "../MentorPlatformLayout";
import MentorDomainSidebar from "./MentorDomainSidebar";
import MentorCardGrid from "./MentorCardGrid";
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
  const activePage = type === "professional" ? "Professional Mentors" : "Emotional Mentors";

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

  const domainName = activeDomain?.name || "All Mentors";
  const domainSub =
    activeDomainId === "all"
      ? `All ${cfg.label.toLowerCase()}. Browse and find your match`
      : `${cfg.label} specialising in ${domainName}`;

  return (
    <MentorPlatformLayout activePage={activePage} type={type}>
      <div className="mp-domains-layout">
        <MentorDomainSidebar
          type={type}
          domains={domainsWithCounts}
          activeDomainId={activeDomainId}
          onSelectDomain={handleDomainSelect}
          totalCount={mentors.length}
        />

        <div className="mp-domains-main">
          <h1 className="mp-dm-title mp-serif">{domainName}</h1>
          <p className="mp-dm-sub">{domainSub}</p>
          <MentorCardGrid
            mentors={filteredMentors}
            onSelectMentor={handleSelectMentor}
            loading={loading}
          />
        </div>
      </div>
    </MentorPlatformLayout>
  );
}
