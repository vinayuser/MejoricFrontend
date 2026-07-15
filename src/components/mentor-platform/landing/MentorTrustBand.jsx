import React from "react";
import { TRUST_CONTENT } from "../../../data/mentorPlatformConfig";

export default function MentorTrustBand() {
  return (
    <section className="mp-trust">
      <div className="mp-trust-inner">
        <div className="mp-trust-head">
          <p className="mp-trust-eyebrow">Before you book</p>
          <h2 className="mp-trust-title mp-serif">What Mejoric Mentors are and what they are not</h2>
        </div>

        <div className="mp-trust-grid">
          <div className="mp-trust-col yes">
            <div className="mp-trust-col-head">
              <span>✓</span> What they are
            </div>
            {TRUST_CONTENT.yes.map((line) => (
              <div key={line} className="mp-trust-row">
                <span className="mp-trust-mark">✓</span>
                <span>{line}</span>
              </div>
            ))}
          </div>

          <div className="mp-trust-col no">
            <div className="mp-trust-col-head">
              <span>✕</span> What they are not
            </div>
            {TRUST_CONTENT.no.map((line) => (
              <div key={line} className="mp-trust-row">
                <span className="mp-trust-mark">✕</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
