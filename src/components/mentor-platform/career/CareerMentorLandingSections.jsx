import React, { useState } from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaChevronDown,
  FaBullseye,
  FaChartLine,
  FaBriefcase,
  FaBolt,
} from "react-icons/fa";
import {
  CAREER_NEEDS,
  HOW_IT_WORKS_STEPS,
  SESSION_OUTCOMES,
  WHY_MEJORIC,
  MENTOR_FAQ_ITEMS,
} from "../../../data/careerMentorLanding";
import MentorHeroBanner from "./MentorHeroBanner";

const OUTCOME_ICONS = [FaBullseye, FaChartLine, FaBriefcase, FaBolt];

export function CareerMentorHero({ onExplore }) {
  return <MentorHeroBanner onExplore={onExplore} />;
}



export function MentorExplanationSection() {
  return (
    <section className="mp-cl-section">
      <div className="mp-cl-wrap mp-cl-explain">
        <div>
          <h2 className="mp-cl-h2">More Than Advice</h2>
          <p className="mp-cl-copy">
            Mejoric mentors aren&apos;t coaches or consultants. They&apos;re experienced
            professionals who&apos;ve achieved what you&apos;re working toward. They provide
            personalized guidance based on real experience, not generic frameworks.
          </p>
          <div className="mp-cl-checks">
            <div>
              <FaCheckCircle />
              <div>
                <h4>Real Industry Experience</h4>
                <p>Every mentor has proven expertise in their field.</p>
              </div>
            </div>
            <div>
              <FaCheckCircle />
              <div>
                <h4>Accountability Partner</h4>
                <p>Regular check-ins keep you focused on what matters for your career.</p>
              </div>
            </div>
            <div>
              <FaCheckCircle />
              <div>
                <h4>Network Access</h4>
                <p>Tap into your mentor&apos;s professional network for introductions and opportunities.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mp-cl-explain-panel">
          <span>💼</span>
          <p>Professional mentorship, structured for results</p>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mp-cl-section mp-cl-tint">
      <div className="mp-cl-wrap">
        <div className="mp-cl-section-head">
          <h2 className="mp-cl-h2">How Mejoric Works</h2>
          <p>A simple, structured approach to getting the mentorship you need.</p>
        </div>
        <div className="mp-cl-steps">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={step.number} className="mp-cl-step">
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="mp-cl-step-line" aria-hidden="true" />
              )}
              <div className="mp-cl-step-card">
                <div className="mp-cl-step-num">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SessionOutcomesSection() {
  return (
    <section className="mp-cl-section mp-cl-tint">
      <div className="mp-cl-wrap">
        <div className="mp-cl-section-head">
          <h2 className="mp-cl-h2">What You&apos;ll Get</h2>
          <p>
            Every session is designed to deliver concrete value and move you
            forward on your goals.
          </p>
        </div>
        <div className="mp-cl-outcomes">
          {SESSION_OUTCOMES.map((outcome, index) => {
            const Icon = OUTCOME_ICONS[index] || FaBullseye;
            return (
              <div key={outcome.title} className="mp-cl-outcome">
                <div className="mp-cl-outcome-icon">
                  <Icon />
                </div>
                <div>
                  <h3>{outcome.title}</h3>
                  <p>{outcome.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WhyMejoricSection() {
  return (
    <section className="mp-cl-section">
      <div className="mp-cl-wrap">
        <div className="mp-cl-section-head">
          <h2 className="mp-cl-h2">Why Choose Mejoric?</h2>
          <p>
            We&apos;ve built the platform specifically for professional career
            development, not generic coaching.
          </p>
        </div>
        <div className="mp-cl-why-grid">
          {WHY_MEJORIC.map((reason) => (
            <div key={reason.title} className="mp-cl-why-card">
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExpectationsSection() {
  return (
    <section className="mp-cl-section mp-cl-tint">
      <div className="mp-cl-wrap mp-cl-expect-wrap">
        <div className="mp-cl-expect">
          <h2 className="mp-cl-h2">Set Yourself Up for Success</h2>
          <div className="mp-cl-expect-grid">
            <div>
              <h3>✓ What to Bring</h3>
              <ul>
                <li>
                  <strong>Clear goals.</strong> What specifically do you want to work on?
                </li>
                <li>
                  <strong>Current context.</strong> Share your role, company, and industry background
                </li>
                <li>
                  <strong>Openness to feedback.</strong> Honest perspectives help you grow
                </li>
                <li>
                  <strong>Commitment.</strong> Show up prepared and ready to implement advice
                </li>
              </ul>
            </div>
            <div>
              <h3>⏱ Time Commitment</h3>
              <ul>
                <li>
                  <strong>Monthly:</strong> 1-2 hours per session, 1 session/month
                </li>
                <li>
                  <strong>Biweekly:</strong> 45-60 minute sessions, ideal for active projects
                </li>
                <li>
                  <strong>Between sessions:</strong> Implement advice, track progress, prepare questions
                </li>
                <li>
                  <strong>Most successful mentees</strong> dedicate 3-5 hours/month total
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CareerMentorFaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="mp-cl-section">
      <div className="mp-cl-wrap mp-cl-faq-wrap">
        <div className="mp-cl-section-head">
          <h2 className="mp-cl-h2">Frequently Asked Questions</h2>
          <p>Everything you need to know about Mejoric mentorship.</p>
        </div>
        <div className="mp-cl-faq-list">
          {MENTOR_FAQ_ITEMS.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className="mp-cl-faq-item">
                <button
                  type="button"
                  className="mp-cl-faq-q"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span>{item.question}</span>
                  <FaChevronDown className={open ? "open" : ""} />
                </button>
                {open && <div className="mp-cl-faq-a">{item.answer}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CareerMentorFinalCta({ onFindMentor }) {
  return (
    <section className="mp-cl-final">
      <div className="mp-cl-wrap mp-cl-final-inner">
        <h2>Ready to Accelerate Your Career?</h2>
        <p>
          Connect with an expert mentor today. Most mentees see meaningful
          progress within 2-3 months.
        </p>
        <div className="mp-cl-final-actions">
          <button type="button" className="mp-cl-btn-light" onClick={onFindMentor}>
            Find Your Mentor 
          </button>
          <a href="mailto:support@mejoric.com" className="mp-cl-btn-outline">
            Contact Support
          </a>
        </div>
        <p className="mp-cl-final-note">
          Questions? Our team is here to help.{" "}
          <a href="mailto:support@mejoric.com">support@mejoric.com</a>
        </p>
      </div>
    </section>
  );
}
