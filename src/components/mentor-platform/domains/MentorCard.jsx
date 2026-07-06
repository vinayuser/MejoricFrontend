import React from "react";
import { getInitials } from "../../../data/mentorPlatformConfig";

export default function MentorCard({ mentor, onClick }) {
  return (
    <button type="button" className="mp-mentor-card" onClick={() => onClick(mentor)}>
      <div className="mp-mc-top" />
      <div className="mp-mc-body">
        <div className="mp-mc-avatar">
          {mentor.img ? (
            <img src={mentor.img} alt={mentor.name} />
          ) : (
            mentor.av || getInitials(mentor.name)
          )}
        </div>
        <div className="mp-mc-name">{mentor.name}</div>
        <div className="mp-mc-domain">
          {(mentor.domains || [mentor.domain].filter(Boolean)).slice(0, 2).join(" · ")}
          {(mentor.domains || []).length > 2 ? " · …" : ""}
        </div>
        <div className="mp-mc-tags">
          {(mentor.tags || []).map((tag) => (
            <span key={tag} className="mp-mc-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="mp-mc-foot">
          <div>
            <div className="mp-mc-rate">{mentor.rate} / session</div>
            <div className="mp-mc-exp">{mentor.exp} experience</div>
          </div>
          <span className="mp-mc-book">View Profile →</span>
        </div>
      </div>
    </button>
  );
}
