import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
  FaYoutube,
  FaHeart,
} from "react-icons/fa";
import Logo from "../img/logo- final.png";
import { useAuth } from "../context/AuthContext";

const QUICK_LINKS = [
  { name: "Home", path: "/" },
  { name: "Mates", path: "/mate" },
  { name: "Mentors", path: "/mentors/professional/browse" },
  { name: "About Us", path: "/about" },
];

const LEGAL_LINKS = [
  { name: "Terms & Conditions", path: "/terms-and-conditions" },
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Certificate Course", path: "/certificate" },
];

const SOCIAL_LINKS = [
  { Icon: FaInstagram, url: "https://www.instagram.com/mejoric_official/", label: "Instagram" },
  { Icon: FaLinkedin, url: "https://www.linkedin.com/company/mejoric/", label: "LinkedIn" },
  { Icon: FaFacebook, url: "https://www.facebook.com/mejoric/", label: "Facebook" },
  { Icon: FaYoutube, url: "https://www.youtube.com/@mejoric_official/", label: "YouTube" },
];

function FooterHeading({ children }) {
  return (
    <h4 className="text-base font-semibold text-white mb-5 pb-2 border-b border-white/15">
      {children}
    </h4>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-white/70 hover:text-white transition-colors text-[15px] leading-8 block"
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  const { user, isAuthenticated } = useAuth();
  const isMate = isAuthenticated && user?.role === "mate";
  const isMentor = isAuthenticated && user?.role === "mentor";

  const loginLinks = [
    !isMate && { name: "Mate Login", path: "/login?role=mate" },
    !isMentor && { name: "Mentor Login", path: "/login?role=mentor" },
  ].filter(Boolean);

  return (
    <footer className="bg-[#5f4f86] text-white">
      <div className="container mx-auto px-5 sm:px-8 py-12 lg:py-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-x-10 lg:gap-y-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <img
                className="w-12 h-12 rounded-lg object-cover"
                src={Logo}
                alt="Mejoric Logo"
              />
              <div>
                <p className="text-lg font-bold text-white leading-tight">Mejoric</p>
                <p className="text-xs text-white/60">Your Growth Partner</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5 max-w-xs">
              Connecting you with expert people for personal growth, emotional
              well-being, and professional development.
            </p>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <item.Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links — page links + login side by side */}
          <div className="sm:col-span-2 lg:col-span-4">
            <FooterHeading>Quick Links</FooterHeading>
            <div className="flex items-start gap-8 sm:gap-10">
              <ul className="flex-1 min-w-0">
                {QUICK_LINKS.map((item) => (
                  <li key={item.name}>
                    <FooterLink to={item.path}>{item.name}</FooterLink>
                  </li>
                ))}
              </ul>

              {loginLinks.length > 0 && (
                <ul className="flex-1 min-w-0">
                  {loginLinks.map((item) => (
                    <li key={item.name}>
                      <FooterLink to={item.path}>{item.name}</FooterLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <FooterHeading>Legal</FooterHeading>
            <ul>
              {LEGAL_LINKS.map((item) => (
                <li key={item.name}>
                  <FooterLink to={item.path}>{item.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <FooterHeading>Contact</FooterHeading>
            <ul className="space-y-3">
              <li>
                <FooterLink to="/contact">Contact Us</FooterLink>
              </li>
              <li>
                <a
                  href="https://wa.me/919204235079"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-[15px]"
                >
                  <FaWhatsapp className="text-[#25D366] shrink-0" />
                  +91 92042 35079
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@mejoric.com"
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-[15px] break-all"
                >
                  <FaEnvelope className="text-white/50 shrink-0" />
                  support@mejoric.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-white/15">
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
            <span className="text-white/80 font-medium">Important:</span> We are
            not a medical service or suicide prevention helpline. If you are
            feeling suicidal, please call immediately — Suicide Lifeline
            Mangalore:{" "}
            <span className="text-white/80">08242983444, 7338201234 (24×7)</span>
            , TeleMANAS:{" "}
            <span className="text-white/80">1-8008914416 / 14416</span>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#4a3d6a]">
        <div className="container mx-auto px-5 sm:px-8 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
            <p className="text-white/50 text-xs sm:text-sm">
              © {new Date().getFullYear()} Mejoric. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 text-white/50 text-xs sm:text-sm">
              Made with <FaHeart className="text-[#d98fa0] text-xs" /> for your growth
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
