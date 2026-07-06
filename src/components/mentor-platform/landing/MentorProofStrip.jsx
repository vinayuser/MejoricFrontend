import React from "react";
import { PROOF_CARDS } from "../../../data/mentorPlatformConfig";

export default function MentorProofStrip() {
  return (
    <section className="mp-proof">
      <div className="mp-proof-inner">
        <div className="mp-proof-head">
          <p className="mp-trust-eyebrow">Real outcomes</p>
          <h2 className="mp-trust-title mp-serif">What changes after one session</h2>
        </div>

        <div className="mp-proof-grid">
          {PROOF_CARDS.map((card, i) => (
            <article key={i} className="mp-proof-card">
              <span className={`mp-proof-tag ${card.type}`}>
                {card.type === "emotional" ? "🌿 Emotional" : "💼 Professional"}
              </span>
              <p className="mp-proof-before">Before</p>
              <p className="mp-proof-quote">{card.before}</p>
              <p className="mp-proof-after">After</p>
              <p className="mp-proof-quote2">{card.after}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
