import React from "react";
import { useParams, Link } from "react-router-dom";
import MentorPlatformLayout from "../MentorPlatformLayout";
import MentorBreadcrumb from "../shared/MentorBreadcrumb";
import MentorPreFooter from "../shared/MentorPreFooter";
import MentorExplainGrid from "./MentorExplainGrid";
import MentorExplainSteps from "./MentorExplainSteps";
import { getConfig } from "../../../data/mentorPlatformConfig";

export default function MentorExplainPage() {
  const { type } = useParams();
  const cfg = getConfig(type);
  const base = `/mentors/${type}`;
  const activePage = type === "professional" ? "Professional Mentors" : "Emotional Mentors";

  return (
    <MentorPlatformLayout activePage={activePage} type={type}>
      <div className="mp-explain-page">
        <div className="mp-explain-wrap">
          <MentorBreadcrumb
            items={[
              { label: "Mentors", to: "/mentors" },
              { label: cfg.breadcrumbLabel || cfg.title },
            ]}
          />

          <span className={`mp-type-pill ${type}`}>{cfg.pill}</span>
          <h1 className="mp-exp-title mp-serif">{cfg.title}</h1>
          <p className="mp-exp-tagline">{cfg.tagline}</p>

          <MentorExplainGrid grid={cfg.grid} />

          <div className="mp-exp-how">
            <h2 className="mp-exp-how-title">How it works</h2>
            <MentorExplainSteps steps={cfg.steps} />
          </div>

          <div className="mp-cta-row">
            <Link to={`${base}/browse`} className="mp-btn-primary">
              {cfg.cta}
            </Link>
            <Link to="/mentors" className="mp-btn-secondary">
              ← Back to mentors
            </Link>
          </div>
        </div>
      </div>
      <MentorPreFooter type={type} />
    </MentorPlatformLayout>
  );
}
