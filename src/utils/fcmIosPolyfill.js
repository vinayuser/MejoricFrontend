/**
 * Firebase `isSupported()` (isWindowSupported) requires:
 *   PushSubscription.prototype.hasOwnProperty('getKey')
 *   ServiceWorkerRegistration.prototype.hasOwnProperty('showNotification')
 * WebKit / Safari often implements these on the prototype chain without marking them
 * as own properties → `hasOwnProperty` is false → FCM wrongly reports "unsupported".
 *
 * Import this module once at app entry (before any getMessaging / isSupported call).
 * IMPORTANT: Do not patch on Android Chromium/Gecko — it can break FCM there.
 */
import { needsFCMPrototypePolyfill } from "./browserDetect";

function defineOwnIfMissing(proto, methodName) {
  if (!proto || typeof proto[methodName] !== "function") return;
  if (Object.prototype.hasOwnProperty.call(proto, methodName)) return;
  try {
    const fn = proto[methodName];
    Object.defineProperty(proto, methodName, {
      value: fn,
      configurable: true,
      enumerable: false,
      writable: true,
    });
  } catch {
    // ignore — read-only env
  }
}

export function applyFCMPrototypePolyfills() {
  if (typeof window === "undefined") return;
  if (!needsFCMPrototypePolyfill()) return;
  try {
    defineOwnIfMissing(
      typeof PushSubscription !== "undefined"
        ? PushSubscription.prototype
        : null,
      "getKey",
    );
    defineOwnIfMissing(
      typeof ServiceWorkerRegistration !== "undefined"
        ? ServiceWorkerRegistration.prototype
        : null,
      "showNotification",
    );
  } catch {
    // ignore
  }
}

applyFCMPrototypePolyfills();
