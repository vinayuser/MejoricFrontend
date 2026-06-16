import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPaperPlane, FaTimes, FaUser, FaClock, FaPlus, FaWallet } from "react-icons/fa";
import { apiPost, apiGet, getAuthToken } from "../utils/api";
import {
  initializeFCM,
  syncFCMTokenWithServer,
  getFCMToken,
} from "../utils/fcm";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import { capitalizeName } from "../utils/formatters";
import { showLoginSignupAlert } from "../utils/authAlert";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || "https://mejoric.com";

const timerStyles = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
`;

const InstantChat = ({ mentor: initialMentor, onClose }) => {
  const mentor = initialMentor && initialMentor.user ? { ...initialMentor, ...initialMentor.user } : initialMentor;
  const [messages, setMessages] = useState([]);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isMate, setIsMate] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isTrialChat, setIsTrialChat] = useState(false);
  const [isTrialSession, setIsTrialSession] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [endedBy, setEndedBy] = useState(null);
  const [timeLeft, setTimeLeft] = useState(
    parseInt(import.meta.env.VITE_TRIAL_CHAT_DURATION) || 600,
  ); // trial duration
  const [isTyping, setIsTyping] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [showRechargeDrawer, setShowRechargeDrawer] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const socketRef = useRef(null);
  const currentUserIdRef = useRef(null);
  const conversationIdRef = useRef(null);
  const lastInitiatedMentorIdRef = useRef(null);
  const sessionEndedRef = useRef(false);
  const navigate = useNavigate();

  const closeSmoothly = useCallback(
    (afterClose) => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        if (afterClose) afterClose();
      }, 300);
    },
    [onClose],
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const parseDate = (val) => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    // If it's a numeric string (like an FCM timestamp "1715101470000")
    if (typeof val === "string" && /^\d+$/.test(val)) {
      return new Date(parseInt(val, 10));
    }
    return new Date(val);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    let socketInstance = null;
    let unsubscribeFCM = null;

    const initChat = async () => {
      console.log("[Chat] Initial mentor prop check:", {
        id: mentor?.id,
        _id: mentor?._id,
        name: mentor?.name,
      });
      console.log(`[Chat] Initializing for ${mentor.name} (${mentor?._id || mentor?.id})`);
      try {
        if (!isMounted) return;
        let user = null;
        let token = getAuthToken();

        // Get cached FCM token first so we don't block chat initialization
        let currentFcmToken = localStorage.getItem("fcmToken") || null;

        // Fetch/refresh FCM token in the background to avoid blocking the chat UI/Socket connection
        getFCMToken().then((newToken) => {
          if (newToken && newToken !== currentFcmToken) {
            currentFcmToken = newToken;
            apiPost("/users/fcm-token", { fcmToken: newToken }).catch(() => { });
          }
        }).catch((err) => {
          console.warn("[Chat] Background FCM token fetch failed:", err);
        });

        if (!token) {
          console.log(
            "[Chat] No token found, performing guest login with FCM token...",
          );
          // If we need a guest login and don't have a cached token, wait briefly for FCM token with a short timeout
          if (!currentFcmToken) {
            try {
              currentFcmToken = await Promise.race([
                getFCMToken(),
                new Promise((resolve) => setTimeout(() => resolve(null), 1500))
              ]);
            } catch (e) {
              console.warn("[Chat] FCM token retrieval timed out for guest login", e);
            }
          }

          let guestLoginResponse;
          try {
            guestLoginResponse = await apiPost(
              "/auth/guest-login",
              {
                fcmToken: currentFcmToken,
              },
              true,
            );
          } catch (guestErr) {
            if (guestErr.status === 403) {
              if (!isMounted) return;
              closeSmoothly(() => {
                showLoginSignupAlert(navigate, {
                  message:
                    guestErr.message ||
                    "Please register or login to continue.",
                });
              });
              return;
            }
            throw guestErr;
          }

          if (guestLoginResponse.success) {
            user = guestLoginResponse.data.user;
            token = guestLoginResponse.data.token;
            localStorage.setItem("authToken", token);
            localStorage.setItem("user", JSON.stringify(user));
            window.dispatchEvent(new Event("storage"));
          } else {
            throw new Error("Guest login failed");
          }
        } else {
          try {
            user = JSON.parse(localStorage.getItem("user"));
          } catch (e) {
            console.error("Failed to parse user", e);
          }
        }

        // Robustly flatten nested user structures
        if (user && user.user) {
          user = {
            ...user,
            ...user.user,
          };
        }

        console.log(`[Chat] Current User: ${user?.name} (${user?._id})`);
        setCurrentUser(user);
        currentUserIdRef.current = user?._id || user?.id;

        // Determine if this is a trial chat (involves at least one guest)
        let isTrial = user?.role === "guest" || mentor.role === "guest";
        if (!isTrial) {
          try {
            const recipientRes = await apiGet(`/users/get/${mentor._id}`);
            if (recipientRes.success && recipientRes.data?.role === "guest") {
              isTrial = true;
            }
          } catch (e) {
            console.warn(
              "[Chat] Could not fetch recipient role, assuming non-guest",
              e,
            );
          }
        }
        setIsTrialChat(isTrial);

        const amIMate = user?.role === "mate" || user?.role === "mentor";
        setIsMate(amIMate);
        if (amIMate) setIsAccepted(true); // Mates start as accepted

        // Sync FCM token with server in the background without blocking Socket initialization
        if (currentFcmToken) {
          console.log("[Chat] Syncing FCM token for session in background...");
          apiPost("/users/fcm-token", { fcmToken: currentFcmToken })
            .then(() => {
              sessionStorage.setItem("fcmSessionSynced", "true");
              localStorage.setItem("lastSyncedFCMToken", currentFcmToken);
            })
            .catch((err) => {
              console.warn("[Chat] FCM token sync failed:", err);
            });
        }

        const targetMentorId = mentor?._id || mentor?.id;
        if (!amIMate && lastInitiatedMentorIdRef.current !== targetMentorId) {
          console.log(
            `[Chat] User initiating chat with mentor: ${targetMentorId}`,
          );
          lastInitiatedMentorIdRef.current = targetMentorId;
          try {
            const initRes = await apiPost("/chat/initiate", { recipientId: targetMentorId });
            if (initRes && initRes.success === false) {
              throw new Error(initRes.message || "Failed to initiate chat");
            }
          } catch (err) {
            console.error("[Chat] Failed to notify mate", err);
            closeSmoothly(() => {
              Swal.fire({
                icon: "warning",
                text: err.message || "Failed to initiate chat. Please try again.",
                confirmButtonText: "Close",
                showCloseButton: true,
                confirmButtonColor: "#9333ea",
                didOpen: () => {
                  const container = Swal.getContainer();
                  if (container) container.style.zIndex = "100002";
                },
              });
            });
            return;
          }
        }

        if (!isMounted) return;

        // Initialize Socket.io (using both websocket and polling for robust cross-browser support, e.g., Brave/Opera)
        const socket = io(SOCKET_SERVER_URL, {
          transports: ["websocket", "polling"],
        });
        socketInstance = socket;
        socketRef.current = socket;

        const syncMessages = async () => {
          try {
            const targetMentorId = mentor?._id || mentor?.id;
            console.log(`[Chat] Syncing history for ${targetMentorId}...`);
            const historyRes = await apiGet(
              `/chat/history?recipientId=${targetMentorId}`,
            );
            if (historyRes.success && historyRes.data) {
              const formattedHistory = historyRes.data.map((m) => ({
                _id: m._id,
                senderId: m.senderId,
                senderName: m.senderName,
                text: m.text,
                timestamp: m.timestamp,
                isOwn:
                  String(m.senderId || "").toLowerCase() ===
                  String(
                    currentUserIdRef.current || user?._id || user?.id || "",
                  ).toLowerCase(),
              }));

              setMessages((prev) => {
                // Merge and filter out duplicates
                const existingIds = new Set(
                  prev.map((m) => m._id).filter(Boolean),
                );
                const newMessages = formattedHistory.filter(
                  (m) => !existingIds.has(m._id),
                );
                if (newMessages.length === 0) return prev;

                const combined = [...prev, ...newMessages].sort(
                  (a, b) => parseDate(a.timestamp) - parseDate(b.timestamp),
                );
                return combined;
              });

              if (formattedHistory.length > 0) {
                setIsAccepted(true);
              }
            }
          } catch (err) {
            console.error("[Chat] Sync failed", err);
          }
        };

        socket.on("connect", () => {
          console.log("🔌 [Socket] Connected:", socket.id);
          setIsReconnecting(false);

          // Always join room on connect/reconnect to ensure we're in the right room
          const localConversationId = [
            String(user?._id || user?.id || ""),
            String(mentor?._id || mentor?.id || ""),
          ]
            .sort()
            .join("_");
          conversationIdRef.current = localConversationId;
          socket.emit("join_chat", localConversationId, user?._id || user?.id);
          console.log(`🔌 [Socket] Joining room: ${localConversationId}`);

          // Trigger sync on connect (handles both initial load and re-connect)
          syncMessages();
        });

        socket.on("reconnecting", (attemptNumber) => {
          console.log(`🔌 [Socket] Reconnecting (attempt ${attemptNumber})...`);
          setIsReconnecting(true);
        });

        socket.on("reconnect", (attemptNumber) => {
          console.log(
            `🔌 [Socket] Reconnected after ${attemptNumber} attempts`,
          );
          setIsReconnecting(false);
          toast.success("Reconnected to chat");
          syncMessages(); // Explicit sync on successful reconnection
        });

        socket.on("reconnect_error", (error) => {
          console.error("🔌 [Socket] Reconnect error:", error);
          setIsReconnecting(true);
        });

        socket.on("new_message", (msg) => {
          console.log("🔌 [Socket] New message received:", msg);

          const myId = String(
            currentUserIdRef.current || user?._id || user?.id || "",
          ).toLowerCase();
          const senderId = String(msg.senderId || "").toLowerCase();
          const isMe = myId && senderId === myId;

          setMessages((prev) => {
            // 1. Check if we already have this message by ID
            if (msg._id && prev.some((m) => m._id === msg._id)) {
              console.log(
                "🔌 [Socket] Duplicate message ID detected, skipping.",
              );
              return prev;
            }

            // 2. If it's my own message
            if (isMe) {
              console.log("🔌 [Socket] Confirmed own message, updating ID...");

              // Try to find the optimistic message and update it
              let foundMatch = false;
              const updated = prev.map((m) => {
                if (
                  !foundMatch &&
                  m.isOwn &&
                  m.text === msg.text &&
                  String(m._id || "").startsWith("temp-")
                ) {
                  foundMatch = true;
                  return { ...m, _id: msg._id, timestamp: msg.timestamp };
                }
                return m;
              });

              // If we found a match and updated it, return the updated list
              if (foundMatch) return updated;

              // If we didn't find the optimistic message but it IS mine (based on senderId),
              // we still shouldn't add it as a new received message.
              // We should add it as an OWN message if it's not already there.
              // This handles cases where the optimistic update was missed.
              return [...prev, { ...msg, isOwn: true }];
            }

            // 3. Message from the other party
            console.log("🔌 [Socket] Message from other party, adding to list");
            setIsAccepted(true);
            return [...prev, { ...msg, isOwn: false }];
          });
        });

        socket.on("disconnect", (reason) => {
          console.log("🔌 [Socket] Disconnected:", reason);
          if (reason === "io server disconnect") {
            // the disconnection was initiated by the server, you need to reconnect manually
            socket.connect();
          }
          setIsReconnecting(true);
        });

        socket.on("low_balance_warning", (data) => {
          console.log("⚠️ [Socket] Low balance warning:", data);
          if (amIMate) return; // Do not show low balance alert to the Mate

          setMessages((prev) => {
            const warningText = `Your balance is about to finish. The session will end in ${Math.round(data.timeLeft / 60)} minute(s).`;

            // Filter out any previous low balance alerts to keep only the most recent one
            const filtered = prev.filter((m) => m.senderId !== "system_billing_alert");

            return [
              ...filtered,
              {
                _id: `billing-alert-${data.timeLeft}-${Date.now()}`,
                senderId: "system_billing_alert",
                senderName: "System Billing Alert",
                text: data.message || warningText,
                timeLeft: data.timeLeft,
                timestamp: new Date(),
                isOwn: false,
              },
            ];
          });

          toast.error(data.message || "Low wallet balance alert! Please recharge.", {
            duration: 6000,
            icon: "⚠️",
            style: {
              borderRadius: "15px",
              background: "#fff",
              color: "#333",
              border: "2px solid #ef4444",
            },
          });
        });

        socket.on("recharge_applied", (data) => {
          console.log("🔌 [Socket] Recharge applied successfully:", data);
          if (data.balance !== undefined) {
            setWalletBalance(data.balance);
          }
          if (data.timeLeft !== undefined) {
            setTimeLeft(data.timeLeft);
          }
          setIsProcessingPayment(false);
          setShowRechargeDrawer(false);
          setRechargeAmount("");

          // Clear any system billing alerts since the user recharged
          setMessages((prev) => prev.filter((m) => m.senderId !== "system_billing_alert"));

          toast.success(data.message || "Recharge applied! Chat time extended.", {
            icon: "💰",
            duration: 5000,
          });
        });

        socket.on("timer_sync", (data) => {
          // console.log("🔌 [Socket] Timer sync received:", data);
          if (data.timeLeft !== undefined) {
            setTimeLeft(data.timeLeft);
            if (data.started !== undefined) {
              setIsStarted(data.started);
            }
            if (data.isTrial !== undefined) {
              setIsTrialSession(data.isTrial);
            }
            if (data.elapsedSeconds !== undefined) {
              setElapsedSeconds(data.elapsedSeconds);
            }
            if (data.balance !== undefined) {
              setWalletBalance(data.balance);
            }
            if (data.timeLeft <= 0) {
              if (!sessionEndedRef.current) {
                sessionEndedRef.current = true;
                setSessionEnded(true);
                if (amIMate) onClose();
              }
            }
          }
        });

        socket.on("notification", (payload) => {
          if (payload.type === "CHAT_DECLINED") {
            console.log("🚫 [Chat] Received CHAT_DECLINED via Socket");
            if (sessionEndedRef.current) return;
            sessionEndedRef.current = true;
            setSessionEnded(true);
            setEndedBy(payload.senderName || "Mate");
            toast.error(
              `${payload.senderName || "Mate"} has declined the chat request.`,
            );
            setMessages((prev) => [
              ...prev,
              {
                senderId: "system",
                senderName: "System",
                text: "Chat request declined.",
                timestamp: new Date(),
                isOwn: false,
              },
            ]);
          }
        });

        socket.on("session_ended", (data) => {
          console.log("🔌 [Socket] Session ended received:", data);
          if (sessionEndedRef.current) return;
          sessionEndedRef.current = true;

          setSessionEnded(true);
          const name = data.endedBy || "The other party";
          if (data.endedBy) {
            setEndedBy(data.endedBy);
          }
          toast.error(`${name} has ended the session.`);
          if (amIMate) onClose();
        });

        // 1. Setup FCM Listener FIRST so we don't miss anything while fetching history
        unsubscribeFCM = initializeFCM((payload) => {
          const data = payload.data || {};
          console.log("📢 [Chat] RAW FCM DATA RECEIVED:", data);

          const eventType = data.event || data.type;

          if (eventType === "CHAT_ACCEPTED") {
            const incomingSenderId = String(data.senderId || "")
              .trim()
              .toLowerCase();
            const currentMentorId = String(mentor?._id || mentor?.id || "")
              .trim()
              .toLowerCase();

            if (incomingSenderId === currentMentorId) {
              console.log("🎊 [Chat] Mate accepted the chat!");
              setIsAccepted(true);
              setMessages((prev) => {
                if (
                  prev.some(
                    (m) =>
                      m.text === (data.body || "Mentor has joined the chat.") &&
                      String(m.senderId) === incomingSenderId,
                  )
                )
                  return prev;
                return [
                  ...prev,
                  {
                    senderId: data.senderId,
                    senderName: data.senderName,
                    text: data.body || "Mentor has joined the chat.",
                    timestamp: data.timestamp
                      ? parseDate(data.timestamp)
                      : new Date(),
                    isOwn: false,
                  },
                ];
              });
            }
          } else if (eventType === "CHAT_ENDED") {
            console.log("🚫 [Chat] Received CHAT_ENDED via FCM");
            if (sessionEndedRef.current) return;
            sessionEndedRef.current = true;

            setSessionEnded(true);
            if (data.endedBy) setEndedBy(data.endedBy);
            toast.error(
              `${data.endedBy || "The other party"} has ended the session.`,
            );
            if (isMate) onClose();
          } else if (eventType === "CHAT_DECLINED") {
            console.log("🚫 [Chat] Received CHAT_DECLINED via FCM");
            if (sessionEndedRef.current) return;
            sessionEndedRef.current = true;
            setSessionEnded(true);
            setEndedBy(data.senderName || "Mate");
            toast.error(
              `${data.senderName || "Mate"} has declined the chat request.`,
            );
            setMessages((prev) => [
              ...prev,
              {
                senderId: "system",
                senderName: "System",
                text: "Chat request declined.",
                timestamp: new Date(),
                isOwn: false,
              },
            ]);
          }
        });

        // 2. Initial sync is handled by the socket.on("connect") listener above.

        // 3. Welcome messages (Only if history is empty)
        setMessages((prev) => {
          if (prev.length > 0) return prev;
          if (user?.role === "guest") {
            const trialSecs = parseInt(import.meta.env.VITE_TRIAL_CHAT_DURATION) || 180;
            const trialMins = Math.round(trialSecs / 60);
            return [
              {
                senderId: mentor?._id || mentor?.id,
                senderName: mentor.name,
                text: `Hi! I'm ${capitalizeName(mentor.name)}. I'm here to listen and support you. You have ${trialMins} minutes for this trial chat.`,
                timestamp: new Date(),
                isOwn: false,
              },
            ];
          } else if (user?.role === "user") {
            return [
              {
                senderId: mentor?._id || mentor?.id,
                senderName: mentor.name,
                text: `Hi! I'm ${capitalizeName(mentor.name)}. I'm here to listen and support you.`,
                timestamp: new Date(),
                isOwn: false,
              },
            ];
          } else {
            return [
              {
                senderId: "system",
                senderName: "System",
                text: `You have joined a chat with ${capitalizeName(mentor.name)}.`,
                timestamp: new Date(),
                isOwn: false,
              },
            ];
          }
        });
      } catch (error) {
        console.error("Chat init error:", error);
        if (isMounted) {
          closeSmoothly(() => {
            Swal.fire({
              icon: "error",
              text: error.message || "Failed to initialize chat. Please try again.",
              confirmButtonText: "Close",
              showCloseButton: true,
              confirmButtonColor: "#9333ea",
              didOpen: () => {
                const container = Swal.getContainer();
                if (container) container.style.zIndex = "100002";
              },
            });
          });
        }
      }
    };

    initChat();

    const targetMentorId = mentor?._id || mentor?.id;
    return () => {
      console.log("[Chat] 🧹 Cleaning up Chat Effect...");
      isMounted = false;
      if (unsubscribeFCM) {
        unsubscribeFCM();
      }
      if (socketInstance) {
        console.log("🔌 [Socket] Disconnecting socket instance...");
        socketInstance.disconnect();
      } else if (socketRef.current) {
        console.log("🔌 [Socket] Disconnecting socketRef fallback...");
        socketRef.current.disconnect();
      }
    };
  }, [mentor?._id, mentor?.id, mentor.name, onClose, closeSmoothly, navigate]);

  useEffect(() => {
    let channel = null;
    try {
      channel = new BroadcastChannel("call_and_status_sync");
      channel.onmessage = (event) => {
        const { type, senderName } = event.data;
        if (type === "CHAT_DECLINED") {
          console.log("🚫 [Chat] Received CHAT_DECLINED via BroadcastChannel");
          if (sessionEndedRef.current) return;
          sessionEndedRef.current = true;
          setSessionEnded(true);
          setEndedBy(senderName || "Mate");
          toast.error(`${senderName || "Mate"} has declined the chat request.`);
          setMessages((prev) => [
            ...prev,
            {
              senderId: "system",
              senderName: "System",
              text: "Chat request declined.",
              timestamp: new Date(),
              isOwn: false,
            },
          ]);
        } else if (type === "CHAT_ENDED") {
          console.log("🚫 [Chat] Received CHAT_ENDED via BroadcastChannel");
          if (sessionEndedRef.current) return;
          sessionEndedRef.current = true;
          setSessionEnded(true);
          if (event.data.endedBy) setEndedBy(event.data.endedBy);
          toast.error(
            `${event.data.endedBy || "The other party"} has ended the session.`,
          );
          if (isMate) onClose();
        }
      };
    } catch (e) {
      console.warn("[InstantChat] BroadcastChannel not supported", e);
    }
    return () => {
      if (channel) channel.close();
    };
  }, [onClose, isMate]);

  const [isStarted, setIsStarted] = useState(false);

  // Timer logic (countdown if trial, count up if paid)
  useEffect(() => {
    const localTimer = setInterval(() => {
      if (!isStarted || sessionEnded) return;
      if (isTrialSession) {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      } else {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(localTimer);
  }, [isStarted, isTrialSession, sessionEnded]);

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleQuickRecharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      toast.error("Payment gateway is initializing. Please try again in a moment.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      console.log("Creating Razorpay order for quick recharge...");
      const orderData = await apiPost("/wallet/order/create", {
        amount: parseFloat(rechargeAmount),
        currency: "INR",
      });

      const orderId = orderData.orderId || orderData.data?.razorpayOrderId;

      if (!orderData.success || !orderId) {
        toast.error("Failed to create payment order. Please try again.");
        setIsProcessingPayment(false);
        return;
      }

      // Check if we are in local development environment
      const isLocal =
        import.meta.env.VITE_APP_ENV === "local" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isLocal) {
        console.log("Local development environment detected. Simulating mock payment...");
        setTimeout(async () => {
          try {
            const verifyData = {
              razorpayOrderId: orderId,
              razorpayPaymentId: `mock_pay_${Date.now()}`,
              razorpaySignature: "mock_signature",
              amount: parseFloat(rechargeAmount),
              currency: "INR",
            };

            const result = await apiPost("/wallet/verify", verifyData);
            if (result.success) {
              const conversationId =
                conversationIdRef.current ||
                [String(currentUser?._id || currentUser?.id || ""), String(mentor._id)]
                  .sort()
                  .join("_");

              if (socketRef.current) {
                socketRef.current.emit("sync_recharge", conversationId);
              } else {
                toast.error("Socket disconnected. Balance updated in DB.");
                setIsProcessingPayment(false);
              }
            } else {
              toast.error("Mock verification failed");
              setIsProcessingPayment(false);
            }
          } catch (error) {
            console.error("Mock verification error:", error);
            toast.error("Mock payment failed");
            setIsProcessingPayment(false);
          }
        }, 1200);
        return;
      }

      const amountInPaise = parseFloat(rechargeAmount) * 100;
      const options = {
        key: "rzp_live_SVXnEDUa7IpGc8",
        amount: amountInPaise,
        currency: "INR",
        name: "Mejoric",
        description: "Quick Chat Wallet Top-up",
        image: "https://mejoric.com/logo512.png",
        order_id: orderId,
        handler: async function (response) {
          setIsProcessingPayment(true);
          try {
            const verifyData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };
            const result = await apiPost("/wallet/verify", verifyData);
            if (result.success) {
              const conversationId =
                conversationIdRef.current ||
                [String(currentUser?._id || currentUser?.id || ""), String(mentor._id)]
                  .sort()
                  .join("_");

              if (socketRef.current) {
                socketRef.current.emit("sync_recharge", conversationId);
              } else {
                toast.success("Payment verified! Balance updated.");
                setIsProcessingPayment(false);
                setShowRechargeDrawer(false);
              }
            } else {
              toast.error("Payment verification failed");
              setIsProcessingPayment(false);
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Recharge verification failed");
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsProcessingPayment(false);
      });
      razorpay.open();
    } catch (err) {
      console.error("Quick recharge error:", err);
      toast.error("Failed to initiate quick recharge");
      setIsProcessingPayment(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sessionEnded || !currentUser) return;

    const text = inputValue.trim();
    setInputValue(""); // Clear early

    // Optimistic Update
    const localMsg = {
      _id: `temp-${Date.now()}`, // Temporary ID to prevent duplicates
      senderId: currentUser?._id || currentUser?.id,
      senderName: currentUser?.name,
      text: text,
      timestamp: new Date(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, localMsg]);

    const recipientId = String(mentor?._id || mentor?.id || "");
    if (!recipientId || recipientId === "undefined" || recipientId === "null") {
      console.error(
        "[Chat] ❌ Cannot send message: recipientId is invalid!",
        {
          recipientId,
          mentor,
        },
      );
      toast.error("Error: Recipient not identified");
      return;
    }

    try {
      const requestBody = {
        recipientId: recipientId,
        text: text,
      };
      console.log(`[Chat] Sending message to ${recipientId}`, requestBody);
      const res = await apiPost("/chat/send", requestBody);
      if (res.success) {
        console.log("[Chat] ✅ Message successfully sent to server");
      } else {
        console.error("[Chat] ❌ Failed to send message:", res.message);
        toast.error("Message not delivered");
      }
    } catch (error) {
      console.error("[Chat] ❌ Send error:", error);
      toast.error("Network error");
    }
  };

  useEffect(() => {
    if (sessionEnded) {
      setMessages((prev) => {
        if (prev.some((m) => m.text === "The session has ended.")) return prev;
        return [
          ...prev,
          {
            senderId: "system",
            senderName: "System",
            text: "The session has ended.",
            timestamp: new Date(),
            isOwn: false,
          },
        ];
      });
    }
  }, [sessionEnded]);

  const handleEndChat = async () => {
    const result = await Swal.fire({
      title: "End Session?",
      text: "Are you sure you want to end this chat session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9333ea",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, end it",
      // Ensure SweetAlert is on top of our modal
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "100002";
      },
    });

    if (result.isConfirmed) {
      // Emit end event
      const conversationId =
        conversationIdRef.current ||
        [String(currentUser?._id || currentUser?.id || ""), String(mentor._id)]
          .sort()
          .join("_");
      if (socketRef.current) {
        socketRef.current.emit("end_chat", conversationId, currentUser?.name);
      }
      // Call API as fallback/reliable way
      try {
        await apiPost("/chat/end", { conversationId });
      } catch (err) {
        console.error("Failed to end chat via API", err);
      }
      onClose();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <style>{timerStyles}</style>
      <div
        className={`bg-white w-full max-w-md h-[600px] rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ease-out ${
          isClosing ? "opacity-0 scale-95 translate-y-2" : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <div className="bg-purple-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50 relative">
              <FaUser className="text-white" />
              {isReconnecting && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-purple-600 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold capitalize">
                  {capitalizeName(mentor.name)}
                </h3>
                {isReconnecting && (
                  <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-md font-black animate-pulse uppercase">
                    Offline
                  </span>
                )}
              </div>
              <p className="text-[10px] opacity-80 uppercase tracking-widest">
                Live Chat
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isStarted && (
              <>
                {/* Header Wallet Pill for Payer (Registered User) */}
                {!isTrialSession && !isMate && walletBalance !== null && (
                  <div className="relative group">
                    <button
                      onClick={() => setShowRechargeDrawer(true)}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-full border border-emerald-400 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-105 active:scale-95 font-semibold"
                    >
                      <FaWallet className="text-xs text-white group-hover:animate-bounce" />
                      <span className="font-mono text-xs font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                        ₹{Math.floor(walletBalance)}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    </button>
                    {/* Premium Tooltip */}
                    <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-slate-900/95 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-top-right transition-all duration-200 pointer-events-none z-[60] flex items-center gap-1.5 backdrop-blur-sm">
                      <FaWallet className="text-emerald-400 text-[10px]" />
                      <span>Wallet Balance: ₹{Math.floor(walletBalance)} (Click to Recharge)</span>
                    </div>
                  </div>
                )}

                {isTrialSession ? (
                  <div className="relative group animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className={`flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full border border-white/30 text-white shadow-sm ${sessionEnded
                        ? "opacity-50"
                        : timeLeft < 30
                          ? "border-red-400/50 bg-red-500/10 text-red-400"
                          : ""
                      }`}>
                      <FaClock className={`text-xs animate-pulse ${sessionEnded
                          ? "opacity-50"
                          : timeLeft < 30
                            ? "text-red-400"
                            : "text-white/80"
                        }`} />
                      <span className="font-mono text-xs font-bold tracking-wider" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    {/* Premium Tooltip */}
                    <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-slate-900/95 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-top-right transition-all duration-200 pointer-events-none z-[60] flex items-center gap-1.5 backdrop-blur-sm">
                      <FaClock className="text-purple-400 text-[10px]" />
                      <span>Session Timer (Countdown)</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative group animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full border border-white/30 text-white shadow-sm">
                      <FaClock className="text-xs text-white/80 animate-pulse" />
                      <span className="font-mono text-xs font-bold tracking-wider" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatTime(elapsedSeconds)}
                      </span>
                    </div>
                    {/* Premium Tooltip */}
                    <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-slate-900/95 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-top-right transition-all duration-200 pointer-events-none z-[60] flex items-center gap-1.5 backdrop-blur-sm">
                      <FaClock className="text-purple-400 text-[10px]" />
                      <span>Session Timer (Elapsed)</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="relative group">
              <button
                onClick={() => (sessionEnded ? onClose() : handleEndChat())}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center text-white"
              >
                <FaTimes />
              </button>
              {/* Premium Tooltip */}
              <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-slate-900/95 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-top-right transition-all duration-200 pointer-events-none z-[60] flex items-center gap-1.5 backdrop-blur-sm">
                <FaTimes className="text-red-400 text-[10px]" />
                <span>End Active Session</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative">
          {/* Floating Reconnection Badge */}
          {isReconnecting && !sessionEnded && (
            <div className="sticky top-0 left-0 right-0 z-10 flex justify-center pb-4">
              <div className="bg-amber-50/90 backdrop-blur-sm text-amber-600 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse border border-amber-200 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                Connection Lost - Reconnecting...
              </div>
            </div>
          )}

          {!isStarted && !sessionEnded && !isReconnecting && (
            <div className="flex justify-center">
              <div className="bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse border border-purple-100">
                Waiting for {isMate ? "user" : capitalizeName(mentor.name)} to
                join...
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            const date = parseDate(msg.timestamp).toDateString();
            const prevDate =
              index > 0
                ? parseDate(messages[index - 1].timestamp).toDateString()
                : null;
            const isNewDay = date !== prevDate;

            const getFormattedDate = (dateVal) => {
              const d = parseDate(dateVal);
              const now = new Date();
              if (d.toDateString() === now.toDateString()) return "Today";
              const yesterday = new Date();
              yesterday.setDate(now.getDate() - 1);
              if (d.toDateString() === yesterday.toDateString())
                return "Yesterday";
              return d.toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
            };

            return (
              <React.Fragment key={msg._id || index}>
                {isNewDay && (
                  <div className="flex justify-center my-6 first:mt-0">
                    <div className="bg-gray-200/50 backdrop-blur-sm text-gray-500 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-[0.1em] border border-gray-200 shadow-sm">
                      {getFormattedDate(msg.timestamp)}
                    </div>
                  </div>
                )}
                {msg.senderId === "system_billing_alert" ? (
                  <div className="flex justify-center my-4 animate-in fade-in zoom-in-95 duration-300 w-full">
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 backdrop-blur-md rounded-2xl p-4 max-w-[90%] text-center shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mr-8 -mt-8"></div>
                      <div className="flex items-center justify-center gap-2 mb-2 text-amber-600">
                        <FaClock className="text-xs animate-pulse" />
                        <span className="font-bold text-[10px] tracking-wider uppercase">Low Balance Alert</span>
                      </div>
                      <p className="text-gray-700 text-xs font-semibold mb-3 leading-relaxed">
                        {msg.text}
                      </p>
                      {!isMate && (
                        <button
                          onClick={() => setShowRechargeDrawer(true)}
                          className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-xl transition-all duration-300 transform active:scale-95 shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                        >
                          <FaPlus className="text-[10px]" /> Recharge Wallet Now
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-md bg-white text-gray-800 ${msg.isOwn ? "rounded-tr-none" : "rounded-tl-none"}`}
                    >
                      {msg.text}
                      <div
                        className={`text-[10px] mt-1 opacity-60 ${msg.isOwn ? "text-right" : "text-left"}`}
                      >
                        {parseDate(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t">
          {sessionEnded ? (
            <div className="text-center space-y-3 py-2 px-4">
              <p className="text-sm font-medium text-gray-600">
                {endedBy
                  ? `${endedBy} has ended the chat session.`
                  : timeLeft <= 0
                    ? "Session ended. Your balance has run out."
                    : "The session has ended."}
              </p>
              {currentUser?.role === "guest" ? (
                <button
                  onClick={() => {
                    localStorage.setItem("redirect_mate_id", mentor._id);
                    localStorage.setItem("redirect_type", "chat");
                    if (currentUser?._id) {
                      localStorage.setItem(
                        "conversion_guest_id",
                        currentUser._id,
                      );
                    }
                    navigate("/signup");
                  }}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-200 active:scale-[0.98] transition-transform"
                >
                  Sign Up to Continue
                </button>
              ) : (
                currentUser?.role === "user" && (
                  <button
                    onClick={() => {
                      if (timeLeft <= 0) {
                        navigate("/wallet");
                      } else {
                        onClose();
                      }
                    }}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-200 active:scale-[0.98] transition-transform"
                  >
                    {timeLeft <= 0 ? "Recharge Wallet" : "Close Chat"}
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  !currentUser ? "Connecting..." : "Type a message..."
                }
                disabled={!currentUser}
                className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !currentUser}
                className="bg-purple-600 text-white p-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
              >
                <FaPaperPlane />
              </button>
            </div>
          )}
        </div>

        {/* Quick Recharge Drawer */}
        {showRechargeDrawer && (
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
            onClick={() => setShowRechargeDrawer(false)}
          />
        )}
        <div
          className={`absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-purple-100 rounded-t-[2rem] shadow-[0_-8px_30px_rgb(0,0,0,0.15)] px-6 py-5 transition-transform duration-300 ease-out transform ${showRechargeDrawer ? "translate-y-0" : "translate-y-full"
            }`}
        >
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 cursor-pointer animate-pulse" onClick={() => setShowRechargeDrawer(false)}></div>

          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-gray-800 text-sm flex items-center gap-2">
              <FaWallet className="text-purple-600" />
              Quick Wallet Recharge
            </h4>
            <button
              onClick={() => setShowRechargeDrawer(false)}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          <p className="text-[10px] text-gray-500 mb-4 leading-relaxed">
            Top up your wallet instantly to continue your session without interruption. Powered securely by Razorpay.
          </p>

          {/* Quick presets */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[100, 200, 500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRechargeAmount(preset.toString())}
                className={`py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 flex flex-col items-center justify-center gap-0.5 border ${rechargeAmount === preset.toString()
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20 border-purple-600"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100/70 border-purple-100"
                  }`}
              >
                <span className="text-[9px] uppercase font-black tracking-widest opacity-80">Preset</span>
                <span className="text-xs">₹{preset}</span>
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="relative mb-5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-base">₹</span>
            <input
              type="number"
              placeholder="Or enter custom amount"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-2xl border-2 border-purple-100 focus:border-purple-500 focus:outline-none text-sm font-semibold text-gray-800 shadow-inner"
            />
          </div>

          {/* Pay CTA */}
          <button
            onClick={handleQuickRecharge}
            disabled={isProcessingPayment || !rechargeAmount || parseFloat(rechargeAmount) <= 0}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/10 transition-all duration-300 ${isProcessingPayment || !rechargeAmount || parseFloat(rechargeAmount) <= 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-xl active:scale-[0.98]"
              }`}
          >
            {isProcessingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                Pay & Continue Chatting
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstantChat;
