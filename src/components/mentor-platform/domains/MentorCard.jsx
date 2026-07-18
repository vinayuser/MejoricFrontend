import React from "react";
import { FaStar } from "react-icons/fa";
import { getInitials } from "../../../data/mentorPlatformConfig";
import { getMentorFromPrice } from "../../../utils/mentorPlatformApi";

export default function MentorCard({ mentor, onClick }) {
  const title =
    mentor.domain ||
    mentor.category ||
    (mentor.domains || [])[0] ||
    "Career Mentor";
  const specialization =
    (mentor.domains || []).slice(0, 2).join(" · ") ||
    mentor.qual ||
    mentor.skills ||
    "Professional guidance";
  const experience =
    mentor.exp && String(mentor.exp).toLowerCase().includes("yr")
      ? mentor.exp
      : mentor.exp
        ? `${mentor.exp} experience`
        : "Experienced mentor";
  const fromPrice = getMentorFromPrice(mentor);

  return (
    <button type="button" className="mp-disc-card" onClick={() => onClick(mentor)}>
      <div className="mp-disc-media">
        {mentor.img ? (
          <img src={mentor.img} alt={mentor.name} />
        ) : (
          <div
            className="mp-disc-fallback"
            style={{ background: mentor.avColor || "var(--mp-accent)" }}
          >
            {mentor.av || getInitials(mentor.name)}
          </div>
        )}
      </div>

      <div className="mp-disc-body">
        <h3 className="mp-disc-name">{mentor.name}</h3>
        <p className="mp-disc-title">{title}</p>
        {mentor.qual ? <p className="mp-disc-company">{mentor.qual}</p> : null}

        <div className="mp-disc-rating">
          <div className="mp-disc-stars" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <FaStar key={i} />
            ))}
          </div>
          <span>Verified mentor</span>
        </div>

        {mentor.bio ? <p className="mp-disc-bio">{mentor.bio}</p> : null}

        <div className="mp-disc-meta">
          <span className="mp-disc-chip">{experience}</span>
          <span className="mp-disc-spec">{specialization}</span>
        </div>

        <div className="mp-disc-price">From ₹{fromPrice}/min</div>

        <span className="mp-disc-cta">View Profile</span>
      </div>
    </button>
  );
}
