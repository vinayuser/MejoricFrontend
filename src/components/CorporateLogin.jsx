import React, { useState, useEffect, useRef } from "react";
import {
  FaEnvelope,
  FaUser,
  FaArrowLeft,
  FaRedo,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaShieldAlt,
  FaUsers,
  FaChartBar,
  FaBuilding,
  FaLock,
  FaArrowRight,
  FaUserPlus,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isCorporateShell } from "../utils/corporateSite";
import { apiGet, apiPost, apiPut } from "../utils/api";
import { getFCMToken } from "../utils/fcm";
import toast from "react-hot-toast";
import logo from "../img/logo.png";
import workspaceIllustration from "../assets/img/corporate-workspace.svg";
import CompanySelect from "./CompanySelect";
import "./CorporateLogin.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_EMAIL_KEY = "corporate_remember_email";

const LEFT_FEATURES = [
  {
    icon: FaShieldAlt,
    title: "Secure & Trusted",
    description:
      "Bank-level security to keep your data and organization safe.",
  },
  {
    icon: FaUsers,
    title: "Team Collaboration",
    description: "Work together efficiently with your team in one place.",
  },
  {
    icon: FaChartBar,
    title: "Smart Insights",
    description: "Get real-time insights and make smarter decisions.",
  },
];

function CorporateAuthHeader() {
  return (
    <header className="corp-auth-header">
      <Link to="/corporate/login" className="corp-auth-brand">
        <img src={logo} alt="Mejoric" />
        <span>Mejoric</span>
      </Link>
    </header>
  );
}

const CONSUMER_SITE_URL = "https://mejoric.com";

function CorporateAuthFooter() {
  return (
    <footer className="corp-auth-footer">
      <span>© 2026 Mejoric. All rights reserved.</span>
      <div className="corp-auth-footer-links">
        <a
          href={`${CONSUMER_SITE_URL}/privacy-policy`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
        <a
          href={`${CONSUMER_SITE_URL}/terms-and-conditions`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>
        <a
          href={`${CONSUMER_SITE_URL}/contact`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact Us
        </a>
      </div>
    </footer>
  );
}

function LeftPanel({ isSignup }) {
  return (
    <div className="corp-auth-left">
      <h1>
        {isSignup ? (
          <>
            Join your <span>team!</span>
          </>
        ) : (
          <>
            Welcome <span>back!</span>
          </>
        )}
      </h1>
      <p className="corp-auth-left-sub">
        {isSignup
          ? "Create your corporate account and access wellness support through your organization."
          : "Sign in to access your corporate account and manage your organization seamlessly."}
      </p>
      <div className="corp-auth-features">
        {LEFT_FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="corp-auth-feature">
              <div className="corp-auth-feature-icon">
                <Icon />
              </div>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <img
        src={workspaceIllustration}
        alt=""
        className="corp-auth-illustration"
      />
    </div>
  );
}

export default function CorporateLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [view, setView] = useState("login");
  const [step, setStep] = useState(1);
  const [isFirstSignup, setIsFirstSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resolvedCompany, setResolvedCompany] = useState(null);
  const [isOwnerFlow, setIsOwnerFlow] = useState(false);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const [form, setForm] = useState({
    corporateId: "",
    name: "",
    email: "",
    age: "",
    city: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setForm((prev) => ({ ...prev, email: saved }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("/corporate/active", true);
        if (res?.success && Array.isArray(res.data)) {
          setCompanies(res.data);
        }
      } catch (err) {
        console.error(err);
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

  const matchCompanyFromEmail = (email) => {
    const domain = email?.trim().toLowerCase().split("@")[1];
    if (!domain) return null;
    return companies.find((c) => c.emailDomain?.toLowerCase() === domain) || null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");

    if (name === "email") {
      const matched = matchCompanyFromEmail(value);
      if (matched) {
        setResolvedCompany(matched);
        if (view === "signup") {
          setForm((prev) => ({ ...prev, corporateId: matched._id }));
        }
      } else {
        setForm((prev) => {
          if (view === "signup") {
            const manual = companies.find((c) => c._id === prev.corporateId);
            setResolvedCompany(manual || null);
          } else {
            setResolvedCompany(null);
          }
          return prev;
        });
      }
    }
  };

  const handleCompanySelect = (corporateId) => {
    const company = companies.find((c) => c._id === corporateId);
    setForm((prev) => ({ ...prev, corporateId }));
    setResolvedCompany(company || null);
    setError("");
  };

  const validateEmail = () => {
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) {
      setError("Please enter a valid work email");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!validateEmail()) return false;
    if (!form.corporateId) {
      setError("Please select your company");
      return false;
    }
    const selected = companies.find((c) => c._id === form.corporateId);
    if (!selected) {
      setError("Please select a valid company");
      return false;
    }
    const domain = form.email.trim().toLowerCase().split("@")[1];
    if (domain !== selected.emailDomain?.toLowerCase()) {
      setError(`Email must belong to @${selected.emailDomain}`);
      return false;
    }
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Please enter your name");
      return false;
    }
    const age = parseInt(form.age, 10);
    if (!age || age < 18 || age > 100) {
      setError("Age must be between 18 and 100");
      return false;
    }
    if (!form.city.trim() || form.city.trim().length < 2) {
      setError("Please enter your city");
      return false;
    }
    return true;
  };

  const buildOtpPayload = () => {
    const isSignupFlow = view === "signup" || isFirstSignup;
    const payload = {
      email: form.email.trim().toLowerCase(),
      mode: isSignupFlow ? "signup" : "login",
    };
    if (isSignupFlow && form.corporateId) payload.corporateId = form.corporateId;
    if (isSignupFlow) {
      payload.name = form.name.trim();
      payload.age = form.age;
      payload.city = form.city.trim();
    }
    return payload;
  };

  const persistRememberEmail = () => {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, form.email.trim().toLowerCase());
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }
  };

  const sendOtp = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiPost("/corporate/send-otp", buildOtpPayload(), true);
      if (res?.success) {
        const firstTime = Boolean(res.data?.isFirst);
        const ownerLogin = Boolean(res.data?.isOwner);
        setIsFirstSignup(firstTime);
        setIsOwnerFlow(ownerLogin);
        persistRememberEmail();

        if (res.data?.corporateId) {
          setForm((prev) => ({ ...prev, corporateId: res.data.corporateId }));
        }
        if (res.data?.companyName) {
          setResolvedCompany({
            _id: res.data.corporateId,
            name: res.data.companyName,
          });
        }

        if (view === "login" && firstTime && !ownerLogin) {
          setError("No account found with this email. Please sign up.");
          return false;
        }

        setStep(2);
        setCountdown(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        toast.success("OTP sent to your email");
        return true;
      }
      setError(res?.message || "Failed to send OTP");
      return false;
    } catch (err) {
      setError(err?.message || "Failed to send OTP");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    await sendOtp();
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    await sendOtp();
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs[index + 1].current?.focus();
    setError("");
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
      inputRefs[index - 1].current?.focus();
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
    inputRefs[5].current?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    if (isFirstSignup && !isOwnerFlow && !validateSignup()) return;

    setIsLoading(true);
    setError("");
    try {
      let fcmToken = localStorage.getItem("fcmToken") || null;
      try {
        fcmToken =
          (await Promise.race([
            getFCMToken(),
            new Promise((resolve) => setTimeout(() => resolve(fcmToken), 2000)),
          ])) || fcmToken;
      } catch {
        /* optional */
      }
      const isSignupFlow = view === "signup" || isFirstSignup;
      const payload = {
        email: form.email.trim().toLowerCase(),
        otp: otpCode,
        fcmToken,
        mode: isSignupFlow ? "signup" : "login",
      };
      if (isSignupFlow && form.corporateId) payload.corporateId = form.corporateId;
      if (isFirstSignup && !isOwnerFlow) {
        payload.name = form.name.trim();
        payload.age = form.age;
        payload.city = form.city.trim();
      }

      const res = await apiPut("/corporate/verify-otp", payload, true);
      if (res?.success && res.data?.user) {
        login({
          ...res.data.user,
          token: res.data.token,
          corporateUsage: res.data.corporateUsage,
        });
        toast.success("Welcome to Mejoric!");
        if (res.data.user.corporateRole === "owner") {
          navigate("/corporate/owner/dashboard");
        } else {
          navigate("/mate");
        }
      } else {
        setError(res?.message || "Verification failed");
      }
    } catch (err) {
      const msg = err?.message || "Verification failed";
      setError(msg);
      if (isFirstSignup && /name|city|age|sign up|register/i.test(msg)) {
        setView("signup");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLogin = () => {
    setView("login");
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setIsFirstSignup(false);
    setIsOwnerFlow(false);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp(["", "", "", "", "", ""]);
      setError("");
    } else {
      resetToLogin();
    }
  };

  const companyLabel = resolvedCompany?.name;
  const isSignupView = view === "signup";
  const showSignupProfileOnOtp = step === 2 && isFirstSignup;

  const cardTitle =
    step === 2
      ? "Verify OTP"
      : isSignupView
        ? "Corporate Sign Up"
        : "Corporate Login";

  const cardSubtitle =
    step === 2
      ? `Enter the code sent to ${form.email}`
      : isSignupView
        ? "Create your account with your work email"
        : "Sign in with your work email or billing contact email";

  return (
    <div className="corp-auth-page">
      <div className="corp-auth-dots" aria-hidden="true" />
      <CorporateAuthHeader />

      <main className="corp-auth-main">
        <LeftPanel isSignup={isSignupView} />

        <div className="corp-auth-right">
          <div className="corp-auth-card">
            <div className="corp-auth-card-body">
              {(step === 2 || isSignupView) && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="corp-auth-back-btn"
                >
                  <FaArrowLeft />
                  {step === 2 ? "Change email" : "Back to login"}
                </button>
              )}

              <div className="corp-auth-card-icon-wrap">
                <FaBuilding />
                <div className="corp-auth-card-icon-badge">
                  <FaShieldAlt />
                </div>
              </div>
              <h2 className="corp-auth-card-title">{cardTitle}</h2>
              <p className="corp-auth-card-subtitle">{cardSubtitle}</p>

              {error && <div className="corp-auth-error">{error}</div>}

              {step === 1 && !isSignupView ? (
                <form onSubmit={handleLoginSubmit}>
                  <div className="corp-auth-field">
                    <label htmlFor="email" className="corp-auth-label">
                      Work email
                    </label>
                    <div className="corp-auth-input-wrap">
                      <FaEnvelope className="corp-auth-input-icon" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className="corp-auth-input"
                      />
                    </div>
                    {companyLabel && (
                      <p className="corp-auth-company-hint">
                        Signing in to {companyLabel}
                      </p>
                    )}
                  </div>

                  <div className="corp-auth-row">
                    <label className="corp-auth-remember">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Remember me
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="corp-auth-primary-btn"
                  >
                    <FaLock />
                    <span>
                      {isLoading ? "Sending OTP..." : "Continue with email"}
                    </span>
                    <FaArrowRight className="corp-auth-btn-arrow" />
                  </button>
                </form>
              ) : step === 1 && isSignupView ? (
                <form onSubmit={handleSignupSubmit} className="corp-auth-form-stack">
                  <div className="corp-auth-field">
                    <CompanySelect
                      id="signup-corporateId"
                      label="Select company"
                      companies={companies}
                      value={form.corporateId}
                      onChange={handleCompanySelect}
                      loading={loadingCompanies}
                    />
                  </div>
                  <div className="corp-auth-field">
                    <label htmlFor="signup-email" className="corp-auth-label">
                      Work email
                    </label>
                    <div className="corp-auth-input-wrap">
                      <FaEnvelope className="corp-auth-input-icon" />
                      <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        required
                        className="corp-auth-input"
                      />
                    </div>
                    {companyLabel && (
                      <p className="corp-auth-company-hint">
                        Signing up for {companyLabel}
                      </p>
                    )}
                    {!loadingCompanies &&
                      form.email.includes("@") &&
                      !companyLabel && (
                        <p className="corp-auth-company-hint warn">
                          No corporate plan found for this domain
                        </p>
                      )}
                  </div>

                  <div className="corp-auth-field">
                    <label htmlFor="name" className="corp-auth-label">
                      Full name
                    </label>
                    <div className="corp-auth-input-wrap">
                      <FaUser className="corp-auth-input-icon" />
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                        className="corp-auth-input"
                      />
                    </div>
                  </div>

                  <div className="corp-auth-form-grid corp-auth-field">
                    <div>
                      <label htmlFor="age" className="corp-auth-label">
                        Age
                      </label>
                      <div className="corp-auth-input-wrap">
                        <FaBirthdayCake className="corp-auth-input-icon" />
                        <input
                          id="age"
                          name="age"
                          type="number"
                          min="18"
                          max="100"
                          value={form.age}
                          onChange={handleChange}
                          placeholder="18+"
                          required
                          className="corp-auth-input"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="city" className="corp-auth-label">
                        City
                      </label>
                      <div className="corp-auth-input-wrap">
                        <FaMapMarkerAlt className="corp-auth-input-icon" />
                        <input
                          id="city"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Your city"
                          required
                          className="corp-auth-input"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || loadingCompanies}
                    className="corp-auth-primary-btn"
                  >
                    <FaLock />
                    <span>
                      {isLoading ? "Sending OTP..." : "Continue with email"}
                    </span>
                    <FaArrowRight className="corp-auth-btn-arrow" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div
                    className="corp-auth-otp-grid"
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
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="corp-auth-otp-input"
                      />
                    ))}
                  </div>

                  {showSignupProfileOnOtp && !isOwnerFlow && (
                    <div className="corp-auth-form-stack mb-4 pt-2 border-t border-purple-100">
                      <p className="text-sm text-gray-600 text-center m-0">
                        Complete your profile to finish sign up
                      </p>
                      <div>
                        <label htmlFor="otp-name" className="corp-auth-label">
                          Full name
                        </label>
                        <input
                          id="otp-name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="corp-auth-input corp-auth-input-plain w-full"
                        />
                      </div>
                      <div className="corp-auth-form-grid">
                        <div>
                          <label htmlFor="otp-age" className="corp-auth-label">
                            Age
                          </label>
                          <input
                            id="otp-age"
                            name="age"
                            type="number"
                            min="18"
                            max="100"
                            value={form.age}
                            onChange={handleChange}
                            placeholder="18+"
                            className="corp-auth-input corp-auth-input-plain w-full"
                          />
                        </div>
                        <div>
                          <label htmlFor="otp-city" className="corp-auth-label">
                            City
                          </label>
                          <input
                            id="otp-city"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="Your city"
                            className="corp-auth-input corp-auth-input-plain w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || otp.some((d) => d === "")}
                    className="corp-auth-primary-btn"
                  >
                    <FaLock />
                    <span>
                      {isLoading
                        ? "Verifying..."
                        : isFirstSignup && !isOwnerFlow
                          ? "Create account"
                          : "Verify & sign in"}
                    </span>
                    <FaArrowRight className="corp-auth-btn-arrow" />
                  </button>

                  <div className="corp-auth-resend">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={isLoading}
                        className="corp-auth-link inline-flex items-center gap-1.5"
                      >
                        <FaRedo
                          className={`text-xs ${isLoading ? "animate-spin" : ""}`}
                        />
                        Resend OTP
                      </button>
                    ) : (
                      <>
                        Resend OTP in{" "}
                        <span className="text-purple-700 font-semibold">
                          {countdown}s
                        </span>
                      </>
                    )}
                  </div>
                </form>
              )}
            </div>

            {step === 1 && !isSignupView && (
              <div className="corp-auth-signup-box">
                <p>New to Mejoric corporate?</p>
                <button
                  type="button"
                  onClick={() => {
                    setView("signup");
                    setError("");
                  }}
                  className="corp-auth-outline-btn"
                >
                  <FaUserPlus />
                  Sign up your organization
                </button>
              </div>
            )}

            {step === 1 && isSignupView && (
              <div className="corp-auth-signup-box">
                <p>Already have an account?</p>
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="corp-auth-outline-btn"
                >
                  Back to login
                </button>
              </div>
            )}

            <div className="corp-auth-secure-note">
              <FaLock />
              Your data is encrypted and secure
              <span className="dot">•</span>
              Trusted by businesses worldwide
            </div>
          </div>

          {!isCorporateShell() && step === 1 && !isSignupView && (
            <p className="corp-auth-alt-link-wrap">
              Regular user?{" "}
              <Link to="/login" className="corp-auth-link">
                Standard login
              </Link>
            </p>
          )}

        </div>
      </main>

      <CorporateAuthFooter />
    </div>
  );
}
