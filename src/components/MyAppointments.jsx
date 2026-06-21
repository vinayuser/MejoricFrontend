import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaHistory,
  FaVideo,
  FaUser,
} from "react-icons/fa";
import Layout from "./Layout";
import { useAuth } from "../context/AuthContext";
import { capitalizeName } from "../utils/formatters";
import toast from "react-hot-toast";
import {
  fetchMyBookings,
  formatLongDate,
} from "../utils/mentorBooking";

const STATUS_STYLES = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-600",
  no_show: "bg-red-100 text-red-700",
};

function BookingCard({ booking, showJoin }) {
  const handleCopyLink = () => {
    if (!booking.zoomJoinUrl) return;
    navigator.clipboard.writeText(booking.zoomJoinUrl).then(
      () => toast.success("Meeting link copied"),
      () => toast.error("Could not copy link"),
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex gap-4 min-w-0">
          <img
            src={booking.mentor?.image || "/favicon.png"}
            alt={booking.mentor?.name || "Mentor"}
            className="w-14 h-14 rounded-full object-cover border-2 border-purple-100 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
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
            <h3 className="text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
              <FaUser className="text-purple-600 shrink-0" />
              {capitalizeName(booking.mentor?.name || "Mentor")}
            </h3>
            <p className="flex items-center gap-2 text-purple-700 font-semibold mt-2">
              <FaClock />
              {booking.slotLabel}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {booking.durationMinutes || 30} minute session
            </p>
          </div>
        </div>

        <div className="min-w-[240px] space-y-2">
          {showJoin && booking.zoomJoinUrl && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                You join as participant
              </p>
              <a
                href={booking.zoomJoinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
              >
                <FaVideo />
                Join meeting as participant
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full px-4 py-2 rounded-lg border border-purple-200 text-purple-700 text-sm font-semibold hover:bg-purple-50 transition-colors"
              >
                Copy participant link
              </button>
            </>
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
  );
}

export default function MyAppointments() {
  const navigate = useNavigate();
  const { isAuthenticated, user, authInitialized } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated) {
      navigate("/login?role=user");
    }
  }, [authInitialized, isAuthenticated, navigate]);

  useEffect(() => {
    if (!authInitialized || !isAuthenticated) return undefined;

    let cancelled = false;
    setLoading(true);

    fetchMyBookings(activeTab)
      .then((result) => {
        if (!cancelled) setBookings(result.data || []);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, authInitialized, isAuthenticated]);

  if (!authInitialized || !isAuthenticated) return null;

  return (
    <Layout activePage="My Appointments">
      <div className="min-h-screen py-12 bg-purple-50/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-4">
              My Appointments
            </h1>
            <p className="text-xl text-gray-600">
              View your upcoming mentor sessions and booking history
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <FaCalendarAlt className="text-3xl" />
                <span className="text-xl font-semibold">Mentor bookings</span>
              </div>
              <p className="text-purple-200">
                {user?.name ? `Hi ${capitalizeName(user.name)}, ` : ""}
                your scheduled sessions and past appointments are listed below.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === "upcoming"
                    ? "bg-purple-600 text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-purple-50"
                }`}
              >
                <FaClock />
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("past")}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === "past"
                    ? "bg-purple-600 text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-purple-50"
                }`}
              >
                <FaHistory />
                History
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
                Loading appointments...
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
                <p>No {activeTab === "upcoming" ? "upcoming" : "past"} appointments yet.</p>
                {activeTab === "upcoming" && (
                  <button
                    type="button"
                    onClick={() => navigate("/mentors")}
                    className="mt-4 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Book a mentor session
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    showJoin={activeTab === "upcoming"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
