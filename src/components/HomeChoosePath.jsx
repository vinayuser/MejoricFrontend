import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trackPixel } from "../utils/metaPixel";
import mateBg from "../assets/img/hcp-mate-bg.png";
import mentorBg from "../assets/img/hcp-mentor-bg.png";
import "./HomeChoosePath.css";

const MATE = {
  tag: "For when you need to talk",
  lines: [
    "A trained, empathetic listener, no advice, no scripts",
    "Instant, judgment-free conversation",
    "Best for venting, feeling heard, easing overwhelm",
  ],
};

const MENTOR = {
  tag: "For when you need direction",
  lines: [
    "A seasoned professional for structured guidance",
    "Goal-oriented sessions on career growth & decisions",
    "Best for planning your next concrete steps",
  ],
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useTypewriter(fullTag, fullLines, start) {
  const [tag, setTag] = useState("");
  const [lines, setLines] = useState(() => fullLines.map(() => ""));
  const [typingLine, setTypingLine] = useState(-1);
  const [typingTag, setTypingTag] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!start) return undefined;

    let cancelled = false;

    const run = async () => {
      if (prefersReducedMotion()) {
        setTag(fullTag);
        setLines([...fullLines]);
        setComplete(true);
        return;
      }

      setTypingTag(true);
      for (let i = 0; i <= fullTag.length; i += 1) {
        if (cancelled) return;
        setTag(fullTag.slice(0, i));
        await wait(i === 0 ? 40 : 28);
      }
      setTypingTag(false);
      await wait(220);

      const next = fullLines.map(() => "");
      for (let li = 0; li < fullLines.length; li += 1) {
        if (cancelled) return;
        setTypingLine(li);
        const text = fullLines[li];
        for (let i = 0; i <= text.length; i += 1) {
          if (cancelled) return;
          next[li] = text.slice(0, i);
          setLines([...next]);
          await wait(16 + (i % 5 === 0 ? 8 : 0));
        }
        await wait(160);
      }

      if (!cancelled) {
        setTypingLine(-1);
        setComplete(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [start, fullTag, fullLines]);

  return { tag, lines, typingTag, typingLine, complete };
}

function PathCard({
  variant,
  bg,
  tag,
  lines,
  typingTag,
  typingLine,
  complete,
  btnLabel,
  btnClass,
  onClick,
}) {
  return (
    <article className={`hcp-card hcp-card-${variant}`}>
      <img className="hcp-card-media" src={bg} alt="" aria-hidden="true" />
      <div className="hcp-card-body">
        <p className={`hcp-card-tag${typingTag ? " is-typing" : ""}`}>
          {tag}
          {typingTag ? <span className="hcp-caret" aria-hidden="true" /> : null}
        </p>
        <ul className="hcp-list" aria-live="polite">
          {lines.map((line, i) => (
            <li
              key={`${variant}-${i}`}
              className={typingLine === i ? "is-typing" : line ? "is-shown" : ""}
            >
              <span className="hcp-line-text">{line}</span>
              {typingLine === i ? (
                <span className="hcp-caret" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={`hcp-btn ${btnClass}${complete ? " is-ready" : ""}`}
          onClick={onClick}
          tabIndex={complete ? 0 : -1}
          aria-hidden={!complete}
        >
          {btnLabel}
        </button>
      </div>
    </article>
  );
}

export default function HomeChoosePath() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [start, setStart] = useState(false);

  const mate = useTypewriter(MATE.tag, MATE.lines, start);
  const mentor = useTypewriter(MENTOR.tag, MENTOR.lines, start);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
    <section
      ref={sectionRef}
      className="hcp-section"
      aria-labelledby="hcp-heading"
    >
      <div className="hcp-inner">
        <header className="hcp-head">
          <h2 id="hcp-heading" className="hcp-title">
            Mate or Mentor?
          </h2>
          <p className="hcp-sub">
            Both paths lead to clarity, pick the kind of conversation that fits
            how you feel right now.
          </p>
        </header>

        <div className="hcp-grid">
          <PathCard
            variant="mate"
            bg={mateBg}
            tag={mate.tag}
            lines={mate.lines}
            typingTag={mate.typingTag}
            typingLine={mate.typingLine}
            complete={mate.complete}
            btnLabel="Talk to a Mate"
            btnClass="hcp-btn-mate"
            onClick={() => go("/mate", "choose_path_mate")}
          />
          <PathCard
            variant="mentor"
            bg={mentorBg}
            tag={mentor.tag}
            lines={mentor.lines}
            typingTag={mentor.typingTag}
            typingLine={mentor.typingLine}
            complete={mentor.complete}
            btnLabel="Find a Mentor"
            btnClass="hcp-btn-mentor"
            onClick={() =>
              go("/mentors/professional/browse", "choose_path_mentor")
            }
          />
        </div>
      </div>
    </section>
  );
}
