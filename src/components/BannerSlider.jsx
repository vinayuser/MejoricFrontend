import React, { useState, useEffect, useCallback, useRef } from "react";
import HeroBannerOverlay, { HERO_MOBILE_GRADIENT } from "./HeroBannerOverlay";

const TRANSITION_MS = 700;
const HEIGHT_CLASSES = "min-h-[580px] lg:min-h-[720px]";

export default function BannerSlider({
  slides,
  mobileSlides,
  interval = 5000,
  onCtaClick,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const jumpTimeoutRef = useRef(null);

  const activeSlides = isMobile ? mobileSlides : slides;
  const slideCount = activeSlides.length;

  const extendedSlides =
    slideCount > 1
      ? [activeSlides[slideCount - 1], ...activeSlides, activeSlides[0]]
      : activeSlides;

  const getRealIndex = useCallback(
    (extendedIdx) => {
      if (slideCount <= 1) return 0;
      if (extendedIdx === 0) return slideCount - 1;
      if (extendedIdx === slideCount + 1) return 0;
      return extendedIdx - 1;
    },
    [slideCount],
  );

  const realIndex = getRealIndex(currentIndex);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setTransitionEnabled(true);
    setCurrentIndex(slideCount > 1 ? 1 : 0);
  }, [isMobile, slideCount]);

  useEffect(() => {
    return () => {
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (slideCount <= 1) return;

    if (currentIndex === 0 || currentIndex === slideCount + 1) {
      jumpTimeoutRef.current = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(currentIndex === 0 ? slideCount : 1);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setTransitionEnabled(true));
        });
      }, TRANSITION_MS);
    }

    return () => {
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
    };
  }, [currentIndex, slideCount]);

  const goToNext = useCallback(() => {
    if (slideCount <= 1) return;
    setCurrentIndex((prev) => prev + 1);
  }, [slideCount]);

  const goToPrevious = useCallback(() => {
    if (slideCount <= 1) return;
    setCurrentIndex((prev) => prev - 1);
  }, [slideCount]);

  const goToSlide = useCallback(
    (targetRealIndex) => {
      if (slideCount <= 1) return;
      setTransitionEnabled(true);
      setCurrentIndex(targetRealIndex + 1);
    },
    [slideCount],
  );

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [goToNext, interval, slideCount]);

  if (!activeSlides.length) return null;

  return (
    <section
      className={`relative w-full overflow-hidden ${HEIGHT_CLASSES} flex items-center justify-center group`}
    >
      <div
        className={`absolute inset-0 flex h-full ${
          transitionEnabled
            ? "transition-transform duration-700 ease-in-out"
            : ""
        }`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {extendedSlides.map((slide, index) => {
          const isHeroMobile = isMobile && slide.showHeroContent;

          return (
          <div
            key={`${slide.alt}-${index}`}
            className={`relative w-full flex-shrink-0 h-full ${HEIGHT_CLASSES}`}
          >
            <img
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: slide.objectPosition ?? "center",
              }}
              src={slide.src}
              alt={slide.alt}
              fetchPriority={index === 1 ? "high" : "auto"}
            />
            {isHeroMobile && (
              <div
                className={`absolute inset-0 z-[5] ${HERO_MOBILE_GRADIENT} pointer-events-none`}
              />
            )}
            {slide.showHeroContent && (
              <HeroBannerOverlay onCtaClick={onCtaClick} />
            )}
          </div>
        );
        })}
      </div>

      {slideCount > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Previous banner"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Next banner"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  realIndex === index
                    ? "bg-white w-6"
                    : "bg-white/50 w-2 hover:bg-white/75"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
