import React, { useState, useEffect, useRef } from "react";
import { FaMobileAlt, FaLock, FaRedo, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";
import { apiPost, apiPut } from "../utils/api";
import toast from "react-hot-toast";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, login, logout, isAuthenticated } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const [sessionId, setSessionId] = useState("");
  const autoSendStartedRef = useRef(false);

  const getOtpSessionKeys = (mobile) => {
    const normalizedMobile = String(mobile);
    return {
      signupSentKey: `mobile_otp_sent_${normalizedMobile}`,
      autoSendKey: `mobile_otp_autosend_${normalizedMobile}`,
      sessionKey: `mobile_otp_session_${normalizedMobile}`,
    };
  };

  const shouldSkipAutoSend = (mobile) => {
    const { signupSentKey, autoSendKey, sessionKey } = getOtpSessionKeys(mobile);

    const storedSessionId = sessionStorage.getItem(sessionKey);
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }

    if (sessionStorage.getItem(signupSentKey)) {
      sessionStorage.removeItem(signupSentKey);
      return true;
    }

    const lastAutoSend = sessionStorage.getItem(autoSendKey);
    if (lastAutoSend && Date.now() - Number(lastAutoSend) < 60000) {
      return true;
    }

    sessionStorage.setItem(autoSendKey, String(Date.now()));
    return false;
  };

  // Timer logic for Resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Check authentication status on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user && (user.isMobileVerified || user.role === "mate")) {
      navigate("/");
      return;
    }

    if (!user?.mobile || autoSendStartedRef.current) return;

    if (shouldSkipAutoSend(user.mobile)) {
      return;
    }

    autoSendStartedRef.current = true;
    handleResend(true);
  }, [isAuthenticated, user, navigate]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return; // Allow only numeric characters

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Get last typed character
    setOtp(newOtp);

    // Auto-focus the next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
    
    setError("");
  };

  const handleKeyDown = (e, index) => {
    // Move to previous box on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error("Please paste a valid 6-digit numeric code");
      return;
    }

    const digits = pastedData.split("");
    setOtp(digits);
    inputRefs[5].current.focus();
  };

  const handleResend = async (silent = false) => {
    if (!user?.mobile) return;
    setIsResending(true);
    setError("");
    try {
      const response = await apiPost(
        "/auth/loginOrSignin-with-mobile",
        {
          mobile: user.mobile,
          role: user.role,
        },
        true
      );

      if (response.success) {
        const newSessionId =
          response.data?.sessionId ||
          response.data?.otpData?.Details ||
          response.data?.otpData?.details;
        if (newSessionId) {
          setSessionId(newSessionId);
          const { sessionKey } = getOtpSessionKeys(user.mobile);
          sessionStorage.setItem(sessionKey, newSessionId);
        }
        if (!silent) {
          toast.success("OTP has been resent to your mobile number!");
        }
        setCountdown(60);
        setCanResend(false);
      } else {
        setError(response.message || "Failed to send verification code.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      if (!silent) {
        toast.error("Failed to resend verification code. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await apiPut("/auth/verify-otp-mobile", {
        otp: otpCode,
        mobile: user.mobile,
        sessionId,
        role: user.role,
      });

      if (response && response.success) {
        toast.success("Mobile number verified successfully! Welcome!");
        
        // Update user auth context
        const updatedUser = {
          ...(response.data?.user || response.user || {}),
          token: response.data?.token || localStorage.getItem("authToken"),
        };
        
        if (response.data?.token) {
          localStorage.setItem("authToken", response.data.token);
        }
        
        login(updatedUser);

        const { autoSendKey, sessionKey } = getOtpSessionKeys(user.mobile);
        sessionStorage.removeItem(autoSendKey);
        sessionStorage.removeItem(sessionKey);
        
        // Navigate appropriately
        const redirectMateId = localStorage.getItem("redirect_mate_id");
        if (redirectMateId) {
          navigate(`/mate-profile/${redirectMateId}`);
        } else {
          navigate("/");
        }
      } else {
        setError(response?.message || "Invalid OTP code.");
        toast.error(response?.message || "Verification failed.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "Invalid verification code. Please check and try again.");
      toast.error(err.message || "Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout activePage="Verify Mobile">
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-50/50 backdrop-blur-xl relative overflow-hidden">
            {/* Soft decorative background circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            {/* Header */}
            <div className="text-center mb-8 relative z-10">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-inner border border-purple-200">
                <FaMobileAlt className="text-purple-600 text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Mobile</h1>
              <p className="text-gray-600 text-sm">
                We've sent a 6-digit verification code to
              </p>
              <p className="text-purple-600 font-semibold text-base mt-1 truncate">
                {user?.mobile || "your registered mobile number"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium animate-shake text-center">
                {error}
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="relative z-10">
              {/* 6-Digit OTP inputs */}
              <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-purple-50/50 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white text-gray-900 shadow-sm transition-all"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isVerifying || otp.some(d => d === "")}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/20"
              >
                {isVerifying ? (
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
                    Verifying...
                  </span>
                ) : (
                  "Verify Code"
                )}
              </button>
            </form>

            {/* Resend and Logout Actions */}
            <div className="mt-8 text-center space-y-6 relative z-10 border-t border-purple-50 pt-6">
              {/* Resend Code Option */}
              <div>
                {canResend ? (
                  <button
                    onClick={() => handleResend(false)}
                    disabled={isResending}
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors focus:outline-none"
                  >
                    <FaRedo className={`text-xs ${isResending ? "animate-spin" : ""}`} />
                    Resend verification code
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm font-medium">
                    Resend code in <span className="text-purple-600 font-bold">{countdown}s</span>
                  </p>
                )}
              </div>

              {/* Logout/Back Option */}
              <div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold transition-colors focus:outline-none text-sm"
                >
                  <FaSignOutAlt className="text-xs" />
                  Use a different account / Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
