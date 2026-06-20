import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";
import Logo from "../img/logo- final.png";

import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { user, isAuthenticated } = useAuth();
  const isMate = isAuthenticated && user?.role === "mate";
  const isMentor = isAuthenticated && user?.role === "mentor";

  return (
    <footer className="bg-purple-900/60 lg:bg-gradient-to-br lg:from-purple-900 lg:via-purple-800 lg:to-purple-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Side - Company Info */}
            <div className="space-y-6 text-left lg:text-left">
              {/* Logo and Brand */}
              <div className="flex flex-col lg:flex-row items-start lg:items-start space-y-4 lg:space-y-0 lg:space-x-4">
                <img
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shadow-lg"
                  src={Logo}
                  alt="Mejoric Logo"
                />
                <div className="text-left">
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Mejoric
                  </h3>
                  {/* <p className="text-purple-300 text-xs sm:text-sm">
                    Your Growth Partner
                  </p> */}
                </div>
              </div>

              {/* Description */}
              <p className="text-purple-200 leading-relaxed max-w-md mx-0 lg:mx-0 text-left lg:text-left text-sm sm:text-base">
                Connecting you with expert people for personal growth, emotional
                well-being, and professional development. Your journey to
                self-improvement starts here.
              </p>

              {/* Social Media Links */}
              <div className="flex justify-start lg:justify-start space-x-2 sm:space-x-3">
                {[
                  {
                    Icon: FaInstagram,
                    url: "https://www.instagram.com/mejoric_official/",
                    label: "Instagram",
                  },
                  {
                    Icon: FaLinkedin,
                    url: "https://www.linkedin.com/company/mejoric/",
                    label: "LinkedIn",
                  },
                  {
                    Icon: FaFacebook,
                    url: "https://www.facebook.com/mejoric/",
                    label: "Facebook",
                  },
                  {
                    Icon: FaYoutube,
                    url: "https://www.youtube.com/@mejoric_official/",
                    label: "YouTube",
                  },
                ].map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="bg-purple-700/50 hover:bg-purple-600 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30"
                  >
                    <item.Icon className="text-base sm:text-lg" />
                  </a>
                ))}
              </div>
            </div>

            {/* Right Side - Links */}
            <div className="grid grid-cols-2 gap-6 sm:gap-8">
              {/* Quick Links */}
              <div className="text-left sm:text-left">
                <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 relative inline-block">
                  Quick Links
                  <span className="absolute -bottom-2 left-0 sm:left-0 transform-none sm:transform-none w-10 sm:w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></span>
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {[
                    { name: "Home", path: "/" },
                    { name: "Mates", path: "/mate" },
                    { name: "Mentors", path: "/mentors" },
                    { name: "Emotional Mentors", path: "/mentors/emotional" },
                    { name: "Professional Mentors", path: "/mentors/professional" },
                    { name: "About Us", path: "/about" },
                  ].map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className="text-purple-200 hover:text-white transition-all duration-300 hover:translate-x-2 inline-flex items-center group justify-start text-sm sm:text-base"
                      >
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 sm:mr-3 group-hover:bg-white transition-colors duration-300"></span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal & More */}
              <div className="text-left">
                <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 relative inline-block">
                  Legal & More
                  <span className="absolute -bottom-2 left-0 w-10 sm:w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></span>
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {[
                    {
                      name: "Terms & Conditions",
                      path: "/terms-and-conditions",
                    },
                    { name: "Privacy Policy", path: "/privacy-policy" },
                    { name: "Certificate Course", path: "/certificate" },
                    !isMate && !isMentor && { name: "Mate Login", path: "/login?role=mate" },
                    !isMate && !isMentor && { name: "Mentor Login", path: "/login?role=mentor" },
                    isMate && { name: "Mate Dashboard", path: "/dashboard" },
                    isMentor && { name: "Mentor Dashboard", path: "/mentor-dashboard" },
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.path}
                          className="text-purple-200 hover:text-white transition-all duration-300 hover:translate-x-2 inline-flex items-center group justify-start text-sm sm:text-base"
                        >
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 sm:mr-3 group-hover:bg-white transition-colors duration-300"></span>
                          {item.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-3 text-left lg:text-left">
              <h4 className="text-base sm:text-lg font-semibold relative inline-block">
                Contact
                <span className="absolute -bottom-2 left-0 lg:left-0 transform-none lg:transform-none w-10 sm:w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></span>
              </h4>

              <a
                href="https://wa.me/919204235079"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-start space-x-3 text-purple-200 hover:text-white transition-colors duration-300 mt-4 sm:mt-6"
              >
                <div className="bg-purple-700/50 p-2 rounded-lg">
                  <FaWhatsapp className="text-white text-sm sm:text-base" />
                </div>
                <span className="text-sm sm:text-base">+91 92042 35079</span>
              </a>
              <a
                href="mailto:support@mejoric.com"
                className="flex items-center justify-start space-x-3 text-purple-200 hover:text-white transition-colors duration-300"
              >
                <div className="bg-purple-700/50 p-2 rounded-lg">
                  <FaEnvelope className="text-purple-300 text-sm sm:text-base" />
                </div>
                <span className="text-sm sm:text-base">
                  support@mejoric.com
                </span>
              </a>
              {/* <Link
                to={"/contact"}
                className="text-purple-200 ml-2 hover:text-white transition-all duration-300 hover:translate-x-2 inline-flex items-center group justify-center sm:justify-start text-sm sm:text-base mt-2"
              >
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 sm:mr-3 group-hover:bg-white transition-colors duration-300"></span>
                Contact
              </Link> */}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-purple-700/50">
            <div className="bg-purple-800/30 rounded-xl p-4 sm:p-6 backdrop-blur-sm text-left lg:text-center">
              <p className="text-purple-300 text-xs sm:text-sm leading-relaxed max-w-4xl mx-0 lg:mx-auto">
                <strong className="text-purple-200">Important:</strong> We are
                not a medical service or suicide prevention helpline. If you are
                feeling suicidal, we would suggest you immediately call up a
                suicide prevention helpline - e.g Suicide Lifeline Mangalore
                Helpline:{" "}
                <span className="text-white font-medium">
                  08242983444, 7338201234 (24x7)
                </span>
                , TeleMANAS:{" "}
                <span className="text-white font-medium">
                  1-8008914416/14416
                </span>{" "}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-purple-700/50 bg-purple-900/50">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 max-w-6xl mx-auto">
            <p className="text-purple-300 text-xs sm:text-sm text-left">
              © {new Date().getFullYear()} Mejoric. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-left text-purple-300 text-xs sm:text-sm">
              <span>Made with</span>
              <span className="text-red-400 animate-pulse">❤</span>
              <span>for your growth</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
