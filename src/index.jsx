import "./utils/fcmIosPolyfill";
if (import.meta.env.PROD) {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
  console.warn = () => {};
  console.info = () => {};
}

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ReactFacebookPixel from "react-facebook-pixel";
import { initializeFCM } from "./utils/fcm";

// Facebook Pixel Configuration
const pixelId = import.meta.env.VITE_PIXEL_ID || "1282059983369638";
ReactFacebookPixel.init(pixelId, {}, { debug: false, autoConfig: true });
ReactFacebookPixel.pageView();

// Initialize FCM foreground listener lazily — do NOT request token here.
// Mobile browsers silently suppress permission requests without a user gesture.
// Token is requested from Login.jsx button click (handleRequestPermission) instead.
const initFCM = async () => {
  try {
    initializeFCM();
  } catch (err) {
    console.error("FCM init failed", err);
  }
};

// Use requestIdleCallback or setTimeout to defer FCM
if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => initFCM());
  } else {
    setTimeout(initFCM, 2000);
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

reportWebVitals();
