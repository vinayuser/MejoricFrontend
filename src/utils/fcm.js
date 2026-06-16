import {
  requestFCMToken,
  onForegroundMessage,
  startTokenRefreshMonitor,
} from "../firebase/firebase";

/**
 * Call Event Constants for synchronization
 */
export const FCM_EVENTS = {
  INCOMING_CALL: "INCOMING_CALL",
  CALL_REJECTED: "CALL_REJECTED",
  CALL_ACCEPTED: "CALL_ACCEPTED",
  CALL_CANCELLED: "CALL_CANCELLED",
  SYNC_STOP_RINGING: "SYNC_STOP_RINGING",
  CHAT_INITIATED: "CHAT_INITIATED",
  CHAT_MESSAGE: "CHAT_MESSAGE",
};

/**
 * Get FCM token and log it to console
 * Call this function when you want to get the FCM token for the user
 */
export const getFCMToken = async () => {
  const token = await requestFCMToken();
  if (token) {
    console.log("🎯 FCM Token obtained:", token);
    // Store FCM token in localStorage
    localStorage.setItem("fcmToken", token);
  }
  return token;
};

/**
 * Helper to update FCM token on server only if it changed
 */
export const syncFCMTokenWithServer = async (apiPost) => {
  try {
    const currentToken = await getFCMToken();
    const lastSyncedToken = localStorage.getItem("lastSyncedFCMToken");
    // Use session storage to track if we've force-synced this browser session
    const sessionSynced = sessionStorage.getItem("fcmSessionSynced");

    // Sync if token changed OR if we haven't synced in this browser session
    // (ensures topic subscription happens at least once per session)
    if (currentToken && (currentToken !== lastSyncedToken || !sessionSynced)) {
      console.log(
        "🔄 Syncing FCM token with server (ensuring topic subscription)...",
      );
      const result = await apiPost("/users/fcm-token", {
        fcmToken: currentToken,
      });
      if (result.success) {
        localStorage.setItem("lastSyncedFCMToken", currentToken);
        sessionStorage.setItem("fcmSessionSynced", "true");
        console.log("✅ FCM token & topic subscription synced");
      }
    } else {
      console.log("✨ FCM token already synchronized for this session");
    }

    // Start monitoring for token rotation (critical for mobile)
    startTokenRefreshMonitor(async (newToken) => {
      try {
        console.log("🔄 Token rotated, syncing with server...");
        await apiPost("/users/fcm-token", { fcmToken: newToken });
        localStorage.setItem("lastSyncedFCMToken", newToken);
        console.log("✅ Rotated FCM token synced with server");
      } catch (e) {
        console.error("Failed to sync rotated token:", e);
      }
    });

    return currentToken;
  } catch (error) {
    console.error("Error syncing FCM token:", error);
    return null;
  }
};

let listeners = [];
let isFCMInitialized = false;
let lastEventTimestamp = 0;

/**
 * Initialize foreground message listener once and broadcast to all registered listeners
 */
const startForegroundListener = () => {
  if (isFCMInitialized) return;

  onForegroundMessage((payload) => {
    const data = payload.data || {};

    // 1. Prevent cross-talk: ignore notifications from other environments
    const currentOrigin = window.location.origin;
    if (data.senderOrigin && data.senderOrigin !== currentOrigin) {
      console.warn(
        `[FCM Foreground] Dropped cross-origin notification. Expected ${currentOrigin}, got ${data.senderOrigin}`,
      );
      return;
    }

    // 2. Prevent stale messages: ignore notifications older than what we've already processed
    if (data.timestamp) {
      const msgTime = parseInt(data.timestamp, 10);
      if (msgTime < lastEventTimestamp) {
        console.warn(
          `[FCM Foreground] Dropped stale notification. Event time: ${msgTime}, High-water mark: ${lastEventTimestamp}`,
        );
        return;
      }
      lastEventTimestamp = msgTime;
    }

    console.log("📬 Foreground message received:", payload);
    const isCallNotification =
      data.type === "incoming_call" ||
      data.type === "CALL" ||
      data.type === "call" ||
      data.type === "ringing" ||
      data.event === "RINGING" ||
      data.event === "incoming_call";

    const isStatusUpdate =
      data.event === "MATE_STATUS_CHANGED" ||
      data.type === "MATE_STATUS_CHANGED";

    const isSilentType =
      data.event === "CHAT_ENDED" ||
      data.type === "CHAT_ENDED" ||
      data.type === "end_chat" ||
      data.type === "session_ended";

    // Play notification sound when message is received (non-call, non-status-update, non-silent)
    if (
      payload.notification &&
      !isCallNotification &&
      !isStatusUpdate &&
      !isSilentType
    ) {
      try {
        const audio = new Audio("/notification-sound.mp3");
        audio.play().catch(() => {});
      } catch (e) {}
    }

    // Broadcast to all registered listeners
    listeners.forEach((callback) => {
      try {
        callback(payload);
      } catch (err) {
        console.error("Error in FCM listener callback:", err);
      }
    });
  });

  isFCMInitialized = true;
  console.log("✅ FCM global foreground listener started");
};

/**
 * Register a listener for FCM messages
 * @param {Function} onMessageCallback - Callback to handle incoming messages
 * @returns {Function} Unsubscribe function
 */
export const initializeFCM = (onMessageCallback) => {
  startForegroundListener();

  if (onMessageCallback) {
    listeners.push(onMessageCallback);
  }

  // Return unsubscribe function
  return () => {
    listeners = listeners.filter((l) => l !== onMessageCallback);
  };
};
