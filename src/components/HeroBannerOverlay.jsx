import React from "react";
import { trackPixel } from "../utils/metaPixel";

export const HERO_MOBILE_GRADIENT =
  "bg-gradient-to-b from-[#4C1D95]/75 via-[#5B21B6]/35 to-[#5B21B6]/10";

const CTA_BUTTON_CLASS =
  "bg-white hover:bg-purple-100 text-purple-700 px-8 py-3.5 sm:px-10 sm:py-4 lg:py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-bold text-base sm:text-lg lg:text-xl hover:scale-105 active:scale-95 cursor-pointer";

export default function HeroBannerOverlay({ onCtaClick }) {
  const handleCtaClick = () => {
    trackPixel("ViewContent");
    if (typeof window.gtag === "function") {
      window.gtag("event", "select_content", {
        content_type: "CTA Button",
        content_id: "talk_now",
      });
    }
    onCtaClick?.();
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <div className="pointer-events-auto w-full max-w-[min(100%,90vw)] sm:max-w-[min(85%,36rem)] lg:w-fit lg:max-w-[min(50vw,42rem)] lg:ml-[clamp(1rem,4vw,3rem)] text-left">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 leading-tight drop-shadow-md">
            You Are Not Alone...
          </h1>

          <p className="text-base sm:text-lg md:text-2xl lg:text-3xl text-white mb-5 md:mb-8 lg:mb-10 leading-relaxed font-medium drop-shadow-md">
            Talk to a trained, empathetic{" "}
            <span className="font-bold">listener Instantly!</span>
          </p>

          <button
            type="button"
            onClick={handleCtaClick}
            className={CTA_BUTTON_CLASS}
          >
            Talk now!
          </button>
        </div>
      </div>
    </div>
  );
}
