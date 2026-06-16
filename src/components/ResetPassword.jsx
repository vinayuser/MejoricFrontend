import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiPost } from '../utils/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [role, setRole] = useState('user'); // Default to 'user'

  // Get token and role from URL query parameter
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const roleParam = searchParams.get('role');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
    
    if (roleParam === 'mate' || roleParam === 'user') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Basic validation
    if (!formData.email || !formData.newPassword || !formData.confirmNewPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Password validation
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    // Password match validation
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Reset password API call
    try {
      const data = await apiPost('/auth/reset-password', {
        email: formData.email,
        role: role, // Use role from URL query parameter
        token: token,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      }, true); // skipAuth = true for reset password

      if (data.success) {
        setSuccess(true);
        setFormData({
          email: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.message || 'Failed to reset password. Please try again or check your connection.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout activePage="ResetPassword">
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-6 transition-colors"
          >
            <FaArrowLeft />
            <span className="font-medium">Back to Login</span>
          </button>

          {/* Reset Password Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600">
                Enter your email and create a new password
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <p className="font-semibold mb-1">Password Reset Successfully! ✅</p>
                <p>
                  Your password has been reset. You can now login with your new password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Reset Password Form */}
            {!success && token && (
              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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

                {/* New Password Field */}
                <div className="mb-6">
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-purple-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
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

                {/* Confirm New Password Field */}
                <div className="mb-6">
                  <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-purple-500" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="w-full pl-12 pr-12 py-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-500 hover:text-purple-700 transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            <p className="mt-8 text-center text-gray-600">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-purple-600 hover:text-purple-600 font-semibold transition-colors"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
