import React, { useState, useEffect, useRef } from "react";
import {
  FaEnvelope,
  FaUser,
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaBirthdayCake,
} from "react-icons/fa";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";
import Footer from "./Footer";
import { apiGet, apiPost, apiPut } from "../utils/api";
import { getFCMToken } from "../utils/fcm";
import toast from "react-hot-toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CorporateLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [step, setStep] = useState(1);
  const [isFirstSignup, setIsFirstSignup] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const [form, setForm] = useState({
    corporateId: searchParams.get("company") || "",
    name: "",
    email: "",
    age: "",
    city: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("/corporate/active", true);
        if (res?.success && Array.isArray(res.data)) {
          setCompanies(res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load companies");
      } finally {
        setLoadingCompanies(false);
      }
    })();
  }, []);

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (step === 2) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, step]);

  const selectedCompany = companies.find((c) => c._id === form.corporateId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateStep1 = () => {
    if (!form.corporateId) {
      setError("Please select your company");
      return false;
    }
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) {
      setError("Please enter a valid work email");
      return false;
    }
    const domain = selectedCompany?.emailDomain;
    if (domain && !form.email.toLowerCase().endsWith(`@${domain}`)) {
      setError(`Email must end with @${domain}`);
      return false;
    }
    if (!form.name.trim()) {
      setError("Name is required");
      return false;
    }
    const age = parseInt(form.age, 10);
    if (!age || age < 18 || age > 100) {
      setError("Age must be between 18 and 100");
      return false;
    }
    if (!form.city.trim()) {
      setError("City is required");
      return false;
    }
    return true;
  };

  const sendOtp = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiPost(
        "/corporate/send-otp",
        {
          corporateId: form.corporateId,
          email: form.email.trim().toLowerCase(),
          name: form.name.trim(),
          age: form.age,
          city: form.city.trim(),
        },
        true,
      );
      if (res?.success) {
        setIsFirstSignup(Boolean(res.data?.isFirst));
        setStep(2);
        setCountdown(60);
        setCanResend(false);
        toast.success("OTP sent to your email");
      } else {
        setError(res?.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    await sendOtp();
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      let fcmToken;
      try {
        fcmToken = await getFCMToken();
      } catch {
        /* optional */
      }
      const res = await apiPut(
        "/corporate/verify-otp",
        {
          corporateId: form.corporateId,
          email: form.email.trim().toLowerCase(),
          otp: otpCode,
          name: form.name.trim(),
          age: form.age,
          city: form.city.trim(),
          fcmToken,
        },
        true,
      );
      if (res?.success && res.data?.user) {
        const userData = {
          ...res.data.user,
          token: res.data.token,
          corporateUsage: res.data.corporateUsage,
        };
        login(userData);
        toast.success("Welcome to Mejoric!");
        navigate("/mate");
      } else {
        setError(res?.message || "Verification failed");
      }
    } catch (err) {
      setError(err?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout activePage="Corporate">
      <div className="min-h-[70vh] bg-gradient-to-b from-purple-50 to-white py-12 px-4">
        <div className="max-w-lg mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-6 text-sm font-medium"
          >
            <FaArrowLeft /> Back to home
          </Link>

          <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
            <div className="bg-[#5f4f86] px-6 py-8 text-white text-center">
              <FaBuilding className="text-3xl mx-auto mb-3 opacity-90" />
              <h1 className="text-2xl font-bold">Corporate Login</h1>
              <p className="text-white/80 text-sm mt-2">
                Sign in with your company email to access your plan
              </p>
            </div>

            <div className="p-6 sm:p-8">
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select company
                    </label>
                    <select
                      name="corporateId"
                      value={form.corporateId}
                      onChange={handleChange}
                      disabled={loadingCompanies}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="">Choose your organization</option>
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} (@{c.emailDomain})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work email
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder={
                          selectedCompany
                            ? `you@${selectedCompany.emailDomain}`
                            : "you@company.com"
                        }
                        className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <div className="relative">
                        <FaBirthdayCake className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          name="age"
                          type="number"
                          min="18"
                          max="100"
                          value={form.age}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || loadingCompanies}
                    className="w-full bg-[#5f4f86] text-white py-3.5 rounded-xl font-semibold hover:bg-[#4a3d6a] transition disabled:opacity-50"
                  >
                    {isLoading ? "Sending OTP..." : "Send email OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <p className="text-center text-gray-600 text-sm">
                    Enter the 6-digit code sent to{" "}
                    <strong>{form.email}</strong>
                    {selectedCompany && (
                      <>
                        {" "}
                        for <strong>{selectedCompany.name}</strong>
                      </>
                    )}
                  </p>

                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={inputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-11 h-12 text-center text-lg font-bold border-2 border-purple-200 rounded-xl focus:border-purple-600 outline-none"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#5f4f86] text-white py-3.5 rounded-xl font-semibold hover:bg-[#4a3d6a] transition disabled:opacity-50"
                  >
                    {isLoading ? "Verifying..." : isFirstSignup ? "Create account" : "Sign in"}
                  </button>

                  <div className="text-center text-sm text-gray-500">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={isLoading}
                        className="text-purple-700 font-medium hover:underline"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <span>Resend OTP in {countdown}s</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp(["", "", "", "", "", ""]);
                      setError("");
                    }}
                    className="w-full text-gray-500 text-sm hover:text-gray-700"
                  >
                    ← Change email or company
                  </button>
                </form>
              )}

              <p className="text-center text-xs text-gray-500 mt-6">
                Regular user?{" "}
                <Link to="/login" className="text-purple-700 font-medium hover:underline">
                  Standard login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
