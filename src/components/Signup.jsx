import React, { useState, useEffect, useRef } from "react";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheck,
  FaWhatsapp,
  FaMobileAlt,
  FaRedo,
  FaHeadphones,
  FaUserFriends,
  FaBolt,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { apiPost, apiPut } from "../utils/api";
import { trackPixel } from "../utils/metaPixel";
import { getFCMToken } from "../utils/fcm";
import toast from "react-hot-toast";
import signupLogo from "../assets/img/signup_logo.jpeg";

const TRUST_POINTS = [
  { label: "Safe Listening", icon: FaHeadphones },
  { label: "Trusted Mentors", icon: FaUserFriends },
  { label: "Instant Support", icon: FaBolt },
];

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
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
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === 2) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      phone: value,
      email: value ? `${value}@users.mejoric.com` : "",
    }));
    setError("");
  };

  const sendOtp = async () => {
    if (!formData.phone) {
      setError("Please enter your phone number");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }

    setIsLoading(true);
    setError("");
    try {
      const data = await apiPost(
        "/auth/loginOrSignin-with-mobile",
        { mobile: formData.phone, role: "user" },
        true,
      );

      if (data?.success) {
        const newSessionId =
          data.data?.sessionId ||
          data.data?.otpData?.Details ||
          data.data?.otpData?.details;
        if (!newSessionId) {
          throw new Error("Failed to start OTP session. Please try again.");
        }
        setSessionId(newSessionId);
        setCountdown(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        return true;
      }

      const errorMsg = data?.message || "Failed to send OTP. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } catch (err) {
      console.error("Send OTP error:", err);
      const errorMessage = err.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1Continue = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.phone) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.name.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    const sent = await sendOtp();
    if (sent) {
      toast.success("OTP sent to your mobile number");
      setStep(2);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    const sent = await sendOtp();
    if (sent) {
      toast.success("OTP resent successfully!");
    }
    setIsResending(false);
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
    setError("");
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputRefs[index - 1].current.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error("Please paste a valid 6-digit code");
      return;
    }
    setOtp(pastedData.split(""));
    inputRefs[5].current.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit OTP");
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

      if (!response.success || !response.data?.token) {
        navigate("/login");
        return;
      }

      const userData = {
        ...(response.data.user || {}),
        token: response.data.token,
      };
      localStorage.setItem("authToken", response.data.token);
      localStorage.removeItem("conversion_guest_id");
      login(userData);

      const verifyResponse = await apiPut(
        "/auth/verify-otp-mobile",
        {
          otp: otpCode,
          mobile: formData.phone,
          sessionId,
          role: "user",
        },
        true,
      );

      if (!verifyResponse?.success) {
        const verifyError =
          verifyResponse?.message || "Invalid OTP. Please check and try again.";
        setError(verifyError);
        toast.error(verifyError);
        return;
      }

      trackPixel("CompleteRegistration");

      if (typeof window.gtag === "function") {
        window.gtag("event", "sign_up", {
          method: "phone",
        });
      }

      const updatedUser = {
        ...(verifyResponse.data?.user || verifyResponse.user || userData),
        token: verifyResponse.data?.token || response.data.token,
        isMobileVerified: true,
      };

      if (verifyResponse.data?.token) {
        localStorage.setItem("authToken", verifyResponse.data.token);
      }

      login(updatedUser);
      toast.success("Welcome! Your journey starts now.");

      localStorage.removeItem("redirect_mate_id");
      localStorage.removeItem("redirect_type");
      navigate("/mate?scrollTo=mates");
    } catch (err) {
      console.error("Signup error:", err);
      const errorMsg = err.message || "Signup failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setSessionId("");
    setError("");
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
          {step === 2 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-6 transition-colors"
            >
              <FaArrowLeft />
              <span className="font-medium">Back to details</span>
            </button>
          )}

          <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-200 rounded-full blur-3xl opacity-40 pointer-events-none" />

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step >= s
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-purple-100 text-purple-400"
                    }`}
                  >
                    {step > s ? <FaCheck className="text-xs" /> : s}
                  </div>
                  {s === 1 && (
                    <div
                      className={`w-10 h-0.5 ${step > 1 ? "bg-purple-600" : "bg-purple-200"}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="text-center mb-6 relative z-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 1 ? "Start Your Journey" : "Almost There!"}
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step === 1
                  ? "Talk to trusted Mates & Mentors who are here for you."
                  : "Set your password and verify your number to get started"}
              </p>
            </div>

            <img
              src={signupLogo}
              alt="Mejoric"
              className="mb-5 rounded-xl w-full object-cover relative z-10"
            />

            {step === 1 && (
              <p className="mb-6 text-center text-base italic font-serif text-purple-600 leading-snug relative z-10">
                A Safe Space When You Need Support
              </p>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm relative z-10">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleStep1Continue} className="relative z-10">
                <div className="mb-5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Name
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
                      placeholder="What should we call you?"
                      className="w-full pl-12 pr-4 py-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaWhatsapp className="text-purple-500" />
                    </div>
                    <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none text-gray-500 font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="10-digit mobile number"
                      className="w-full pl-24 pr-4 py-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Email field — kept for API compatibility, hidden from users */}
                <div className="hidden">
                  <label htmlFor="email">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="text-purple-500" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/20"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10">
                <p className="text-center text-sm text-gray-600 mb-5">
                  OTP sent to{" "}
                  <span className="font-semibold text-purple-600">
                    +91 {formData.phone}
                  </span>
                </p>

                <div className="mb-5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Create Password
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
                      placeholder="Create a secure password"
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

                <div className="mb-5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Re-enter Password
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

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FaMobileAlt className="inline mr-1.5 text-purple-500" />
                    Verify OTP
                  </label>
                  <div
                    className="flex justify-between gap-2"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={inputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="w-11 h-14 text-center text-xl font-bold bg-purple-50 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isResending}
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-semibold transition-colors"
                      >
                        <FaRedo
                          className={`text-xs ${isResending ? "animate-spin" : ""}`}
                        />
                        Resend OTP
                      </button>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Resend OTP in{" "}
                        <span className="text-purple-600 font-bold">
                          {countdown}s
                        </span>
                      </p>
                    )}
                  </div>
                </div>

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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl font-bold text-base hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/30"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Starting your journey...
                    </span>
                  ) : (
                    "Connect With A Mate | Start My Journey"
                  )}
                </button>
              </form>
            )}

            {/* Trust footer */}
            <div className="mt-8 pt-6 border-t border-purple-100 relative z-10">
              <div className="flex flex-nowrap items-center justify-center gap-x-2 sm:gap-x-4 text-xs sm:text-sm whitespace-nowrap">
                {TRUST_POINTS.map((point, index) => {
                  const Icon = point.icon;
                  return (
                    <React.Fragment key={point.label}>
                      {index > 0 && (
                        <span className="text-purple-300 shrink-0">|</span>
                      )}
                      <span className="inline-flex items-center gap-1 text-gray-600 font-medium shrink-0">
                        <Icon className="text-purple-500 text-[10px] sm:text-xs" />
                        {point.label}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <p className="mt-6 text-center text-gray-600 text-sm relative z-10">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
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
