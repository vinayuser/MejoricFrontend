import React from "react";
import { FaBriefcase, FaStar } from "react-icons/fa";
import { getInitials } from "../../../data/mentorPlatformConfig";
import { getMentorFromPrice } from "../../../utils/mentorPlatformApi";
import { capitalizeName } from "../../../utils/formatters";

/** Card matching Mejoric_Mentor_Platform_.html mentor-card */
export default function MentorCard({ mentor, onClick, variant = "disc" }) {
  const displayName = capitalizeName(mentor.name);
  const title =
    mentor.domain ||
    mentor.category ||
    (mentor.domains || [])[0] ||
    "Emotional Mentor";
  const tags = (mentor.tags || mentor.domains || []).slice(0, 3);
  const experience =
    mentor.exp && String(mentor.exp).toLowerCase().includes("yr")
      ? mentor.exp
      : mentor.exp
        ? `${mentor.exp} yrs`
        : null;
  const fromPrice = getMentorFromPrice(mentor);
  const rateLabel =
    mentor.rate ||
    (fromPrice
      ? `From ₹${Number(fromPrice).toLocaleString("en-IN")}`
      : null);
  const rating = mentor.rating || mentor.avgRating || null;
  const reviewCount = mentor.reviewCount || mentor.reviews || null;

  if (variant === "listing") {
    const specialization =
      (mentor.domains || []).slice(0, 2).join(" · ") ||
      mentor.qual ||
      mentor.skills ||
      title;
    const expLabel =
      experience ||
      (mentor.exp ? `${mentor.exp} Years Experience` : "Experienced mentor");

    return (
      <article className="mp-list-card">
        <div className="mp-list-top">
          <div
            className="mp-list-avatar"
            style={
              mentor.img
                ? undefined
                : { background: mentor.avColor || "var(--mp-accent)" }
            }
          >
            {mentor.img ? (
              <img src={mentor.img} alt="" />
            ) : (
              mentor.av || getInitials(displayName)
            )}
          </div>
          <div className="mp-list-meta">
            <div className="mp-list-name-row">
              <h2 className="mp-list-name">{displayName}</h2>
              {rating ? (
                <div className="mp-list-rating">
                  <FaStar aria-hidden="true" />
                  <strong>{Number(rating).toFixed(1)}</strong>
                  {reviewCount ? (
                    <span>({reviewCount} reviews)</span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <p className="mp-list-role">{specialization}</p>
            <p className="mp-list-exp">
              <FaBriefcase aria-hidden="true" />
              {expLabel}
            </p>
          </div>
        </div>

        {mentor.bio ? (
          <p className="mp-list-bio">{mentor.bio}</p>
        ) : (
          <p className="mp-list-bio">
            Personalized 1-to-1 mentorship focused on clarity, growth, and your
            next concrete step.
          </p>
        )}

        {tags.length > 0 ? (
          <div className="mp-list-tags">
            {tags.map((t) => (
              <span key={t} className="mp-list-tag">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mp-list-actions">
          <button
            type="button"
            className="mp-list-btn mp-list-btn-ghost"
            onClick={() => onClick(mentor)}
          >
            View Profile
          </button>
          <button
            type="button"
            className="mp-list-btn mp-list-btn-solid"
            onClick={() => onClick(mentor)}
          >
            Book Session
          </button>
        </div>
      </article>
    );
  }

  if (variant === "domains") {
    return (
      <button
        type="button"
        className="mp-mentor-card"
        onClick={() => onClick(mentor)}
      >
        <div className="mp-mc-top" />
        <div className="mp-mc-body">
          <div
            className="mp-mc-avatar"
            style={
              mentor.img
                ? undefined
                : { background: mentor.avColor || "var(--mp-accent)" }
            }
          >
            {mentor.img ? (
              <img src={mentor.img} alt="" />
            ) : (
              mentor.av || getInitials(displayName)
            )}
          </div>
          <div className="mp-mc-name">{displayName}</div>
          <div className="mp-mc-domain">{title}</div>
          {tags.length > 0 && (
            <div className="mp-mc-tags">
              {tags.map((t) => (
                <span key={t} className="mp-mc-tag">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mp-mc-foot">
            <div>
              {rateLabel && <div className="mp-mc-rate">{rateLabel}</div>}
              {experience && (
                <div className="mp-mc-exp">{experience} experience</div>
              )}
            </div>
            <span className="mp-mc-book">View Profile →</span>
          </div>
        </div>
      </button>
    );
  }

  const specialization =
    (mentor.domains || []).slice(0, 2).join(" · ") ||
    mentor.qual ||
    mentor.skills ||
    "Professional guidance";
  const expLabel =
    mentor.exp && String(mentor.exp).toLowerCase().includes("yr")
      ? mentor.exp
      : mentor.exp
        ? `${mentor.exp} experience`
        : "Experienced mentor";

  return (
    <button type="button" className="mp-disc-card" onClick={() => onClick(mentor)}>
      <div className="mp-disc-media">
        {mentor.img ? (
          <img src={mentor.img} alt={displayName} />
        ) : (
          <div
            className="mp-disc-fallback"
            style={{ background: mentor.avColor || "var(--mp-accent)" }}
          >
            {mentor.av || getInitials(displayName)}
          </div>
        )}
      </div>

      <div className="mp-disc-body">
        <h3 className="mp-disc-name">{displayName}</h3>
        <p className="mp-disc-title">{title}</p>
        {mentor.qual ? <p className="mp-disc-company">{mentor.qual}</p> : null}

        {mentor.bio ? <p className="mp-disc-bio">{mentor.bio}</p> : null}

        <div className="mp-disc-meta">
          <span className="mp-disc-chip">{expLabel}</span>
          <span className="mp-disc-spec">{specialization}</span>
        </div>

        <div className="mp-disc-price">
          From ₹{Number(fromPrice).toLocaleString("en-IN")}
        </div>

        <span className="mp-disc-cta">View Profile</span>
      </div>
    </button>
  );
}
