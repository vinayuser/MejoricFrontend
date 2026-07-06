import React from "react";
import { getConfig } from "../../../data/mentorPlatformConfig";

export default function MentorDomainSidebar({
  type,
  domains,
  activeDomainId,
  onSelectDomain,
  totalCount,
}) {
  const cfg = getConfig(type);

  const sections = domains.reduce((acc, d) => {
    const sec = d.section || "All";
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(d);
    return acc;
  }, {});

  return (
    <aside className="mp-domains-sidebar">
      <div className="mp-ds-header">
        <span className={`mp-type-pill ${type}`}>{cfg.pill}</span>
        <h2 className="mp-ds-title">{cfg.title}</h2>
        <p className="mp-ds-count">{totalCount} mentors available</p>
      </div>

      {Object.entries(sections).map(([section, items]) => (
        <div key={section} className="mp-ds-section">
          {section !== "All" && <span className="mp-ds-sec-label">{section}</span>}
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
