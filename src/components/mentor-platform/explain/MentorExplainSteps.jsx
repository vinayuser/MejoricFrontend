import React from "react";

export default function MentorExplainSteps({ steps = [] }) {
  return (
    <div className="mp-exp-steps">
      {steps.map((step) => (
        <div key={step.n} className="mp-exp-step">
          <div className="mp-exp-step-n">{step.n}</div>
          <div className="mp-exp-step-t">{step.t}</div>
          <div className="mp-exp-step-b">{step.b}</div>
        </div>
      ))}
    </div>
  );
}
