import React from "react";

export default function MentorExplainGrid({ grid = [] }) {
  return (
    <div className="mp-exp-grid">
      {grid.map((cell) => (
        <div key={cell.head} className={`mp-exp-cell${cell.dark ? " dark" : ""}`}>
          <div className="mp-exp-cell-title">{cell.head}</div>
          <div className="mp-exp-cell-body">{cell.body}</div>
        </div>
      ))}
    </div>
  );
}
