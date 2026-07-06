import React from "react";
import { useNavigate } from "react-router-dom";
import { LANDING_CHIPS } from "../../../data/mentorPlatformConfig";

export default function MentorDiagnosticChips() {
  const navigate = useNavigate();

  const handleChip = (type) => {
    navigate(`/mentors/${type}/about`);
  };

  return (
    <section className="mp-diag">
      <div className="mp-diag-inner">
        <p className="mp-diag-label">Not sure where to start? Tap what sounds like you</p>
        <div className="mp-chip-row">
          {LANDING_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              className="mp-chip"
              onClick={() => handleChip(chip.type)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
