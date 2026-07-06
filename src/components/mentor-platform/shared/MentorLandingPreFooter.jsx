import React from "react";
import { Link } from "react-router-dom";

export default function MentorLandingPreFooter() {
  return (
    <section className="mp-pre-footer">
      <div className="mp-pre-footer-inner">
        <h2 className="mp-pre-footer-title mp-serif">Start with one conversation</h2>
        <p className="mp-pre-footer-sub">
          Whether you need emotional support or professional direction, your first session starts from ₹199.
        </p>
        <div className="mp-cta-row" style={{ justifyContent: "center" }}>
          <Link to="/mentors/emotional/about" className="mp-btn-primary">
            Emotional Mentors →
          </Link>
          <Link to="/mentors/professional/about" className="mp-btn-secondary">
            Professional Mentors →
          </Link>
        </div>
      </div>
    </section>
  );
}
