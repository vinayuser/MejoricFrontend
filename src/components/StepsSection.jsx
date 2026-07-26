import React, { useState, useEffect, useCallback } from "react";
import step1 from "../assets/img/Step 1.webp";
import step2 from "../assets/img/Step 2.webp";
import step3 from "../assets/img/Step 3.webp";
import step4 from "../assets/img/Step 4.webp";
import step5 from "../assets/img/Step 5.webp";
import step6 from "../assets/img/Step 6.webp";

const steps = [
  {
    id: 1,
    title: "It builds up",
    desc: "Work, life, thoughts - everything feels like too much. You feel stuck, confused, or just mentally drained.",
    img: step1,
  },
  {
    id: 2,
    title: "You reach out",
    desc: "You take the first step - to talk, to understand, or to seek guidance.",
    img: step2,
  },
  {
    id: 3,
    title: "You open up",
    desc: "You share what’s on your mind. Freely, honestly - without judgment.",
    img: step3,
  },
  {
    id: 4,
    title: "You gain clarity",
    desc: "Things start making more sense. Your thoughts feel clearer, your direction feels stronger.",
    img: step4,
  },
  {
    id: 5,
    title: "You move forward",
    desc: "With better understanding, you take small but meaningful steps ahead.",
    img: step5,
  },
  {
    id: 6,
    title: "You keep growing",
    desc: "Whether it’s support or guidance - you come back whenever you need it.",
    img: step6,
  },
];

function getVisibleSlides() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth >= 1280) return 4;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

export default function StepsSection() {
  const [visibleSlides, setVisibleSlides] = useState(getVisibleSlides);
  const [currentIndex, setCurrentIndex] = useState(0);

  const maxIndex = Math.max(0, steps.length - visibleSlides);

  useEffect(() => {
    const onResize = () => {
      const nextVisible = getVisibleSlides();
      setVisibleSlides(nextVisible);
      setCurrentIndex((prev) =>
        Math.min(prev, Math.max(0, steps.length - nextVisible)),
      );
    };

    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const slideWidthPercent = 100 / visibleSlides;

  return (
    <div className="bg-white py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="relative">
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Previous slide"
          >
            <svg
              className="w-4 h-4 md:w-6 md:h-6 text-gray-700"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Next slide"
          >
            <svg
              className="w-4 h-4 md:w-6 md:h-6 text-gray-700"
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

          <h1 className="text-3xl text-center md:text-4xl font-bold text-black-600 mb-4">
            Your Journey With Us
          </h1>

          <div className="overflow-hidden px-8 md:px-12">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * slideWidthPercent}%)`,
              }}
            >
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex-shrink-0 p-2 md:p-4"
                  style={{ width: `${slideWidthPercent}%` }}
                >
                  <div
                    className={`rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-md relative h-full ${
                      index % 2 === 0 ? "bg-purple-100" : "bg-purple-200"
                    }`}
                  >
                    <div className="w-full h-24 md:h-32 bg-gray-200 rounded-xl mb-3 md:mb-4 overflow-hidden">
                      <img
                        src={step.img}
                        alt={step.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-700">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "bg-purple-500 w-4 md:w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
