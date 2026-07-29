import React, { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaMobileAlt,
  FaRedo,
  FaTimes,
  FaUserPlus,
} from "react-icons/fa";
import { apiPost } from "../utils/api";
import { getFCMToken } from "../utils/fcm";
import toast from "react-hot-toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WELCOME =
  parseInt(import.meta.env.VITE_FREE_WALLET_RECHARGE, 10) || 500;

/**
 * Compact in-chat signup: profile → mobile OTP → convert guest (same user id).
 */
export default function GuestChatSignupPanel({
  guestUserId,
  matePrompted = false,
  forced = false,
  visible = true,
  onClose,
  onConverted,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    city: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sessionId, setSessionId] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (step !== 2 || countdown <= 0) {
      if (step === 2 && countdown <= 0) setCanResend(true);
      return undefined;
    }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [step, countdown]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Please enter your name");
      return false;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setError("Enter a valid 10-digit mobile number");
      return false;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError("Enter a valid email");
      return false;
    }
    const ageNum = Number(form.age);
    if (!Number.isFinite(ageNum) || ageNum < 18 || ageNum > 100) {
      setError("Age must be between 18 and 100");
      return false;
    }
    if (!form.city.trim() || form.city.trim().length < 2) {
      setError("Please enter your city");
      return false;
    }
    if (!agreed) {
      setError("Please agree to Terms & Privacy Policy");
      return false;
    }
    return true;
  };

  const sendOtp = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiPost(
        "/auth/loginOrSignin-with-mobile",
        {
          mobile: form.phone,
          role: "user",
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          age: Number(form.age),
          city: form.city.trim(),
          guestId: guestUserId,
        },
        true,
      );
      const sid = data?.data?.sessionId || data?.data?.otpData?.Details;
      if (!sid) throw new Error("Could not start OTP session");
      setSessionId(sid);
      setStep(2);
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      setCanResend(false);
      toast.success("OTP sent to your mobile");
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiPost(
        "/auth/loginOrSignin-with-mobile",
        {
          mobile: form.phone,
          role: "user",
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          age: Number(form.age),
          city: form.city.trim(),
          guestId: guestUserId,
        },
        true,
      );
      const sid = data?.data?.sessionId || data?.data?.otpData?.Details;
      if (sid) setSessionId(sid);
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      toast.success("OTP resent");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = pasted.split("");
    while (next.length < 6) next.push("");
    setOtp(next.slice(0, 6));
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const verifyAndConvert = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let fcmToken = null;
      try {
        fcmToken = await getFCMToken();
      } catch {
        /* optional */
      }
      const data = await apiPost("/auth/convert-guest", {
        guestId: guestUserId,
        mobile: form.phone,
        otp: code,
        sessionId,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        age: Number(form.age),
        city: form.city.trim(),
        agreedToTerms: true,
        fcmToken,
      });
      const token = data?.data?.token;
      const user = data?.data?.user || data?.data;
      if (!token || !user) throw new Error("Conversion failed");
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("conversion_guest_id");
      window.dispatchEvent(new Event("storage"));
      toast.success(data?.message || `Welcome! ₹${WELCOME} added to wallet`);
      onConverted?.(user, token);
    } catch (err) {
      setError(err.message || "Invalid OTP or signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`absolute inset-0 z-[70] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {/* Soft dim over chat — not dismissible when mate forced registration */}
      <div
        className={`absolute inset-0 bg-slate-900/25 transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={forced ? undefined : onClose}
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 top-10 flex flex-col rounded-t-3xl bg-gradient-to-b from-violet-50 via-white to-white shadow-[0_-12px_40px_rgba(88,28,135,0.18)] overflow-hidden">
      <div className="mx-auto mt-2 mb-1 h-1.5 w-10 rounded-full bg-violet-200/80" />
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-100 bg-white/90 backdrop-blur">
        <div className="flex items-center gap-2">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="p-2 rounded-full hover:bg-violet-50 text-violet-700"
              aria-label="Back"
            >
              <FaArrowLeft className="text-sm" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center">
              <FaUserPlus className="text-sm" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {step === 1 ? "Create your account" : "Verify mobile"}
            </p>
            <p className="text-[11px] text-slate-500">
              {matePrompted || forced
                ? "Register to continue this chat — required by your mate"
                : `Get ₹${WELCOME} welcome balance · keep this chat`}
            </p>
          </div>
        </div>
        {!forced && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {(matePrompted || forced) && step === 1 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
            Your mate has asked you to register. Please complete signup to keep
            chatting — this step can&apos;t be skipped. Your chat history stays
            intact.
          </div>
        )}

        {step === 1 ? (
          <>
            <label className="block text-xs font-medium text-slate-600">
              Full name
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Mobile number
              <div className="mt-1 relative">
                <FaMobileAlt className="absolute left-3 top-3.5 text-slate-400 text-sm" />
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                />
              </div>
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="you@email.com"
                autoComplete="email"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-slate-600">
                Age
                <input
                  value={form.age}
                  onChange={(e) =>
                    setField("age", e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="18+"
                  inputMode="numeric"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                City
                <input
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="City"
                />
              </label>
            </div>
            <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  setError("");
                }}
                className="mt-0.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span>
                I agree to the Terms & Conditions and Privacy Policy
              </span>
            </label>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 text-center">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-slate-900">+91 {form.phone}</span>
            </p>
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-10 h-12 text-center text-lg font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                  inputMode="numeric"
                  maxLength={1}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={resendOtp}
              disabled={!canResend || loading}
              className="mx-auto flex items-center gap-1.5 text-xs text-violet-700 disabled:text-slate-400"
            >
              <FaRedo className="text-[10px]" />
              {canResend ? "Resend OTP" : `Resend in ${countdown}s`}
            </button>
          </>
        )}

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      <div className="p-4 border-t border-violet-100 bg-white">
        <button
          type="button"
          disabled={loading}
          onClick={step === 1 ? sendOtp : verifyAndConvert}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 shadow-lg shadow-violet-200 disabled:opacity-60 active:scale-[0.99] transition"
        >
          {loading ? (
            "Please wait…"
          ) : step === 1 ? (
            <>
              Send OTP <FaMobileAlt className="text-sm" />
            </>
          ) : (
            <>
              Verify & continue <FaCheck className="text-sm" />
            </>
          )}
        </button>
      </div>
      </div>
    </div>
  );
}
