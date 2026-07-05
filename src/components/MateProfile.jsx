import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLanguage,
  FaTags,
  FaRupeeSign,
  FaBriefcase,
  FaChevronLeft,
  FaCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useMateAvailability } from "../hooks/useMateAvailability";
import { apiGet } from "../utils/api";
import { capitalizeName } from "../utils/formatters";
import logo from "../img/logo- final.png";
import toast from "react-hot-toast";

function MateProfile() {
  const navigate = useNavigate();
  const { user, logout, authInitialized } = useAuth();
  const { isOnline, isUpdatingStatus, toggleOnlineStatus, setOffline } =
    useMateAvailability(user);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = user?.role || user?.user?.role;

  useEffect(() => {
    if (!authInitialized) return;
    if (!user) {
      navigate("/login?role=mate", { replace: true });
      return;
    }
    if (role && role !== "mate") {
      navigate("/", { replace: true });
    }
  }, [user, role, navigate, authInitialized]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const result = await apiGet("/users/get");
        if (result.success && result.data) {
          setProfile(result.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (user && role === "mate") {
      fetchProfile();
    }
  }, [user, role]);

  const handleLogout = async () => {
    await setOffline();
    logout();
    navigate("/login?role=mate");
  };

  const mate = profile?.mate || {};
  const displayName = capitalizeName(mate.name || profile?.name || "Mate");
  const avatar = profile?.image || "/favicon.png";

  const formatMobile = (mobile) => {
    if (!mobile) return "—";
    const str = String(mobile);
    if (str.length === 10) {
      return `+91 ${str.slice(0, 5)} ${str.slice(5)}`;
    }
    return str;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Back to dashboard"
              >
                <FaChevronLeft />
              </Link>
              <Link to="/dashboard" className="flex items-center">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  My Profile
                </h1>
              </Link>
            </div>
            <nav className="flex items-center space-x-3 sm:space-x-6">
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1 sm:gap-2"
              >
                <FaSignOutAlt className="text-sm sm:text-base" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">
            Loading profile...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-24 h-24 rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/favicon.png";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">Mate · Mejoric</p>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Availability</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Go online to receive calls and chats from users.
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    isOnline
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <FaCircle className={`text-[8px] ${isOnline ? "text-green-500" : "text-gray-400"}`} />
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">
                    {isOnline ? "You are visible to users" : "You are hidden from users"}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {isOnline
                      ? "Users can call or chat with you now."
                      : "Turn on to start receiving requests."}
                  </p>
                </div>
                <button
                  onClick={toggleOnlineStatus}
                  disabled={isUpdatingStatus}
                  aria-label={isOnline ? "Go offline" : "Go online"}
                  className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
                    isOnline ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                      isOnline ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Details</h3>
              <dl className="space-y-4">
                <DetailRow icon={FaUser} label="Name" value={displayName} />
                <DetailRow icon={FaEnvelope} label="Email" value={profile?.email || mate.email || "—"} />
                <DetailRow icon={FaPhone} label="Phone" value={formatMobile(profile?.mobile || mate.mobile)} />
                <DetailRow
                  icon={FaBriefcase}
                  label="Experience"
                  value={mate.experience != null ? `${mate.experience} year(s)` : "—"}
                />
                <DetailRow
                  icon={FaRupeeSign}
                  label="Rate"
                  value={mate.pricePerMin != null ? `₹${mate.pricePerMin}/min` : "—"}
                />
                <DetailRow
                  icon={FaLanguage}
                  label="Languages"
                  value={
                    mate.languages?.length
                      ? mate.languages.join(", ")
                      : "—"
                  }
                />
                <DetailRow
                  icon={FaTags}
                  label="Specializations"
                  value={
                    mate.specifications?.length
                      ? mate.specifications.join(", ")
                      : "—"
                  }
                />
              </dl>

              {mate.bio && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Bio
                  </p>
                  <p className="text-gray-700 leading-relaxed">{mate.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="text-gray-600 text-sm" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</dt>
        <dd className="text-gray-900 font-medium mt-0.5 break-words">{value}</dd>
      </div>
    </div>
  );
}

export default MateProfile;
