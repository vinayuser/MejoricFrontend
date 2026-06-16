/**
 * Detect if the user is browsing inside an in-app browser (WebView).
 * In-app browsers (Instagram, Facebook, WhatsApp, etc.) do NOT support:
 * - Service Workers
 * - Push API / FCM
 * - PWA installation
 * 
 * Users in these browsers need to be redirected to their default browser.
 */
export function isInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  return /FBAN|FBAV|Instagram|Line\/|Snapchat|Twitter|WhatsApp|MicroMessenger|GSA\/|KAKAOTALK|Telegram/i.test(ua);
}

/**
 * Detect if the user is on an iOS device (includes iPadOS “desktop” Safari UA).
 */
export function isIOS() {
  if (window.MSStream) return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  // iPadOS 13+ often reports as Mac with touch
  return (
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
  );
}

/**
 * Chrome on iOS is WebKit with a Chrome UI — not real Chromium.
 * Firebase Cloud Messaging Web (`isSupported()`) is false here by design; push/call alerts need Safari (often + Home Screen PWA) or Android Chrome.
 */
export function isIOSChrome() {
  const ua = navigator.userAgent || "";
  return isIOS() && /CriOS\//i.test(ua);
}

/**
 * True for Safari on iOS (including WebKit version string, excluding CriOS/FxiOS).
 */
export function isIOSSafari() {
  const ua = navigator.userAgent || "";
  if (!isIOS() || /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)) return false;
  return /Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua);
}

/** Any non-Safari browser shell on iOS (all use WebKit; none expose FCM Web Push like Safari can). */
export function isIOSThirdPartyBrowser() {
  const ua = navigator.userAgent || "";
  return isIOS() && /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

/**
 * Only WebKit/iOS needs the FCM hasOwnProperty prototype shim.
 * Never run it on Android (Chrome / Edge / Samsung / Firefox) — it can break push there.
 */
export function needsFCMPrototypePolyfill() {
  const ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) return false;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
  if (!/Safari/i.test(ua)) return false;
  if (/Chrome|Chromium|Edg|OPR|FxiOS|CriOS|OPiOS|EdgiOS/i.test(ua)) return false;
  return true;
}

export function isAndroid() {
  return /Android/i.test(navigator.userAgent || "");
}

/**
 * Detect if the app is running as an installed PWA (standalone mode)
 */
export function isStandalonePWA() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

/**
 * Detect if the browser supports push notifications
 */
export function supportsPushNotifications() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}
