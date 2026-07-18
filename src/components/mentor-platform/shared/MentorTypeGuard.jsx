import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { MENTOR_TYPES } from "../../../data/mentorPlatformConfig";

const PROFESSIONAL_BROWSE = "/mentors/professional/browse";

export function useValidMentorType() {
  const { type } = useParams();
  if (type === "emotional") return null;
  return MENTOR_TYPES[type] ? type : null;
}

/** Emotional mentors are hidden for now — only professional mentors are shown. */
export function MentorTypeGuard({ children }) {
  const { type } = useParams();
  if (type === "emotional") {
    return <Navigate to={PROFESSIONAL_BROWSE} replace />;
  }
  if (!MENTOR_TYPES[type]) {
    return <Navigate to={PROFESSIONAL_BROWSE} replace />;
  }
  return children;
}
