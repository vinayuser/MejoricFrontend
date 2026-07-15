import React from "react";

export default function MentorProfileSections({ mentor }) {
  if (!mentor) return null;

  const specs = mentor.specs || [];
  const expectItems = [
    "A private 1-to-1 session on video or audio",
    "You lead the conversation at your pace",
    "Completely confidential",
    "Verified by Mejoric before going live",
  ];

  return (
    <div className="mp-prof-sections">
      <div>
        <div className="mp-ps-section">
          <div className="mp-ps-title">Specialises in</div>
          {specs.map((s) => (
            <div key={s} className="mp-ps-item">
              <div className="mp-ps-dot" />
              {s}
            </div>
          ))}
        </div>
        <div className="mp-ps-section">
          <div className="mp-ps-title">Qualification</div>
          <div className="mp-ps-item">
            <div className="mp-ps-dot" />
            {mentor.qual}
          </div>
        </div>
      </div>
      <div>
        <div className="mp-ps-section">
          <div className="mp-ps-title">Approach</div>
          <div className="mp-ps-item">
            <div className="mp-ps-dot" />
            {mentor.approach}
          </div>
        </div>
        <div className="mp-ps-section">
          <div className="mp-ps-title">What to expect</div>
          {expectItems.map((item) => (
            <div key={item} className="mp-ps-item">
              <div className="mp-ps-dot" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
