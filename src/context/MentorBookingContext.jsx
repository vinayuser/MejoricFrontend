import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

const MentorBookingContext = createContext(null);

const EMPTY_BOOKING = {
  mentorType: null,
  mentor: null,
  format: "video",
  slot: null,
  price: 0,
};

export function MentorBookingProvider({ children }) {
  const [booking, setBooking] = useState(EMPTY_BOOKING);

  const setBookingDraft = useCallback((patch) => {
    setBooking((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearBooking = useCallback(() => {
    setBooking(EMPTY_BOOKING);
  }, []);

  const value = useMemo(
    () => ({ booking, setBookingDraft, clearBooking }),
    [booking, setBookingDraft, clearBooking],
  );

  return (
    <MentorBookingContext.Provider value={value}>
      {children}
    </MentorBookingContext.Provider>
  );
}

export function useMentorBooking() {
  const ctx = useContext(MentorBookingContext);
  if (!ctx) {
    throw new Error("useMentorBooking must be used within MentorBookingProvider");
  }
  return ctx;
}
