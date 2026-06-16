import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaPhone,
  FaComments,
  FaStar,
  FaChevronLeft,
  FaRegClock,
  FaCalendarAlt,
  FaHistory,
  FaUserCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost } from "../utils/api";
import Layout from "./Layout";
import Footer from "./Footer";
import InstantChat from "./InstantChat";
import { initializeFCM } from "../utils/fcm";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { capitalizeName } from "../utils/formatters";
import { showLoginSignupAlert } from "../utils/authAlert";

const MateDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, walletBalance, guestTrialExhausted } = useAuth();
  const isChatDisabled = guestTrialExhausted && (!isAuthenticated || user?.role === "guest");

  const [mate, setMate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("bio"); // bio, history
  const [showChat, setShowChat] = useState(false);

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const groupedChats = useMemo(() => {
    const groups = [];
    // Sort chats by time ascending for grouping if they aren't already
    const sortedChats = [...chatHistory].sort(
      (a, b) =>
        new Date(a.timestamp || a.createdAt) -
        new Date(b.timestamp || b.createdAt),
    );

    sortedChats.forEach((chat) => {
      const date = new Date(chat.timestamp || chat.createdAt).toDateString();
      let lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.date !== date) {
        groups.push({
          date: date,
          label: formatDateLabel(date),
          messages: [chat],
        });
      } else {
        lastGroup.messages.push(chat);
      }
    });
    return groups;
  }, [chatHistory]);

  useEffect(() => {
    const fetchMateData = async () => {
      try {
        setLoading(true);
        // Fetch mate public profile
        const res = await apiGet(`/users/profile/${id}`, true);
        if (res.success && res.data) {
          const u = res.data;
          const m = u.mate || {};
          setMate({
            _id: u._id,
            name: m.name || u.name || "Mate",
            img: u.image || "/favicon.png",
            online: u.isOnline || false,
            isAvailable: m.isAvailable || false,
            isBusy: m.isBusy || false,
            skills: m.specifications || [],
            languages: m.languages || [],
            price: m.pricePerMin || 0,
            bio: m.bio || "No biography available.",
            experience: "2+ Years", // Placeholder as not in schema
          });
        }
      } catch (err) {
        console.error("Error fetching mate:", err);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchMateData();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      const fetchHistory = async () => {
        try {
          // Fetch Chat History
          const chatRes = await apiGet(
            `/chat/history?recipientId=${id}&limit=10`,
          );
          if (chatRes.success) setChatHistory(chatRes.data || []);

          // Fetch Call History
          const callRes = await apiGet(
            `/calls/history?otherPartyId=${id}&limit=10`,
          );
          if (callRes.success) setCallHistory(callRes.data || []);
        } catch (err) {
          console.error("History fetch error:", err);
        }
      };
      fetchHistory();
    }
  }, [isAuthenticated, id]);

  // Listen for real-time status changes
  useEffect(() => {
    const unsubscribe = initializeFCM((payload) => {
      const data = payload.data || {};
      if (
        data.event === "MATE_STATUS_CHANGED" &&
        String(data.mateUserId) === String(id)
      ) {
        console.log(
          `📡 [FCM] Current mate status updated: ${data.isAvailable === "true" ? "Online" : "Offline"}`,
        );
        setMate((prev) =>
          prev
            ? {
              ...prev,
              isAvailable: data.isAvailable === "true",
            }
            : null,
        );
      }
    });

    // 2. Handle messages from Service Worker (Topic messages often arrive here)
    const handleSWMessage = (event) => {
      if (event.data?.type === "MATE_STATUS_CHANGED") {
        const data = event.data.data;
        if (String(data.mateUserId) === String(id)) {
          console.log(
            `📡 [SW] Current mate status updated: ${data.isAvailable === "true" ? "Online" : "Offline"}`,
          );
          setMate((prev) =>
            prev
              ? {
                ...prev,
                isAvailable: data.isAvailable === "true",
              }
              : null,
          );
        }
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSWMessage);
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      }
    };
  }, [id]);

  // Handle auto-action from redirect
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const autoCall = query.get("auto_call") === "true";
    const autoChat = query.get("auto_chat") === "true";

    if ((autoCall || autoChat) && mate && isAuthenticated) {
      // Clear the redirect data
      localStorage.removeItem("redirect_mate_id");
      localStorage.removeItem("redirect_type");

      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);

      if (!mate.isAvailable) {
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

      if (autoChat) {
        if (!isAuthenticated) {
          showLoginSignupAlert(navigate, {
            message: "Please sign up or login to start a chat.",
          });
          return;
        }
        if (isChatDisabled) {
          showLoginSignupAlert(navigate, {
            message:
              "Free trial credits used up. Please sign up or login to continue chatting.",
          });
          return;
        }
        setShowChat(true);
      } else if (autoCall) {
        const type = query.get("type") || "video";
        handleAction(type);
      }
    }
  }, [mate, isAuthenticated]);

  const handleAction = (type) => {
    if (!mate.isAvailable) {
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

    if ((type === "audio" || type === "video") && user?.role === "guest") {
      Swal.fire({
        icon: "info",
        text: "Please sign up to make calls!",
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
        title: "Insufficient Balance",
        text: `Your wallet balance is ₹0 or less. Please recharge your wallet to start a ${type} session.`,
        icon: "warning",
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

    if (type === "chat") {
      if (!isAuthenticated) {
        showLoginSignupAlert(navigate, {
          message: "Please sign up or login to start a chat.",
        });
        return;
      }

      if (isChatDisabled) {
        showLoginSignupAlert(navigate, {
          message:
            "Free trial credits used up. Please sign up or login to continue chatting.",
        });
        return;
      }
      setShowChat(true);
      return;
    }

    if (!isAuthenticated) {
      Swal.fire({
        title: "Login Required",
        text: `Please login to start a ${type} with this mate.`,
        icon: "info",
        confirmButtonColor: "#9333ea",
        didOpen: () => {
          const container = Swal.getContainer();
          if (container) container.style.zIndex = "100002";
        },
      });
      navigate("/login");
      return;
    }

    toast.success(`Initiating ${type}...`);
    navigate(`/mate?auto_call=true&mate_id=${id}&type=${type}`);
  };

  if (loading) {
    return (
      <Layout activePage="Mate">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (!mate) {
    return (
      <Layout activePage="Mate">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-800">Mate not found</h2>
          <button
            onClick={() => navigate("/mate")}
            className="mt-4 text-purple-600 font-bold"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="Mate">
      <div className="bg-gray-50 min-h-screen pb-20">
        {/* Header/Banner Section */}
        <div className="bg-purple-600 h-48 md:h-64 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors z-10"
          >
            <FaChevronLeft />
          </button>
        </div>

        <div className="container mx-auto px-4 -mt-24 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-6 text-center">
                  <div className="relative inline-block">
                    <img
                      src={mate.img}
                      alt={mate.name}
                      className="w-48 h-48 rounded-full border-8 border-white shadow-lg object-cover object-[center_20%]"
                    />
                    <div
                      className={`absolute bottom-5 right-5 w-6 h-6 rounded-full border-4 border-white ${mate.isAvailable ? "bg-green-500" : "bg-gray-400"}`}
                    ></div>
                  </div>

                  <h1 className="text-2xl font-bold mt-4 text-gray-900 capitalize">
                    {capitalizeName(mate.name)}
                  </h1>
                  <p className="text-purple-600 font-semibold text-sm uppercase tracking-wider mt-1">
                    {mate.skills.join(" • ") || "Expert Mate"}
                  </p>

                  <div className="flex items-center justify-center gap-1 mt-3 text-yellow-500">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <span className="text-gray-400 text-xs ml-1">(4.9/5)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-purple-50 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">
                        Experience
                      </p>
                      <p className="text-sm font-bold text-purple-700">
                        {mate.experience}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-2xl">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">
                        Rate
                      </p>
                      <p className="text-sm font-bold text-purple-700">
                        ₹{mate.price}/min
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAction("video");
                      }}
                      disabled={!isAuthenticated || user?.role === "guest" || !mate.isAvailable}
                      className={`group relative font-bold py-3 px-1 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg text-xs ${
                        !mate.isAvailable
                          ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                          : !isAuthenticated || user?.role === "guest"
                            ? "bg-gray-300 text-gray-500 shadow-none cursor-not-allowed"
                            : isAuthenticated && user?.role === "user" && walletBalance <= 0
                              ? "bg-gray-300 text-gray-500 hover:bg-gray-400 shadow-none cursor-pointer animate-pulse"
                              : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"
                      }`}
                    >
                      <FaVideo /> Video
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        {!mate.isAvailable
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAction("audio");
                      }}
                      disabled={!isAuthenticated || user?.role === "guest" || !mate.isAvailable}
                      className={`group relative font-bold py-3 px-1 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg text-xs ${
                        !mate.isAvailable
                          ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                          : !isAuthenticated || user?.role === "guest"
                            ? "bg-gray-300 text-gray-500 shadow-none cursor-not-allowed"
                            : isAuthenticated && user?.role === "user" && walletBalance <= 0
                              ? "bg-gray-300 text-gray-500 hover:bg-gray-400 shadow-none cursor-pointer animate-pulse"
                              : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"
                      }`}
                    >
                      <FaPhone /> Audio
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        {!mate.isAvailable
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
                        handleAction("chat");
                      }}
                      disabled={!mate.isAvailable}
                      className={`group relative font-bold py-3 px-1 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs ${
                        !mate.isAvailable
                          ? "bg-gray-200 text-gray-400 border-2 border-transparent cursor-not-allowed"
                          : "bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 cursor-pointer"
                      }`}
                    >
                      <FaComments /> Chat
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        {!mate.isAvailable
                          ? "Mate is offline"
                          : isChatDisabled
                            ? "Trial exhausted. Please sign up."
                            : user?.role === "guest"
                              ? "Sign up required"
                              : `₹${import.meta.env.VITE_CHAT_PRICE_PER_MIN || 8}/min`}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Details & History Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl min-h-[500px] flex flex-col">
                {/* Tabs */}
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab("bio")}
                    className={`flex-1 py-5 font-bold text-sm transition-colors ${activeTab === "bio" ? "text-purple-600 border-b-4 border-purple-600" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    About Mate
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`flex-1 py-5 font-bold text-sm transition-colors ${activeTab === "history" ? "text-purple-600 border-b-4 border-purple-600" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Interaction History
                  </button>
                </div>

                <div className="p-8 flex-1">
                  {activeTab === "bio" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Biography
                      </h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {mate.bio}
                      </p>

                      <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">
                        Specifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {mate.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-bold capitalize"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">
                        Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {mate.languages.map((lang) => (
                          <span
                            key={lang}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-bold capitalize"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {!isAuthenticated ? (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                          <FaHistory className="text-4xl text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">
                            Please login to view your history with{" "}
                            {capitalizeName(mate.name)}
                          </p>
                          <button
                            onClick={() => navigate("/login")}
                            className="mt-4 bg-purple-600 text-white px-8 py-2 rounded-full font-bold shadow-md"
                          >
                            Login Now
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-10">
                          {/* Call History */}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                              <FaPhone className="text-green-500 text-sm" />{" "}
                              Past Calls
                            </h3>
                            {callHistory.length > 0 ? (
                              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {callHistory.map((call) => (
                                  <div
                                    key={call._id}
                                    className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${call.callType === "VIDEO" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}
                                      >
                                        {call.callType === "VIDEO" ? (
                                          <FaVideo />
                                        ) : (
                                          <FaPhone />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-gray-800 capitalize">
                                          {call.callType.toLowerCase()} Call
                                        </p>
                                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                          <FaCalendarAlt />{" "}
                                          {new Date(
                                            call.createdAt,
                                          ).toLocaleDateString()}{" "}
                                          at{" "}
                                          {new Date(
                                            call.createdAt,
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1 justify-end">
                                        <FaRegClock className="text-xs text-purple-500" />{" "}
                                        {Math.ceil((call.duration || 0) / 60)}{" "}
                                        mins
                                      </p>
                                      <p className="text-[10px] font-bold text-green-600">
                                        ₹{call.totalAmountDeducted || 0}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">
                                No call history found.
                              </p>
                            )}
                          </div>

                          {/* Chat History */}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                              <FaComments className="text-indigo-500 text-sm" />{" "}
                              Recent Messages
                            </h3>
                            {chatHistory.length > 0 ? (
                              <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100 space-y-6 max-h-[400px] overflow-y-auto flex flex-col custom-scrollbar">
                                {groupedChats.map((group) => (
                                  <div key={group.date} className="space-y-4">
                                    <div className="flex justify-center">
                                      <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-400 shadow-sm uppercase tracking-tighter">
                                        {group.label}
                                      </span>
                                    </div>
                                    {group.messages.map((chat) => (
                                      <div
                                        key={chat._id}
                                        className={`flex ${String(chat.senderId || "").toLowerCase() === String(user?._id || user?.id || "").toLowerCase() ? "justify-end" : "justify-start"}`}
                                      >
                                        <div
                                          className={`max-w-[80%] p-3 rounded-2xl text-[11px] shadow-sm bg-white text-gray-800 ${String(chat.senderId || "").toLowerCase() === String(user?._id || user?.id || "").toLowerCase() ? "rounded-tr-none" : "rounded-tl-none"}`}
                                        >
                                          {chat.text}
                                          <div
                                            className={`text-[9px] mt-1 opacity-50 ${String(chat.senderId || "").toLowerCase() === String(user?._id || user?.id || "").toLowerCase() ? "text-right" : "text-left"}`}
                                          >
                                            {new Date(
                                              chat.timestamp || chat.createdAt,
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">
                                No message history found.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showChat && (
        <InstantChat mentor={mate} onClose={() => setShowChat(false)} />
      )}

      <Footer />
    </Layout>
  );
};

export default MateDetailsPage;
