import React, { useState } from 'react';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiPost } from '../utils/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState(null); // null = show both options, 'user' or 'mate' = selected role
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    // Role validation
    if (!selectedRole) {
      setError('Please select a login type');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Forgot password API call
    try {
      const data = await apiPost('/auth/forgot-password', {
        email: email,
        platform: 'WEB',
        role: selectedRole
      }, true); // skipAuth = true for forgot password

      if (data.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMessage = err.message || 'Failed to send reset email. Please try again or check your connection.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout activePage="ForgotPassword">
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

          {/* Forgot Password Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <p className="font-semibold mb-1">Email Sent Successfully! 📧</p>
                <p>
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Forgot Password Form */}
            {!success && (
              <form onSubmit={handleSubmit}>
                {/* Role Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Login Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* User Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('user')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedRole === 'user'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-2xl mb-2 ${selectedRole === 'user' ? 'text-purple-600' : 'text-gray-600'}`}>👨‍🏫</div>
                        <p className={`font-semibold ${selectedRole === 'user' ? 'text-purple-700' : 'text-gray-700'}`}>User</p>
                      </div>
                    </button>
                    {/* Mate Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('mate')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedRole === 'mate'
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-2xl mb-2 ${selectedRole === 'mate' ? 'text-pink-500' : 'text-gray-600'}`}>🤝</div>
                        <p className={`font-semibold ${selectedRole === 'mate' ? 'text-pink-700' : 'text-gray-700'}`}>Mate</p>
                      </div>
                    </button>
                  </div>
                </div>

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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
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
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
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
