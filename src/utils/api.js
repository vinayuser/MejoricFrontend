// API Utility functions
// Typical success body: { success: true, message: string, data: T }
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/mateandmentors";

import { appPath } from "./basePath";

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const isPlatformBlockedError = (status, message) =>
  Number(status) === 403 &&
  /blocked|access denied/i.test(String(message || ""));

/** Clear session and show a full-screen block once (stops API/chat retry storms). */
export const handlePlatformBlocked = (message) => {
  if (typeof window === "undefined") return true;
  if (window.__platformBlocked) return true;
  window.__platformBlocked = true;

  try {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("walletBalance");
    localStorage.removeItem("conversion_guest_id");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("force_signup_"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }

  window.dispatchEvent(
    new CustomEvent("platform-blocked", {
      detail: {
        message:
          message ||
          "Access denied. Your access to this platform has been blocked.",
      },
    }),
  );

  if (!document.getElementById("platform-blocked-overlay")) {
    const el = document.createElement("div");
    el.id = "platform-blocked-overlay";
    el.setAttribute("role", "alertdialog");
    el.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,0.96);color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:system-ui,sans-serif";
    const safe = String(
      message ||
        "Access denied. Your access to this platform has been blocked.",
    ).replace(/[<>&]/g, "");
    el.innerHTML = `<div style="max-width:420px"><h1 style="font-size:1.5rem;font-weight:700;margin:0 0 12px">Access blocked</h1><p style="margin:0;opacity:.9;line-height:1.5">${safe}</p></div>`;
    document.body.appendChild(el);
  }

  return true;
};

const throwHttpError = (response, errorData) => {
  const message =
    errorData.message || `HTTP error! status: ${response.status}`;
  if (isPlatformBlockedError(response.status, message)) {
    handlePlatformBlocked(message);
  }
  const error = new Error(message);
  error.response = errorData;
  error.status = response.status;
  throw error;
};

// Cleanup session and redirect to login
export const cleanupAndRedirect = () => {
  console.log("🚨 Auth token missing or invalid. Cleaning up session...");
  localStorage.removeItem("user");
  localStorage.removeItem("authToken");
  localStorage.removeItem("walletBalance");
  const loginPath = appPath("login");
  if (!window.location.pathname.endsWith("/login")) {
    window.location.href = loginPath;
  }
};

// Get default headers with optional token
export const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// GET request
export const apiGet = async (endpoint, skipAuth = false) => {
  if (typeof window !== "undefined" && window.__platformBlocked) {
    const error = new Error(
      "Access denied. Your access to this platform has been blocked.",
    );
    error.status = 403;
    throw error;
  }

  if (!skipAuth) {
    const token = getAuthToken();
    if (!token) {
      cleanupAndRedirect();
      return null;
    }
  }

  try {
    const headers = skipAuth
      ? { "Content-Type": "application/json" }
      : getHeaders();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: headers,
    });

    if (response.status === 401 && !skipAuth) {
      cleanupAndRedirect();
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throwHttpError(response, errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API GET Error:", error);
    throw error;
  }
};

// POST request
export const apiPost = async (endpoint, body, skipAuth = false) => {
  if (typeof window !== "undefined" && window.__platformBlocked) {
    const error = new Error(
      "Access denied. Your access to this platform has been blocked.",
    );
    error.status = 403;
    throw error;
  }

  if (!skipAuth) {
    const token = getAuthToken();
    if (!token) {
      cleanupAndRedirect();
      return null;
    }
  }

  try {
    const headers = skipAuth
      ? { "Content-Type": "application/json" }
      : getHeaders();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (response.status === 401 && !skipAuth) {
      cleanupAndRedirect();
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throwHttpError(response, errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API POST Error:", error);
    throw error;
  }
};

// PUT request (supports keepalive for tab-close offline beacons)
export const apiPut = async (endpoint, body, skipAuth = false, options = {}) => {
  if (typeof window !== "undefined" && window.__platformBlocked) {
    const error = new Error(
      "Access denied. Your access to this platform has been blocked.",
    );
    error.status = 403;
    throw error;
  }

  if (!skipAuth) {
    const token = getAuthToken();
    if (!token) {
      cleanupAndRedirect();
      return null;
    }
  }

  try {
    const headers = skipAuth
      ? { "Content-Type": "application/json" }
      : getHeaders();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(body),
      keepalive: Boolean(options.keepalive),
    });

    if (response.status === 401 && !skipAuth) {
      cleanupAndRedirect();
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throwHttpError(response, errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API PUT Error:", error);
    throw error;
  }
};

// DELETE request
export const apiDelete = async (endpoint) => {
  if (typeof window !== "undefined" && window.__platformBlocked) {
    const error = new Error(
      "Access denied. Your access to this platform has been blocked.",
    );
    error.status = 403;
    throw error;
  }

  const token = getAuthToken();
  if (!token) {
    cleanupAndRedirect();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (response.status === 401) {
      cleanupAndRedirect();
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throwHttpError(response, errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API DELETE Error:", error);
    throw error;
  }
};

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};
