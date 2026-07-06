import React from "react";
import MentorCard from "./MentorCard";

export default function MentorCardGrid({ mentors, onSelectMentor, loading }) {
  if (loading) {
    return (
      <div className="mp-mentor-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mp-mentor-card" style={{ opacity: 0.5, minHeight: 220 }} />
        ))}
      </div>
    );
  }

  if (!mentors.length) {
    return (
      <p style={{ fontSize: 13, color: "var(--mp-g4)", padding: 20 }}>
        No mentors in this domain yet.
      </p>
    );
  }

  return (
    <div className="mp-mentor-grid">
      {mentors.map((mentor) => (
        <MentorCard
          key={mentor.id || mentor._id}
          mentor={mentor}
          onClick={onSelectMentor}
        />
      ))}
    </div>
  );
}
