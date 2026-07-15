import React from "react";
import ReactDOM from "react-dom/client";
import "./utils/fcmIosPolyfill";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ReactFacebookPixel from "react-facebook-pixel";
import { initializeFCM } from "./utils/fcm";

if (import.meta.env.PROD) {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
  console.warn = () => {};
  console.info = () => {};
}

const pixelId = import.meta.env.VITE_PIXEL_ID || "1282059983369638";
ReactFacebookPixel.init(pixelId, {}, { debug: false, autoConfig: true });
ReactFacebookPixel.pageView();

const initFCM = async () => {
  try {
    initializeFCM();
  } catch (err) {
    console.error("FCM init failed", err);
  }
};

if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => initFCM());
  } else {
    setTimeout(initFCM, 2000);
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
// StrictMode double-mounts effects in dev and breaks WebRTC join (UID conflict / stuck Connecting).
root.render(<App />);

reportWebVitals();
