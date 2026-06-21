import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaPhone,
  FaVideo,
  FaHistory,
  FaUser,
  FaSignOutAlt,
  FaWallet,
  FaHeadset,
  FaPhoneSlash,
  FaCircle,
  FaComments,
} from "react-icons/fa";
import toast from "react-hot-toast";
import logo from "../img/logo- final.png";
import { apiPost, apiGet, apiPut } from "../utils/api";
import { initializeFCM, getFCMToken } from "../utils/fcm";
import { capitalizeName } from "../utils/formatters";
// Video/Audio call base URLs - roomId will be appended dynamically
const VIDEO_CALL_URL = `${import.meta.env.VITE_VIDEO_CALL_BASE_URL || "https://mateandmentors.yourvideo.live/host/"}`;
const AUDIO_CALL_URL = `${import.meta.env.VITE_AUDIO_CALL_BASE_URL || "https://matenmentor.yourvideo.live/host/"}`;

function MateDashboard() {
  const navigate = useNavigate();
  const { user, logout, walletBalance, refreshWalletBalance } = useAuth();
  const [callHistory, setCallHistory] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [receiverId, setReceiverId] = useState(null);
  // console.log(receiverId, "this is reciverId");
  // Fetch user online status on component mount

  const [isOnline, setIsOnline] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showCallIframe, setShowCallIframe] = useState(false);
  const [callUrl, setCallUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("calls"); // "calls" or "chats"
  const [chatPage, setChatPage] = useState(1);
  const [totalChatPages, setTotalChatPages] = useState(1);
  const [globalStats, setGlobalStats] = useState({
    totalCalls: 0,
    totalMinutes: 0,
  });

  // Fetch mate's current isAvailable status on mount
  useEffect(() => {
    const fetchMateStatus = async () => {
      try {
        const userId = user?.user?._id || user?._id || user?.id;
        if (!userId) return;

        const token = user?.token || localStorage.getItem("authToken");
        if (!token) return;

        // Bearer identifies the user; same as GET /users/get?userId= when self
        const result = await apiGet("/users/get");

        if (result.success && result.data) {
          const mateAvailable = result.data.mate?.isAvailable || false;
          setIsOnline(mateAvailable);
          console.log(
            "📡 Mate availability loaded:",
            mateAvailable ? "Online" : "Offline",
          );
        }
      } catch (error) {
        console.error("Error fetching mate status:", error);
      }
    };

    fetchMateStatus();
  }, [user]);

  // Fetch call history from API
  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        const token = user?.token || localStorage.getItem("authToken");
        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/calls/history?page=${currentPage}&limit=10`,
          {
            method: "GET",
            headers,
          },
        );

        const result = await response.json();

        if (result.success && result.data) {
          // Transform API response to match our display format
          const formattedHistory = result.data.map((call) => {
            // Calculate duration in minutes
            let duration = "0 min";
            if (call.startTime && call.updatedAt) {
              const start = new Date(call.startTime);
              const end = new Date(call.updatedAt);
              const diffMinutes = Math.round((end - start) / 60000);
              duration = diffMinutes > 0 ? `${diffMinutes} min` : "<1 min";
              call.rawMinutes = diffMinutes; // Store numeric value for summing
            } else {
              call.rawMinutes = 0;
            }

            // Determine the other party (mentor)
            const isCaller =
              String(call.callerId?._id || "") ===
              String(user?._id || user?.user?._id || "");
            const mentorName = isCaller
              ? call.receiverId?.name
              : call.callerId?.name;

            return {
              id: call._id,
              mentorName: mentorName || "Unknown",
              type: call.callType?.toLowerCase() || "video",
              duration: duration,
              rawMinutes: call.rawMinutes || 0,
              date: new Date(call.createdAt).toLocaleDateString("en-GB"),
              status: call.callStatus?.toLowerCase() || "unknown",
            };
          });

          setCallHistory(formattedHistory);

          // Store receiverId from the first call in history
          if (result.data.length > 0 && result.data[0].receiverId?._id) {
            setReceiverId(result.data[0].receiverId._id);
          }

          // Update pagination and global stats info
          if (result.pagination) {
            setTotalPages(
              Math.ceil(result.pagination.total / result.pagination.limit),
            );
            setGlobalStats({
              totalCalls: result.pagination.total || 0,
              totalMinutes: result.pagination.totalMinutes || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching call history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCallHistory();
  }, [user, currentPage]);

  // Fetch chat history from API
  useEffect(() => {
    const fetchChatHistory = async () => {
      setIsChatLoading(true);
      try {
        const result = await apiGet(
          `/chat/all-history?page=${chatPage}&limit=10`,
        );
        if (result.success && result.data) {
          setChatHistory(result.data);
          setTotalChatPages(result.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setIsChatLoading(false);
      }
    };
    if (user) fetchChatHistory();
  }, [user, chatPage]);

  // Fetch wallet balance from API on load
  useEffect(() => {
    refreshWalletBalance();
  }, []);
  const toggleOnlineStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      console.log("User object for status update:", user);
      console.log("User ID:", user?._id || user?.id);

      const newStatus = !isOnline;
      const userId = user?.user?._id || user?._id || user?.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      const result = await apiPut(`/users/update?userId=${userId}`, {
        isAvailable: newStatus,
      });

      if (result.success) {
        setIsOnline(newStatus);
        console.log(`User is now ${newStatus ? "Online" : "Offline"}`);
      } else {
        console.error("Failed to update status:", result.message);
        toast.error("Failed to update status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  // FCM is now handled globally in CallNotification.jsx

  const handleLogout = async () => {
    try {
      console.log("Setting user to offline before logout");
      console.log("User ID:", user?._id || user?.id);

      const userId = user?.user?._id || user?._id || user?.id;
      if (userId) {
        const result = await apiPut(`/users/update?userId=${userId}`, {
          isAvailable: false,
        });
        if (result.success) {
          setIsOnline(false);
          console.log("User set to offline successfully");
        } else {
          console.error("Failed to set user to offline:", result.message);
        }
      }
    } catch (error) {
      console.error("Error setting user to offline:", error);
    } finally {
      // Logout and navigate to login page
      logout();
      navigate("/login?role=mate");
    }
  };

  const handleAcceptCall = async (
    callSessionId,
    callType = "video",
    roomId = null,
  ) => {
    console.log(roomId, "^^^^^^^^^^^^^");
    try {
      // Get token from user object in AuthContext
      const token = user?.token || localStorage.getItem("authToken");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/calls/accept`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ callSessionId }),
        },
      );

      const result = await response.json();

      if (result.success) {
        // Build dynamic URL based on roomId from notification
        let url;
        if (roomId) {
          // Encode both roomId and rest id together using base64
          console.log(roomId, "this is roomId");
          const combinedId =
            callType === "audio"
              ? `${roomId}-69c517c510b8b0a2780f69c3`
              : `${roomId}-69b7a7f601742c5c950b3e8e`;
          const encodedCombinedId = btoa(combinedId);
          // Use encoded combined id in URL
          url =
            callType === "audio"
              ? `${AUDIO_CALL_URL}${encodedCombinedId}?name=${user?.name}&landing=no`
              : `${VIDEO_CALL_URL}${encodedCombinedId}?name=${user?.name}&landing=no&my_virtual_img=https://res.cloudinary.com/dgpstba9n/image/upload/v1774511122/matebackground_wuqx9h.jpg`;
          console.log("Using dynamic room URL:", url);
        } else {
          // Fallback to static URLs
          url = callType === "audio" ? AUDIO_CALL_URL : VIDEO_CALL_URL;
          console.log("Using static fallback URL:", url);
        }
        setCallUrl(url);
        setShowCallIframe(true);
      } else {
        toast.error("Failed to accept call");
      }
    } catch (error) {
      console.error("Accept call error:", error);
      toast.error("Failed to accept call");
    }
  };
  const handleDeclineCall = async (callSessionId) => {
    try {
      // Get token from user object in AuthContext
      const token = user?.token || localStorage.getItem("authToken");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/calls/reject`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ callSessionId }),
        },
      );

      const result = await response.json();

      if (!result.success) {
        toast.error("Failed to decline call");
      }
    } catch (error) {
      console.error("Decline call error:", error);
      toast.error("Failed to decline call");
    }
  };
  const handleEndCall = async () => {
    // Call end API when closing iframe
    if (incomingCall?.callSessionId) {
      try {
        const token = user?.token || localStorage.getItem("authToken");
        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        await fetch(`${import.meta.env.VITE_API_BASE_URL}/calls/end`, {
          method: "POST",
          headers,
          body: JSON.stringify({ callSessionId: incomingCall.callSessionId }),
        });
        console.log("Call ended successfully");
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }
    setShowCallIframe(false);
    setCallUrl("");
  };

  const totalCalls = globalStats.totalCalls;
  const totalMinutes = globalStats.totalMinutes;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Ringtone Audio Element */}
      {/* Incoming Call is now handled globally in CallNotification.jsx */}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <img src={logo} className="w-full h-full object-contain" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Mate Dashboard
                </h1>
              </Link>
            </div>
            <nav className="flex items-center space-x-3 sm:space-x-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={toggleOnlineStatus}
                  disabled={isUpdatingStatus}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isOnline ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isOnline ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>

                <span
                  className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                    isOnline ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Welcome Message */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {capitalizeName(user?.name) || "Mate"}! 👋
          </h2>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Here's your call history and activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Calls</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {totalCalls}
                </p>
              </div>
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <FaPhone className="text-blue-600 text-lg sm:text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Minutes</p>
                <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                  {totalMinutes}
                </p>
              </div>
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaHistory className="text-indigo-600 text-lg sm:text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-green-100 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Earning Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  ₹{walletBalance}
                </p>
              </div>
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-green-100 rounded-full flex items-center justify-center">
                <FaWallet className="text-green-600 text-lg sm:text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* History Section Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-8">
          <div className="flex border-b border-blue-100">
            <button
              onClick={() => setActiveTab("calls")}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "calls"
                  ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FaHistory />
              Call History
            </button>
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "chats"
                  ? "text-purple-600 bg-purple-50 border-b-2 border-purple-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FaComments />
              Chat History
            </button>
          </div>

          <div className="p-0">
            {activeTab === "calls" ? (
              <>
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading calls...</p>
                  </div>
                ) : callHistory.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-4">📞</div>
                    <p className="text-gray-500">No call history yet</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-blue-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                              Mentor
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                              Type
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                              Duration
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                              Date
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100">
                          {callHistory.map((call) => (
                            <tr
                              key={call.id}
                              className="hover:bg-blue-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FaUser className="text-blue-600" />
                                  </div>
                                  <span className="font-medium capitalize text-gray-900">
                                    {capitalizeName(call.mentorName)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`flex items-center gap-2 text-sm ${
                                    call.type === "video"
                                      ? "text-blue-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {call.type === "video" ? (
                                    <FaVideo />
                                  ) : (
                                    <FaPhone />
                                  )}
                                  <span className="capitalize">
                                    {call.type}
                                  </span>
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600 text-sm">
                                {call.duration}
                              </td>
                              <td className="px-6 py-4 text-gray-600 text-sm">
                                {call.date}
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                  {call.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 py-6 bg-gray-50 border-t border-blue-100">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
                        >
                          Prev
                        </button>
                        <span className="text-gray-600 font-medium">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {isChatLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading chats...</p>
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-gray-500">No chat history yet</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Start Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              End Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Messages
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {chatHistory.map((chat, index) => (
                            <tr
                              key={index}
                              className="hover:bg-purple-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 bg-purple-100 rounded-full flex items-center justify-center">
                                    <FaUser className="text-purple-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {capitalizeName(chat.otherUser?.name) ||
                                        "Guest User"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(chat.startTime).toLocaleString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {chat.endTime ? (
                                    new Date(chat.endTime).toLocaleString()
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      Ongoing
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-semibold">
                                  {chat.messageCount}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    chat.status === "ACTIVE"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {chat.status.toLowerCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Chat Pagination */}
                    {totalChatPages > 1 && (
                      <div className="flex justify-center items-center gap-4 py-6 bg-gray-50 border-t border-purple-100 rounded-b-xl">
                        <button
                          onClick={() =>
                            setChatPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={chatPage === 1}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-300 transition-colors hover:bg-purple-700"
                        >
                          Prev
                        </button>
                        <span className="text-gray-600 font-medium">
                          Page {chatPage} of {totalChatPages}
                        </span>
                        <button
                          onClick={() =>
                            setChatPage((prev) =>
                              Math.min(totalChatPages, prev + 1),
                            )
                          }
                          disabled={chatPage === totalChatPages}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-300 transition-colors hover:bg-purple-700"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MateDashboard;
