import React from "react";
import mentorHeroBg from "../../../assets/img/mentor-hero-banner.jpg";
import "./MentorHeroBanner.css";

export default function MentorHeroBanner({ onExplore }) {
  return (
    <section className="mentor-hero" aria-labelledby="mentor-hero-heading">
      <div className="mentor-hero-media" aria-hidden="true">
        <img
          src={mentorHeroBg}
          alt=""
          className="mentor-hero-img"
          fetchPriority="high"
        />
        <div className="mentor-hero-fade" />
      </div>

      <div className="mentor-hero-inner">
        <div className="mentor-hero-copy">
          <div className="mentor-hero-text">
            <h1 id="mentor-hero-heading" className="mentor-hero-title">
            Move Forward With Someone Who’s Been There.
            </h1>
            <p className="mentor-hero-sub">
            Life and work don't always come with clear answers. Sometimes, the right conversation with the right person is all it takes to see your next step differently.
            </p>
          </div>

          <div className="mentor-hero-actions">
            <button
              type="button"
              className="mentor-hero-btn"
              onClick={onExplore}
            >
              Find Your Mentor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
