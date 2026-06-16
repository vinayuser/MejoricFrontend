// Firebase version MUST match the main app (package.json firebase ^12.x) so FCM
// can decrypt and deliver pushes on mobile Chrome; v9 SW + v12 client breaks delivery.
importScripts(
  "https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js",
);

// Same rule as main app: prototype shim only for WebKit/iOS — never on Android (breaks Chromium/Gecko).
(function fcmSwPrototypePolyfill() {
  const ua = self.navigator?.userAgent || "";
  if (/Android/i.test(ua)) return;
  const nav = self.navigator || {};
  if (!/iPhone|iPad|iPod/i.test(ua)) {
    const ipadDesktop =
      nav.platform === "MacIntel" && (nav.maxTouchPoints || 0) > 1;
    if (!ipadDesktop) {
      if (
        !/Safari/i.test(ua) ||
        /Chrome|Chromium|Edg|OPR|FxiOS|CriOS/i.test(ua)
      )
        return;
    }
  }
  function own(proto, name) {
    if (!proto || typeof proto[name] !== "function") return;
    if (Object.prototype.hasOwnProperty.call(proto, name)) return;
    try {
      Object.defineProperty(proto, name, {
        value: proto[name],
        configurable: true,
        enumerable: false,
        writable: true,
      });
    } catch (e) {}
  }
  try {
    own(
      typeof PushSubscription !== "undefined"
        ? PushSubscription.prototype
        : null,
      "getKey",
    );
    own(
      typeof ServiceWorkerRegistration !== "undefined"
        ? ServiceWorkerRegistration.prototype
        : null,
      "showNotification",
    );
  } catch (e) {}
})();

// Activate new SW immediately (mobile often delays without this)
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

firebase.initializeApp({
  apiKey: "AIzaSyCDmsPUtnY-S9XJnvMxGUAi6zskrdyp-uo",
  authDomain: "mateandmentor-83864.firebaseapp.com",
  projectId: "mateandmentor-83864",
  storageBucket: "mateandmentor-83864.firebasestorage.app",
  messagingSenderId: "305523793072",
  appId: "1:305523793072:web:911391fdf9e4bd054e2f75",
  measurementId: "G-T3VEG8DTC8",
});

function origin() {
  try {
    return self.location.origin || "https://mejoric.com";
  } catch {
    return "https://mejoric.com";
  }
}

function isIncomingCall(d) {
  return (
    d?.type === "incoming_call" ||
    d?.type === "call" ||
    d?.type === "ringing" ||
    d?.type === "CHAT_INITIATED" ||
    d?.type === "CHAT_ACCEPTED" ||
    d?.event === "RINGING" ||
    d?.event === "incoming_call" ||
    d?.event === "CHAT_INITIATED" ||
    d?.event === "CHAT_ACCEPTED"
  );
}

// Some mobile browsers / WebViews cannot use FCM in a service worker — avoid crashing the SW.
try {
  const messaging = firebase.messaging();
  // Single entry for FCM — do NOT add a second raw `push` listener; it races Firebase,
  // and `event.data.json()` often fails on FCM Web Push payloads (opaque / wrong shape).
  let lastEventTimestamp = 0;

  messaging.onBackgroundMessage((payload) => {
    console.log("📥 [FCM SW] onBackgroundMessage received:", payload);

    const d = payload.data || {};

    // 1. Prevent cross-talk: ignore notifications from other environments
    if (d.senderOrigin && d.senderOrigin !== origin()) {
      console.warn(`[FCM SW] Dropped cross-origin notification. Expected ${origin()}, got ${d.senderOrigin}`);
      return;
    }

    // 2. Prevent stale messages: ignore notifications older than what we've already processed
    if (d.timestamp) {
      const msgTime = parseInt(d.timestamp, 10);
      if (msgTime < lastEventTimestamp) {
        console.warn(`[FCM SW] Dropped stale notification. Event time: ${msgTime}, High-water mark: ${lastEventTimestamp}`);
        return;
      }
      lastEventTimestamp = msgTime;
    }

    // Broadcast to all open tabs as a backup to foreground listeners
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        if (d?.event === "CHAT_INITIATED" || d?.type === "CHAT_INITIATED") {
          client.postMessage({ type: "CHAT_INITIATED", data: d });
        } else if (d?.event === "CHAT_ACCEPTED" || d?.type === "CHAT_ACCEPTED") {
          client.postMessage({ type: "CHAT_ACCEPTED", data: d });
        } else if (d?.event === "CHAT_MESSAGE" || d?.type === "CHAT_MESSAGE") {
          client.postMessage({ type: "CHAT_MESSAGE", data: d });
        } else if (d?.type === "incoming_call" || d?.type === "CALL" || d?.event === "RINGING") {
          client.postMessage({ type: "INCOMING_CALL", data: d });
        } else if (d?.event === "MATE_STATUS_CHANGED") {
          client.postMessage({ type: "MATE_STATUS_CHANGED", data: d });
        }
      });
    });

    if (isIncomingCall(d)) {
      const title =
        payload.notification?.title ||
        d.title ||
        (d.callerName
          ? `${d.callerName} is calling`
          : d.senderName
            ? `${d.senderName} wants to chat`
            : "Incoming Call");
      const body =
        payload.notification?.body || d.body || "You have an incoming call";

      const base = origin();
      // Avoid non-standard options (e.g. `sound`) — they can make showNotification throw on mobile WebKit/Chromium.
      const options = {
        body,
        icon: `${base}/logo192.png`,
        badge: `${base}/logo192.png`,
        vibrate: [200, 100, 200, 100, 200],
        data: { ...d },
        tag: "incoming-call",
        renotify: true,
        requireInteraction: true,
      };

      return self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "INCOMING_CALL", data: d });
          });
          return self.registration.showNotification(title, options);
        });
    }

    // Other messages with a notification payload: let defaults apply
    if (payload.notification) {
      return Promise.resolve();
    }

    const title = d.title || "New notification";
    const body = d.body || "";
    return self.registration.showNotification(title, {
      body,
      icon: `${origin()}/logo192.png`,
      badge: `${origin()}/logo192.png`,
      data: d,
      tag: "mnm-general-alert",
      renotify: true,
    });
  });
} catch (e) {
  console.warn(
    "[FCM SW] Messaging not supported in this context:",
    e?.message || e,
  );
}

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  notification.close();

  const data = notification.data || {};
  const incoming = isIncomingCall(data);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        if (incoming) {
          clients.forEach((client) => {
            client.postMessage({ type: "INCOMING_CALL", data });
          });
        }
        if (clients.length > 0) {
          return clients[0].focus();
        }
        return self.clients.openWindow("/");
      }),
  );
});
