import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaPhone,
  FaPhoneSlash,
  FaVolumeMute,
  FaComments,
  FaShare,
  FaPlusSquare,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import InstantChat from "./InstantChat";
import {
  isIOSThirdPartyBrowser,
  isIOS,
  isAndroid,
  isStandalonePWA,
} from "../utils/browserDetect";
import {
  initializeFCM,
  syncFCMTokenWithServer,
  FCM_EVENTS,
} from "../utils/fcm";
import { io } from "socket.io-client";
import { apiGet, apiPost } from "../utils/api";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { capitalizeName } from "../utils/formatters";
// Video/Audio call base URLs
const VIDEO_CALL_URL = `${import.meta.env.VITE_VIDEO_CALL_BASE_URL || "https://mateandmentors.yourvideo.live/host/"}`;
const AUDIO_CALL_URL = `${import.meta.env.VITE_AUDIO_CALL_BASE_URL || "https://matenmentor.yourvideo.live/host/"}`;

const CALL_TIMEOUT_MS = 60000;
const DISMISS_INCOMING_TTL_MS = 120000;
const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL || "https://mejoric.com";

const CallNotification = () => {
  const { isAuthenticated, user } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallIframe, setShowCallIframe] = useState(false);
  const [callUrl, setCallUrl] = useState("");
  const [audioError, setAudioError] = useState(false);
  const [incomingChat, setIncomingChat] = useState(null);
  const [showChatUI, setShowChatUI] = useState(false);

  const audioRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const lastProcessedCallId = useRef(null);
  const incomingCallRef = useRef(null);
  const showCallIframeRef = useRef(false);
  const activeCallSessionIdRef = useRef(null);
  const dismissedIncomingSessionsRef = useRef(new Map());
  const socketRef = useRef(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  const isCallReceiverRole = user?.role === "mate" || user?.role === "mentor";

  const stopRingtone = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ("vibrate" in navigator) navigator.vibrate(0);
  }, []);

  const clearIncomingState = useCallback(() => {
    incomingCallRef.current = null;
    setIncomingCall(null);
  }, []);

  const handleCloseChat = useCallback(() => {
    setShowChatUI(false);
    setIncomingChat(null);
  }, []);

  useEffect(() => {
    if (
      isAuthenticated &&
      isCallReceiverRole &&
      isIOS() &&
      !isStandalonePWA()
    ) {
      // Show prompt after a short delay
      const timer = setTimeout(() => setShowIOSPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isCallReceiverRole]);

  const playRingtone = useCallback(() => {
    if (audioRef.current) {
      setAudioError(false);
      audioRef.current.loop = true;
      audioRef.current.play().catch((error) => {
        console.warn("[CallNotification] Ringtone blocked", error);
        setAudioError(true);
      });
      if ("vibrate" in navigator) {
        const vibratePattern = [];
        for (let i = 0; i < 60; i++) vibratePattern.push(500, 200);
        navigator.vibrate(vibratePattern);
      }
    }
  }, []);

  const processIncomingCall = useCallback(
    (data) => {
      if (!data?.callSessionId) return;
      if (incomingCallRef.current?.callSessionId === data.callSessionId) return;

      const dismissedAt = dismissedIncomingSessionsRef.current.get(
        data.callSessionId,
      );
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_INCOMING_TTL_MS)
        return;

      if (lastProcessedCallId.current === data.callSessionId) return;
      lastProcessedCallId.current = data.callSessionId;
      setTimeout(() => {
        lastProcessedCallId.current = null;
      }, 5000);

      const next = {
        callSessionId: data.callSessionId,
        callerName: data.callerName || "Someone",
        callType: (data.callType || "video").toLowerCase(),
        roomId: data.roomId || null,
      };
      incomingCallRef.current = next;
      setIncomingCall(next);
      playRingtone();
    },
    [playRingtone],
  );

  const declineCallBySessionId = useCallback(
    async (callSessionId, recordDismiss) => {
      if (!callSessionId) return;
      if (recordDismiss)
        dismissedIncomingSessionsRef.current.set(callSessionId, Date.now());
      stopRingtone();
      clearIncomingState();
      broadcastChannelRef.current?.postMessage({
        type: FCM_EVENTS.SYNC_STOP_RINGING,
      });
      try {
        await apiPost("/calls/reject", { callSessionId });
      } catch (error) {
        console.error(error);
      }
    },
    [stopRingtone, clearIncomingState],
  );

  const handleDeclineCall = useCallback(async () => {
    const id = incomingCall?.callSessionId;
    if (id) await declineCallBySessionId(id, true);
  }, [incomingCall, declineCallBySessionId]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    const { callSessionId, callType, roomId } = incomingCall;
    stopRingtone();
    clearIncomingState();
    broadcastChannelRef.current?.postMessage({
      type: FCM_EVENTS.SYNC_STOP_RINGING,
    });

    try {
      const result = await apiPost("/calls/accept", { callSessionId });
      if (result.success) {
        activeCallSessionIdRef.current = callSessionId;
        let url;
        if (roomId) {
          const combinedId =
            callType === "audio"
              ? `${roomId}-69c517c510b8b0a2780f69c3`
              : `${roomId}-69b7a7f601742c5c950b3e8e`;
          const encodedCombinedId = btoa(combinedId);
          url =
            callType === "audio"
              ? `${AUDIO_CALL_URL}${encodedCombinedId}?name=${user?.name}&landing=no`
              : `${VIDEO_CALL_URL}${encodedCombinedId}?name=${user?.name}&landing=no&my_virtual_img=https://res.cloudinary.com/dgpstba9n/image/upload/v1774511122/matebackground_wuqx9h.jpg`;
        } else {
          url = callType === "audio" ? AUDIO_CALL_URL : VIDEO_CALL_URL;
        }
        setCallUrl(url);
        setShowCallIframe(true);
      } else {
        Swal.fire({
          icon: "error",
          text: result.message || "Invalid session",
          confirmButtonColor: "#9333ea",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        text: "Failed to accept call",
        confirmButtonColor: "#9333ea",
      });
    }
  };

  const handleEndCall = async () => {
    const sessionToEnd =
      activeCallSessionIdRef.current || incomingCall?.callSessionId;
    if (sessionToEnd) {
      try {
        await apiPost("/calls/end", { callSessionId: sessionToEnd });
      } catch (error) {
        console.error(error);
      }
    }
    activeCallSessionIdRef.current = null;
    setShowCallIframe(false);
    setCallUrl("");
    clearIncomingState();
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      broadcastChannelRef.current = new BroadcastChannel(
        "call_and_status_sync",
      );
      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data.type === FCM_EVENTS.SYNC_STOP_RINGING) {
          stopRingtone();
          clearIncomingState();
          setIncomingChat(null);
        } else if (event.data.type === "CALL_ENDED") {
          setShowCallIframe(false);
          setCallUrl("");
          activeCallSessionIdRef.current = null;
          clearIncomingState();
        }
      };
    } catch (e) {
      broadcastChannelRef.current = null;
    }

    const unsubscribeFCM = initializeFCM((payload) => {
      const data = payload.data || {};
      // Note: Both callers and receivers should receive ENDED events
      // but only mates/mentors should process INCOMING_CALLs.

      const isIncomingCall =
        (data.event === "RINGING" ||
          data.type === "incoming_call" ||
          data.type === "CALL") &&
        isCallReceiverRole;
      const isCallCancelled =
        data.event === "CALL_CANCELLED" ||
        data.type === "call_cancelled" ||
        data.type === "end_call" ||
        data.event === "ENDED" ||
        data.event === "CHAT_ENDED" ||
        data.type === "CHAT_ENDED" ||
        data.event === "CHAT_DECLINED" ||
        data.type === "CHAT_DECLINED";
      const isChatInitiated =
        data.event === "CHAT_INITIATED" || data.type === "CHAT_INITIATED";

      if (isChatInitiated && !showChatUI && isCallReceiverRole) {
        console.log("   -> ✅ [FCM] Condition met! Setting incoming chat...");
        setIncomingCall(null);
        const sId =
          data.senderId || data.sender_id || data.userId || data.from;
        setIncomingChat({
          senderId: sId,
          senderName: data.senderName || data.name || "Someone",
          senderRole: data.senderRole || data.role,
          text: data.text || data.body || "wants to chat",
        });
        playRingtone();
      } else if (isIncomingCall) {
        processIncomingCall(data);
      } else if (isCallCancelled) {
        stopRingtone();
        clearIncomingState();
        setIncomingChat(null);
        setShowCallIframe(false);
        // Broadcast to other components (like Mentor.jsx or InstantChat.jsx) to close their modals
        broadcastChannelRef.current?.postMessage({
          type:
            data.event === "CHAT_DECLINED" || data.type === "CHAT_DECLINED"
              ? "CHAT_DECLINED"
              : data.event === "CHAT_ENDED" || data.type === "CHAT_ENDED"
                ? "CHAT_ENDED"
                : "CALL_ENDED",
          callSessionId: data.callSessionId || data.referenceId,
          senderName: data.senderName,
          endedBy: data.endedBy,
        });
      } else if (
        data.event === "CHAT_MESSAGE" &&
        !showChatUI &&
        isCallReceiverRole
      ) {
        setIncomingChat({
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text || "New message",
        });
        new Audio("/notification-sound.mp3").play().catch(() => { });
      }
    });

    const handleSWMessage = (event) => {
      // Process ended calls for everyone, but incoming calls only for mates
      if (event.data?.type === "CALL_ENDED") {
        setShowCallIframe(false);
        clearIncomingState();
        broadcastChannelRef.current?.postMessage({
          type: "CALL_ENDED",
          callSessionId: event.data.data?.callSessionId,
        });
        return;
        ``;
      }

      if (!isCallReceiverRole) return;
      if (event.data?.type === "CHAT_INITIATED") {
        console.log("   -> ✅ [SW] Condition met! Setting incoming chat...");
        setIncomingCall(null);
        setIncomingChat({
          senderId: event.data.data.senderId,
          senderName: event.data.data.senderName,
          senderRole: event.data.data.senderRole,
          text: event.data.data.text || "wants to chat",
        });
        playRingtone();
      } else if (event.data?.type === "INCOMING_CALL") {
        processIncomingCall(event.data.data);
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleSWMessage);

    // --- Socket.io Fallback ---
    if (isAuthenticated && user?._id) {
      console.log("🔌 [Socket] Connecting for notifications...");
      const socket = io(SOCKET_SERVER_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ [Socket] Connected. Registering user:", user._id);
        socket.emit("register_user", user._id);
      });

      socket.on("notification", (payload) => {
        console.log("🔔 [Socket] Notification received:", payload);
        console.log(
          "   -> isCallReceiverRole:",
          isCallReceiverRole,
          "showChatUI:",
          showChatUI,
          "user role:",
          user?.role,
        );

        if (
          payload.type === "CHAT_INITIATED" &&
          !showChatUI &&
          isCallReceiverRole
        ) {
          console.log("   -> ✅ Condition met! Setting incoming chat...");
          setIncomingCall(null);
          const sId =
            payload.senderId ||
            payload.sender_id ||
            payload.userId ||
            payload.from;
          setIncomingChat({
            senderId: sId,
            senderName: payload.senderName || payload.name || "Someone",
            senderRole: payload.senderRole || payload.role,
            text: payload.text || payload.body || "wants to chat",
          });
          playRingtone();
        } else if (payload.type === "INCOMING_CALL") {
          processIncomingCall(payload);
        } else if (payload.type === "CALL_ENDED") {
          setShowCallIframe(false);
          clearIncomingState();
          broadcastChannelRef.current?.postMessage({
            type: "CALL_ENDED",
            callSessionId: payload.callSessionId,
          });
        } else if (
          payload.type === "CHAT_DECLINED" ||
          payload.type === "CHAT_ENDED"
        ) {
          console.log(`🚫 [Socket] ${payload.type} received, broadcasting...`);
          stopRingtone();
          setIncomingChat(null);
          broadcastChannelRef.current?.postMessage({
            type: payload.type,
            senderId: payload.senderId,
            senderName: payload.senderName,
          });
        }
      });
    }

    return () => {
      unsubscribeFCM();
      navigator.serviceWorker?.removeEventListener("message", handleSWMessage);
      broadcastChannelRef.current?.close();
      stopRingtone();
      if (socketRef.current) {
        console.log("🔌 [Socket] Disconnecting...");
        socketRef.current.disconnect();
      }
    };
  }, [
    isAuthenticated,
    user?._id,
    isCallReceiverRole,
    processIncomingCall,
    playRingtone,
    stopRingtone,
    clearIncomingState,
    showChatUI,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !isCallReceiverRole) return;
    const interval = setInterval(async () => {
      if (incomingCall || showChatUI || showCallIframe) return;
      try {
        const res = await apiGet("/calls/pending-incoming");
        if (res.success && res.data) processIncomingCall(res.data);
      } catch (e) { }
    }, 8000);
    return () => clearInterval(interval);
  }, [
    isAuthenticated,
    isCallReceiverRole,
    incomingCall,
    showChatUI,
    showCallIframe,
    processIncomingCall,
  ]);

  useEffect(() => {
    if (!incomingCall?.callSessionId) return;
    const tid = setTimeout(
      () => declineCallBySessionId(incomingCall.callSessionId, true),
      CALL_TIMEOUT_MS,
    );
    return () => clearTimeout(tid);
  }, [incomingCall, declineCallBySessionId]);

  const handleAcceptChat = async () => {
    if (!incomingChat) return;
    stopRingtone();
    setShowChatUI(true);
    try {
      await apiPost("/chat/accept", { recipientId: incomingChat.senderId });
    } catch (err) {
      console.error("[CallNotification] Failed to notify acceptance", err);
    }
  };

  const handleDeclineChat = async () => {
    if (!incomingChat) return;
    const recipientId = incomingChat.senderId;
    stopRingtone();
    setIncomingChat(null);
    try {
      await apiPost("/chat/reject", { recipientId });
    } catch (err) {
      console.error("[CallNotification] Failed to notify rejection", err);
    }
  };

  return (
    <>
      <audio ref={audioRef} preload="auto" src="/ringtone.mp3" />

      {incomingCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full animate-bounce-subtle border border-purple-100">
            <div className="text-center">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-20"></div>
                <FaPhone className="text-purple-600 text-4xl animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Incoming Call
              </h3>
              <p className="text-gray-600 mb-1">
                {capitalizeName(incomingCall.callerName)} is calling you
              </p>
              <p className="text-sm font-semibold text-purple-600 mb-4 uppercase tracking-wider">
                {incomingCall.callType === "audio"
                  ? "Audio Call"
                  : "Video Call"}
              </p>
              {/* {audioError && (
                <div className="text-amber-600 bg-amber-50 px-3 py-2 rounded-xl mb-6 text-sm">
                  Ringtone blocked
                </div>
              )} */}
              <div className="flex gap-4">
                <button
                  onClick={handleDeclineCall}
                  className="flex-1 px-6 py-4 bg-red-100 text-red-600 rounded-2xl font-bold"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptCall}
                  className="flex-1 px-6 py-4 bg-green-500 text-white rounded-2xl font-bold"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {incomingChat && !showChatUI && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full animate-bounce-subtle border border-blue-100">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                <FaComments className="text-blue-600 text-4xl animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Chat Request
              </h3>
              <p className="text-gray-600 mb-6">
                {capitalizeName(incomingChat.senderName)} wants to chat
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleDeclineChat}
                  className="flex-1 px-6 py-4 bg-red-100 text-red-600 rounded-2xl font-bold"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptChat}
                  className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChatUI && incomingChat && (
        <InstantChat
          mentor={{
            _id: incomingChat.senderId,
            name: incomingChat.senderName,
            role: incomingChat.senderRole,
          }}
          onClose={handleCloseChat}
        />
      )}

      {showCallIframe && (
        <div className="fixed inset-0 z-[9998] bg-white flex flex-col">
          <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <FaPhone className="text-white" />
              </div>
              <div>
                <h4 className="font-bold">Active Call Session</h4>
                <p className="text-xs text-gray-400">Encrypted • Real-time</p>
              </div>
            </div>
            <button
              onClick={handleEndCall}
              className="bg-red-600 px-6 py-2 rounded-xl font-bold"
            >
              End Call
            </button>
          </div>
          <iframe
            src={callUrl}
            className="w-full flex-1 border-0"
            allow="camera; microphone; fullscreen; display-capture; speaker"
            allowFullScreen
            title="Active Call"
          />
        </div>
      )}

      {/* iOS Notification Guide */}
      {showIOSPrompt && (
        <div className="fixed bottom-24 left-4 right-4 z-[10001] animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>

            <div className="flex gap-4">
              <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaInfoCircle className="text-purple-600 text-xl" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">
                  Enable Call Notifications
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  On iPhone, you must add this app to your Home Screen to
                  receive calls when the screen is locked.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg">
                    <span className="w-6 h-6 bg-white border rounded-md flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>
                      Tap the <FaShare className="inline text-blue-500 mx-1" />{" "}
                      Share button in Safari
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg">
                    <span className="w-6 h-6 bg-white border rounded-md flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>
                      Scroll down and tap{" "}
                      <FaPlusSquare className="inline mx-1" /> "Add to Home
                      Screen"
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full mt-5 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CallNotification;
