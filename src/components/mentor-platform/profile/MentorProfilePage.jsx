import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { requireAuthForBooking } from "../../../utils/authAlert";
import { useMentorBooking } from "../../../context/MentorBookingContext";
import MentorPlatformLayout from "../MentorPlatformLayout";
import MentorBreadcrumb from "../shared/MentorBreadcrumb";
import MentorProfileHero from "./MentorProfileHero";
import MentorProfileSections from "./MentorProfileSections";
import MentorBookingPanel from "./MentorBookingPanel";
import MentorBookingModal from "../../MentorBooking";
import { getConfig } from "../../../data/mentorPlatformConfig";
import {
  fetchMentorProfile,
  getFormatPrice,
} from "../../../utils/mentorPlatformApi";
import { capitalizeName } from "../../../utils/formatters";
export default function MentorProfilePage() {
  const { type, mentorId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { setBookingDraft } = useMentorBooking();
  const cfg = getConfig(type);
  const base = `/mentors/${type}`;
  const activePage = "Mentors";

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState("video");
  const [slot, setSlot] = useState(null);
  const [showApiBooking, setShowApiBooking] = useState(false);
  const [bookingRefreshKey, setBookingRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSlot(null);
    fetchMentorProfile(mentorId, type).then((data) => {
      if (!cancelled) {
        setMentor(data);
        if (data?.isDemo) {
          setSlot(data?.slots?.[0] || null);
        } else {
          setSlot(null);
        }
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mentorId, type]);

  const handleBook = () => {
    if (!requireAuthForBooking(navigate, { isAuthenticated, user })) return;
    if (!mentor) return;
    if (slot?.bookedByMe) return;

    const price = getFormatPrice(mentor, format);
    setBookingDraft({
      mentorType: type,
      mentor,
      format,
      slot,
      price,
    });

    if (mentor.isDemo) {
      navigate(`${base}/booking/confirm`);
      return;
    }

    setShowApiBooking(true);
  };

  if (loading) {
    return (
      <MentorPlatformLayout activePage={activePage} type={type}>
        <div className="mp-profile-wrap" style={{ opacity: 0.6 }}>
          Loading mentor…
        </div>
      </MentorPlatformLayout>
    );
  }

  if (!mentor) {
    return (
      <MentorPlatformLayout activePage={activePage} type={type}>
        <div className="mp-profile-wrap">
          <p>Mentor not found.</p>
          <button type="button" className="mp-btn-secondary" onClick={() => navigate(`${base}/browse`)}>
            Back to browse
          </button>
        </div>
      </MentorPlatformLayout>
    );
  }

  return (
    <MentorPlatformLayout activePage={activePage} type={type}>
      <div className="mp-profile-wrap">
          <MentorBreadcrumb
            items={[
              { label: "Mentors", to: "/mentors/professional/browse" },
              { label: capitalizeName(mentor.name) },
            ]}
          />

        <div className="mp-prof-hero">
          <MentorProfileHero mentor={mentor} type={type} cfg={cfg} />
          <div className="mp-ph-right">
            <MentorBookingPanel
              mentor={mentor}
              format={format}
              slot={slot}
              onFormatChange={setFormat}
              onSlotChange={setSlot}
              onBook={handleBook}
              refreshKey={bookingRefreshKey}
            />
          </div>
        </div>

        <MentorProfileSections mentor={mentor} />
      </div>

      {showApiBooking && !mentor.isDemo && (
        <MentorBookingModal
          mentorId={mentor._id}
          sessionFormat={format}
          sessionPrice={getFormatPrice(mentor, format)}
          initialSlot={slot && typeof slot === "object" ? slot : null}
          initialDateKey={slot?.dateKey || ""}
          initialStep={slot && typeof slot === "object" ? "confirm" : "schedule"}
          isOpen={showApiBooking}
          onClose={() => setShowApiBooking(false)}
          onBookingSuccess={() => {
            setShowApiBooking(false);
            setSlot(null);
            setBookingRefreshKey((key) => key + 1);
          }}
        />
      )}
    </MentorPlatformLayout>
  );
}
