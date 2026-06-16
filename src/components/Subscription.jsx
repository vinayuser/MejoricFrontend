import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import {
  FaCheck,
  FaTimes,
  FaCrown,
  FaStar,
  FaRocket,
  FaLock,
} from "react-icons/fa";
import toast from "react-hot-toast";

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(null);

  const razorpayKey = "rzp_live_SVXnEDUa7IpGc8";

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = (plan) => {
    if (!window.Razorpay) {
      toast.error("Payment gateway is loading. Please try again in a moment.");
      return;
    }

    setLoading(plan.name);

    const amount =
      billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly;
    const amountInPaise = amount * 100;

    const options = {
      key: razorpayKey,
      amount: amountInPaise,
      currency: "INR",
      name: "Mejoric",
      description: `${plan.name} - ${billingCycle === "monthly" ? "Monthly" : "Yearly"} Subscription`,
      image: "https://mejoric.com/logo512.png",
      handler: function (response) {
        toast.success(
          `Payment Successful! Payment ID: ${response.razorpay_payment_id}`,
        );
        setLoading(null);
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

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on("payment.failed", function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setLoading(null);
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Basic",
      price: { monthly: 499, yearly: 4990 },
      description: "Perfect for getting started",
      features: [
        "Access to mentor profiles",
        "Basic matching algorithm",
        "Email support",
        "Community access",
        "5 mentor connections per month",
      ],
      icon: <FaStar />,
      popular: false,
    },
    {
      name: "Professional",
      price: { monthly: 999, yearly: 9990 },
      description: "Best for regular mentorship",
      features: [
        "Everything in Basic",
        "Advanced matching algorithm",
        "Priority support",
        "Unlimited mentor connections",
        "Video call sessions (5/month)",
        "Personalized development plan",
        "Progress tracking",
      ],
      icon: <FaCrown />,
      popular: true,
    },
    {
      name: "Enterprise",
      price: { monthly: 2499, yearly: 24990 },
      description: "For complete transformation",
      features: [
        "Everything in Professional",
        "Dedicated mentor manager",
        "Unlimited video calls",
        "1-on-1 coaching sessions",
        "Custom learning paths",
        "Career guidance",
        "24/7 priority support",
        "Certificate of completion",
      ],
      icon: <FaRocket />,
      popular: false,
    },
  ];

  return (
    <Layout activePage="Subscription">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Unlock your potential with our tailored mentorship programs
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span
                className={`text-lg ${billingCycle === "monthly" ? "text-purple-700 font-semibold" : "text-gray-500"}`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly",
                  )
                }
                className="relative w-16 h-8 bg-purple-600 rounded-full p-1 transition-colors duration-300"
              >
                <div
                  className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    billingCycle === "yearly"
                      ? "translate-x-8"
                      : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`text-lg ${billingCycle === "yearly" ? "text-purple-700 font-semibold" : "text-gray-500"}`}
              >
                Yearly
              </span>
              {billingCycle === "yearly" && (
                <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                  Save 20%!
                </span>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 ${
                  plan.popular
                    ? "ring-4 ring-purple-500 transform scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="bg-purple-600 text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`text-3xl ${plan.popular ? "text-purple-600" : "text-pink-500"}`}
                    >
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {plan.name}
                    </h3>
                  </div>

                  <p className="text-gray-500 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-purple-700">
                      ₹
                      {billingCycle === "monthly"
                        ? plan.price.monthly
                        : plan.price.yearly}
                    </span>
                    <span className="text-gray-500">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <FaCheck className="text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePayment(plan)}
                    disabled={loading === plan.name}
                    className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.popular
                        ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    }`}
                  >
                    {loading === plan.name ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaLock className="text-sm" /> Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FaLock className="text-sm" /> Pay ₹
                        {billingCycle === "monthly"
                          ? plan.price.monthly
                          : plan.price.yearly}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-purple-600 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  Can I cancel my subscription anytime?
                </h3>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time. Your access
                  will continue until the end of your billing period.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit cards, debit cards, UPI, and net
                  banking.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-gray-600">
                  Yes, we offer a 7-day free trial on all plans. No credit card
                  required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscription;
