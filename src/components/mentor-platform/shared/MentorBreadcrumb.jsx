import React from "react";
import { Link } from "react-router-dom";

export default function MentorBreadcrumb({ items = [] }) {
  return (
    <nav className="mp-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <span className="mp-bc-sep">›</span>}
          {item.to ? (
            <Link to={item.to}>{item.label}</Link>
          ) : item.onClick ? (
            <button type="button" onClick={item.onClick}>
              {item.label}
            </button>
          ) : (
            <span>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
