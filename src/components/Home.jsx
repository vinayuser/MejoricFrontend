import React from "react";
import {
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaComments,
  FaHandshake,
  FaInfinity,
  FaUserFriends,
  FaHeart,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";
import Layout from "../components/Layout";
import { trackPixel } from "../utils/metaPixel";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import image from "../assets/img/segment.webp";
import bannerImages from "../assets/img/2.webp";
import heroMobileBanner from "../assets/img/hero_mobile.webp";
import HeroBannerOverlay, { HERO_MOBILE_GRADIENT } from "./HeroBannerOverlay";

import StepsSection from "./StepsSection";

// Built and deployed successfully
export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout activePage="Home">
      <section className="relative w-full overflow-hidden min-h-[580px] lg:min-h-[720px]">
        <div className="absolute inset-0 hidden lg:block">
          <img
            src={bannerImages}
            className="w-full h-full object-cover"
            alt="Mejoric Desktop Hero"
            fetchPriority="high"
          />
        </div>

        <div className="absolute inset-0 lg:hidden">
          <img
            src={heroMobileBanner}
            className="w-full h-full object-cover object-center"
            alt="Mejoric Mobile Hero"
            fetchPriority="high"
          />
          <div className={`absolute inset-0 ${HERO_MOBILE_GRADIENT} pointer-events-none`} />
        </div>

        <HeroBannerOverlay onCtaClick={() => navigate("/mate")} />
      </section>

      {/* VIDEO SECTION */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-purple-600 mb-4">
                Watch How It Works
              </h1>
              <p className="text-lg text-gray-700">
                Learn more about our approach to emotional support and
                mentorship
              </p>
            </div>
            {/* Video Container */}
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-2xl"
                width="560"
                height="315"
                src="https://www.youtube.com/embed/A7cqbRmOiYU?si=bjkY7e__QKGrhUzR"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Emotional Opening Copy */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className=" mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content - Left */}
              <div>
                <h1 className="text-3xl text-center lg:text-left md:text-4xl font-bold text-purple-600 mb-4">
                  You Don’t Have to Carry Life Alone.
                </h1>
                <p className="text-lg md:text-xl text-center lg:text-left text-gray-700 mb-6 leading-relaxed">
                  Everyone goes through moments where life feels heavy,
                  confusing, or overwhelming.
                </p>
                <p className="text-lg md:text-xl text-center lg:text-left text-gray-700 mb-6 leading-relaxed">
                  But you don't have to carry it all by yourself.
                </p>
                <p className="text-lg md:text-xl text-center lg:text-left text-gray-700 mb-8 leading-relaxed">
                  Whether you need to express what you're feeling or find
                  clarity on what to do next, Mejoric connects you to the right
                  person, right when you need it.
                </p>
                <p className="text-lg md:text-xl text-center lg:text-left text-gray-700 mb-4 leading-relaxed font-semibold">
                  No waiting lists. No pressure. No judgment.
                </p>
                <p className="text-lg md:text-xl text-center lg:text-left text-gray-700 mb-12 leading-relaxed">
                  Just a safe space to feel lighter or a clear path to move
                  forward.
                </p>

                {/* CTAs - Side by side, equal weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto lg:mx-0">
                  <button
                    onClick={() => {
                      trackPixel("ViewContent");
                      if (typeof window.gtag === "function") {
                        window.gtag("event", "select_content", {
                          content_type: "CTA Button",
                          content_id: "i_want_to_talk",
                        });
                      }
                      navigate("/mate");
                    }}
                    className="bg-purple-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
                  >
                    I Want To Talk
                    <br />
                    <span className="text-sm opacity-90">
                      (Connect with a Mate)
                    </span>
                  </button>
                  {/* <button
                    onClick={() => {
                      trackPixel("ViewContent");
                      if (typeof window.gtag === "function") {
                        window.gtag("event", "select_content", {
                          content_type: "CTA Button",
                          content_id: "clarity_direction",
                        });
                      }
                      navigate("/mentors");
                    }}
                    className="bg-purple-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
                  >
                    I Need Clarity & Direction
                    <br />
                    <span className="text-sm opacity-90">(Find a Mentor)</span>
                  </button> */}
                </div>
              </div>

              {/* Image - Right */}
              <div className="lg:block">
                <img
                  src={image}
                  alt="Mejoric Support"
                  className="rounded-2xl shadow-2xl w-full h-auto "
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <StepsSection />
      <section className="py-5 bg-white">
        <div className="container mx-auto px-4">
          <div className=" mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-purple-600 mb-4">
                From Your First Message to Real Clarity
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  step: "1",
                  title: "Quick Match ",
                  desc: "Get matched with the right person in under 10 minutes.",
                },
                {
                  step: "2",
                  title: "Safe Space ",
                  desc: "100% confidential. No judgment, ever.",
                },
                {
                  step: "3",
                  title: "Human Conversations",
                  desc: "No scripts. No advice overload. Just real listening.",
                },
                {
                  step: "4",
                  title: "Empathetic Listener",
                  desc: "People who truly listen, not just respond",
                },

                {
                  step: "5",
                  title: "No Commitment",
                  desc: "Start, pause, or stop anytime",
                },
                {
                  step: "6",
                  title: "At Your Pace",
                  desc: "Go as slow or as fast as you need",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-purple-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="py-16 mb-10   relative overflow-hidden  min-h-[280px]">
        <div
          className="absolute inset-0  bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1600')`,
          }}
        />
        {/* Purple overlay */}
        <div className="absolute inset-0 bg-purple-900/70"></div>

        <div className="container mx-auto px-4   relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your safe space is just minutes away.
            </h2>
            <p className="text-xl text-white/90 mb-12">
              No waiting. No judgment. Just support that actually helps.
            </p>
            <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
              <button
                onClick={() => {
                  trackPixel("ViewContent");
                  if (typeof window.gtag === "function") {
                    window.gtag("event", "select_content", {
                      content_type: "CTA Button",
                      content_id: "talk_to_mate_bottom",
                    });
                  }
                  navigate("/mate");
                }}
                className="bg-white cursor-pointer text-purple-700 px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
              >
                Talk to a Mate
              </button>
              {/* <button
                onClick={() => {
                  trackPixel("ViewContent");
                  if (typeof window.gtag === "function") {
                    window.gtag("event", "select_content", {
                      content_type: "CTA Button",
                      content_id: "find_mentor_bottom",
                    });
                  }
                  navigate("/mentors");
                }}
                className="bg-white cursor-pointer text-purple-700 px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
              >
                Find a Mentor
              </button> */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
