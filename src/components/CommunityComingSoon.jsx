import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import Footer from "./Footer";
import "./CommunityComingSoon.css";

export default function CommunityComingSoon() {
  const navigate = useNavigate();

  return (
    <Layout activePage="Community">
      <section className="ccs-section" aria-labelledby="ccs-heading">
        <div className="ccs-inner">
          <span className="ccs-badge">Community</span>
          <h1 id="ccs-heading" className="ccs-title">
            Coming Soon
          </h1>
          <p className="ccs-sub">
            We&apos;re building a safer space to connect, share, and grow
            together. Check back shortly, something thoughtful is on the way.
          </p>
          <div className="ccs-actions">
            <button
              type="button"
              className="ccs-btn ccs-btn-secondary"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
}
