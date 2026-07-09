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
import { apiPost, apiGet } from "../utils/api";
import { initializeFCM, getFCMToken } from "../utils/fcm";
import { capitalizeName, getDisplayName, formatDisplayLabel } from "../utils/formatters";
import { useMateAvailability } from "../hooks/useMateAvailability";

function normalizeId(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value._id ?? value.id ?? "");
}

function MateDashboard() {
  const navigate = useNavigate();
  const { user, logout, walletBalance } = useAuth();
  const [callHistory, setCallHistory] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [receiverId, setReceiverId] = useState(null);
  const { isOnline, isUpdatingStatus, toggleOnlineStatus, setOffline } =
    useMateAvailability(user);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("calls"); // "calls" or "chats"
  const [chatPage, setChatPage] = useState(1);
  const [totalChatPages, setTotalChatPages] = useState(1);
  const [globalStats, setGlobalStats] = useState({
    totalCalls: 0,
    totalMinutes: 0,
  });

  const userId = user?._id ?? user?.id;

  // Fetch call history from API
  useEffect(() => {
    if (!userId) return;

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
            let duration = "0 min";
            if (call.duration != null && call.duration > 0) {
              const diffMinutes = Math.ceil(call.duration / 60);
              duration = diffMinutes >= 1 ? `${diffMinutes} min` : "<1 min";
            } else if (call.startTime && call.endTime) {
              const start = new Date(call.startTime);
              const end = new Date(call.endTime);
              const diffMinutes = Math.round((end - start) / 60000);
              duration = diffMinutes > 0 ? `${diffMinutes} min` : "<1 min";
            } else if (call.startTime && call.updatedAt) {
              const start = new Date(call.startTime);
              const end = new Date(call.updatedAt);
              const diffMinutes = Math.round((end - start) / 60000);
              duration = diffMinutes > 0 ? `${diffMinutes} min` : "<1 min";
            }

            let userName =
              call.otherPartyName ||
              getDisplayName(call.callerId) ||
              getDisplayName(call.receiverId) ||
              "User";

            if (userName === "User") {
              const currentUserId = normalizeId(userId);
              const callerId = normalizeId(call.callerId);
              const receiverId = normalizeId(call.receiverId);

              if (currentUserId && currentUserId === receiverId) {
                userName = getDisplayName(call.callerId);
              } else if (currentUserId && currentUserId === callerId) {
                userName = getDisplayName(call.receiverId);
              } else if (user?.role === "mate") {
                userName =
                  getDisplayName(call.callerId) ||
                  getDisplayName(call.receiverId) ||
                  "User";
              }
            }

            return {
              id: call._id,
              userName,
              type: call.callType?.toLowerCase() || "video",
              duration,
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
  }, [userId, currentPage]);

  // Fetch chat history only when the chats tab is active
  useEffect(() => {
    if (!userId || activeTab !== "chats") return;

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
    fetchChatHistory();
  }, [userId, chatPage, activeTab]);

  const handleLogout = async () => {
    await setOffline();
    logout();
    navigate("/login?role=mate");
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
              <Link
                to="/dashboard/profile"
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1 sm:gap-2"
              >
                <FaUser className="text-sm sm:text-base" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
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
                              User
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
                                    {formatDisplayLabel(call.userName)}
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
                                      {formatDisplayLabel(chat.otherUser?.name)}
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
