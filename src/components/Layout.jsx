import React, { useState, useRef, useEffect } from "react";
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaHome,
  FaUser,
  FaHeart,
  FaUsers,
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaSignInAlt,
  FaUserPlus,
  FaChevronDown,
  FaVideo,
  FaWallet,
  FaRupeeSign,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { trackPixel, trackPixelCustom } from "../utils/metaPixel";
import logo from "../img/logo_final.webp";
import { getFCMToken } from "../utils/fcm";
import toast from "react-hot-toast";
import { capitalizeName } from "../utils/formatters";

const Layout = ({ children, activePage }) => {
  const { user, isAuthenticated, walletBalance, logout, refreshWalletBalance } =
    useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Notification State
  const [fcmStatus, setFcmStatus] = useState(
    typeof Notification !== "undefined"
      ? Notification.permission
      : "unsupported",
  );
  const [isDismissed, setIsDismissed] = useState(false);

  // Request FCM token and monitor permission
  useEffect(() => {
    const fetchToken = async () => {
      if (
        typeof Notification === "undefined" ||
        Notification.permission === "unsupported"
      )
        return;

      try {
        await getFCMToken();
        setFcmStatus(Notification.permission);
      } catch (err) {
        console.error("FCM Token request failed:", err);
      }
    };

    const interval = setInterval(() => {
      if (
        typeof Notification !== "undefined" &&
        Notification.permission !== fcmStatus
      ) {
        setFcmStatus(Notification.permission);
      }
    }, 2000);

    fetchToken();
    return () => clearInterval(interval);
  }, [fcmStatus]);

  const handleRequestPermission = async () => {
    if (typeof Notification === "undefined") return;

    try {
      const permission = await Notification.requestPermission();
      setFcmStatus(permission);

      if (permission === "granted") {
        await getFCMToken();
      } else if (permission === "denied") {
        toast.error(
          "Notifications are still blocked. Please allow them manually in your browser settings.",
        );
      }
    } catch (err) {
      console.error("Permission request failed:", err);
    }
  };

  // Get user role
  const userRole = user?.role || "user";

  useEffect(() => {
    if (isDropdownOpen && !isAuthenticated) {
      trackPixelCustom("AuthPromptShown");
    }
  }, [isDropdownOpen, isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Wallet balance is refreshed globally in AuthContext.jsx
  useEffect(() => {
    // Other layout side-effects can go here
  }, []);

  const handleSearchFocus = () => {
    if (!isSearchOpen) {
      setIsSearchOpen(true);
    }
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      // Allow default tab behavior but focus the input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    }
  };

  // Role-based navigation items
  const navigationItems =
    userRole === "mate"
      ? [
          {
            name: "Dashboard",
            icon: <FaHome />,
            path: "/dashboard",
            badge: null,
          },
          { name: "Wallet", icon: <FaWallet />, path: "/wallet", badge: null },
          {
            name: "Contact",
            icon: <FaWhatsapp />,
            path: "/contact",
            badge: null,
          },
        ]
      : [
          { name: "Home", icon: <FaHome />, path: "/", badge: null },
          { name: "Mate", icon: <FaHeart />, path: "/mate", badge: "" },
          { name: "Mentors", icon: <FaUsers />, path: "/mentors", badge: "" },
          {
            name: "Contact",
            icon: <FaWhatsapp />,
            path: "/contact",
            badge: null,
          },
        ];

  return (
    <div className="min-h-screen bg-purple-100">
      {/* Notifications Blocked Banner - Global visibility */}
      {fcmStatus === "denied" && !isDismissed && (
        <div className="fixed bottom-0 left-0 right-0 md:sticky md:top-0 z-[100] animate-slide-up md:animate-none">
          <div className="bg-red-50 border-t md:border-t-0 md:border-b border-red-200 px-6 py-4 md:py-3 flex flex-col md:flex-row items-center justify-between gap-4 w-full shadow-lg">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-xl font-bold">✕</span>
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-red-700 leading-tight">
                  Notifications Blocked
                </h3>
                <p className="text-sm text-red-600/80 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  Needed to receive incoming calls
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleRequestPermission}
                className="flex-1 md:flex-none px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold transition-all text-sm border border-red-200 shadow-sm"
              >
                Reset Settings
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-2 text-red-400 hover:text-red-700 hover:bg-white md:hover:bg-red-100 rounded-lg transition-colors border md:border-transparent border-red-100"
                aria-label="Dismiss"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}

      {/* Main Navigation */}
      <nav
        className={`sticky ${fcmStatus === "denied" && !isDismissed ? "md:top-[68px]" : "top-0"} z-50 bg-white/95 backdrop-blur-xl shadow-lg border-b border-purple-100 px-4 sm:px-6 py-3 transition-all duration-300`}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full blur duration-1000 group"></div>
              <img
                className="relative h-16 sm:h-20 lg:h-24 w-16 sm:w-20 lg:w-24"
                src={logo}
                alt="Mejoric"
              />
            </div>
            <div className="sm:block">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700">
                Mejoric
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => (
              <li key={item.name} className="relative">
                <Link
                  to={item.path}
                  onClick={() => {
                    trackPixel("ViewContent", {
                      content_category: item.name,
                    });
                    if (typeof window.gtag === "function") {
                      window.gtag("event", "view_item", {
                        items: [
                          {
                            item_name: item.name,
                            item_category: "Navigation",
                          },
                        ],
                      });
                    }
                  }}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 mx-1 ${
                    activePage === item.name
                      ? "bg-purple-600 text-white shadow-lg"
                      : "hover:bg-purple-50 text-gray-700 hover:text-purple-700 hover:shadow-md"
                  }`}
                >
                  <span
                    className={`text-lg ${activePage === item.name ? "text-white" : "text-purple-600"}`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-semibold text-sm">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        activePage === item.name
                          ? "bg-white/30 text-white"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-purple-100 text-purple-700"
            >
              <FaBars className="text-xl" />
            </button>

            {/* Wallet Balance Display */}
            {isAuthenticated && (
              <Link
                to="/wallet"
                className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold hover:bg-green-200 transition-colors text-sm"
              >
                <FaWallet className="text-sm" />
                <FaRupeeSign className="text-xs" />
                {walletBalance}
              </Link>
            )}
            {/* Login Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold hover:bg-purple-200 transition-colors duration-300 text-sm"
              >
                <FaUser className="text-xs sm:text-sm" />

                <FaChevronDown
                  className={`text-xs transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-purple-100 py-2 z-50 animate-fade-in overflow-hidden">
                  {isAuthenticated && user && (
                    <div className="px-5 py-4 bg-purple-50/50 border-b border-purple-100 mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {capitalizeName(user.name)}
                      </p>
                      <p className="text-[11px] text-purple-600 font-medium truncate mt-0.5">
                        {user.email || user.phone}
                      </p>
                    </div>
                  )}
                  {isAuthenticated ? (
                    <>
                      {userRole === "mate" ? (
                        <>
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate("/dashboard");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                          >
                            <FaHome className="text-purple-600" />
                            <span className="font-medium">Dashboard</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate("/wallet");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                          >
                            <FaWallet className="text-green-600" />
                            <span className="font-medium">
                              Wallet: ₹{walletBalance}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              setIsDropdownOpen(false);
                              navigate("/");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                          >
                            <FaSignInAlt className="text-red-600" />
                            <span className="font-medium">Logout</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate("/wallet");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                          >
                            <FaWallet className="text-green-600" />
                            <span className="font-medium">
                              Wallet: ₹{walletBalance}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              setIsDropdownOpen(false);
                              navigate("/");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                          >
                            <FaSignInAlt className="text-red-600" />
                            <span className="font-medium">Logout</span>
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/login?role=user");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                      >
                        <FaSignInAlt className="text-purple-600" />
                        <span className="font-medium">Login</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/signup");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                      >
                        <FaUserPlus className="text-pink-600" />
                        <span className="font-medium">Sign Up</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl border-l border-purple-100">
            <div className="h-full flex flex-col">
              {/* Menu Header */}
              <div className="p-6 bg-purple-600">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img
                      className="h-14 w-14 rounded-full border-4 border-white/30 shadow-xl"
                      src={logo}
                      alt="Mejoric"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Mejoric</h2>
                      {/* <p className="text-purple-100 text-sm">
                        Your Learning Journey
                      </p> */}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
                  >
                    <FaTimes className="text-white text-xl" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                    <FaUser className="text-purple-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold truncate">
                      {isAuthenticated && user
                        ? `Hi, ${capitalizeName(user.name)}`
                        : "Welcome to Mejoric!"}
                    </h3>
                    <p className="text-purple-100 text-[10px] truncate">
                      {isAuthenticated && user
                        ? user.email || user.phone
                        : "Join our community of learners"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Search */}
                <div className="mb-6">
                  <div className="flex items-center bg-white p-3 rounded-2xl shadow-lg border border-purple-100">
                    <FaSearch className="text-purple-500 mr-3" />
                    <input
                      type="text"
                      placeholder="Search mentors..."
                      className="flex-1 bg-transparent outline-none text-gray-700"
                    />
                  </div>
                </div>

                {/* Navigation Items */}
                <ul className="space-y-3 mb-8">
                  {navigationItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          trackPixel("ViewContent", {
                            content_category: item.name,
                          });
                          if (typeof window.gtag === "function") {
                            window.gtag("event", "view_item", {
                              items: [
                                {
                                  item_name: item.name,
                                  item_category: "Navigation",
                                },
                              ],
                            });
                          }
                        }}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                          activePage === item.name
                            ? "bg-purple-600 text-white shadow-xl"
                            : "bg-white hover:bg-purple-50 text-gray-700 shadow-md hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-xl ${activePage === item.name ? "text-white" : "text-purple-600"}`}
                          >
                            {item.icon}
                          </span>
                          <span className="font-semibold text-lg">
                            {item.name}
                          </span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              activePage === item.name
                                ? "bg-white/30 text-white"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                  {/* Add Login/Logout button for mobile */}
                  {isAuthenticated ? (
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-purple-50 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <span className="text-xl text-red-600">
                          <FaSignInAlt />
                        </span>
                        <span className="font-semibold text-lg">Logout</span>
                      </button>
                    </li>
                  ) : (
                    <>
                      <li>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate("/login?role=user");
                          }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-purple-50 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <span className="text-xl text-purple-600">
                            <FaSignInAlt />
                          </span>
                          <span className="font-semibold text-lg">Login</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate("/signup");
                          }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-purple-50 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <span className="text-xl text-pink-600">
                            <FaUserPlus />
                          </span>
                          <span className="font-semibold text-lg">Sign Up</span>
                        </button>
                      </li>
                    </>
                  )}
                </ul>

                {/* Stats */}
                {/* <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-purple-50 p-4 rounded-2xl text-center shadow-md border border-purple-100">
                    <div className="text-2xl font-bold text-purple-700">
                      50+
                    </div>
                    <div className="text-xs text-gray-600">Mentors</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl text-center shadow-md border border-purple-100">
                    <div className="text-2xl font-bold text-purple-700">
                      1k+
                    </div>
                    <div className="text-xs text-gray-600">Users</div>
                  </div>
                </div> */}

                {/* Auth Buttons - Currently disabled */}
                {/* Social Links */}
                <div className="mt-8 pt-6 border-t border-purple-200">
                  <p className="text-center text-gray-500 mb-4">Follow Us</p>
                  <div className="flex justify-center gap-4">
                    <a
                      href="https://www.instagram.com/mejoric_official/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 hover:text-white hover:bg-purple-600 hover:scale-110 transition-all duration-300 shadow-md"
                    >
                      <FaInstagram />
                    </a>
                    <a
                      href="https://www.linkedin.com/company/mejoric/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 hover:text-white hover:bg-purple-600 hover:scale-110 transition-all duration-300 shadow-md"
                    >
                      <FaLinkedin />
                    </a>
                    <a
                      href="https://www.facebook.com/mejoric/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 hover:text-white hover:bg-purple-600 hover:scale-110 transition-all duration-300 shadow-md"
                    >
                      <FaFacebook />
                    </a>
                    <a
                      href="https://www.youtube.com/@mejoric_official/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 hover:text-white hover:bg-purple-600 hover:scale-110 transition-all duration-300 shadow-md"
                    >
                      <FaYoutube />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="min-h-screen">{children}</main>
    </div>
  );
};

export default Layout;
