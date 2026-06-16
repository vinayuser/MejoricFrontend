// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import {
  isIOSThirdPartyBrowser,
  isIOS,
  isIOSSafari,
  isAndroid,
} from "../utils/browserDetect";

/** Vite `BASE_URL` so FCM SW works when the app is hosted under a subpath. */
function fcmServiceWorkerUrl() {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}firebase-messaging-sw.js`.replace(/([^:])\/{2,}/g, "$1/");
}

function fcmServiceWorkerScope() {
  return import.meta.env.BASE_URL || "/";
}

/**
 * Android Chrome often needs the messaging SW to be activated (and sometimes
 * controlling the page) before pushManager.subscribe / getToken succeeds.
 */
async function prepareServiceWorkerForMessaging() {
  if (!("serviceWorker" in navigator)) {
    return undefined;
  }
  const swUrl = fcmServiceWorkerUrl();
  const swScope = fcmServiceWorkerScope();
  let reg;
  try {
    reg = await navigator.serviceWorker.register(swUrl, { scope: swScope });
  } catch (e) {
    console.warn("⚠️ FCM: service worker register failed:", e);
    return undefined;
  }

  await navigator.serviceWorker.ready;

  const waitUntilActivated = async () => {
    if (reg.active) return;
    const w = reg.installing || reg.waiting;
    if (!w) return;
    await new Promise((resolve, reject) => {
      if (w.state === "activated" || reg.active) {
        resolve();
        return;
      }
      const to = setTimeout(
        () => reject(new Error("FCM: service worker activation timeout")),
        25000,
      );
      w.addEventListener("statechange", () => {
        if (w.state === "activated" || reg.active) {
          clearTimeout(to);
          resolve();
        }
      });
    });
  };

  try {
    await waitUntilActivated();
  } catch (e) {
    console.warn("⚠️ FCM:", e?.message || e);
  }

  if (!navigator.serviceWorker.controller) {
    await Promise.race([
      new Promise((resolve) => {
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        );
      }),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
  }

  return reg;
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDmsPUtnY-S9XJnvMxGUAi6zskrdyp-uo",
  authDomain: "mateandmentor-83864.firebaseapp.com",
  projectId: "mateandmentor-83864",
  storageBucket: "mateandmentor-83864.firebasestorage.app",
  messagingSenderId: "305523793072",
  appId: "1:305523793072:web:911391fdf9e4bd054e2f75",
  measurementId: import.meta.env.VITE_GA_ID,
};

const app = initializeApp(firebaseConfig);

try {
  getAnalytics(app);
} catch {
  // Analytics can fail in non-browser / restricted contexts
}

/**
 * Firebase requires `await isSupported()` before `getMessaging()`.
 *
 * `messagingUnsupported` is set only when `isSupported()` is false (definitive).
 * Transient failures do not lock the app — the next call can retry getMessaging/getToken.
 */
let messagingInstance;
let messagingUnsupported = false;
let messagingInitPromise = null;
export let fcmInitError = null;

export async function getMessagingWhenSupported() {
  if (messagingUnsupported) return null;
  if (messagingInstance) return messagingInstance;

  if (!messagingInitPromise) {
    messagingInitPromise = (async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          messagingUnsupported = true;
          messagingInstance = undefined;
          fcmInitError = new Error("messaging/unsupported-browser");
          return null;
        }
        messagingInstance = getMessaging(app);
        fcmInitError = null;
        return messagingInstance;
      } catch (e) {
        fcmInitError = e;
        console.warn("Firebase Messaging init failed:", e?.message || e);
        messagingInstance = undefined;
        return null;
      } finally {
        messagingInitPromise = null;
      }
    })();
  }

  return messagingInitPromise;
}

export const requestFCMToken = async () => {
  try {
    const messaging = await getMessagingWhenSupported();
    if (!messaging) {
      if (isIOSThirdPartyBrowser()) {
        console.warn(
          "⚠️ FCM: Chrome, Firefox, and Edge on iPhone/iPad are WebKit shells — Firebase Web Push is not supported. For call alerts use Safari (iOS 16.4+), add the site to your Home Screen, allow notifications, or use Chrome on Android/desktop.",
        );
      } else if (isIOS() && isIOSSafari()) {
        console.warn(
          "⚠️ FCM: Safari still reports unsupported. Common causes: Private Browsing (turn off), cookies blocked, iOS < 16.4, or IndexedDB unavailable. Try Share → Add to Home Screen, open from the icon, then allow notifications.",
        );
      } else if (isAndroid()) {
        console.warn(
          "⚠️ FCM: Not supported on this Android browser session. Check: HTTPS, notifications allowed for this site, not in a WebView, disable Data Saver for the site if needed, and ensure cookies/IndexedDB are not blocked.",
        );
      } else {
        console.warn(
          "⚠️ FCM: Not available in this browser (Firebase isSupported() false or init failed).",
        );
      }
      return null;
    }

    if (typeof Notification === "undefined") {
      console.warn("⚠️ FCM: Notifications API is not supported.");
      return null;
    }

    if (!window.isSecureContext) {
      console.warn(
        "⚠️ FCM: Not a secure context (HTTPS or localhost required for push).",
      );
      return null;
    }

    console.log("🔍 Current Notification Permission:", Notification.permission);
    return requestPermission(messaging);
  } catch (error) {
    console.warn("❌ FCM token request:", error?.message || error);
    return null;
  }
};

async function requestPermission(messaging) {
  if (typeof Notification === "undefined") return null;

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  console.log("Permission:", permission);

  if (permission !== "granted") {
    console.warn("⚠️ Notification permission was not granted:", permission);
    return null;
  }

  let serviceWorkerRegistration;
  if ("serviceWorker" in navigator) {
    try {
      serviceWorkerRegistration = await prepareServiceWorkerForMessaging();
    } catch (swError) {
      console.warn("⚠️ FCM: Service worker setup failed:", swError);
    }
  }

  const getTokenOpts = {
    vapidKey:
      "BH8sadFA-qbhf1mokSo_shRxuWtFKt0WGDN_qZryGuquK7JdZwy9qnx0_vOlFR6Vk-5f6mjsxnLFUWJm_FqcDYo",
    ...(serviceWorkerRegistration ? { serviceWorkerRegistration } : {}),
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let lastError;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const token = await getToken(messaging, getTokenOpts);
      if (token) {
        console.log("🎯 FCM Token obtained successfully");
        return token;
      }
    } catch (e) {
      lastError = e;
      console.warn(
        `⚠️ FCM getToken attempt ${attempt + 1} failed:`,
        e?.code || "",
        e?.message || e,
      );
      if (attempt < 3) await sleep(500 * (attempt + 1) * (attempt + 1));
    }
  }
  console.warn(
    "⚠️ FCM getToken failed after retries:",
    lastError?.code || "",
    lastError?.message || lastError,
  );
  return null;
}

/**
 * Subscribe to foreground FCM messages. Returns an unsubscribe function.
 * Safe on unsupported browsers (no throw; inner setup is async).
 */
export const onForegroundMessage = (callback) => {
  let cancelled = false;
  let unsubscribe = () => {};

  getMessagingWhenSupported()
    .then((messaging) => {
      if (cancelled || !messaging) return;
      try {
        unsubscribe = onMessage(messaging, (payload) => {
          console.log("Foreground message:", payload);

          if (callback) callback(payload);
        });
      } catch (e) {
        console.warn("⚠️ FCM onMessage registration failed:", e?.message || e);
      }
    })
    .catch((e) => {
      if (!cancelled) {
        console.warn(
          "⚠️ FCM foreground listener setup failed:",
          e?.message || e,
        );
      }
    });

  return () => {
    cancelled = true;
    try {
      unsubscribe();
    } catch {
      // ignore
    }
  };
};

export const startTokenRefreshMonitor = (onNewToken) => {
  const CHECK_INTERVAL_MS = 10 * 60 * 1000;

  const intervalId = setInterval(async () => {
    try {
      const messaging = await getMessagingWhenSupported();
      if (!messaging) return;

      let swReg;
      if ("serviceWorker" in navigator) {
        try {
          swReg = await navigator.serviceWorker.getRegistration();
          if (!swReg?.active) {
            swReg = await prepareServiceWorkerForMessaging();
          }
        } catch {
          // ignore
        }
      }

      try {
        const currentToken = await getToken(messaging, {
          vapidKey:
            "BH8sadFA-qbhf1mokSo_shRxuWtFKt0WGDN_qZryGuquK7JdZwy9qnx0_vOlFR6Vk-5f6mjsxnLFUWJm_FqcDYo",
          ...(swReg ? { serviceWorkerRegistration: swReg } : {}),
        });
        const storedToken = localStorage.getItem("fcmToken");
        if (currentToken && currentToken !== storedToken) {
          console.log("🔄 FCM token rotated, syncing new token...");
          localStorage.setItem("fcmToken", currentToken);
          if (onNewToken) onNewToken(currentToken);
        }
      } catch (tokenError) {
        console.warn(
          "⚠️ FCM token refresh check failed:",
          tokenError?.message || tokenError,
        );
      }
    } catch (e) {
      console.debug("Token refresh monitor:", e?.message || e);
    }
  }, CHECK_INTERVAL_MS);

  return () => clearInterval(intervalId);
};

export default app;
