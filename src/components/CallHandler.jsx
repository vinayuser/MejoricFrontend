import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaVideo, FaWallet, FaSignInAlt, FaRupeeSign } from "react-icons/fa";
import { trackPixelCustom, trackPixel } from "../utils/metaPixel";

const CallHandler = ({ mentor, children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, walletBalance } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const pricePerMinute = mentor?.price || 12;
  const minimumBalance = pricePerMinute * 5; // At least 5 minutes

  const handleCallClick = () => {
    setError("");

    // Check if user is logged in
    if (!isAuthenticated) {
      setShowModal(true);
      setError("Please login to start a call");
      trackPixelCustom("AuthPromptShown", { context: "CallHandler" });
      return;
    }

    // Check wallet balance
    if (walletBalance < minimumBalance) {
      setShowModal(true);
      setError(
        `Insufficient balance. Minimum ₹${minimumBalance} required for 5 minutes call.`,
      );
      trackPixelCustom("RechargePromptShown", {
        balance: walletBalance,
        required: minimumBalance,
        mentor: mentor?.name,
      });
      return;
    }

    // Proceed to video call
    navigate(
      `/video-call?mentor=${encodeURIComponent(mentor?.name || "Mentor")}&price=${pricePerMinute}`,
    );
  };

  const handleLoginRedirect = () => {
    setShowModal(false);
    navigate("/login");
  };

  const handleWalletRedirect = () => {
    setShowModal(false);
    navigate("/wallet");
  };

  return (
    <>
      <div onClick={handleCallClick} className="cursor-pointer">
        {children}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaVideo className="text-white text-3xl" />
              </div>
              <h3 className="text-white text-xl font-bold">
                {!isAuthenticated ? "Login Required" : "Recharge Required"}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-center">
                  {error}
                </div>
              )}

              {!isAuthenticated ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    Please login to connect with mentors and start video calls.
                  </p>
                  <button
                    onClick={handleLoginRedirect}
                    className="w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-purple-700 transition-colors"
                  >
                    <FaSignInAlt /> Login Now
                  </button>
                </div>
              ) : (
                <div>
                  <div className="bg-purple-50 rounded-2xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">
                        Your Current Balance
                      </span>
                      <span className="text-2xl font-bold text-purple-700">
                        <FaRupeeSign className="inline" />
                        {walletBalance}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Minimum Required</span>
                      <span className="font-semibold text-gray-700">
                        <FaRupeeSign className="inline" />
                        {minimumBalance}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleWalletRedirect}
                    className="w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-purple-700 transition-colors mb-3"
                  >
                    <FaWallet /> Recharge Wallet
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-3 text-gray-500 py-2 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CallHandler;
