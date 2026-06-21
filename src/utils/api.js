// API Utility functions
// Typical success body: { success: true, message: string, data: T }
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Cleanup session and redirect to login
export const cleanupAndRedirect = () => {
  console.log("🚨 Auth token missing or invalid. Cleaning up session...");
  localStorage.removeItem("user");
  localStorage.removeItem("authToken");
  localStorage.removeItem("walletBalance");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
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
    console.log("✅ Auth token added to request");
  } else {
    console.log("⚠️ No auth token found in localStorage");
    // We don't redirect here because getHeaders might be called for public routes
    // The specific api methods will handle 401s
  }

  return headers;
};

// GET request
export const apiGet = async (endpoint, skipAuth = false) => {
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
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
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
      // Create error with API message if available
      const error = new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
      error.response = errorData;
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API POST Error:", error);
    throw error;
  }
};

// PUT request
export const apiPut = async (endpoint, body, skipAuth = false) => {
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
    });

    if (response.status === 401 && !skipAuth) {
      cleanupAndRedirect();
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
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
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
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
