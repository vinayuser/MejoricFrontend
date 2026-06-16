import React, { useEffect, useState, useMemo, useRef, memo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaWhatsapp,
  FaVideo,
  FaPhone,
  FaFilter,
  FaTimes,
  FaPhoneSlash,
  FaStar,
  FaComments,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import CallHandler from "../components/CallHandler";
import { apiGet, apiPost } from "../utils/api";
import { trackPixel } from "../utils/metaPixel";
import { capitalizeName } from "../utils/formatters";
import { initializeFCM, getFCMToken } from "../utils/fcm";
import { onForegroundMessage } from "../firebase/firebase";
import banner from "../assets/img/mateguide.webp";
import banners from "../assets/img/mates_hero.webp";
import homeDesktopBanner from "../assets/img/2.webp";
import homeMobileBanner from "../assets/img/1.webp";
import BannerSlider from "./BannerSlider";
import InstantChat from "./InstantChat";
import { showLoginSignupAlert } from "../utils/authAlert";

const mateBannerSlides = [
  { src: homeDesktopBanner, alt: "Mejoric Hero", showHeroContent: true },
  { src: banner, alt: "Mate Guide" },
];

const mateBannerMobileSlides = [
  { src: homeMobileBanner, alt: "Mejoric Hero", showHeroContent: true },
  { src: banners, alt: "Mate Hero" },
];

// Video call URLs - base URL, roomId will be appended dynamically
const VIDEO_CALL_BASE_URL = "https://mateandmentors.yourvideo.live/";
const AUDIO_CALL_BASE_URL = "https://matenmentor.yourvideo.live/";

// Transform API data
const transformMateData = (matesData) => {
  if (!Array.isArray(matesData)) return [];

  return matesData.map((user) => {
    const mate = user.mate || {};
    return {
      _id: user._id,
      name: mate.name || user.name || "Unknown",
      img: user.image || "/favicon.png", // Use favicon or a placeholder instead of empty string
      online: user.isOnline || false,
      isAvailable: mate.isAvailable || false,
      isBusy: mate.isBusy || false,
      skills: mate.specifications?.join(", ") || "General",
      experience: "2",
      price: mate.pricePerMin || 0,
      priceDisplay: `₹${mate.pricePerMin || 0}/min`,
      category: mate.specifications?.[0] || "general",
      language: mate.languages?.join(", ") || "English",
      mobile: mate.mobile || user.mobile,
      email: mate.email || user.email,
      bio: mate.bio || "",
    };
  });
};

const categories = ["All", "Relationship", "Emotional", "Career", "Life"];
const onlineStatuses = ["All", "Online now", "Offline"];

export default function Mentor() {
  const navigate = useNavigate();
  const { token, getAuthToken, isAuthenticated, user, walletBalance, guestTrialExhausted } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOnlineStatus, setSelectedOnlineStatus] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [mates, setMates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState(""); // 'video' or 'audio'
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [callUrl, setCallUrl] = useState(""); // Dynamic call URL based on roomId
  const [callSessionId, setCallSessionId] = useState(""); // Store call session ID for ending call
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); // Show feedback modal
  const [feedbackRating, setFeedbackRating] = useState(0); // Rating 1-5
  const [feedbackDescription, setFeedbackDescription] = useState(""); // Feedback description
  const [selectedMentorForFeedback, setSelectedMentorForFeedback] =
    useState(null); // Mentor for feedback
  const [selectedMentorForChat, setSelectedMentorForChat] = useState(null);
  const [showInstantChat, setShowInstantChat] = useState(false);

  const handleCloseChat = React.useCallback(() => {
    setShowInstantChat(false);
    setSelectedMentorForChat(null);
  }, []);

  const handleChatClick = React.useCallback(
    (mentor) => {
      if (!mentor.isAvailable) {
        Swal.fire({
          icon: "warning",
          text: "This mate is currently offline.",
          confirmButtonColor: "#9333ea",
          didOpen: () => {
            const container = Swal.getContainer();
            if (container) container.style.zIndex = "100002";
          },
        });
        return;
      }

      if (!isAuthenticated) {
        showLoginSignupAlert(navigate, {
          message: "Please sign up or login to start a chat.",
        });
        return;
      }

      if (guestTrialExhausted && user?.role === "guest") {
        showLoginSignupAlert(navigate, {
          message:
            "Free trial credits used up. Please sign up or login to continue chatting.",
        });
        return;
      }

      if (user?.role === "user" && walletBalance <= 0) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Balance",
          text: "Your wallet balance is ₹0 or less. Please recharge your wallet to start chat sessions.",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonText: "Recharge Now",
          cancelButtonText: "Close",
          confirmButtonColor: "#9333ea",
          didOpen: () => {
            const container = Swal.getContainer();
            if (container) container.style.zIndex = "100002";
          },
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/wallet");
          }
        });
        return;
      }

      setSelectedMentorForChat(mentor);
      setShowInstantChat(true);

      if (typeof window.gtag === "function") {
        window.gtag("event", "select_content", {
          content_type: "chat",
          item_id: mentor._id,
          method: "instant_chat",
        });
      }
    },
    [isAuthenticated, guestTrialExhausted, user?.role, walletBalance, navigate],
  );

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let interval;
    if (showCallModal && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;

          // Warnings at 2 mins (120s) and 1 min (60s)
          if (next === 120 || next === 60) {
            toast(
              (t) => (
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-red-600">
                    Low Balance Alert
                  </span>
                  <span className="text-sm">
                    Your wallet balance is about to finish. The call will end in{" "}
                    {Math.floor(next / 60)} minute(s). Please recharge to
                    continue.
                  </span>
                  <div className="flex gap-2 self-end">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="text-gray-500 text-xs px-3 py-1"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        navigate("/wallet");
                      }}
                      className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold"
                    >
                      Recharge Now
                    </button>
                  </div>
                </div>
              ),
              {
                duration: 10000,
                icon: "⚠️",
                position: "top-center",
                style: {
                  borderRadius: "15px",
                  background: "#fff",
                  color: "#333",
                  border: "2px solid #ef4444",
                  maxWidth: "400px",
                },
              },
            );
          }

          if (next <= 0) {
            clearInterval(interval);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showCallModal, timeLeft]);

  const initiateCall = async (mentor, type) => {
    if (!mentor.isAvailable) {
      Swal.fire({
        icon: "warning",
        text: "This mate is currently offline.",
        confirmButtonColor: "#9333ea",
      });
      return;
    }
    setCallType(type);
    setSelectedMentorId(mentor._id);

    try {
      const result = await apiPost("/calls/initiate", {
        receiverId: mentor._id,
        callType: type.toUpperCase(),
      });

      // Track Meta Pixel Schedule event (initiating call)
      trackPixel("Schedule", {
        content_name: mentor.name,
        content_category: `${type.charAt(0).toUpperCase() + type.slice(1)} Call`,
      });

      if (result.success && result.data?.roomId) {
        if (result.data.remainingMinutes === 0) {
          await apiPost("/calls/end", {
            callSessionId: result.data.callSessionId || result.data._id || "",
          });
          Swal.fire({
            icon: "warning",
            text: "No remaining minutes available. Please recharge your wallet.",
            confirmButtonColor: "#9333ea",
          });
          return;
        }

        const baseUrl =
          type === "video" ? VIDEO_CALL_BASE_URL : AUDIO_CALL_BASE_URL;
        const callUrl = `${baseUrl}${result.data.roomId}?name=${encodeURIComponent(user?.name || "User")}&landing=no`;
        setCallUrl(callUrl);
        setCallSessionId(result.data.callSessionId || result.data._id || "");
        setTimeLeft((result.data.remainingMinutes || 0) * 60);
        setShowCallModal(true);
      } else {
        Swal.fire({
          icon: "error",
          text: result.message || "Failed to initiate call.",
          confirmButtonColor: "#9333ea",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "warning",
        text: error.message || "Failed to initiate call.",
        confirmButtonColor: "#9333ea",
      });
    }
  };

  // ✅ Transform
  const mentorsList = useMemo(() => transformMateData(mates), [mates]);

  // ✅ Filters fix
  const filteredMentors = useMemo(() => {
    return mentorsList.filter((mentor) => {
      const matchesCategory =
        selectedCategory === "All" ||
        mentor.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesOnlineStatus =
        selectedOnlineStatus === "All" ||
        (selectedOnlineStatus === "Online now" && mentor.online) ||
        (selectedOnlineStatus === "Offline" && !mentor.online);

      const matchesPrice =
        mentor.price >= priceRange[0] && mentor.price <= priceRange[1];

      return matchesCategory && matchesOnlineStatus && matchesPrice;
    });
  }, [mentorsList, selectedCategory, selectedOnlineStatus, priceRange]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const autoCall = query.get("auto_call") === "true";
    const autoChat = query.get("auto_chat") === "true";
    const mateId = query.get("mate_id");

    if (
      (autoCall || autoChat) &&
      mateId &&
      isAuthenticated &&
      mentorsList.length > 0
    ) {
      const mentor = mentorsList.find((m) => m._id === mateId);
      if (mentor) {
        localStorage.removeItem("redirect_mate_id");
        localStorage.removeItem("redirect_type");
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        if (!mentor.isAvailable) {
          Swal.fire({
            icon: "warning",
            text: "This mate is currently offline.",
            confirmButtonColor: "#9333ea",
          });
          return;
        }

        if (autoCall) {
          initiateCall(mentor, "video");
        } else if (autoChat) {
          if (!isAuthenticated) {
            showLoginSignupAlert(navigate, {
              message: "Please sign up or login to start a chat.",
            });
            return;
          }
          if (guestTrialExhausted && user?.role === "guest") {
            showLoginSignupAlert(navigate, {
              message:
                "Free trial credits used up. Please sign up or login to continue chatting.",
            });
            return;
          }
          setSelectedMentorForChat(mentor);
          setShowInstantChat(true);
        }
      }
    }
  }, [isAuthenticated, mentorsList, guestTrialExhausted, user?.role, navigate]);

  const fetchMatesRef = useRef(null);

  useEffect(() => {
    const fetchMates = async () => {
      try {
        const data = await apiGet(
          "/users/getAll?page=1&limit=100&role=mate&sortBy=isAvailable",
          true,
        );
        if (data.success && Array.isArray(data?.data?.data)) {
          setMates(data.data.data);
        } else {
          setMates([]);
          setError("Failed to fetch mates");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchMates();

    // Store fetchMates in ref so FCM listener can call it
    fetchMatesRef.current = fetchMates;
  }, []);

  // Listen for MATE_STATUS_CHANGED events (via FCM or Service Worker)
  useEffect(() => {
    // 1. Handle foreground FCM messages
    const unsubscribe = initializeFCM((payload) => {
      const data = payload.data || {};
      if (data.event === "MATE_STATUS_CHANGED") {
        console.log(
          `📡 [FCM] Mate status changed: ${data.mateName} → ${data.isAvailable === "true" ? "Online" : "Offline"}`,
        );
        fetchMatesRef.current?.();
      } else if (data.event === "ENDED") {
        console.log("📡 [FCM] Call ended by other party");
        setShowCallModal(false);
        setCallUrl("");
        setCallSessionId("");
        setShowFeedbackModal(true);
      }
    });

    // 2. Handle messages from Service Worker (Topic messages often arrive here)
    const handleSWMessage = (event) => {
      if (event.data?.type === "MATE_STATUS_CHANGED") {
        const data = event.data.data;
        console.log(
          `📡 [SW] Mate status changed: ${data.mateName} → ${data.isAvailable === "true" ? "Online" : "Offline"}`,
        );
        fetchMatesRef.current?.();
      } else if (event.data?.type === "CALL_ENDED") {
        console.log("📡 [SW] Call ended by other party");
        setShowCallModal(false);
        setCallUrl("");
        setCallSessionId("");
        setShowFeedbackModal(true);
      }
    };

    // 3. Handle custom event dispatched from CallNotification or broadcast channel
    const handleMateStatusChange = (event) => {
      const data = event.detail;
      console.log(
        `📡 [CustomEvent] Mate status changed: ${data.mateName} → ${data.isAvailable === "true" ? "Online" : "Offline"}`,
      );
      fetchMatesRef.current?.();
    };

    // 4. Handle broadcast channel messages (from other tabs)
    let broadcastChannel = null;
    try {
      broadcastChannel = new BroadcastChannel("call_and_status_sync");
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === "MATE_STATUS_CHANGED") {
          const data = event.data.data;
          console.log(
            `📡 [BroadcastChannel] Mate status changed: ${data.mateName} → ${data.isAvailable === "true" ? "Online" : "Offline"}`,
          );
          fetchMatesRef.current?.();
        } else if (event.data?.type === "CALL_ENDED") {
          console.log("📡 [BroadcastChannel] Call ended by other party");
          setShowCallModal(false);
          setCallUrl("");
          setCallSessionId("");
          setShowFeedbackModal(true);
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported for mate status sync");
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSWMessage);
    }
    window.addEventListener("mateStatusChanged", handleMateStatusChange);

    return () => {
      if (unsubscribe) unsubscribe();
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      }
      window.removeEventListener("mateStatusChanged", handleMateStatusChange);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  // Memoized Mentor Card Component
  const MentorCard = memo(
    ({
      mentor,
      isAuthenticated,
      user,
      guestTrialExhausted,
      walletBalance,
      navigate,
      onChatClick,
      setCallType,
      setSelectedMentorId,
      setCallUrl,
      setCallSessionId,
      setShowCallModal,
    }) => {
      const [isExpanded, setIsExpanded] = React.useState(false);

      return (
        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 overflow-hidden h-full flex flex-col group/card hover:shadow-2xl transition-all duration-300 relative">
          {/* Online/Offline Status */}
          <div className="absolute top-4 right-4 z-10">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${mentor.isBusy
                ? "bg-yellow-500 text-white"
                : mentor.isAvailable
                  ? "bg-green-500 text-white"
                  : "bg-red-400 text-white"
                }`}
            >
              {mentor.isBusy
                ? "Busy"
                : mentor.isAvailable
                  ? "Online"
                  : "Offline"}
            </span>
          </div>

          {/* Circular Image Container */}
          <div className="flex justify-center pt-6">
            <div
              className="relative w-44 h-44 rounded-full bg-purple-50 overflow-hidden cursor-pointer border-4 border-purple-100 shadow-md transition-all duration-300 group-hover/card:border-purple-200"
              onClick={() => navigate(`/mate-profile/${mentor._id}`)}
            >
              <img
                src={mentor.img}
                className="w-full h-full object-cover object-[center_20%] transition-transform duration-500 group-hover/card:scale-105"
                loading="lazy"
                alt={mentor.name}
              />
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            {/* Header: Name and Price */}
            <div className="flex justify-between items-start mb-2">
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/mate-profile/${mentor._id}`)}
              >
                <h3 className="font-bold text-xl capitalize truncate text-gray-900 group-hover:text-purple-600 transition-colors">
                  {capitalizeName(mentor.name)}
                </h3>
                <p className="text-purple-600 text-xs font-semibold mt-0.5 capitalize">
                  {mentor.language}
                </p>
              </div>
              {/* <span className="text-purple-700 font-bold text-base bg-purple-50 px-2 py-1 rounded-lg">
                {mentor.priceDisplay}
              </span> */}
            </div>

            {/* Bio: Standardized height when collapsed */}
            <div className="flex-1 mt-3 mb-5">
              <div className={!isExpanded ? "h-[45px] overflow-hidden" : ""}>
                <p
                  className={`text-gray-600 text-sm leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}
                >
                  {mentor.bio}
                </p>
              </div>
              {mentor.bio && mentor.bio.length > 50 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-purple-600 text-xs font-bold mt-2 hover:underline focus:outline-none"
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-auto">
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!mentor.isAvailable) {
                    Swal.fire({
                      icon: "warning",
                      text: "This mate is currently offline.",
                      confirmButtonColor: "#9333ea",
                      didOpen: () => {
                        const container = Swal.getContainer();
                        if (container) container.style.zIndex = "100002";
                      },
                    });
                    return;
                  }
                  if (!isAuthenticated || user?.role === "guest") {
                    Swal.fire({
                      icon: "info",
                      text: !isAuthenticated
                        ? "Please login first to make a call!"
                        : "Please sign up to make video calls!",
                      confirmButtonColor: "#9333ea",
                      didOpen: () => {
                        const container = Swal.getContainer();
                        if (container) container.style.zIndex = "100002";
                      },
                    });
                    navigate("/Signup");
                    return;
                  }
                  if (isAuthenticated && user?.role === "user" && walletBalance <= 0) {
                    Swal.fire({
                      icon: "warning",
                      title: "Insufficient Balance",
                      text: "Your wallet balance is ₹0 or less. Please recharge your wallet to make calls.",
                      showCancelButton: true,
                      confirmButtonText: "Recharge Now",
                      cancelButtonText: "Cancel",
                      confirmButtonColor: "#9333ea",
                      didOpen: () => {
                        const container = Swal.getContainer();
                        if (container) container.style.zIndex = "100002";
                      },
                    }).then((result) => {
                      if (result.isConfirmed) {
                        navigate("/wallet");
                      }
                    });
                    return;
                  }
                  // Track Google Analytics event
                  if (typeof window.gtag === "function") {
                    window.gtag("event", "select_content", {
                      content_type: "call",
                      item_id: mentor._id,
                      method: "video",
                    });
                  }
                  initiateCall(mentor, "video");
                }}
                disabled={!isAuthenticated || user?.role === "guest" || !mentor.isAvailable}
                className={`group/video relative flex items-center justify-center gap-1 rounded-lg font-semibold py-2 px-1 transition-all active:scale-95 text-xs ${
                  !mentor.isAvailable
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : !isAuthenticated || user?.role === "guest"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isAuthenticated && user?.role === "user" && walletBalance <= 0
                        ? "bg-gray-300 text-gray-500 hover:bg-gray-400 cursor-pointer shadow-none animate-pulse"
                        : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                <FaVideo className="text-xs" />
                <span>Video</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/video:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {!mentor.isAvailable
                    ? "Mate is offline"
                    : !isAuthenticated
                      ? "Login required"
                      : user?.role === "guest"
                        ? "Sign up required"
                        : `₹${import.meta.env.VITE_VIDEO_CALL_PRICE_PER_MIN || 15}/min`}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </button>

              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!mentor.isAvailable) {
                    Swal.fire({
                      icon: "warning",
                      text: "This mate is currently offline.",
                      confirmButtonColor: "#9333ea",
                      didOpen: () => {
                        const container = Swal.getContainer();
                        if (container) container.style.zIndex = "100002";
                      },
                    });
                    return;
                  }
                  if (!isAuthenticated || user?.role === "guest") {
                    Swal.fire({
                      icon: "info",
                      text: !isAuthenticated
                        ? "Please login first to make a call!"
                        : "Please sign up to make audio calls!",
                      confirmButtonColor: "#9333ea",
                      didOpen: () => {
                        const container = Swal.getContainer();
                        if (container) container.style.zIndex = "100002";
                      },
                    });
                    navigate("/Signup");
                    return;
                  }
                  if (isAuthenticated && user?.role === "user" && walletBalance <= 0) {
                    Swal.fire({
                      icon: "warning",
                      title: "Insufficient Balance",
                      text: "Your wallet balance is ₹0 or less. Please recharge your wallet to make calls.",
                      showCancelButton: true,
                      confirmButtonText: "Recharge Now",
                      cancelButtonText: "Cancel",
                      confirmButtonColor: "#9333ea",
                      didOpen: () => {
                        const container = Swal.getContainer();
                        if (container) container.style.zIndex = "100002";
                      },
                    }).then((result) => {
                      if (result.isConfirmed) {
                        navigate("/wallet");
                      }
                    });
                    return;
                  }
                  // Track Google Analytics event
                  if (typeof window.gtag === "function") {
                    window.gtag("event", "select_content", {
                      content_type: "call",
                      item_id: mentor._id,
                      method: "audio",
                    });
                  }
                  initiateCall(mentor, "audio");
                }}
                disabled={!isAuthenticated || user?.role === "guest" || !mentor.isAvailable}
                className={`group/audio relative flex items-center justify-center gap-1 rounded-lg font-semibold py-2 px-1 transition-all active:scale-95 text-xs ${
                  !mentor.isAvailable
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : !isAuthenticated || user?.role === "guest"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isAuthenticated && user?.role === "user" && walletBalance <= 0
                        ? "bg-gray-300 text-gray-500 hover:bg-gray-400 cursor-pointer shadow-none animate-pulse"
                        : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                <FaPhone className="text-xs" />
                <span>Audio</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/audio:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {!mentor.isAvailable
                    ? "Mate is offline"
                    : !isAuthenticated
                      ? "Login required"
                      : user?.role === "guest"
                        ? "Sign up required"
                        : `₹${import.meta.env.VITE_AUDIO_CALL_PRICE_PER_MIN || 12}/min`}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChatClick(mentor);
                }}
                disabled={!mentor.isAvailable}
                className={`group relative flex items-center justify-center gap-1 font-bold py-2 px-1 rounded-lg transition-all active:scale-95 shadow-sm text-xs ${
                  !mentor.isAvailable
                    ? "bg-gray-200 text-gray-400 border-2 border-transparent cursor-not-allowed"
                    : "bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-50 cursor-pointer"
                }`}
              >
                <FaComments className="text-xs" />
                <span>Chat</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {!mentor.isAvailable
                    ? "Mate is offline"
                    : !isAuthenticated
                      ? "Sign up to chat"
                      : guestTrialExhausted && user?.role === "guest"
                        ? "Trial exhausted — sign up"
                        : isAuthenticated && user?.role === "user" && walletBalance <= 0
                          ? "Recharge to chat"
                          : `₹${import.meta.env.VITE_CHAT_PRICE_PER_MIN || 8}/min`}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      );
    },
  );

  return (
    <Layout activePage="Mate">
      {/* Incoming Call is now handled globally in CallNotification.jsx */}

      {/* Section Content */}
      <section className="bg-gray-50 overflow-hidden pb-12 md:pb-20">
        <div className="w-full">
          <BannerSlider
            slides={mateBannerSlides}
            mobileSlides={mateBannerMobileSlides}
            onCtaClick={() => {
              document
                .getElementById("mates-list")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </div>
        <div id="mates-list" className="container mx-auto px-4 mt-4 md:mt-8">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : error ? (
            <div className="text-center py-10">{error}</div>
          ) : filteredMentors.length === 0 ? (
            <div className="text-center py-10">No mates found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <MentorCard
                  key={mentor._id}
                  mentor={mentor}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  guestTrialExhausted={guestTrialExhausted}
                  walletBalance={walletBalance}
                  navigate={navigate}
                  onChatClick={handleChatClick}
                  setCallType={setCallType}
                  setSelectedMentorId={setSelectedMentorId}
                  setCallUrl={setCallUrl}
                  setCallSessionId={setCallSessionId}
                  setShowCallModal={setShowCallModal}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-purple-600 p-4 flex justify-between items-center">
              <h3 className="text-white text-lg font-bold">
                {callType === "video" ? "Video Call" : "Audio Call"}
              </h3>
              <button
                onClick={async () => {
                  // Call end API when closing modal
                  if (callSessionId) {
                    try {
                      await apiPost("/calls/end", { callSessionId });
                      console.log("Call ended successfully");
                    } catch (error) {
                      console.error("Error ending call:", error);
                    }
                  }
                  setShowCallModal(false);
                  setCallUrl("");
                  setCallSessionId("");
                  // Show feedback modal after call ends
                  setShowFeedbackModal(true);
                }}
                className="text-white hover:text-gray-200"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Iframe */}
            <div className="w-full h-[calc(100%-60px)]">
              <iframe
                src={
                  callUrl ||
                  (callType === "video"
                    ? VIDEO_CALL_BASE_URL
                    : AUDIO_CALL_BASE_URL)
                }
                allow="camera; microphone; fullscreen; speaker; display-capture"
                className="w-full h-full border-0"
                title={callType === "video" ? "Video Call" : "Audio Call"}
              />
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Rate Your Experience
              </h3>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`text-3xl ${star <= feedbackRating
                      ? "text-yellow-400"
                      : "text-gray-300"
                      }`}
                  />
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Share your feedback
              </label>
              <textarea
                value={feedbackDescription}
                onChange={(e) => setFeedbackDescription(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackRating(0);
                  setFeedbackDescription("");
                  setSelectedMentorForFeedback(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={async () => {
                  setShowFeedbackModal(false);
                  if (feedbackRating === 0) {
                    toast.error("Please select a rating");
                    return;
                  }
                  try {
                    // Submit feedback to API
                    await apiPost("/feedback/submit", {
                      callSessionId: callSessionId,
                      rating: feedbackRating,
                      description: feedbackDescription,
                      mentorId: selectedMentorForFeedback?._id,
                    });

                    // Track Meta Pixel RatingSubmitted event
                    trackPixelCustom("RatingSubmitted", {
                      rating: feedbackRating,
                      mentorId: selectedMentorForFeedback?._id,
                    });
                    toast.success("Thank you for your feedback!");
                    setShowFeedbackModal(false);
                    setFeedbackRating(0);
                    setFeedbackDescription("");
                    setSelectedMentorForFeedback(null);
                  } catch (error) {
                    console.error("Error submitting feedback:", error);
                    toast.error("Failed to submit feedback. Please try again.");
                  }
                }}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Chat Modal */}
      {showInstantChat && selectedMentorForChat && (
        <InstantChat mentor={selectedMentorForChat} onClose={handleCloseChat} />
      )}

      <Footer />
    </Layout>
  );
}
