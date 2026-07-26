import React from "react";
import { FaShieldAlt, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { trackPixel } from "../utils/metaPixel";
import heroBanner from "../assets/img/hero-find-clarity.jpg";
import "./HomeHero.css";

export default function HomeHero() {
  const navigate = useNavigate();

  const go = (path, contentId) => {
    trackPixel("ViewContent");
    if (typeof window.gtag === "function") {
      window.gtag("event", "select_content", {
        content_type: "CTA Button",
        content_id: contentId,
      });
    }
    navigate(path);
  };

  return (
    <section className="home-hero" aria-labelledby="home-hero-heading">
      <div className="home-hero-media" aria-hidden="true">
        <img
          src={heroBanner}
          alt=""
          className="home-hero-img"
          fetchPriority="high"
        />
        <div className="home-hero-fade" />
      </div>

      <div className="home-hero-inner">
        <div className="home-hero-copy">
          <div className="home-hero-badge">
            <FaShieldAlt className="home-hero-badge-icon" aria-hidden="true" />
            <span>Your Safe Space for Growth</span>
          </div>

          <h1 id="home-hero-heading" className="home-hero-title">
            Find Clarity, <span>Your Way.</span>
          </h1>

          <p className="home-hero-sub">
            Whether you need a Mate to listen or a Mentor to lead, we&apos;re
            here for you. Start your journey to a calmer mind today with
            compassionate, professional guidance.
          </p>

          <div className="home-hero-actions">
            <button
              type="button"
              className="home-hero-btn home-hero-btn-mate"
              onClick={() => go("/mate", "hero_talk_to_mate")}
            >
              Talk to a Mate
            </button>
            <button
              type="button"
              className="home-hero-btn home-hero-btn-mentor"
              onClick={() =>
                go("/mentors/professional/browse", "hero_find_mentor")
              }
            >
              Find a Mentor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
