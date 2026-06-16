import React from 'react';
import { FaHeart, FaCompass, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import Footer from "../components/Footer";

export default function KnowYourMateMentor() {
  const navigate = useNavigate();

  const mateFeatures = [
    "You're feeling overwhelmed and just need to talk",
    "You want someone to listen without giving advice",
    "You're going through emotional stress or confusion",
    "You need a safe space to express your feelings",
    "You want to feel heard and understood",
    "You're looking for emotional relief, not solutions"
  ];

  const mentorFeatures = [
    "You're stuck on a decision and need clarity",
    "You want practical guidance and direction",
    "You're facing a career, relationship, or life challenge",
    "You need someone to help you think through options",
    "You want actionable steps to move forward",
    "You're looking for expertise and experience"
  ];

  return (
    <Layout activePage="Know Your Mate & Mentor">
      {/* Hero Section */}
      <section className="py-20 bg-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Know Your Mate & Mentor
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Understanding the difference helps you choose the right support for your journey.
          </p>
        </div>
      </section>

      {/* Main Comparison Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Two Paths, One Goal: Your Well-being
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Both Mates and Mentors are here to support you — they just do it in different ways.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Mate Card */}
            <div className="bg-pink-50 rounded-3xl p-8 md:p-10 border-2 border-pink-100 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaHeart className="text-4xl text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Mate</h3>
                <p className="text-xl text-pink-600 font-semibold">Emotional Relief</p>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Choose a Mate when:</h4>
                <ul className="space-y-3">
                  {mateFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-pink-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-2">What to expect:</h4>
                <p className="text-gray-600">
                  A warm, non-judgmental conversation where you can express yourself freely. 
                  Your Mate is trained to listen deeply and help you feel lighter.
                </p>
              </div>

              <button
                onClick={() => navigate("/mate")}
                className="w-full bg-pink-500 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                Connect with a Mate <FaArrowRight />
              </button>
            </div>

            {/* Mentor Card */}
            <div className="bg-blue-50 rounded-3xl p-8 md:p-10 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCompass className="text-4xl text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Mentor</h3>
                <p className="text-xl text-blue-600 font-semibold">Practical Clarity</p>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Choose a Mentor when:</h4>
                <ul className="space-y-3">
                  {mentorFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-2">What to expect:</h4>
                <p className="text-gray-600">
                  A focused conversation with an experienced guide who helps you 
                  think clearly and take meaningful action toward your goals.
                </p>
              </div>

              <button
                onClick={() => navigate("/mentor")}
                className="w-full bg-blue-500 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                Find a Mentor <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Decision Guide */}
      <section className="py-20 bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quick Decision Guide
            </h2>
            <p className="text-lg text-gray-600">
              Still not sure? Ask yourself these questions:
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
              <div className="space-y-8">
                <div className="border-b border-gray-100 pb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    "Do I need to be heard or do I need a plan?"
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-pink-50 rounded-xl p-4">
                      <span className="text-pink-600 font-semibold">Need to be heard?</span>
                      <span className="text-gray-600"> → Choose a Mate</span>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <span className="text-blue-600 font-semibold">Need a plan?</span>
                      <span className="text-gray-600"> → Choose a Mentor</span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-100 pb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    "Am I feeling emotional or analytical right now?"
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-pink-50 rounded-xl p-4">
                      <span className="text-pink-600 font-semibold">Feeling emotional?</span>
                      <span className="text-gray-600"> → Choose a Mate</span>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <span className="text-blue-600 font-semibold">Feeling analytical?</span>
                      <span className="text-gray-600"> → Choose a Mentor</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    "Do I want comfort or direction?"
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-pink-50 rounded-xl p-4">
                      <span className="text-pink-600 font-semibold">Want comfort?</span>
                      <span className="text-gray-600"> → Choose a Mate</span>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <span className="text-blue-600 font-semibold">Want direction?</span>
                      <span className="text-gray-600"> → Choose a Mentor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Both is OK Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              It's Okay to Need Both
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Life is complex. Sometimes you need emotional support first, then practical guidance later. 
              Or vice versa. Many of our users connect with both a Mate and a Mentor at different times 
              in their journey.
            </p>
            <p className="text-xl font-semibold text-purple-600 mb-10">
              There's no wrong choice — only the choice that feels right for you right now.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/mate")}
                className="bg-pink-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
              >
                Start with a Mate
              </button>
              <button
                onClick={() => navigate("/mentor")}
                className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
              >
                Start with a Mentor
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  );
}
