import React, { useState, useEffect, useRef } from "react";
import { FaMobileAlt, FaArrowLeft, FaRedo } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { apiPost, apiPut } from "../utils/api";
import { trackPixelCustom } from "../utils/metaPixel";
import toast from "react-hot-toast";
import banner from "../assets/img/banner.jpeg";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && (roleParam === "user" || roleParam === "mate")) {
      setSelectedRole(roleParam);
    } else {
      setSelectedRole("user");
    }
  }, [searchParams]);

  useEffect(() => {
    let timer;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === "otp") {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, step]);

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(value);
    setError("");
  };

  const sendOtp = async () => {
    if (!mobile) {
      setError("Please enter your mobile number");
      return false;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    setIsLoading(true);
    setError("");
    try {
      const data = await apiPost(
        "/auth/loginOrSignin-with-mobile",
        {
          mobile,
          role: selectedRole,
        },
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
        setStep("otp");
        setCountdown(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        return true;
      }

      const errorMsg =
        data?.message || data?.msg || "Failed to send OTP. Please try again.";
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

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    const sent = await sendOtp();
    if (sent) {
      toast.success("OTP sent to your mobile number");
    }
  };

  const handleResend = async () => {
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const data = await apiPut(
        "/auth/verify-otp-mobile",
        {
          otp: otpCode,
          mobile,
          sessionId,
          role: selectedRole,
          fcmToken: localStorage.getItem("fcmToken"),
        },
        true,
      );

      if (!data) {
        throw new Error("Verification failed. Please try again.");
      }

      if (data.success) {
        const payload = data.data || data;
        const token = payload?.token ?? data.token;
        const apiUser = payload?.user ?? data.user;
        const apiRole = apiUser?.role || selectedRole;

        const userData = {
          ...(apiUser || {}),
          token,
          role: apiRole,
        };

        if (token) {
          localStorage.setItem("authToken", token);
        }

        login(userData);

        trackPixelCustom("LoginSuccess", {
          role: apiRole,
          mobile,
        });

        if (apiRole === "mate") {
          toast.success("Login successful!");
          navigate("/dashboard");
        } else if (userData.isMobileVerified === false) {
          toast.success("Login successful! Please verify your mobile number.");
          navigate("/verify-email");
        } else {
          toast.success("Login successful!");
          const redirectMateId = localStorage.getItem("redirect_mate_id");
          if (redirectMateId) {
            navigate("/wallet");
          } else {
            navigate("/");
          }
        }
      } else {
        const errorMsg = data?.message || data?.msg || "Invalid OTP. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      const errorMessage = err.message || "Verification failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMobile = () => {
    setStep("mobile");
    setOtp(["", "", "", "", "", ""]);
    setSessionId("");
    setError("");
  };

  return (
    <Layout activePage="Login">
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <button
            onClick={() => (step === "otp" ? handleBackToMobile() : navigate("/"))}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-6 transition-colors"
          >
            <FaArrowLeft />
            <span className="font-medium">
              {step === "otp" ? "Change mobile number" : "Back to Home"}
            </span>
          </button>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back!
              </h1>
              <p className="text-gray-600">
                {step === "mobile"
                  ? "Login with your mobile number"
                  : "Enter the OTP sent to your phone"}
              </p>
            </div>

            <img src={banner} alt="Banner" className="mb-6 rounded-xl" />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {step === "mobile" ? (
              <form onSubmit={handleMobileSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaMobileAlt className="text-purple-500" />
                    </div>
                    <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none text-gray-500 font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={mobile}
                      onChange={handleMobileChange}
                      placeholder="10-digit mobile number"
                      className="w-full pl-24 pr-4 py-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <p className="text-center text-sm text-gray-600 mb-6">
                  Code sent to{" "}
                  <span className="font-semibold text-purple-600">+91 {mobile}</span>
                </p>

                <div
                  className="flex justify-between gap-2 mb-8"
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
                      className="w-12 h-14 text-center text-2xl font-bold bg-purple-50/50 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.some((d) => d === "")}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </button>

                <div className="mt-6 text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                    >
                      <FaRedo className={`text-xs ${isResending ? "animate-spin" : ""}`} />
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Resend OTP in{" "}
                      <span className="text-purple-600 font-bold">{countdown}s</span>
                    </p>
                  )}
                </div>
              </form>
            )}

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <p className="text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-purple-600 hover:text-purple-600 font-semibold transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
