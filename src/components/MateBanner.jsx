import React from "react";
import mateBannerBg from "../assets/img/mate-banner-hero.png";
import "./MateBanner.css";

export default function MateBanner({
  onlineCount = 0,
  onStartTalking,
  onHowItWorks,
}) {
  const onlineLabel =
    onlineCount > 0
      ? `${onlineCount}+ Mate${onlineCount === 1 ? "" : "s"} online now`
      : "Mates ready to listen";

  return (
    <section className="mate-banner" aria-labelledby="mate-banner-heading">
      <div className="mate-banner-media" aria-hidden="true">
        <img
          src={mateBannerBg}
          alt=""
          className="mate-banner-img"
          fetchPriority="high"
        />
        <div className="mate-banner-fade" />
      </div>

      <div className="mate-banner-inner">
        <div className="mate-banner-copy">
          <div className="mate-banner-text">
            <h1 id="mate-banner-heading" className="mate-banner-title">
              Your Safe Space for Conversation
            </h1>
            <p className="mate-banner-sub">
              Sometimes, all you need is someone who truly listens. Your first
              conversation is on us. Find connection in a judgement-free
              environment.
            </p>
          </div>

          <div className="mate-banner-actions">
            <button
              type="button"
              className="mate-banner-btn mate-banner-btn-secondary"
              onClick={onHowItWorks}
            >
              Talk Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
