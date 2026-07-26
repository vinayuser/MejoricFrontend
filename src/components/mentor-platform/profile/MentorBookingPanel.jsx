import React, { useEffect, useState } from "react";
import { SESSION_FORMATS } from "../../../data/mentorPlatformConfig";
import { getFormatPrice } from "../../../utils/mentorPlatformApi";
import {
  fetchAvailableDates,
  fetchAvailableSlots,
  formatLongDate,
  getMonthMatrix,
  parseDateKey,
  toDateKey,
} from "../../../utils/mentorBooking";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function ProfileCalendar({
  viewDate,
  selectedDateKey,
  availableDateKeys,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  loading,
}) {
  const monthLabel = viewDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const todayKey = toDateKey(new Date());
  const cells = getMonthMatrix(viewDate);

  return (
    <div className="mp-bc-calendar">
      <div className="mp-bc-cal-header">
        <button type="button" className="mp-bc-cal-nav" onClick={onPrevMonth} aria-label="Previous month">
          ‹
        </button>
        <span className="mp-bc-cal-month">{monthLabel}</span>
        <button type="button" className="mp-bc-cal-nav" onClick={onNextMonth} aria-label="Next month">
          ›
        </button>
      </div>

      {loading ? (
        <p className="mp-bc-cal-loading">Loading dates…</p>
      ) : (
        <>
          <div className="mp-bc-cal-weekdays">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mp-bc-cal-grid">
            {cells.map((date, index) => {
              if (!date) {
                return <span key={`e-${index}`} className="mp-bc-cal-empty" />;
              }
              const dateKey = toDateKey(date);
              const isPast = dateKey < todayKey;
              const isAvailable = availableDateKeys.includes(dateKey);
              const isSelected = selectedDateKey === dateKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={isPast || !isAvailable}
                  onClick={() => onSelectDate(dateKey)}
                  className={`mp-bc-cal-day${isSelected ? " selected" : ""}${isAvailable && !isPast ? " available" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          {availableDateKeys.length === 0 && (
            <p className="mp-bc-cal-empty-msg">No available dates this month.</p>
          )}
        </>
      )}
    </div>
  );
}

export default function MentorBookingPanel({
  mentor,
  format,
  slot,
  onFormatChange,
  onSlotChange,
  onBook,
  bookingDisabled,
  refreshKey = 0,
}) {
  const isDemo = mentor?.isDemo;
  const mentorId = mentor?._id || mentor?.id;
  const demoSlots = mentor?.slots || [];

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [availableDateKeys, setAvailableDateKeys] = useState([]);
  const [apiSlots, setApiSlots] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (isDemo || !mentorId) return undefined;
    let cancelled = false;
    setLoadingDates(true);

    fetchAvailableDates(mentorId, viewDate)
      .then((dates) => {
        if (cancelled) return;
        setAvailableDateKeys(dates);
        if (dates.length > 0 && !dates.includes(selectedDateKey)) {
          setSelectedDateKey(dates[0]);
        } else if (dates.length === 0) {
          setSelectedDateKey("");
          onSlotChange(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDates(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mentorId, viewDate, isDemo, refreshKey]);

  useEffect(() => {
    if (isDemo || !mentorId || !selectedDateKey) {
      setApiSlots([]);
      return undefined;
    }
    let cancelled = false;
    setLoadingSlots(true);

    fetchAvailableSlots(mentorId, selectedDateKey)
      .then((slots) => {
        if (cancelled) return;
        setApiSlots(slots);
        const currentId = slot && typeof slot === "object" ? slot.id : null;
        if (currentId && slots.some((s) => s.id === currentId)) {
          return;
        }
        const bookable = slots.filter((s) => !s.bookedByMe);
        const myBooked = slots.filter((s) => s.bookedByMe);
        onSlotChange(bookable[0] || myBooked[0] || null);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mentorId, selectedDateKey, isDemo, refreshKey]);

  const handleSelectDate = (dateKey) => {
    setSelectedDateKey(dateKey);
    onSlotChange(null);
  };

  const selectedSlotId =
    slot && typeof slot === "object" ? slot.id : null;

  const isMyBookedSlot = Boolean(
    slot && typeof slot === "object" && slot.bookedByMe,
  );

  const hasBookableSlotSelected = isDemo
    ? Boolean(slot)
    : Boolean(selectedSlotId && !isMyBookedSlot);

  return (
    <div className="mp-booking-card">
      <div className="mp-bc-rate">{mentor?.rate}</div>
      <div className="mp-bc-rate-sub">Session price by format</div>

      <div className="mp-bc-formats">
        {SESSION_FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`mp-bc-format${format === f.id ? " selected" : ""}`}
            onClick={() => onFormatChange(f.id)}
          >
            <div className="mp-bcf-left">
              <span className="mp-bcf-icon">{f.icon}</span>
              <div>
                <div className="mp-bcf-name">{f.name}</div>
                <div className="mp-bcf-dur">{f.dur}</div>
              </div>
            </div>
            <div className="mp-bcf-price">
              <div>₹{getFormatPrice(mentor, f.id).toLocaleString("en-IN")}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mp-bc-slots">
        <div className="mp-bc-slots-title">Pick a date & time</div>

        {isDemo ? (
          <div className="mp-bc-slot-grid">
            {demoSlots.map((s) => (
              <button
                key={s}
                type="button"
                className={`mp-bc-slot${slot === s ? " selected" : ""}`}
                onClick={() => onSlotChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <>
            <ProfileCalendar
              viewDate={viewDate}
              selectedDateKey={selectedDateKey}
              availableDateKeys={availableDateKeys}
              loading={loadingDates}
              onPrevMonth={() =>
                setViewDate(
                  (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
                )
              }
              onNextMonth={() =>
                setViewDate(
                  (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
                )
              }
              onSelectDate={handleSelectDate}
            />

            {selectedDateKey && (
              <div className="mp-bc-times">
                <p className="mp-bc-times-label">
                  {formatLongDate(parseDateKey(selectedDateKey))} · IST
                </p>
                {loadingSlots ? (
                  <p className="mp-bc-cal-loading">Loading slots…</p>
                ) : apiSlots.length === 0 ? (
                  <p className="mp-bc-cal-empty-msg">No open slots on this date.</p>
                ) : (
                  <div className="mp-bc-slot-grid">
                    {apiSlots.map((s) => {
                      const isMine = Boolean(s.bookedByMe);
                      const isSelected = selectedSlotId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          className={`mp-bc-slot${isSelected ? " selected" : ""}${isMine ? " booked-mine" : ""}`}
                          onClick={() => onSlotChange(s)}
                          title={isMine ? "You already booked this slot" : undefined}
                        >
                          {isMine ? "✓ " : ""}
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isMyBookedSlot && (
        <div className="mp-bc-booked-banner">
          <strong>Already booked with you</strong>
          <span>
            {selectedDateKey && slot?.label
              ? `${formatLongDate(parseDateKey(selectedDateKey))} · ${slot.label}`
              : "Your session is confirmed"}
          </span>
        </div>
      )}

      <button
        type="button"
        className={`mp-bc-btn${isMyBookedSlot ? " mp-bc-btn-booked" : ""}`}
        onClick={onBook}
        disabled={bookingDisabled || !hasBookableSlotSelected}
      >
        {isMyBookedSlot ? "Session confirmed ✓" : "Book Session →"}
      </button>
      
    </div>
  );
}
