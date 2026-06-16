import React, { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheck,
  FaWhatsapp,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { apiPost } from "../utils/api";
import { trackPixel } from "../utils/metaPixel";
import { getFCMToken } from "../utils/fcm";
import toast from "react-hot-toast";
import banner from "../assets/img/banner.jpeg";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Name validation
    if (formData.name.length < 2) {
      setError("Name must be at least 2 characters");
      setIsLoading(false);
      return;
    }

    // Phone validation
    if (!formData.phone) {
      setError("Please enter your phone number");
      setIsLoading(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the Terms and Conditions and Privacy Policy");
      setIsLoading(false);
      return;
    }

    try {
      let fcmToken = null;
      try {
        fcmToken = await Promise.race([
          getFCMToken(),
          new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
        ]);
      } catch (fcmError) {
        console.warn("FCM token retrieval timed out or failed:", fcmError);
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.phone,
        password: formData.password,
        cofirmPassword: formData.confirmPassword,
        agreedToTerms: true,
        role: "user",
        fcmToken,
        guestId: localStorage.getItem("conversion_guest_id"),
      };

      const response = await apiPost("/auth/register", payload, true);

      trackPixel("CompleteRegistration");

      if (typeof window.gtag === "function") {
        window.gtag("event", "sign_up", {
          method: "email",
        });
      }

      toast.success(response.message);

      if (response.success && response.data?.token) {
        const userData = {
          ...(response.data.user || {}),
          token: response.data.token,
        };
        localStorage.setItem("authToken", response.data.token);
        localStorage.removeItem("conversion_guest_id");
        login(userData);

        if (userData.email && userData.isEmailVerified === false) {
          sessionStorage.setItem(
            `email_otp_sent_${userData.email.toLowerCase()}`,
            "1",
          );
        }

        const redirectMateId = localStorage.getItem("redirect_mate_id");

        if (redirectMateId) {
          localStorage.removeItem("redirect_mate_id");
          localStorage.removeItem("redirect_type");
          toast.success("Registration successful! Please verify your email.");
          navigate("/verify-email");
        } else if (userData.isEmailVerified === false) {
          toast.success("Registration successful! Please verify your email.");
          navigate("/verify-email");
        } else {
          toast.success("Registration successful!");
          navigate("/");
        }
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Signup error:", err);
      const errorMsg = err.message || "Signup failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { met: formData.password.length >= 6, text: "At least 6 characters" },
    { met: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
    { met: /[0-9]/.test(formData.password), text: "One number" },
  ];

  return (
    <Layout activePage="Signup">
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-6 transition-colors"
          >
            <FaArrowLeft />
            <span className="font-medium">Back to Home</span>
          </button>

          {/* Signup Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account!
              </h1>
              <p className="text-gray-600">Sign-up to begin your journey</p>
            </div>
            <img className="mb-5" src={banner} />
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="mb-5">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-purple-500" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="mb-5">
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaWhatsapp className="text-purple-500 " />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-purple-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-5">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-purple-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full pl-12 pr-12 py-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-sm ${req.met ? "text-green-600" : "text-gray-400"}`}
                      >
                        <FaCheck
                          className={`text-xs ${req.met ? "opacity-100" : "opacity-30"}`}
                        />
                        <span>{req.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-purple-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full pl-12 pr-4 py-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <FaCheck className="text-xs" />
                      <span>Passwords match</span>
                    </div>
                  )}
              </div>

              {/* Terms Checkbox */}
              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-1 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{" "}
                    <Link
                      to="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 font-medium underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 font-medium underline"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
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
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Social Signup */}

            {/* Login Link */}
            <p className="mt-8 text-center text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-purple-600 hover:text-purple-600 font-semibold transition-colors"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
