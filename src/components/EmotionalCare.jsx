import React from 'react';
import { FaHeart, FaHandHoldingHeart, FaSmile, FaBrain, FaUsers, FaClock } from 'react-icons/fa';
import Layout from '../components/Layout';
import Footer from '../components/Footer';

export default function EmotionalCare() {
  const services = [
    { icon: <FaHeart />, title: "Relationship Counseling", desc: "Navigate relationship challenges with expert guidance" },
    { icon: <FaBrain />, title: "Stress Management", desc: "Learn techniques to manage stress and anxiety" },
    { icon: <FaSmile />, title: "Emotional Support", desc: "Get compassionate support for emotional well-being" },
    { icon: <FaHandHoldingHeart />, title: "Self-Care Guidance", desc: "Develop personalized self-care routines" },
    { icon: <FaUsers />, title: "Group Sessions", desc: "Connect with others in supportive group environments" },
    { icon: <FaClock />, title: "24/7 Support", desc: "Access help whenever you need it" }
  ];

  return (
    <Layout activePage=" Emotional Wellbeing">
      {/* Hero Section */}
      

      {/* Services */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Care Services</h2>
            <p className="text-gray-700 text-lg">Comprehensive emotional support for all aspects of life</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/40">
                <div className="text-5xl text-purple-600 mb-4 flex justify-center">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-700">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Support */}
      <section className="py-16 bg-red-50 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Need Immediate Help?</h2>
          <p className="text-gray-700 text-lg mb-8">
            If you're in crisis or need immediate emotional support, we're here for you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:bg-red-700 hover:shadow-xl transition-all duration-300 font-semibold text-lg">
              Emergency Support Line
            </button>
            <button className="bg-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all duration-300 font-semibold text-lg">
              Chat Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  );
}