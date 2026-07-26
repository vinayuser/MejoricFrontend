import React from "react";
import "./MentorClimbCta.css";

export default function MentorClimbCta({ onBrowseDomains }) {
  return (
    <section className="mp-climb" aria-labelledby="mp-climb-heading">
      <div className="mp-climb-inner">
        <h2 id="mp-climb-heading" className="mp-climb-title">
          Ready to Climb?
        </h2>
        <div className="mp-climb-actions">
          <button
            type="button"
            className="mp-climb-btn mp-climb-btn-light"
            onClick={onBrowseDomains}
          >
            Browse All Domains
          </button>
          <a
            href="mailto:support@mejoric.com"
            className="mp-climb-btn mp-climb-btn-outline"
          >
            Talk to a Consultant
          </a>
        </div>
      </div>
    </section>
  );
}
