import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaTimes,
  FaVideo,
} from "react-icons/fa";
import { apiGet } from "../utils/api";
import { capitalizeName } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  createMentorBooking,
  fetchAvailableDates,
  fetchAvailableSlots,
  formatBookingDateTime,
  formatLongDate,
  getMonthMatrix,
  parseDateKey,
  toDateKey,
} from "../utils/mentorBooking";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BUDGET_OPTIONS = [
  { value: "", label: "Choose one" },
  { value: "under-500", label: "Under ₹500" },
  { value: "500-1000", label: "₹500 – ₹1,000" },
  { value: "1000-2000", label: "₹1,000 – ₹2,000" },
  { value: "2000-plus", label: "₹2,000+" },
];

const REFERRAL_OPTIONS = [
  { value: "", label: "Choose one" },
  { value: "google", label: "Google search" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "friend", label: "Friend or family" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  age: "",
  budget: "",
  referral: "",
  supportNeeds: "",
  consent: false,
};

const inputClass = (hasError) =>
  `w-full rounded-lg border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
    hasError ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
  }`;

const labelClass = "block text-sm font-medium text-slate-800 mb-2";

function MentorSummary({ mentor, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="w-16 h-16 rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-4 w-28 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (!mentor) return null;

  return (
    <div className="flex items-center gap-4">
      <img
        src={mentor.image || "/favicon.png"}
        alt={mentor.name}
        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-purple-100"
      />
      <div>
        <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">
          Book appointment
        </p>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 capitalize">
          {capitalizeName(mentor.name)}
        </h1>
        <p className="text-sm text-slate-500">
          {mentor.mentor?.specifications?.[0] || "Mentor"} · 30 min session
        </p>
      </div>
    </div>
  );
}

function BookingCalendar({
  viewDate,
  selectedDateKey,
  availableDateKeys,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}) {
  const monthLabel = viewDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const todayKey = toDateKey(new Date());
  const cells = getMonthMatrix(viewDate);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onPrevMonth}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Previous month"
        >
          <FaChevronLeft />
        </button>
        <h2 className="text-lg font-bold text-slate-900">{monthLabel}</h2>
        <button
          type="button"
          onClick={onNextMonth}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Next month"
        >
          <FaChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateKey = toDateKey(date);
          const isPast = dateKey < todayKey;
          const isAvailable = availableDateKeys.includes(dateKey);
          const isSelected = selectedDateKey === dateKey;
          const isToday = dateKey === todayKey;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isPast || !isAvailable}
              onClick={() => onSelectDate(dateKey)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all ${
                isSelected
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                  : isPast || !isAvailable
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-700 hover:bg-purple-50"
              } ${isToday && !isSelected ? "ring-2 ring-purple-200" : ""}`}
            >
              <span>{date.getDate()}</span>
              {isAvailable && !isSelected && (
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeSlots({
  selectedDateKey,
  slots,
  selectedSlotId,
  onSelectSlot,
  showAll,
  onToggleShowAll,
}) {
  const visibleSlots = showAll ? slots : slots.slice(0, 9);
  const selectedDate = parseDateKey(selectedDateKey);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
            Available times
          </p>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            {formatLongDate(selectedDate)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">India Standard Time (IST)</p>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          No open slots on this date. Pick another day from the calendar.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visibleSlots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200"
                      : "bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>

          {slots.length > 9 && (
            <button
              type="button"
              onClick={onToggleShowAll}
              className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700 underline underline-offset-4"
            >
              {showAll ? "Show fewer sessions" : "Show all sessions"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function BookingFormStep({
  mentor,
  selectedDateKey,
  selectedSlot,
  form,
  errors,
  onChange,
  onBack,
  onSubmit,
  submitting,
}) {
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const mentorName = capitalizeName(mentor?.mentor?.name || mentor?.name || "Mentor");
  const sessionLabel = `Session with ${mentorName}`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] min-h-0">
      <div className="px-5 md:px-8 py-6 border-b xl:border-b-0 xl:border-r border-slate-100 overflow-y-auto max-h-[min(70vh,720px)]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 mb-5"
        >
          <FaChevronLeft className="text-xs" />
          Change date & time
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Booking Form</h2>
        <p className="text-lg font-semibold text-slate-800 mb-2">{sessionLabel}</p>
        <p className="text-sm text-slate-600 leading-relaxed mb-8 max-w-2xl">
          This form helps your mentor plan your session. Please answer all questions as
          best as you can. For checkboxes, tick them if your answer is &quot;yes.&quot;
        </p>

        <div className="space-y-6 max-w-2xl">
          <div>
            <label className={labelClass}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              className={inputClass(errors.fullName)}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                className={inputClass(errors.email)}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className={labelClass}>
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-sm text-slate-600">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className={`${inputClass(errors.phone)} rounded-l-none`}
                  placeholder="9876543210"
                />
              </div>
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <p className={labelClass}>
              Gender <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-4">
              {GENDER_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={form.gender === option}
                    onChange={(e) => onChange("gender", e.target.value)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
            {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="13"
              max="100"
              value={form.age}
              onChange={(e) => onChange("age", e.target.value)}
              className={inputClass(errors.age)}
              placeholder="Enter your age"
            />
            {errors.age && <p className="text-sm text-red-500 mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Please enter how much you would like to spend per session{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={form.budget}
              onChange={(e) => onChange("budget", e.target.value)}
              className={inputClass(errors.budget)}
            >
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value || "default"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Where&apos;d you first spot us? <span className="text-red-500">*</span>
            </label>
            <select
              value={form.referral}
              onChange={(e) => onChange("referral", e.target.value)}
              className={inputClass(errors.referral)}
            >
              {REFERRAL_OPTIONS.map((option) => (
                <option key={option.value || "default"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.referral && (
              <p className="text-sm text-red-500 mt-1">{errors.referral}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              What kind of support are you looking for (please share only if comfortable)
              in the session?
            </label>
            <textarea
              value={form.supportNeeds}
              onChange={(e) => onChange("supportNeeds", e.target.value)}
              rows={5}
              className={`${inputClass(false)} resize-none`}
              placeholder="Share what you'd like to focus on..."
            />
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => onChange("consent", e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-700 leading-relaxed">
                I confirm that I am 18 years of age or older and agree to Mejoric&apos;s{" "}
                <Link to="/terms-and-conditions" className="text-purple-600 underline">
                  Terms of Use
                </Link>{" "}
                &{" "}
                <Link to="/privacy-policy" className="text-purple-600 underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.consent && (
              <p className="text-sm text-red-500 mt-1">{errors.consent}</p>
            )}
          </div>
        </div>
      </div>

      <aside className="px-5 md:px-6 py-6 bg-slate-50/80 overflow-y-auto max-h-[min(70vh,720px)]">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Details</h3>

        <div className="space-y-2 mb-6">
          <p className="font-semibold text-slate-900">{sessionLabel}</p>
          <p className="text-slate-700">
            {formatBookingDateTime(selectedDateKey, selectedSlot.label)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMoreDetails((value) => !value)}
          className="flex items-center justify-between w-full py-3 border-t border-b border-slate-200 text-sm font-semibold text-slate-800"
        >
          More details
          {showMoreDetails ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {showMoreDetails && (
          <div className="py-4 space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">Mentor:</span> {mentorName}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Duration:</span> 30 minutes
            </p>
            <p>
              <span className="font-semibold text-slate-800">Format:</span> Video call via Zoom
            </p>
            <p>
              <span className="font-semibold text-slate-800">Timezone:</span> India Standard Time
              (IST)
            </p>
          </div>
        )}

        <p className="text-xs text-slate-500 leading-relaxed mt-6">
          By completing your booking, you agree to receive related phone and email
          notifications about this appointment.
        </p>

        <Link
          to="/privacy-policy"
          className="inline-block text-sm font-semibold text-purple-600 hover:text-purple-700 mt-3"
        >
          View Policy
        </Link>

        <button
          type="button"
          disabled={submitting}
          onClick={onSubmit}
          className="w-full mt-8 py-4 rounded-xl bg-purple-600 text-white text-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-lg shadow-purple-200"
        >
          {submitting ? "Booking..." : "Book Now"}
        </button>
      </aside>
    </div>
  );
}

function BookingSuccess({ booking, onDone }) {
  return (
    <div className="text-center py-6 px-4 md:px-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-6">
        <FaCheckCircle className="text-3xl" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
        Appointment booked
      </h2>
      <p className="text-slate-600 mb-8">
        Your session with <span className="font-semibold">{booking.mentorName}</span>{" "}
        is confirmed. A confirmation email with the Zoom meeting details will be sent
        to <span className="font-semibold">{booking.userEmail}</span> once email delivery
        is enabled.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm mb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              Date & time
            </p>
            <p className="font-semibold text-slate-900 mt-1">
              {formatLongDate(parseDateKey(booking.dateKey))}
            </p>
            <p className="text-purple-600 font-semibold">{booking.slotLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              Booking ID
            </p>
            <p className="font-mono text-sm text-slate-800 mt-1 break-all">{booking.id}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-purple-700 font-semibold mb-3">
            <FaVideo />
            Zoom meeting details
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Meeting ID:</span>{" "}
              <span className="font-semibold text-slate-900">{booking.zoomMeetingId}</span>
            </p>
            <p>
              <span className="text-slate-500">Passcode:</span>{" "}
              <span className="font-semibold text-slate-900">{booking.zoomPassword}</span>
            </p>
            <a
              href={booking.zoomJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 text-purple-600 font-semibold hover:text-purple-700"
            >
              Open Zoom link
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="px-8 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
      >
        Done
      </button>
    </div>
  );
}

export default function MentorBookingModal({ mentorId, isOpen, onClose }) {
  const { user } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [loadingMentor, setLoadingMentor] = useState(true);
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [availableDateKeys, setAvailableDateKeys] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState("schedule");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !mentorId) return undefined;

    const fetchMentor = async () => {
      setLoadingMentor(true);
      setMentor(null);
      try {
        const data = await apiGet(`/users/profile/${mentorId}`, true);
        if (data?.success) {
          setMentor(data.data);
        } else {
          toast.error("Mentor not found");
          onClose();
        }
      } catch (error) {
        console.error(error);
        toast.error("Unable to load mentor profile");
        onClose();
      } finally {
        setLoadingMentor(false);
      }
    };

    fetchMentor();
  }, [mentorId, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setStep("schedule");
      setBooking(null);
      setSelectedSlot(null);
      setSelectedDateKey("");
      setShowAllSlots(false);
      setErrors({});
      setForm(EMPTY_FORM);
      setViewDate(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !user) return;
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user.name || "",
      email: current.email || user.email || "",
      phone: current.phone || (user.mobile ? String(user.mobile) : ""),
    }));
  }, [user, isOpen]);

  const handleFormChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else if (form.phone.trim().length < 10) {
      nextErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!form.gender) nextErrors.gender = "Please select your gender";
    if (!form.age.trim()) {
      nextErrors.age = "Age is required";
    } else if (Number(form.age) < 13 || Number(form.age) > 100) {
      nextErrors.age = "Enter a valid age between 13 and 100";
    }
    if (!form.budget) nextErrors.budget = "Choose a budget option";
    if (!form.referral) nextErrors.referral = "Choose an option";
    if (!form.consent) nextErrors.consent = "You must agree before booking";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const availableDateKeysMemo = availableDateKeys;

  useEffect(() => {
    if (!isOpen || !mentorId) return undefined;

    let cancelled = false;
    setLoadingDates(true);

    fetchAvailableDates(mentorId, viewDate)
      .then((dates) => {
        if (!cancelled) setAvailableDateKeys(dates);
      })
      .finally(() => {
        if (!cancelled) setLoadingDates(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mentorId, viewDate, isOpen]);

  useEffect(() => {
    if (!mentorId || !selectedDateKey) {
      setSlots([]);
      return undefined;
    }

    let cancelled = false;
    setLoadingSlots(true);

    fetchAvailableSlots(mentorId, selectedDateKey)
      .then((availableSlots) => {
        if (!cancelled) setSlots(availableSlots);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mentorId, selectedDateKey]);

  useEffect(() => {
    if (availableDateKeys.length === 0) {
      setSelectedDateKey("");
      return;
    }
    if (!selectedDateKey || !availableDateKeys.includes(selectedDateKey)) {
      setSelectedDateKey(availableDateKeys[0]);
    }
  }, [availableDateKeys, selectedDateKey]);

  useEffect(() => {
    setSelectedSlot(null);
    setShowAllSlots(false);
  }, [selectedDateKey]);

  const handlePrevMonth = () => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    if (!validateForm()) {
      toast.error("Please complete all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createMentorBooking({
        mentorId,
        slot: selectedSlot,
        guestDetails: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          gender: form.gender,
          age: form.age.trim(),
          budget: form.budget,
          referral: form.referral,
          supportNeeds: form.supportNeeds.trim(),
        },
      });
      setBooking(result);
      setStep("success");
      toast.success("Appointment booked successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Could not create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mentorId) return null;

  const stepTitle =
    step === "success"
      ? "Booking confirmed"
      : step === "confirm"
        ? "Booking Form"
        : "Select a Date and Time";

  return createPortal(
    <div className="fixed inset-0 z-[100010] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close booking"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentor-booking-title"
        className="relative z-10 w-full max-w-6xl max-h-[94vh] flex flex-col rounded-2xl md:rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-5 md:px-8 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="min-w-0 flex-1">
            {step === "schedule" ? (
              <MentorSummary mentor={mentor} loading={loadingMentor} />
            ) : (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                  Book appointment
                </p>
                <h2
                  id="mentor-booking-title"
                  className="text-lg md:text-xl font-bold text-slate-900 truncate"
                >
                  {stepTitle}
                </h2>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {step === "schedule" && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                <FaCalendarAlt className="text-purple-500" />
                IST
              </div>
            )}
            {step === "schedule" && selectedSlot && (
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep("confirm")}
                className="hidden md:inline-flex px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {step === "success" && booking ? (
            <BookingSuccess booking={booking} onDone={onClose} />
          ) : step === "schedule" ? (
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] min-h-[min(70vh,680px)]">
              <div className="px-5 md:px-8 py-6 border-b lg:border-b-0 lg:border-r border-slate-100">
                      <BookingCalendar
                        viewDate={viewDate}
                        selectedDateKey={selectedDateKey}
                        availableDateKeys={availableDateKeysMemo}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onSelectDate={setSelectedDateKey}
                />
              </div>

              <div className="px-5 md:px-8 py-6 flex flex-col">
                {selectedDateKey ? (
                  loadingSlots ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                      Loading available times...
                    </div>
                  ) : (
                    <TimeSlots
                    selectedDateKey={selectedDateKey}
                    slots={slots}
                    selectedSlotId={selectedSlot?.id}
                    onSelectSlot={setSelectedSlot}
                    showAll={showAllSlots}
                      onToggleShowAll={() => setShowAllSlots((value) => !value)}
                    />
                  )
                ) : loadingDates ? (
                  <div className="flex-1 flex items-center justify-center text-slate-500">
                    Loading calendar...
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500">
                    Choose an available date to see time slots.
                  </div>
                )}

                <div className="mt-6 flex justify-end md:hidden">
                  <button
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() => setStep("confirm")}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <BookingFormStep
              mentor={mentor}
              selectedDateKey={selectedDateKey}
              selectedSlot={selectedSlot}
              form={form}
              errors={errors}
              onChange={handleFormChange}
              onBack={() => setStep("schedule")}
              onSubmit={handleConfirmBooking}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
