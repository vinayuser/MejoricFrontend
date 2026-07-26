import React from "react";
import { getInitials } from "../../../data/mentorPlatformConfig";
import { getFormatPrice } from "../../../utils/mentorPlatformApi";
import { capitalizeName } from "../../../utils/formatters";

export default function MentorProfileHero({ mentor, type, cfg }) {
  if (!mentor) return null;

  const displayName = capitalizeName(mentor.name);
  const audioSession = getFormatPrice(mentor, "audio");
  const videoSession = getFormatPrice(mentor, "video");

  return (
    <div className="mp-ph-left">
      <div className="mp-ph-avatar">
        {mentor.img ? (
          <img src={mentor.img} alt={displayName} />
        ) : (
          mentor.av || getInitials(displayName)
        )}
      </div>
      <span className={`mp-type-pill ${type}`}>{cfg.pill}</span>
      <h1 className="mp-ph-name mp-serif">{displayName}</h1>
      <div className="mp-ph-domain">
        {(mentor.domains || [mentor.domain].filter(Boolean)).join(" · ")}
      </div>
      <div className="mp-ph-tags">
        {(mentor.tags || []).map((tag) => (
          <span key={tag} className="mp-ph-tag">
            {tag}
          </span>
        ))}
        {mentor.exp && <span className="mp-ph-tag">{mentor.exp} experience</span>}
      </div>
      <p className="mp-ph-bio">{mentor.bio}</p>
      <div className="mp-ph-stats">
        <div className="mp-ph-stat">
          <div className="mp-ph-stat-val">{mentor.exp}</div>
          <div className="mp-ph-stat-lbl">Experience</div>
        </div>
        <div className="mp-ph-stat">
          <div className="mp-ph-stat-val">
            ₹{audioSession.toLocaleString("en-IN")}
          </div>
          <div className="mp-ph-stat-lbl">Audio · 45 min</div>
        </div>
        <div className="mp-ph-stat">
          <div className="mp-ph-stat-val">
            ₹{videoSession.toLocaleString("en-IN")}
          </div>
          <div className="mp-ph-stat-lbl">Video · 45 min</div>
        </div>
      </div>
    </div>
  );
}
