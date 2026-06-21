import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaVideo,
  FaClock,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { capitalizeName } from "../utils/formatters";
import toast from "react-hot-toast";
import logo from "../img/logo- final.png";
import {
  buildAllSlotsForDate,
  fetchMyAppointments,
  fetchMyAvailability,
  formatDuration,
  formatLongDate,
  getMonthMatrix,
  saveMyAvailability,
  toDateKey,
} from "../utils/mentorBooking";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_STYLES = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-600",
  no_show: "bg-red-100 text-red-700",
};

function ScheduleTab({ viewDate, setViewDate, selectedDateKey, setSelectedDateKey }) {
  const [selectedSlotIds, setSelectedSlotIds] = useState([]);
  const [bookedSlotIds, setBookedSlotIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedDateKey) return undefined;
    let cancelled = false;
    setLoading(true);

    fetchMyAvailability(selectedDateKey)
      .then((data) => {
        if (cancelled) return;
        setSelectedSlotIds(data.selectedSlotIds || []);
        setBookedSlotIds(data.bookedSlotIds || []);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDateKey]);

  const allSlots = selectedDateKey ? buildAllSlotsForDate(selectedDateKey) : [];
  const todayKey = toDateKey(new Date());
  const cells = getMonthMatrix(viewDate);
  const monthLabel = viewDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const toggleSlot = (slotId) => {
    if (bookedSlotIds.includes(slotId)) return;
    setSelectedSlotIds((current) =>
      current.includes(slotId)
        ? current.filter((id) => id !== slotId)
        : [...current, slotId],
    );
  };

  const handleSave = async () => {
    if (!selectedDateKey) return;
    setSaving(true);
    try {
      const data = await saveMyAvailability(selectedDateKey, selectedSlotIds);
      setSelectedSlotIds(data.selectedSlotIds || []);
      setBookedSlotIds(data.bookedSlotIds || []);
      toast.success("Availability saved");
    } catch (error) {
      toast.error(error.message || "Could not save availability");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() =>
              setViewDate(
                (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
            className="p-2 rounded-lg border border-slate-200"
          >
            <FaChevronLeft />
          </button>
          <h3 className="font-bold text-slate-900">{monthLabel}</h3>
          <button
            type="button"
            onClick={() =>
              setViewDate(
                (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
            className="p-2 rounded-lg border border-slate-200"
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
            const dateKey = toDateKey(date);
            const isPast = dateKey < todayKey;
            const isSelected = selectedDateKey === dateKey;
            return (
              <button
                key={dateKey}
                type="button"
                disabled={isPast}
                onClick={() => setSelectedDateKey(dateKey)}
                className={`aspect-square rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-purple-600 text-white"
                    : isPast
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-700 hover:bg-purple-50"
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        {selectedDateKey ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                  Set availability
                </p>
                <h3 className="text-xl font-bold text-slate-900">
                  {formatLongDate(new Date(selectedDateKey.replace(/-/g, "/")))}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Tap slots to mark when you are available for mentor appointments (IST).
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save availability"}
              </button>
            </div>

            {loading ? (
              <p className="text-slate-500">Loading slots...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allSlots.map((slot) => {
                  const isSelected = selectedSlotIds.includes(slot.id);
                  const isBooked = bookedSlotIds.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isBooked}
                      onClick={() => toggleSlot(slot.id)}
                      className={`py-3 px-3 rounded-xl border text-sm font-semibold transition-all ${
                        isBooked
                          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                          : isSelected
                            ? "bg-purple-600 border-purple-600 text-white"
                            : "bg-white border-slate-200 text-slate-700 hover:border-purple-300"
                      }`}
                    >
                      {slot.label}
                      {isBooked && <span className="block text-[10px] font-normal mt-1">Booked</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-500">Select a future date to manage your availability.</p>
        )}
      </div>
    </div>
  );
}

function AppointmentsTab({ tab }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Meeting link copied"),
      () => toast.error("Could not copy link"),
    );
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchMyAppointments(tab)
      .then((result) => {
        if (!cancelled) setAppointments(result.data || []);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab]);

  if (loading) {
    return <p className="text-slate-500 py-8 text-center">Loading appointments...</p>;
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
        <p>No {tab} appointments yet.</p>
        {tab === "upcoming" && (
          <p className="text-sm text-slate-400 mt-2">
            When a user books a session with you, it will appear here with the Zoom join link.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((booking) => (
        <div
          key={booking._id}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    STATUS_STYLES[booking.status] || STATUS_STYLES.scheduled
                  }`}
                >
                  {booking.status.replace("_", " ")}
                </span>
                <span className="text-sm text-slate-500">
                  {formatLongDate(new Date(booking.scheduledAt))}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FaUser className="text-purple-600" />
                {booking.guestDetails?.fullName}
              </h3>
              <p className="text-sm text-slate-600 mt-1">{booking.guestDetails?.email}</p>
              <p className="text-sm text-slate-600">{booking.guestDetails?.phone}</p>
              {booking.guestDetails?.supportNeeds && (
                <p className="text-sm text-slate-500 mt-3 bg-purple-50 rounded-xl p-3">
                  {booking.guestDetails.supportNeeds}
                </p>
              )}
            </div>

            <div className="min-w-[260px] space-y-3">
              <p className="flex items-center gap-2 text-purple-700 font-semibold">
                <FaClock />
                {booking.slotLabel}
              </p>
              {booking.actualDurationSeconds ? (
                <p className="text-sm text-slate-600">
                  Duration: {formatDuration(booking.actualDurationSeconds)}
                </p>
              ) : null}
              {tab === "upcoming" && booking.zoomStartUrl && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                    You join as host
                  </p>
                  <a
                    href={booking.zoomStartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
                  >
                    <FaVideo />
                    Start meeting as host
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(booking.zoomStartUrl)}
                    className="w-full px-4 py-2 rounded-lg border border-purple-200 text-purple-700 text-sm font-semibold hover:bg-purple-50 transition-colors"
                  >
                    Copy host link
                  </button>
                </div>
              )}
              {booking.zoomMeetingId && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-800">Meeting ID:</span>{" "}
                    {booking.zoomMeetingId}
                  </p>
                  {booking.zoomPassword && (
                    <p>
                      <span className="font-semibold text-slate-800">Passcode:</span>{" "}
                      {booking.zoomPassword}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MentorDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("schedule");
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "mentor") {
      navigate("/login?role=mentor");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDateKey(toDateKey(tomorrow));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "mentor") return undefined;
    let cancelled = false;

    fetchMyAppointments("upcoming")
      .then((result) => {
        if (!cancelled) setUpcomingCount(result.total || result.data?.length || 0);
      })
      .catch(() => {
        if (!cancelled) setUpcomingCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user || user.role !== "mentor") {
    return null;
  }

  return (
    <div className="min-h-screen bg-purple-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Mejoric" className="w-10 h-10 rounded-lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                Mentor panel
              </p>
              <h1 className="text-lg font-bold text-slate-900 capitalize">
                {capitalizeName(user.name)}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "schedule", label: "My schedule", icon: FaCalendarAlt },
            { id: "upcoming", label: "Upcoming", icon: FaClock },
            { id: "completed", label: "Completed", icon: FaVideo },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === id
                  ? "bg-purple-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-purple-50"
              }`}
            >
              <Icon />
              {label}
              {id === "upcoming" && upcomingCount > 0 && (
                <span
                  className={`min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                    activeTab === id ? "bg-white text-purple-600" : "bg-purple-600 text-white"
                  }`}
                >
                  {upcomingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "schedule" ? (
          <ScheduleTab
            viewDate={viewDate}
            setViewDate={setViewDate}
            selectedDateKey={selectedDateKey}
            setSelectedDateKey={setSelectedDateKey}
          />
        ) : (
          <AppointmentsTab tab={activeTab} />
        )}
      </main>
    </div>
  );
}
