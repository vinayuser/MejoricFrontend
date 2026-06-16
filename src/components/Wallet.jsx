import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import {
  FaWallet,
  FaPlus,
  FaHistory,
  FaCreditCard,
  FaLock,
  FaRupeeSign,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { trackPixel, trackPixelCustom } from "../utils/metaPixel";
import { apiPost, apiGet } from "../utils/api";
import toast from "react-hot-toast";

const Wallet = () => {
  const { walletBalance, addToWallet, refreshWalletBalance } = useAuth();
  const [balance, setBalance] = useState(walletBalance);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const razorpayKey = "rzp_live_SVXnEDUa7IpGc8";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch wallet balance from API
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const result = await apiGet("/wallet");
        if (result.success && result.data) {
          // Response has { data: { balances: { INR: 100 } } }
          const inrBalance = result.data.balances?.INR || 0;
          setBalance(inrBalance);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchWalletBalance();
  }, []);

  // Fetch wallet transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoadingTransactions(true);
        const result = await apiGet(
          "/wallet/history?page=1&limit=10&currency=INR&status=SUCCESS",
        );
        if (result.success && result.data?.data) {
          // Transform API response to component format
          const transformedTransactions = result.data.data.map((tx) => ({
            id: tx._id,
            type: tx.type === "CREDIT" ? "credit" : "debit",
            amount: tx.amount,
            description: tx.description || tx.source || "Wallet Transaction",
            date: new Date(tx.createdAt).toISOString().split("T")[0],
          }));
          setTransactions(transformedTransactions);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, []);

  // Automatic mock recharge for local development conversion flow
  useEffect(() => {
    const isLocal =
      import.meta.env.VITE_APP_ENV === "local" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const redirectMateId = localStorage.getItem("redirect_mate_id");

    if (isLocal && redirectMateId && !loading) {
      console.log("Auto-recharging 10 INR for local conversion flow...");
      // Set amount to 10 for the mock flow
      setAmount("10");
      // Give it a tiny delay to ensure everything is initialized
      const timer = setTimeout(() => {
        handleAutoMockRecharge("10");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAutoMockRecharge = async (rechargeAmount) => {
    setLoading(true);
    console.log("Starting auto mock recharge...");
    try {
      // Step 1: Create order on backend first
      const orderData = await apiPost("/wallet/order/create", {
        amount: parseFloat(rechargeAmount),
        currency: "INR",
      });

      const orderId = orderData.orderId || orderData.data?.razorpayOrderId;

      if (!orderData.success || !orderId) {
        toast.error("Failed to create auto-payment order.");
        setLoading(false);
        return;
      }

      console.log("Auto order created:", orderId);
      const mockResponse = {
        razorpay_order_id: orderId,
        razorpay_payment_id: `mock_pay_${Date.now()}`,
        razorpay_signature: "mock_signature",
      };

      const verifyData = {
        razorpayOrderId: mockResponse.razorpay_order_id,
        razorpayPaymentId: mockResponse.razorpay_payment_id,
        razorpaySignature: mockResponse.razorpay_signature,
        amount: parseFloat(rechargeAmount),
        currency: "INR",
      };

      const result = await apiPost("/wallet/verify", verifyData);
      if (result.success) {
        console.log("Auto mock verification success!");
        onPaymentSuccess(
          mockResponse.razorpay_payment_id,
          parseFloat(rechargeAmount),
        );
      } else {
        toast.error("Auto mock payment failed");
      }
    } catch (error) {
      console.error("Auto mock error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPaymentSuccess = async (razorpayPaymentId, successAmount) => {
    const finalAmount = successAmount || parseFloat(amount);
    const newTransaction = {
      id: Date.now(),
      type: "credit",
      amount: finalAmount,
      description: "Wallet Top-up",
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions([newTransaction, ...transactions]);
    addToWallet(finalAmount);

    // Refresh wallet balance from backend
    refreshWalletBalance();

    setAmount("");
    // Track Meta Pixel Purchase event
    trackPixel("Purchase", {
      value: finalAmount,
      currency: "INR",
    });

    // Track Meta Pixel WalletCreditGranted custom event
    trackPixelCustom("WalletCreditGranted", {
      amount: finalAmount,
      currency: "INR",
    });
    toast.success(`Payment Successful! Payment ID: ${razorpayPaymentId}`);

    const redirectMateId = localStorage.getItem("redirect_mate_id");
    const redirectType = localStorage.getItem("redirect_type");
    if (redirectMateId) {
      // Clear the redirect data so it doesn't trigger again
      localStorage.removeItem("redirect_mate_id");
      localStorage.removeItem("redirect_type");

      // Determine whether to auto-call or auto-chat
      const param =
        redirectType === "chat" ? "auto_chat=true" : "auto_call=true";
      window.location.href = `/mate-profile/${redirectMateId}?${param}`;
    }
  };

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Payment gateway is loading. Please try again in a moment.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create order on backend first
      console.log("Creating Razorpay order on backend...");
      const token = localStorage.getItem("authToken");

      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/wallet/order/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ amount: parseFloat(amount), currency: "INR" }),
        },
      );

      const orderData = await orderResponse.json();
      console.log("Order response:", orderData);

      // Check for orderId in response (could be in data or directly)
      const orderId = orderData.orderId || orderData.data?.razorpayOrderId;

      if (!orderData.success || !orderId) {
        toast.error("Failed to create payment order. Please try again.");
        setLoading(false);
        return;
      }

      // Local mock payment bypass
      const isLocal =
        import.meta.env.VITE_APP_ENV === "local" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isLocal) {
        console.log("Local environment detected, using mock payment...");
        setTimeout(async () => {
          try {
            const mockResponse = {
              razorpay_order_id: orderId,
              razorpay_payment_id: `mock_pay_${Date.now()}`,
              razorpay_signature: "mock_signature",
            };

            const verifyData = {
              razorpayOrderId: mockResponse.razorpay_order_id,
              razorpayPaymentId: mockResponse.razorpay_payment_id,
              razorpaySignature: mockResponse.razorpay_signature,
              amount: parseFloat(amount), // Send amount for mock verification
              currency: "INR",
            };

            const result = await apiPost("/wallet/verify", verifyData);
            if (result.success) {
              onPaymentSuccess(mockResponse.razorpay_payment_id);
            } else {
              toast.error("Mock payment verification failed");
            }
          } catch (error) {
            console.error("Mock payment error:", error);
            toast.error("Mock payment failed");
          } finally {
            setLoading(false);
          }
        }, 1500);
        return;
      }

      const amountInPaise = parseFloat(amount) * 100;

      // Step 2: Open Razorpay checkout with the order from backend
      const options = {
        key: razorpayKey,
        amount: amountInPaise,
        currency: "INR",
        name: "Mejoric",
        description: "Wallet Top-up",
        image: "https://mejoric.com/logo512.png",
        order_id: orderId,
        handler: async function (response) {
          console.log("Full Razorpay response:", response);
          setLoading(true);
          try {
            // Step 3: Verify payment on backend
            const razorpayOrderId = response.razorpay_order_id;
            const razorpayPaymentId = response.razorpay_payment_id;
            const razorpaySignature = response.razorpay_signature;

            console.log("razorpayOrderId:", razorpayOrderId);
            console.log("razorpayPaymentId:", razorpayPaymentId);
            console.log("razorpaySignature:", razorpaySignature);

            const verifyData = {
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
            };
            console.log(verifyData, "Verification data");

            const result = await apiPost("/wallet/verify", verifyData);

            if (result.success) {
              onPaymentSuccess(response.razorpay_payment_id);
            } else {
              toast.error(
                "Payment verification failed. Please contact support.",
              );
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on("payment.failed", function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setLoading(false);
      });
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Failed to create payment order. Please try again.");
      setLoading(false);
    }
  };

  const quickAmounts = [100, 250, 500, 1000, 2000, 5000];
  return (
    <Layout activePage="Wallet">
      <div className="min-h-screen   py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-4">
              My Wallet
            </h1>
            <p className="text-xl text-gray-600">
              Add money to your wallet and use it for mentor sessions
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Wallet Balance Card */}
            <div className="bg-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaWallet className="text-3xl" />
                  <span className="text-xl font-semibold">Wallet Balance</span>
                </div>
              </div>
              <div className="text-5xl font-bold mb-2">
                <FaRupeeSign className="inline mr-1" />
                {balance.toLocaleString("en-IN")}
              </div>
              <p className="text-purple-200">Available for mentor sessions</p>
            </div>

            {/* Add Money Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaPlus className="text-purple-600" />
                Add Money to Wallet
              </h2>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className={`py-3 rounded-xl font-semibold transition-all duration-300 ${
                      amount === amt.toString()
                        ? "bg-purple-600 text-white shadow-lg"
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-gray-600 mb-2 font-medium">
                    Enter Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-purple-100 focus:border-purple-500 focus:outline-none text-lg"
                  />
                </div>
                <div className="md:pt-8">
                  <button
                    onClick={() => {
                      // Track Facebook Pixel InitiateCheckout event
                      trackPixel("InitiateCheckout");

                      // Track Google Analytics add_payment_info event
                      if (typeof window.gtag === "function") {
                        window.gtag("event", "add_payment_info", {
                          currency: "INR",
                          value: parseFloat(amount) || 0,
                          items: [
                            {
                              item_id: "wallet_topup",
                              item_name: "Wallet Top-up",
                              item_category: "Payment",
                            },
                          ],
                        });
                        console.log(
                          "Google Analytics: add_payment_info event tracked",
                        );
                      }
                      handleAddMoney();
                    }}
                    disabled={loading || !amount}
                    className={`w-full md:w-auto px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                      loading || !amount
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {loading ? (
                      <>
                        <FaLock className="text-sm" /> Processing...
                      </>
                    ) : (
                      <>
                        <FaCreditCard /> Add Money
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-gray-500 text-sm flex items-center gap-2">
                <FaLock className="text-green-500" />
                Secure payment powered by Razorpay
              </p>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaHistory className="text-purple-600" />
                Transaction History
              </h2>

              {isLoadingTransactions ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            transaction.type === "credit"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <FaPlus />
                          ) : (
                            <FaWallet />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          transaction.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}₹
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
