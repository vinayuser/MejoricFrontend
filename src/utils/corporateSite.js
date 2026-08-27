/**
 * Corporate app shell (corporate.mejoric.com / corporate-login deploy).
 * When true: mates listing only, minimal header, no footer/nav.
 */
export function isCorporateShell() {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_IS_CORPORATE_APP === "true") {
    return true;
  }
  if (typeof window === "undefined") return false;
  return window.location.hostname === "corporate.mejoric.com";
}

/** Paths allowed on the corporate shell (SPA). */
export const CORPORATE_ALLOWED_PATHS = [
  "/corporate/login",
  "/mate",
  "/video-call",
];

export function isCorporateAllowedPath(pathname) {
  if (!pathname) return false;
  if (CORPORATE_ALLOWED_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/mate-profile/")) return true;
  return false;
}
