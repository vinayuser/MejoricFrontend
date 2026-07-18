import React from "react";
import { Link, useParams } from "react-router-dom";
import { useMentorBooking } from "../../../context/MentorBookingContext";
import MentorPlatformLayout from "../MentorPlatformLayout";
import { getConfig } from "../../../data/mentorPlatformConfig";
import { getFormatLabel } from "../../../utils/mentorPlatformApi";

export default function MentorBookingConfirmPage() {
  const { type } = useParams();
  const { booking } = useMentorBooking();
  const cfg = getConfig(type);
  const base = `/mentors/${type}`;
  const activePage = type === "professional" ? "Professional Mentors" : "Emotional Mentors";
  const { mentor, format, slot, price } = booking;
  const slotLabel =
    slot && typeof slot === "object"
      ? slot.label || slot.slotLabel
      : slot;

  if (!mentor) {
    return (
      <MentorPlatformLayout activePage={activePage} type={type}>
        <div className="mp-confirm-wrap">
          <p>No booking details found.</p>
          <Link to={`${base}/browse`} className="mp-btn-primary">
            Browse mentors
          </Link>
        </div>
      </MentorPlatformLayout>
    );
  }

  return (
    <MentorPlatformLayout activePage={activePage} type={type}>
      <div className="mp-confirm-wrap">
        <div className="mp-conf-icon">✅</div>
        <h1 className="mp-conf-title mp-serif">Booking Confirmed</h1>
        <p className="mp-conf-sub">
          Your session with {mentor.name} has been confirmed.
          <br />
          You will receive a calendar invite and session link shortly.
        </p>

        <div className="mp-conf-card">
          <div className="mp-conf-row">
            <span className="mp-conf-lbl">Mentor</span>
            <span className="mp-conf-val">{mentor.name}</span>
          </div>
          <div className="mp-conf-row">
            <span className="mp-conf-lbl">Domain</span>
            <span className="mp-conf-val">{mentor.domain}</span>
          </div>
          <div className="mp-conf-row">
            <span className="mp-conf-lbl">Format</span>
            <span className="mp-conf-val">{getFormatLabel(format)}</span>
          </div>
          <div className="mp-conf-row">
            <span className="mp-conf-lbl">Slot</span>
            <span className="mp-conf-val">{slotLabel}</span>
          </div>
          <div className="mp-conf-row">
            <span className="mp-conf-lbl">Amount</span>
            <span className="mp-conf-val">₹{(price || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="mp-conf-btns">
          <Link to={`${base}/browse`} className="mp-btn-primary">
            Book Another Session
          </Link>
          <Link to="/mentors/professional/browse" className="mp-btn-secondary">
            Back to mentors
          </Link>
        </div>
      </div>
    </MentorPlatformLayout>
  );
}
