import React from "react";
import {
  FaBolt,
  FaEllipsisH,
  FaLayerGroup,
  FaMountain,
} from "react-icons/fa";
import { getConfig } from "../../../data/mentorPlatformConfig";

const SECTION_ICONS = {
  "The Bedrock": FaLayerGroup,
  "The Catalyst": FaBolt,
  "The Summit": FaMountain,
  "Specialized Guidance": FaEllipsisH,
};

export default function MentorDomainSidebar({
  type,
  domains,
  activeDomainId,
  onSelectDomain,
  totalCount,
  variant = "default",
}) {
  const cfg = getConfig(type);
  const isBrowse = variant === "browse";

  const allDomain = domains.find((d) => d.id === "all");
  const sectionDomains = domains.filter((d) => d.id !== "all");

  const sections = sectionDomains.reduce((acc, d) => {
    const sec = d.section || "All";
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(d);
    return acc;
  }, {});

  if (isBrowse) {
    return (
      <aside className="mp-browse-sidebar">
        <div className="mp-browse-side-sticky">
          {allDomain ? (
            <button
              type="button"
              className={`mp-browse-side-link${
                activeDomainId === "all" ? " active" : ""
              }`}
              onClick={() => onSelectDomain("all")}
            >
              All Mentors
            </button>
          ) : null}

          {Object.entries(sections).map(([section, items]) => {
            const Icon = SECTION_ICONS[section] || FaLayerGroup;
            return (
              <div key={section} className="mp-browse-side-group">
                <h3 className="mp-browse-side-label">
                  <Icon aria-hidden="true" />
                  {section}
                </h3>
                <ul className="mp-browse-side-list">
                  {items.map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        className={`mp-browse-side-link${
                          d.id === activeDomainId ? " active" : ""
                        }`}
                        onClick={() => onSelectDomain(d.id)}
                      >
                        <span className="mp-browse-side-name">{d.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="mp-domains-sidebar">
      <div className="mp-ds-header">
        <span className={`mp-type-pill ${type}`}>{cfg.pill}</span>
        <h2 className="mp-ds-title">{cfg.title}</h2>
        <p className="mp-ds-count">{totalCount} mentors available</p>
      </div>

      {Object.entries(
        domains.reduce((acc, d) => {
          const sec = d.section || "All";
          if (!acc[sec]) acc[sec] = [];
          acc[sec].push(d);
          return acc;
        }, {}),
      ).map(([section, items]) => (
        <div key={section} className="mp-ds-section">
          {section !== "All" && (
            <span className="mp-ds-sec-label">{section}</span>
          )}
          {items.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`mp-ds-item${d.id === activeDomainId ? " active" : ""}`}
              onClick={() => onSelectDomain(d.id)}
            >
              <span className="mp-ds-item-name">{d.name}</span>
              <span className="mp-ds-item-count">{d.count}</span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
