import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../Layout";
import Footer from "../Footer";
import {
  QUESTIONS,
  PAGE_SIZE,
  TOTAL_PAGES,
  SECTION_LABELS,
  TRAIT_DIMS,
  FUNCTION_INFO,
} from "../../data/compassQuestions";
import {
  computeJung,
  computeTraits,
  typeTitle,
  archetypeText,
  computeRecommendation,
  formatNote,
  getCompassAxes,
  getStackRoles,
  pct100,
} from "../../utils/compassScoring";
import "./CompassAssessment.css";

function CompassSvg({ axes }) {
  const cx = 160;
  const cy = 160;
  const r = 98;
  const rings = [1, 0.66, 0.33];
  const path = axes
    .map((ax, i) => {
      const angle = ((Math.PI * 2) / 4) * i - Math.PI / 2;
      const val = ax.pct / 100;
      const dist = r * 0.35 + r * 0.65 * val;
      return `${(cx + dist * Math.cos(angle)).toFixed(1)},${(
        cy + dist * Math.sin(angle)
      ).toFixed(1)}`;
    })
    .join(" ");
  const labelPos = [
    { x: cx, y: cy - r - 14, t: "People / Alone" },
    { x: cx + r + 30, y: cy + 4, t: "Now / What If" },
    { x: cx, y: cy + r + 22, t: "Head / Heart" },
    { x: cx - r - 30, y: cy + 4, t: "Plan / Go" },
  ];

  return (
    <svg width="320" height="320" viewBox="0 0 320 320" aria-hidden>
      {rings.map((f) => (
        <circle
          key={f}
          cx={cx}
          cy={cy}
          r={(r * f).toFixed(1)}
          fill="none"
          stroke="#E3DCF0"
          strokeWidth="1"
        />
      ))}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#E3DCF0" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#E3DCF0" />
      <polygon
        points={path}
        fill="rgba(181,103,122,0.22)"
        stroke="#B5677A"
        strokeWidth="2"
      />
      {axes.map((ax, i) => {
        const angle = ((Math.PI * 2) / 4) * i - Math.PI / 2;
        const val = ax.pct / 100;
        const dist = r * 0.35 + r * 0.65 * val;
        const x = cx + dist * Math.cos(angle);
        const y = cy + dist * Math.sin(angle);
        return (
          <circle
            key={i}
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r="6"
            fill="#5F4F86"
            opacity="0.9"
          />
        );
      })}
      <circle cx={cx} cy={cy} r="3" fill="#3D2B3A" />
      {labelPos.map((l) => (
        <text
          key={l.t}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="#7C6BA8"
          fontFamily="DM Sans, sans-serif"
        >
          {l.t}
        </text>
      ))}
    </svg>
  );
}

function RadarSvg({ traits }) {
  const cx = 150;
  const cy = 150;
  const r = 112;
  const n = TRAIT_DIMS.length;
  const ringFracs = [0.25, 0.5, 0.75, 1];

  return (
    <svg width="340" height="320" viewBox="-40 -10 380 320" aria-hidden>
      {ringFracs.map((f) => {
        const pts = [];
        for (let i = 0; i < n; i++) {
          const angle = ((Math.PI * 2) / n) * i - Math.PI / 2;
          pts.push(
            `${(cx + r * f * Math.cos(angle)).toFixed(1)},${(
              cy + r * f * Math.sin(angle)
            ).toFixed(1)}`,
          );
        }
        return (
          <polygon
            key={f}
            points={pts.join(" ")}
            fill="none"
            stroke="#E3DCF0"
            strokeWidth="1"
          />
        );
      })}
      {TRAIT_DIMS.map((t, i) => {
        const angle = ((Math.PI * 2) / n) * i - Math.PI / 2;
        const ex = cx + r * Math.cos(angle);
        const ey = cy + r * Math.sin(angle);
        const lx = cx + (r + 22) * Math.cos(angle);
        const ly = cy + (r + 22) * Math.sin(angle);
        return (
          <React.Fragment key={t.key}>
            <line
              x1={cx}
              y1={cy}
              x2={ex.toFixed(1)}
              y2={ey.toFixed(1)}
              stroke="#E3DCF0"
              strokeWidth="1"
            />
            <text
              x={lx.toFixed(1)}
              y={ly.toFixed(1)}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill="#5A5A5A"
              fontFamily="DM Sans, sans-serif"
            >
              {t.label}
            </text>
          </React.Fragment>
        );
      })}
      <polygon
        points={TRAIT_DIMS.map((t, i) => {
          const angle = ((Math.PI * 2) / n) * i - Math.PI / 2;
          const val = (traits[t.key] - 1) / 4;
          const dx = cx + r * val * Math.cos(angle);
          const dy = cy + r * val * Math.sin(angle);
          return `${dx.toFixed(1)},${dy.toFixed(1)}`;
        }).join(" ")}
        fill="rgba(95,79,134,0.28)"
        stroke="#5F4F86"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function CompassAssessment() {
  const [screen, setScreen] = useState("intro"); // intro | test | results
  const [consent, setConsent] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);

  const pageStart = currentPage * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, QUESTIONS.length);
  const pageQuestions = QUESTIONS.slice(pageStart, pageEnd);

  const pageComplete = useMemo(() => {
    for (let i = pageStart; i < pageEnd; i++) {
      if (answers[i] == null) return false;
    }
    return true;
  }, [answers, pageStart, pageEnd]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen, currentPage]);

  const results = useMemo(() => {
    if (screen !== "results") return null;
    const jung = computeJung(answers);
    const traits = computeTraits(answers);
    return {
      jung,
      traits,
      title: typeTitle(jung),
      arch: archetypeText(jung, traits),
      recs: computeRecommendation(jung, traits),
      format: formatNote(traits),
      axes: getCompassAxes(jung),
      stack: getStackRoles(jung),
    };
  }, [screen, answers]);

  const startTest = () => {
    if (!consent) return;
    setScreen("test");
    setCurrentPage(0);
  };

  const setAnswer = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const nextPage = () => {
    if (!pageComplete) return;
    if (currentPage < TOTAL_PAGES - 1) {
      setCurrentPage((p) => p + 1);
    } else {
      setScreen("results");
    }
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const restart = () => {
    setAnswers({});
    setCurrentPage(0);
    setConsent(false);
    setScreen("intro");
  };

  return (
    <Layout activePage="compass">
      <div className="compass-page">
        <div className="compass-progress" aria-hidden>
          <div
            className="compass-progress-fill"
            style={{
              width: `${screen === "intro" ? 0 : screen === "results" ? 100 : progressPct}%`,
            }}
          />
        </div>

        <div className="compass-wrap">
          <div className="compass-topbar">
            <div className="compass-brand">
              MEJORIC <span>COMPASS</span>
              <small>Getting to Know You</small>
            </div>
            <div className="compass-confid">Psychometric assessment</div>
          </div>

          {screen === "intro" && (
            <section className="compass-screen">
              <div className="compass-eyebrow">A friendly quiz, just for you</div>
              <h1 className="compass-hero-title">
                Let&apos;s get to know <em>you</em> a little better.
              </h1>
              <p className="compass-hero-sub">
                Answer some quick, easy questions about yourself. It&apos;s not a
                test — there&apos;s nothing to study for, and no answer is wrong.
                When you&apos;re done, we&apos;ll suggest a Mejoric Mate or Mentor
                who might be a great person for you to talk to.
              </p>

              <div className="compass-pillars">
                <div className="compass-pillar one">
                  <h3>No Wrong Answers</h3>
                  <p>
                    Just pick what feels true for you right now. Nobody is grading
                    this, and you can&apos;t get it &quot;wrong.&quot;
                  </p>
                </div>
                <div className="compass-pillar two">
                  <h3>Totally Private</h3>
                  <p>
                    This just helps us get to know you a bit. It&apos;s never used
                    to judge you, and it&apos;s not a fixed label about who you
                    are.
                  </p>
                </div>
                <div className="compass-pillar three">
                  <h3>Finds Your Best Match</h3>
                  <p>
                    At the end, we&apos;ll suggest the kind of person — a Mate, a
                    Mentor, or someone else — who might be a great fit for you.
                  </p>
                </div>
              </div>

              <div className="compass-meta">
                <div className="compass-meta-item">
                  <b>54</b>short questions
                </div>
                <div className="compass-meta-item">
                  <b>~12 min</b>to finish
                </div>
                <div className="compass-meta-item">
                  <b>0</b>right or wrong answers
                </div>
                <div className="compass-meta-item">
                  <b>Not</b>a grade
                </div>
              </div>

              <div className="compass-safety">
                <b>Before you start —</b> this is just for fun and to help us get
                to know you. It is not a medical test, and nobody will judge you by
                it. If something is really bothering you right now, please stop and
                talk to a grown-up you trust — a parent, a teacher, a Mejoric
                Mentor, or a helpline — first.
              </div>

              <label className="compass-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  I&apos;ll answer honestly, and I understand this is just to help
                  me — not a fixed label about who I am.
                </span>
              </label>

              <div className="compass-cta">
                <button
                  type="button"
                  className="compass-btn compass-btn-primary"
                  disabled={!consent}
                  onClick={startTest}
                >
                  Let&apos;s start! →
                </button>
                <span className="compass-hint">
                  Answers stay on this device to generate your result.
                </span>
              </div>

              <div className="compass-foot">
                <span>Mejoric · The Compass v1.0</span>
                <span>mejoric.com</span>
              </div>
            </section>
          )}

          {screen === "test" && (
            <section className="compass-screen">
              <div className="compass-test-head">
                <div className="compass-section-label">
                  {SECTION_LABELS[currentPage] || "Part B"}
                </div>
                <div className="compass-page-count">
                  Page {currentPage + 1} of {TOTAL_PAGES}
                </div>
              </div>

              {pageQuestions.map((q, localIdx) => {
                const index = pageStart + localIdx;
                return (
                  <div className="compass-q-card" key={index}>
                    <div className="compass-q-text">
                      <span className="qn">{index + 1}.</span>
                      {q.text}
                    </div>
                    <div className="compass-likert-opts" role="radiogroup">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <label className="compass-likert-opt" key={v}>
                          <input
                            type="radio"
                            name={`q${index}`}
                            value={v}
                            checked={answers[index] === v}
                            onChange={() => setAnswer(index, v)}
                          />
                          <span>{v}</span>
                        </label>
                      ))}
                    </div>
                    <div className="compass-likert-labels">
                      <span>Not like me</span>
                      <span>Very much like me</span>
                    </div>
                  </div>
                );
              })}

              <div className="compass-nav">
                <button
                  type="button"
                  className="compass-btn compass-btn-ghost"
                  onClick={prevPage}
                  style={{ visibility: currentPage === 0 ? "hidden" : "visible" }}
                >
                  ← Back
                </button>
                <div className="compass-dots" aria-hidden>
                  {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                    <div
                      key={i}
                      className={`compass-dot${i < currentPage ? " done" : ""}${
                        i === currentPage ? " now" : ""
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="compass-btn compass-btn-primary"
                  disabled={!pageComplete}
                  onClick={nextPage}
                >
                  {currentPage === TOTAL_PAGES - 1
                    ? "See my results →"
                    : "Continue →"}
                </button>
              </div>
            </section>
          )}

          {screen === "results" && results && (
            <section className="compass-screen">
              <div className="compass-res-kicker">Your Mejoric Compass Result</div>
              <div className="compass-res-code">
                <div className="letters">
                  {results.jung.code.split("").map((l, i) => (
                    <span key={`${l}-${i}`}>{l}</span>
                  ))}
                </div>
                <div className="code-label">your code</div>
              </div>
              <h2 className="compass-res-title">
                {results.title.title} <em>({results.jung.code})</em>
              </h2>
              <p className="compass-res-desc">{results.title.desc}</p>

              <h3 className="compass-section-title">
                Your <em>Compass</em>
              </h3>
              <p className="compass-section-sub">
                Everyone&apos;s mind works a little differently. This shows where
                your energy likes to go, and how you notice things and make
                choices. No side is better than the other — they&apos;re just
                different ways of being you.
              </p>
              <div className="compass-viz-row">
                <CompassSvg axes={results.axes} />
                <div className="compass-legend">
                  {results.axes.map((ax) => {
                    const winner = ax.pct >= 50 ? ax.a : ax.b;
                    const showPct = ax.pct >= 50 ? ax.pct : 100 - ax.pct;
                    return (
                      <div className="compass-axis-row" key={ax.a}>
                        <div className="compass-axis-pole win">{winner}</div>
                        <div className="compass-axis-bar">
                          <div
                            className="compass-axis-bar-fill"
                            style={{ width: `${showPct}%` }}
                          />
                        </div>
                        <div className="compass-axis-pct">{showPct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <h3 className="compass-section-title">
                Your <em>Favourite Ways</em>
              </h3>
              <p className="compass-section-sub">
                We don&apos;t use every way of thinking equally. You have a
                favourite that leads, a helper that backs it up, one you&apos;re
                still getting good at, and one that&apos;s your growing edge.
              </p>
              <div className="compass-stack">
                {results.stack.map((r) => {
                  const info = FUNCTION_INFO[r.key];
                  return (
                    <div
                      key={r.role}
                      className={`compass-stack-card${
                        r.role === "Growing Edge" ? " inferior" : ""
                      }`}
                    >
                      <div className="role">{r.role}</div>
                      <div className="fn-name">{info?.name}</div>
                      <p>{info?.blurb}</p>
                    </div>
                  );
                })}
              </div>

              <h3 className="compass-section-title">
                Your <em>Support-Style</em> Profile
              </h3>
              <p className="compass-section-sub">
                These eight things describe how you like to get help: how open you
                are, how you bounce back, and what actually works best for you.
              </p>
              <div className="compass-trait-wrap">
                <RadarSvg traits={results.traits} />
                <div className="compass-trait-bars">
                  {TRAIT_DIMS.map((t) => {
                    const p = pct100(results.traits[t.key]);
                    return (
                      <div className="compass-trait-row" key={t.key}>
                        <div className="compass-trait-label">{t.label}</div>
                        <div className="compass-trait-bar">
                          <div
                            className="compass-trait-bar-fill"
                            style={{ width: `${p}%` }}
                          />
                        </div>
                        <div className="compass-trait-val">{p}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <h3 className="compass-section-title">
                Your <em>Type</em>
              </h3>
              <div className="compass-archetype">
                <div className="compass-archetype-eyebrow">
                  A fun snapshot, not a box
                </div>
                <div className="compass-archetype-name">{results.arch.name}</div>
                <p className="compass-archetype-text">{results.arch.desc}</p>
              </div>

              <h3 className="compass-section-title">
                Where This Points You — <em>at Mejoric</em>
              </h3>
              <p className="compass-section-sub">
                Based on your answers, here&apos;s a good place to start. You can
                always choose someone different if it doesn&apos;t feel right.
              </p>
              <div className="compass-rec-grid">
                {results.recs.map((r) => (
                  <Link
                    key={r.name}
                    to={r.path}
                    className={`compass-rec-card${r.primary ? " primary" : ""}`}
                  >
                    <div className="compass-rec-badge">{r.badge}</div>
                    <div className="compass-rec-name">{r.name}</div>
                    <div className="compass-rec-text">{r.text}</div>
                  </Link>
                ))}
              </div>
              <div className="compass-rec-format">{results.format}</div>

              <div className="compass-standing">
                <b>A note for everyone —</b> Mates and Mentors are warm, friendly
                people you can always talk to. But if something feels really heavy,
                a Mejoric grown-up helper (a licensed psychologist) is always just
                one step away — any time, no matter what this quiz says.
              </div>

              <div className="compass-disclaimer">
                Mejoric made this quiz ourselves, just for you. It&apos;s not a
                medical test and it hasn&apos;t been checked by doctors as a
                diagnosis tool — it&apos;s simply a fun, friendly way to learn a
                bit more about how you think, feel, and like to get help. Treat it
                as a starting point for a chat, not the final word on who you are.
              </div>

              <div className="compass-result-actions">
                <button
                  type="button"
                  className="compass-btn compass-btn-primary"
                  onClick={() => window.print()}
                >
                  Save / print my result
                </button>
                <button
                  type="button"
                  className="compass-btn compass-btn-ghost"
                  onClick={restart}
                >
                  Retake the assessment
                </button>
              </div>

              <div className="compass-foot">
                <span>Mejoric · The Compass v1.0</span>
                <span>mejoric.com</span>
              </div>
            </section>
          )}
        </div>
      </div>
      {screen !== "test" && <Footer />}
    </Layout>
  );
}
