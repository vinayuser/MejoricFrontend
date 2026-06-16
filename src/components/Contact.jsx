import React, { useState } from "react";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPaperPlane,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";
import { trackPixel } from "../utils/metaPixel";
import Layout from "../components/Layout";
import Footer from "../components/Footer";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/contacts/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Message sent successfully!",
        });


        // Track Meta Pixel Contact event
        trackPixel("Contact", {
          subject: formData.subject,
          email: formData.email
        });
        setFormData({
          name: "",
          email: "",
          mobile: "",
          subject: "",
          message: "",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSubmitStatus({
          type: "error",
          message:
            errorData.message || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: <FaWhatsapp />,
      title: "WhatsApp",
      info: "+91 92042 35079",
      desc: "Mon to Fri 9am to 6pm",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      info: "support@mejoric.com",
      desc: "Send us anytime!",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Location",
      info: "India ",
      desc: "",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: <FaPhone />,
      title: "Phone",
      info: "+91 92042 35079",
      desc: "Mon to Fri 9am to 6pm",
      color: "from-blue-500 to-blue-600",
    },
  ];

  return (
    <Layout activePage="Contact">
      {/* Hero Section */}
      <section className="bg-purple-100 py-5 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            We're here to help you find the perfect guide and answer any
            questions you may have.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Let's Talk
              </h2>
              <p className="text-gray-700 text-lg mb-8">
                Have questions about our services? Need help finding the right
                support? We're here to assist you every step of the way.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="text-3xl text-purple-600 mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-800 font-semibold mb-1">
                      {item.info}
                    </p>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h3>

              {submitStatus && (
                <div
                  className={`mb-6 p-4 rounded-xl ${submitStatus.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                      placeholder="Enter your mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                      placeholder="Enter subject"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition resize-none"
                    placeholder="Enter your message"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white/50 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I choose the right mentor?",
                a: "Browse profiles, read reviews, and consider scheduling introductory sessions.",
              },
              {
                q: "What are the session fees?",
                a: "Mentor fee ranges between INR 1,200 and 10,000 per hour (depending on scope and expertise)",
              },
              {
                q: "Can I change mentors?",
                a: "Yes, you can switch mentors at any time to find the perfect match.",
              },
              {
                q: "Are sessions confidential?",
                a: "Absolutely. All sessions are private and confidential.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  );
}
