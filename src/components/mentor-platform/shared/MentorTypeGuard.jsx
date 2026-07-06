import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { MENTOR_TYPES } from "../../../data/mentorPlatformConfig";

export function useValidMentorType() {
  const { type } = useParams();
  return MENTOR_TYPES[type] ? type : null;
}

export function MentorTypeGuard({ children }) {
  const type = useValidMentorType();
  if (!type) return <Navigate to="/mentors" replace />;
  return children;
}
