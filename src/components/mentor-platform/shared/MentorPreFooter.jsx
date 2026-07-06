import React from "react";
import { Link } from "react-router-dom";
import { getConfig } from "../../../data/mentorPlatformConfig";

export default function MentorPreFooter({ type }) {
  const cfg = getConfig(type);
  const base = `/mentors/${type}`;

  return (
    <section className="mp-pre-footer">
      <div className="mp-pre-footer-inner">
        <h2 className="mp-pre-footer-title mp-serif">Ready to find your mentor?</h2>
        <p className="mp-pre-footer-sub">
          Browse verified {cfg.label.toLowerCase()} and book your first session from ₹199.
        </p>
        <Link to={`${base}/browse`} className="mp-btn-primary">
          {cfg.cta}
        </Link>
      </div>
    </section>
  );
}
