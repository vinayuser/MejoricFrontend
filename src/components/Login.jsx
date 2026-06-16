import React, { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../utils/api";
import { getFCMToken } from "../utils/fcm";
import { trackPixel, trackPixelCustom } from "../utils/metaPixel";
import toast from "react-hot-toast";
import banner from "../assets/img/banner.jpeg";
export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("user"); // default to 'user', can be 'user' or 'mate'

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && (roleParam === "user" || roleParam === "mate")) {
      setSelectedRole(roleParam);
    } else {
      setSelectedRole("user");
    }
  }, [searchParams]);

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
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Role validation
    if (!selectedRole) {
      setError("Please select a login type");
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

    // Login API call
    try {
      const data = await apiPost(
        "/auth/login",
        {
          type: "email",
          email: formData.email,
          password: formData.password,
          role: selectedRole,
          fcmToken: localStorage.getItem("fcmToken"),
        },
        true,
      );

      if (data.success) {
        // API: { success, message, data: { user, token } }
        const payload = data.data || data;
        const token = payload?.token ?? data.token;
        const apiUser = payload?.user ?? data.user;
        const apiRole = apiUser?.role || selectedRole;

        setSelectedRole(apiRole);

        console.log("Fetched User Role:", apiRole);
        console.log("Fetched User Data:", apiUser);

        const userData = {
          ...(apiUser || {}),
          token,
          role: apiRole,
        };

        if (token) {
          localStorage.setItem("authToken", token);
        }

        login(userData);

        // Track Meta Pixel LoginSuccess event
        trackPixelCustom("LoginSuccess", {
          role: apiRole,
          email: formData.email,
        });

        // Navigate based on role
        if (apiRole === "mate") {
          toast.success("Login successful!");
          navigate("/dashboard");
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
        const errorMsg =
          data.message || "Login failed. Please check your credentials.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err.message ||
        "Login failed. Please try again or check your connection.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout activePage="Login">
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

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back!
              </h1>
              <p className="text-gray-600">Login to continue your journey</p>
            </div>

            <img src={banner} />
            {/* Role Selection */}
            <div className="mb-2">
              <div
                className={`grid gap-4 ${selectedRole ? "grid-cols-1" : "grid-cols-2"}`}
              ></div>
              {/* Change Role Button */}
              {selectedRole && (
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="mt-3 text-sm text-purple-600 hover:text-purple-600 font-medium transition-colors"
                ></button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-pulse">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-6">
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
              <div className="mb-6">
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
                    placeholder="Enter your password"
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-purple-600 hover:text-purple-600 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
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
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-purple-600 hover:text-purple-600 font-semibold transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
        </div>
      </div>
    </Layout>
  );
}
