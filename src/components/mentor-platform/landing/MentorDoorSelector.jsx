import React from "react";
import { useNavigate } from "react-router-dom";

export default function MentorDoorSelector() {
  const navigate = useNavigate();

  return (
    <section className="mp-doors">
        <button
          type="button"
          className="mp-door mp-door-em"
          onClick={() => navigate("/mentors/emotional/about")}
        >
          <span className="mp-door-tag mp-mono">🌿 Emotional Support</span>
          <h2 className="mp-door-title mp-serif">Emotional Mentors</h2>
          <p className="mp-door-sub">
            For anxiety, grief, relationships, burnout, and the feelings you can&apos;t quite name yet.
          </p>
          <span className="mp-door-cta">
            Explore Emotional Mentors <span className="mp-door-arrow">→</span>
          </span>
        </button>

        <div className="mp-door-divider">
          <div className="mp-door-divider-dot">or</div>
        </div>

        <button
          type="button"
          className="mp-door mp-door-pr"
          onClick={() => navigate("/mentors/professional/about")}
        >
          <span className="mp-door-tag mp-mono">💼 Career & Professional</span>
          <h2 className="mp-door-title mp-serif">Professional Mentors</h2>
          <p className="mp-door-sub">
            For career moves, interview prep, HR, product, data, UX — honest guidance from people who&apos;ve done it.
          </p>
          <span className="mp-door-cta">
            Explore Professional Mentors <span className="mp-door-arrow">→</span>
          </span>
        </button>
    </section>
  );
}
