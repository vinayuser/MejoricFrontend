import React, { useEffect } from "react";
import {
  FaBullseye,
  FaHeart,
  FaHandshake,
  FaUserFriends,
  FaInfinity,
  FaShieldAlt,
  FaComments,
  FaCheckCircle,
} from "react-icons/fa";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { trackPixel } from "../utils/metaPixel";

export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    trackPixel("Lead", {
      content_name: "About Page View",
    });
  }, []);

  return (
    <Layout activePage="About">
      {/* BANNER SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              We See You. We Hear You. We're With You.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
              Because we've been where you are - overwhelmed, confused, or just
              needing someone who truly gets it.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 1: Short Emotional Line */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed">
              This isn't just a platform.
            </p>
            <p className="text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed mt-4">
              It's a human-first space created by people who know what it feels
              like to navigate life alone.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Our Story */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Why We Created Mejoric
            </h2>

            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                At some point, every one of us has needed a space to talk,
                think, release, or get direction, without feeling judged,
                rushed, or misunderstood.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                But real life rarely gives us that space.
              </p>

              <ul className="space-y-4 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-600 mt-1 flex-shrink-0" />
                  <span>Friends are busy.</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-600 mt-1 flex-shrink-0" />
                  <span>Family means well, but may not understand.</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-600 mt-1 flex-shrink-0" />
                  <span>Therapy can feel like a big step.</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-600 mt-1 flex-shrink-0" />
                  <span>Coaching can feel too formal.</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-600 mt-1 flex-shrink-0" />
                  <span>And sometimes… you just want someone who listens.</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-600 mt-1 flex-shrink-0" />
                  <span>Other times… you just want someone who guides.</span>
                </li>
              </ul>

              <p className="text-lg text-gray-700 leading-relaxed font-semibold">
                We built Mejoric to fill this gap: a warm, safe, no-pressure
                space where you can choose what you need:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <FaHandshake className="text-purple-600 text-3xl mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-purple-700 mb-2">
                    a Mate
                  </h3>
                  <p className="text-gray-600">When you want to feel lighter</p>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <FaUserFriends className="text-blue-600 text-3xl mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-blue-700 mb-2">
                    a Mentor
                  </h3>
                  <p className="text-gray-600">When you want clarity</p>
                </div>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed font-semibold mt-6 text-center">
                A space designed for humans, not labels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: The Philosophy */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Simple, Clear, Human.
            </h2>

            <p className="text-xl text-gray-700 leading-relaxed mb-8 text-center">
              Life doesn't come with a manual.
              <br />
              But support shouldn't be complicated.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center font-semibold">
              Our philosophy is built on three simple truths:
            </p>

            <div className="space-y-8">
              <div className="bg-purple-100 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-purple-700 mb-4">
                  1. Everyone deserves to feel heard.
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Before solutions, strategies, or advice - We all need a safe
                  space to be ourselves.
                </p>
              </div>

              <div className="bg-blue-100 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-blue-700 mb-4">
                  2. Clarity comes from connection.
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Whether emotional or practical, clarity grows when you feel
                  understood.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  3. Support should meet you where you are.
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>• Some days you want to talk.</p>
                  <p>• Some days you need direction.</p>
                  <p>• Some days you need healing.</p>
                  <p className="font-semibold">
                    You get to choose, without pressure or stigma.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: The Mate & Mentor Model */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              One Journey. Two Kinds of Support. One Safe Space.
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center">
              We created a simple support system that adapts to your needs:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaHandshake className="text-purple-600 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-purple-700 mb-4 text-center">
                  Mate - Emotional Relief
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  A Mate is a trained listener who helps you feel lighter
                  through empathy, presence, and validation.
                </p>
                <p className="text-gray-600 italic text-center">
                  No advice. No judgment. Just understanding.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUserFriends className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-blue-700 mb-4 text-center">
                  Mentor - Practical Clarity
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  A Mentor is someone with lived experience who guides you
                  through decisions, direction, productivity, or career choices.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
              <h4 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">
                Why it works:
              </h4>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed text-center mb-6">
                You move seamlessly from
              </p>

              {/* Responsive progression flow */}
              <div className="space-y-4 md:space-y-0">
                {/* Mobile: Vertical flow */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-purple-600 px-2 py-1 bg-purple-50 rounded-lg">
                      venting
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl text-gray-400">↓</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-purple-600 px-2 py-1 bg-purple-50 rounded-lg">
                      understanding
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl text-gray-400">↓</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">
                      clarity
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl text-gray-400">↓</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">
                      action
                    </span>
                  </div>
                </div>

                {/* Tablet and Desktop: Horizontal flow */}
                <div className="hidden md:flex items-center justify-center flex-wrap gap-2 lg:gap-4">
                  <span className="text-base lg:text-xl font-bold text-purple-600 px-3 py-2 bg-purple-50 rounded-lg">
                    venting
                  </span>
                  <span className="text-lg lg:text-xl text-gray-600 flex-shrink-0">
                    →
                  </span>
                  <span className="text-base lg:text-xl font-bold text-purple-600 px-3 py-2 bg-purple-50 rounded-lg">
                    understanding
                  </span>
                  <span className="text-lg lg:text-xl text-gray-600 flex-shrink-0">
                    →
                  </span>
                  <span className="text-base lg:text-xl font-bold text-blue-600 px-3 py-2 bg-blue-50 rounded-lg">
                    clarity
                  </span>
                  <span className="text-lg lg:text-xl text-gray-600 flex-shrink-0">
                    →
                  </span>
                  <span className="text-base lg:text-xl font-bold text-blue-600 px-3 py-2 bg-blue-50 rounded-lg">
                    action
                  </span>
                </div>
              </div>

              <p className="text-sm md:text-base text-gray-600 italic text-center mt-6">
                in your own time, at your own pace.
              </p>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => navigate("/know-your-mate-mentor")}
                className="bg-purple-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
              >
                Know Your Mate & Mentor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Our Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              To Make Support Accessible, Human, and Judgment-Free
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center">
              We're here to build a world where:
            </p>

            <div className="space-y-4">
              {[
                "No one has to struggle alone",
                "Support is available in minutes, not weeks",
                "Emotional and practical guidance is easy to access",
                "People feel safe, respected, and understood",
                "You choose your own pace of growth",
                "Every conversation feels human, warm, and meaningful",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-purple-50 rounded-xl p-4"
                >
                  <FaCheckCircle className="text-purple-600 text-xl flex-shrink-0" />
                  <span className="text-gray-700 text-lg">{item}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                This is our mission.
              </p>
              <p className="text-2xl font-bold text-gray-900">
                This is our promise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Our Values */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              What We Stand For
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <FaHeart />,
                  title: "Warmth",
                  desc: "Every interaction should feel human.",
                },
                {
                  icon: <FaShieldAlt />,
                  title: "Safety",
                  desc: "Your thoughts, feelings, and stories stay protected.",
                },
                {
                  icon: <FaComments />,
                  title: "Presence",
                  desc: "We listen to understand, not to respond.",
                },
                {
                  icon: <FaBullseye />,
                  title: "Clarity",
                  desc: "We help you see your next step, without pressure.",
                },
                {
                  icon: <FaCheckCircle />,
                  title: "Boundaries",
                  desc: "We guide, not diagnose. We listen, not fix.",
                },
                {
                  icon: <FaInfinity />,
                  title: "Growth at Your Pace",
                  desc: "Come as you are. Move when you're ready.",
                },
              ].map((value, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg text-center hover:scale-105 transition-transform duration-300"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-purple-600 text-2xl">{value.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Final CTA Block */}
      <section className="py-16 bg-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to begin your journey?
            </h2>
            <p className="text-xl text-white/90 mb-12">
              Choose support that meets you exactly where you are.
            </p>

            {/* Triple CTA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <button
                onClick={() => navigate("/emotional-care")}
                className="bg-white text-purple-600 px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
              >
                Talk to a Mate
              </button>
              <button
                onClick={() => navigate("/mentors")}
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
              >
                Find a Mentor
              </button>
              <button
                onClick={() => navigate("/know-your-mate-mentor")}
                className="bg-white/20 text-white border-2 border-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105"
              >
                Know Your Mate & Mentor
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  );
}
