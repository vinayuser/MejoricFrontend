
import React from 'react'
import Layout from './Layout'
import Footer from './Footer'
import { FaUsers, FaRocket, FaClock, FaBell } from 'react-icons/fa'

export default function Mentors() {
  return (
    <>
<Layout activePage="Mentors">
      <div className="min-h-screen  from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          {/* Icon with animation */}
         

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-bold    text-purple-600  mb-6">
            Coming Soon
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium">
            We're Building Something Amazing!
          </p>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Our team of expert mentors is coming soon to help you achieve your goals. 
            Get ready for personalized guidance and support on your journey to success.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
              <FaRocket className="text-3xl text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Expert Mentors</h3>
              <p className="text-sm text-gray-500 mt-1">Industry professionals</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
              <FaClock className="text-3xl text-pink-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">24/7 Support</h3>
              <p className="text-sm text-gray-500 mt-1">Round the clock help</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
              <FaBell className="text-3xl text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Get Notified</h3>
              <p className="text-sm text-gray-500 mt-1">Be the first to know</p>
            </div>
          </div>

          {/* CTA Button */}
          <button className="bg-purple-600 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto">
            <FaBell />
            Notify Me When Ready
          </button>

          {/* Decorative elements */}
          <div className="mt-12 flex justify-center gap-2">
            <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      </div>
      <Footer />
      </Layout>
    </>
  )
}
