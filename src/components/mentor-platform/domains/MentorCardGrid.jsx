import React from "react";
import MentorCard from "./MentorCard";

export default function MentorCardGrid({
  mentors,
  onSelectMentor,
  loading,
  variant = "disc",
}) {
  const gridClass =
    variant === "domains"
      ? "mp-mentor-grid"
      : variant === "listing"
        ? "mp-list-grid"
        : "mp-disc-grid";
  const skeletonClass =
    variant === "domains"
      ? "mp-mentor-card mp-disc-skeleton"
      : variant === "listing"
        ? "mp-list-card mp-disc-skeleton"
        : "mp-disc-card mp-disc-skeleton";

  if (loading) {
    return (
      <div className={gridClass}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={skeletonClass} />
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
    <div className={gridClass}>
      {mentors.map((mentor) => (
        <MentorCard
          key={mentor.id || mentor._id}
          mentor={mentor}
          onClick={onSelectMentor}
          variant={variant}
        />
      ))}
    </div>
  );
}
