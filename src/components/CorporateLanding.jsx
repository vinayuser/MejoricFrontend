import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaUserFriends,
  FaComments,
  FaBuilding,
  FaLock,
  FaArrowRight,
  FaHeadset,
  FaHeart,
} from "react-icons/fa";
import logo from "../img/logo.png";
import workspaceIllustration from "../assets/img/corporate-workspace.svg";
import heroBanner from "../assets/img/hero-find-clarity.jpg";
import "./CorporateLogin.css";
import "./CorporateLanding.css";

const CONSUMER_SITE_URL = "https://mejoric.com";

const FEATURES = [
  {
    icon: FaShieldAlt,
    title: "Confidential & secure",
    description:
      "Private conversations with trained Mates. What you share stays between you and your Mate.",
  },
  {
    icon: FaUserFriends,
    title: "Human support, on demand",
    description:
      "Connect with compassionate listeners for stress, relationships, career worries, and everyday life.",
  },
  {
    icon: FaBuilding,
    title: "Included by your organization",
    description:
      "Wellness minutes are sponsored by your company — no wallet or per-minute payments for you.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Sign in with work email",
    description: "Use your company email address to verify you belong to your organization.",
  },
  {
    step: "02",
    title: "Browse available Mates",
    description: "See who's online and choose someone who fits what you need today.",
  },
  {
    step: "03",
    title: "Chat, call, or video",
    description: "Start a confidential session — audio, video, or text — in a few taps.",
  },
  {
    step: "04",
    title: "Return whenever you need",
    description: "Support is there for ongoing check-ins, not just one-off moments.",
  },
];

const TRUST_POINTS = [
  {
    icon: FaLock,
    title: "Your privacy matters",
    description: "Sessions are confidential. Speak openly without worry.",
  },
  {
    icon: FaHeadset,
    title: "Real people, real listening",
    description: "Trained Mates who meet you where you are — no scripts, no judgment.",
  },
  {
    icon: FaHeart,
    title: "Support on your schedule",
    description: "Reach out when it suits you — mornings, evenings, or whenever life feels heavy.",
  },
];

function CorporateLandingHeader() {
  return (
    <header className="corp-auth-header corp-landing-header">
      <Link to="/" className="corp-auth-brand">
        <img src={logo} alt="Mejoric" />
        <span>Mejoric</span>
        <span className="corp-landing-badge">Corporate</span>
      </Link>
      <div className="corp-landing-header-actions">
        <Link to="/corporate/login" className="corp-landing-header-link">
          Sign in
        </Link>
        <Link to="/corporate/login" className="corp-landing-header-cta">
          Get started
        </Link>
      </div>
    </header>
  );
}

function CorporateLandingFooter() {
  return (
    <footer className="corp-auth-footer corp-landing-footer">
      <span>© 2026 Mejoric. All rights reserved.</span>
      <div className="corp-auth-footer-links">
        <a
          href={`${CONSUMER_SITE_URL}/privacy-policy`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
        <a
          href={`${CONSUMER_SITE_URL}/terms-and-conditions`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>
        <a
          href={`${CONSUMER_SITE_URL}/contact`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact Us
        </a>
        <a
          href={CONSUMER_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          mejoric.com
        </a>
      </div>
    </footer>
  );
}

export default function CorporateLanding() {
  const navigate = useNavigate();

  const goToLogin = () => navigate("/corporate/login");

  return (
    <div className="corp-landing-page">
      <CorporateLandingHeader />

      <section className="corp-landing-hero" aria-labelledby="corp-landing-heading">
        <div className="corp-landing-hero-media" aria-hidden="true">
          <img
            src={heroBanner}
            alt=""
            className="corp-landing-hero-img"
            fetchPriority="high"
          />
          <div className="corp-landing-hero-fade" />
        </div>

        <div className="corp-landing-hero-inner">
          <div className="corp-landing-hero-copy">
            <div className="corp-landing-hero-badge">
              <FaBuilding aria-hidden="true" />
              <span>Employee wellness</span>
            </div>
            <h1 id="corp-landing-heading" className="corp-landing-hero-title">
              Find clarity, <span>your way.</span>
            </h1>
            <p className="corp-landing-hero-sub">
              Confidential access to trained Mates — via chat, audio, or video —
              included through your organization&apos;s wellness plan.
            </p>
            <div className="corp-landing-hero-actions">
              <button
                type="button"
                className="corp-landing-btn corp-landing-btn-primary"
                onClick={goToLogin}
              >
                Sign in with work email
                <FaArrowRight aria-hidden="true" />
              </button>
              <button
                type="button"
                className="corp-landing-btn corp-landing-btn-secondary"
                onClick={goToLogin}
              >
                First time? Create account
              </button>
            </div>
          </div>

          <div className="corp-landing-hero-visual">
            <img
              src={workspaceIllustration}
              alt="Team collaborating in a modern workspace"
              className="corp-landing-hero-illustration"
            />
          </div>
        </div>
      </section>

      <section className="corp-landing-section">
        <div className="corp-landing-container">
          <div className="corp-landing-section-head">
            <h2>Why Mejoric Corporate</h2>
            <p>
              The same trusted Mate experience as mejoric.com — ready when you
              need someone to listen.
            </p>
          </div>
          <div className="corp-landing-features">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="corp-landing-feature-card">
                  <div className="corp-landing-feature-icon">
                    <Icon aria-hidden="true" />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="corp-landing-section corp-landing-section-alt">
        <div className="corp-landing-container">
          <div className="corp-landing-section-head">
            <h2>How it works</h2>
            <p>From login to your first conversation in minutes.</p>
          </div>
          <div className="corp-landing-steps">
            {STEPS.map((item) => (
              <article key={item.step} className="corp-landing-step">
                <span className="corp-landing-step-num">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="corp-landing-section">
        <div className="corp-landing-container corp-landing-split">
          <div className="corp-landing-split-copy">
            <div className="corp-landing-hero-badge corp-landing-hero-badge-inline">
              <FaComments aria-hidden="true" />
              <span>A safe space</span>
            </div>
            <h2>You don&apos;t have to carry it alone</h2>
            <p>
              Work, life, and everything in between can feel overwhelming.
              Mejoric gives you a confidential place to talk it through with
              someone who listens.
            </p>
            <button
              type="button"
              className="corp-landing-btn corp-landing-btn-primary"
              onClick={goToLogin}
            >
              Sign in to get started
              <FaArrowRight aria-hidden="true" />
            </button>
          </div>
          <div className="corp-landing-hr-grid">
            {TRUST_POINTS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="corp-landing-hr-card">
                  <Icon className="corp-landing-hr-icon" aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="corp-landing-cta-band">
        <div className="corp-landing-container corp-landing-cta-inner">
          <h2>Ready when you are</h2>
          <p>
            Sign in with your work email to browse Mates and start a
            conversation today.
          </p>
          <button
            type="button"
            className="corp-landing-btn corp-landing-btn-light"
            onClick={goToLogin}
          >
            Go to sign in
            <FaArrowRight aria-hidden="true" />
          </button>
        </div>
      </section>

      <CorporateLandingFooter />
    </div>
  );
}
