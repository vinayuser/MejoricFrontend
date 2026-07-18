import React from "react";
import MentorCard from "./MentorCard";

export default function MentorCardGrid({ mentors, onSelectMentor, loading }) {
  if (loading) {
    return (
      <div className="mp-disc-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="mp-disc-card mp-disc-skeleton" />
        ))}
      </div>
    );
  }

  if (!mentors.length) {
    return (
      <p className="mp-disc-empty">
        No mentors available right now. Please check back soon.
      </p>
    );
  }

  return (
    <div className="mp-disc-grid">
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
