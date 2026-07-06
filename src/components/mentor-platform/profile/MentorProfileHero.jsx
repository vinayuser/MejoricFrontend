import React from "react";
import { getInitials } from "../../../data/mentorPlatformConfig";
import {
  getFormatPrice,
  getFormatPricePerMin,
} from "../../../utils/mentorPlatformApi";

export default function MentorProfileHero({ mentor, type, cfg }) {
  if (!mentor) return null;

  const audioPerMin = getFormatPricePerMin(mentor, "audio");
  const videoPerMin = getFormatPricePerMin(mentor, "video");
  const videoSessionTotal = getFormatPrice(mentor, "video");

  return (
    <div className="mp-ph-left">
      <div className="mp-ph-avatar">
        {mentor.img ? (
          <img src={mentor.img} alt={mentor.name} />
        ) : (
          mentor.av || getInitials(mentor.name)
        )}
      </div>
      <span className={`mp-type-pill ${type}`}>{cfg.pill}</span>
      <h1 className="mp-ph-name mp-serif">{mentor.name}</h1>
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
          <div className="mp-ph-stat-val">₹{audioPerMin}/min</div>
          <div className="mp-ph-stat-lbl">Audio calls</div>
        </div>
        <div className="mp-ph-stat">
          <div className="mp-ph-stat-val">₹{videoPerMin}/min</div>
          <div className="mp-ph-stat-lbl">Video · ₹{videoSessionTotal.toLocaleString("en-IN")} / 45m</div>
        </div>
      </div>
    </div>
  );
}
