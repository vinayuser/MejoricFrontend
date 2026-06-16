import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Layout from "../components/Layout";
import Footer from "../components/Footer";

const CONFIG = {
  RAZORPAY_KEY: "rzp_live_SVXnEDUa7IpGc8",
  FORMSPREE_URL: "https://formspree.io/f/mdawjoag",
  SHEETS_URL:
    "https://script.google.com/macros/s/AKfycbxIx2CgPndtBmWojBnyfKzympEhw2iPmenwhNyZa6fLhMryUAHXhFWBzQ8n0aBmRpZM/exec",
};

export default function Certificate() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const formRef = useRef(null);

  const [activeSection, setActiveSection] = useState("chapter-1");
  const [searchTerm, setSearchTerm] = useState("");

  const chapters = [
    { id: "chapter-1", num: "1", title: "Program Overview" },
    { id: "chapter-2", num: "2", title: "What You'll Learn" },
    { id: "chapter-3", num: "3", title: "Secure Enrollment Form" },
    { id: "chapter-4", num: "4", title: "Program Support & Contact" },
  ];

  // Load Razorpay script
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

  // Track scroll position to update active side item
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const chap of chapters) {
        const element = document.getElementById(chap.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(chap.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapters]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  const filteredChapters = chapters.filter(
    (chap) =>
      chap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chap.num.includes(searchTerm)
  );

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email.";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Invalid phone number.";
    if (!form.amount || parseFloat(form.amount) <= 0)
      e.amount = "Please enter a valid amount.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const postPayment = (paymentId) => {
    const enrolledOn = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    fetch(CONFIG.FORMSPREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        Name: form.name,
        Email: form.email,
        Phone: form.phone,
        Payment_ID: paymentId,
        Amount: `Rs.${form.amount}`,
        Programme: "Psychology Certification Programme",
        Enrolled_On: enrolledOn,
      }),
    });

    fetch(CONFIG.SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        payment_id: paymentId,
        amount: form.amount,
      }),
    });
  };

  const handlePayment = () => {
    if (!validate()) return;

    setLoading(true);

    const amountInPaise = Math.round(parseFloat(form.amount) * 100);

    const rzp = new window.Razorpay({
      key: CONFIG.RAZORPAY_KEY,
      amount: amountInPaise,
      currency: "INR",
      name: "Mejoric",
      description: "Psychology Certification Programme",
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      handler: (res) => {
        postPayment(res.razorpay_payment_id);
        setSuccess(res.razorpay_payment_id);
        setLoading(false);
      },
    });

    rzp.on("payment.failed", () => {
      Swal.fire({
        icon: "error",
        text: "Your payment could not be processed. Please try again.",
        confirmButtonColor: "#9333ea",
      });
      setLoading(false);
    });

    rzp.open();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Layout activePage="Certificate Course">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Hero Banner Header */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-700 font-semibold text-sm mb-4 shadow-sm backdrop-blur-sm">
              <span>Professional Certification</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-4">
              Certificate <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Course</span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed font-medium">
              Start seeing real clients and build robust clinical/counselling skills even with zero prior experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar Table of Contents */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-6 space-y-6 max-h-[80vh] flex flex-col">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg mb-2">Program Sections</h3>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">Navigate course roadmap</p>

                  {/* Search filter in TOC */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search chapters..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    />
                    <svg
                      className="w-4 h-4 text-gray-400 absolute left-3 top-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                </div>

                <div className="overflow-y-auto pr-1 flex-1 space-y-1 scrollbar-thin scrollbar-thumb-purple-100 hover:scrollbar-thumb-purple-200">
                  {filteredChapters.map((chap) => (
                    <button
                      key={chap.id}
                      onClick={() => scrollToSection(chap.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${
                        activeSection === chap.id
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/10 scale-[1.02]"
                          : "text-gray-600 hover:bg-purple-50/50 hover:text-purple-700"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold flex items-center justify-center ${
                          activeSection === chap.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {chap.num}
                      </span>
                      <span className="truncate">{chap.title}</span>
                    </button>
                  ))}
                  {filteredChapters.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No sections match your search.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* Glassmorphic Document Metadata Summary */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-purple-100/50 shadow-xl shadow-purple-900/5 p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  Program Details Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-500 text-sm">Course name</span>
                    <span className="text-gray-900 font-bold text-sm text-left sm:text-right mt-0.5 sm:mt-0">Psychology Certification</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-500 text-sm">Provider</span>
                    <span className="text-gray-900 font-bold text-sm text-left sm:text-right mt-0.5 sm:mt-0">Mejoric Marketplace</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 sm:border-0">
                    <span className="font-semibold text-gray-500 text-sm">Mode</span>
                    <span className="text-gray-900 font-bold text-sm text-left sm:text-right mt-0.5 sm:mt-0">Online & Interactive</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between py-3">
                    <span className="font-semibold text-gray-500 text-sm">Seat Status</span>
                    <div className="flex items-center gap-1.5 mt-0.5 sm:mt-0">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                      <span className="text-green-600 font-bold text-sm">Reservations Open</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections */}
              
              {/* Chapter 1 */}
              <section id="chapter-1" className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-lg shadow-sm">
                    1
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Program Overview</h2>
                </div>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 translate-y-1/4 translate-x-1/4 scale-150">
                      <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold mb-2">Start Seeing Real Clients</h3>
                    <p className="text-purple-100 text-base md:text-lg mb-6 leading-relaxed font-medium">
                      Acquire hands-on expertise, clinical skills, and professional certification even if you have zero practical experience.
                    </p>
                    <button
                      onClick={() => scrollToSection("chapter-3")}
                      className="bg-white hover:bg-purple-50 text-purple-950 px-6 py-2.5 rounded-xl font-bold transition-all transform active:scale-95 shadow-md flex items-center gap-2"
                    >
                      Reserve Your Seat Now
                      <span>→</span>
                    </button>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    The Mejoric Psychology Certification Programme is uniquely crafted to bridge the gap between academic theories and live marketplace practice. We train you through active client scenarios, professional mentorship pipelines, and standardized clinical guidelines to help you securely and confidently launch your private consulting services.
                  </p>
                </div>
              </section>

              {/* Chapter 2 */}
              <section id="chapter-2" className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-lg shadow-sm">
                    2
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900">What You'll Learn</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/10 transition-all rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 flex-shrink-0 shadow-sm">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 mb-2 text-lg">1. Foundation</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Build a robust foundation in core psychology principles and clinical conceptualizations.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/10 transition-all rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 flex-shrink-0 shadow-sm">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 mb-2 text-lg">2. Practical Skills</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Master modern evidence-based counseling methodologies, live communication, and client handling.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/10 transition-all rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 flex-shrink-0 shadow-sm">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 mb-2 text-lg">3. Certification</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Earn an accredited certification that grants you the credentials to safely scale your counseling practice.
                      </p>
                    </div>
                  </div>

                </div>
              </section>

              {/* Chapter 3 */}
              <section id="chapter-3" ref={formRef} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-lg shadow-sm">
                    3
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Secure Enrollment Form</h2>
                </div>
                <div className="max-w-xl mx-auto">
                  {!success ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
                      <h3 className="text-xl font-bold text-center text-purple-700 mb-6">
                        Complete Your Registration
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                          <input
                            name="name"
                            type="text"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border bg-white ${
                              errors.name ? "border-red-500 focus:ring-red-500/25" : "border-gray-200 focus:ring-purple-500/25 focus:border-purple-500"
                            } focus:outline-none focus:ring-4 transition-all text-sm`}
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-500"></span>
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                          <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border bg-white ${
                              errors.email ? "border-red-500 focus:ring-red-500/25" : "border-gray-200 focus:ring-purple-500/25 focus:border-purple-500"
                            } focus:outline-none focus:ring-4 transition-all text-sm`}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-500"></span>
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                          <input
                            name="phone"
                            type="text"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border bg-white ${
                              errors.phone ? "border-red-500 focus:ring-red-500/25" : "border-gray-200 focus:ring-purple-500/25 focus:border-purple-500"
                            } focus:outline-none focus:ring-4 transition-all text-sm`}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-500"></span>
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Enrollment Amount (INR)</label>
                          <input
                            name="amount"
                            type="number"
                            placeholder="Enter Amount (₹)"
                            value={form.amount}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border bg-white ${
                              errors.amount ? "border-red-500 focus:ring-red-500/25" : "border-gray-200 focus:ring-purple-500/25 focus:border-purple-500"
                            } focus:outline-none focus:ring-4 transition-all text-sm`}
                          />
                          {errors.amount && (
                            <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-500"></span>
                              {errors.amount}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={handlePayment}
                          disabled={loading}
                          className={`w-full mt-4 py-3.5 rounded-xl text-white font-extrabold text-base transition-all duration-150 transform active:scale-95 shadow-md ${
                            loading
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800 shadow-purple-600/10"
                          }`}
                        >
                          {loading ? "Processing Secure payment..." : "Pay & Enroll Now"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-3xl p-8 text-center shadow-sm">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
                        <svg
                          className="w-8 h-8 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-black text-emerald-800 mb-2">
                        You're Enrolled!
                      </h2>
                      <div className="bg-white/80 border border-emerald-100 rounded-2xl p-4 max-w-sm mx-auto space-y-1 mb-4">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Payment Transaction ID</p>
                        <p className="text-gray-800 font-extrabold text-sm font-mono break-all">{success}</p>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                        Registration logs were securely saved. A representative will contact you shortly via email or phone with class links and materials.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Chapter 4 */}
              <section id="chapter-4" className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-lg shadow-sm">
                    4
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Program Support & Contact</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    If you run into any payment difficulties, failed status logs, scheduling questions, or require special accommodations during the Psychology Certification course, reach out directly to our operations and administrative desk.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/10 transition-all">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">General Inquiries</span>
                      <a href="mailto:support@mejoric.com" className="text-purple-600 hover:text-purple-700 font-bold text-sm sm:text-base transition-colors truncate">
                        support@mejoric.com
                      </a>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/10 transition-all">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Queries</span>
                      <a href="mailto:legal@mejoric.com" className="text-purple-600 hover:text-purple-700 font-bold text-sm sm:text-base transition-colors truncate">
                        legal@mejoric.com
                      </a>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/10 transition-all">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mejoric Platform</span>
                      <a href="https://mejoric.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-bold text-sm sm:text-base transition-colors">
                        mejoric.com
                      </a>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
