import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Footer from "../components/Footer";

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState("chapter-1");
  const [searchTerm, setSearchTerm] = useState("");
  const [consents, setConsents] = useState({});
  
  const chapters = [
      { id: 'chapter-1', num: '1', title: 'Definitions and Platform Description' },
      { id: 'chapter-2', num: '2', title: 'Acceptance of Terms and Eligibility' },
      { id: 'chapter-3', num: '3', title: 'Nature of Services \- Critical Disclaimers' },
      { id: 'chapter-4', num: '4', title: 'User Obligations and Prohibited Conduct' },
      { id: 'chapter-5', num: '5', title: 'Platform Conduct and Boundaries' },
      { id: 'chapter-6', num: '6', title: 'Self-Harm and Crisis Safety Protocol' },
      { id: 'chapter-7', num: '7', title: 'Professional Services \- Category-Specific Liability Clarifications' },
      { id: 'chapter-8', num: '8', title: 'Professional Misrepresentation and Credential Verification' },
      { id: 'chapter-9', num: '9', title: 'Data Privacy and Confidentiality' },
      { id: 'chapter-10', num: '10', title: 'Anti-Harassment and Safe Conduct Policy' },
      { id: 'chapter-11', num: '11', title: 'Platform Liability and Indemnification' },
      { id: 'chapter-12', num: '12', title: 'Payment Framework' },
      { id: 'chapter-13', num: '13', title: 'Intellectual Property' },
      { id: 'chapter-14', num: '14', title: 'Relationship of Parties' },
      { id: 'chapter-15', num: '15', title: 'Platform Infrastructure and Availability' },
      { id: 'chapter-16', num: '16', title: 'Fraud, Payment Misuse and Compliance' },
      { id: 'chapter-17', num: '17', title: 'Dispute Resolution and Governing Law' },
      { id: 'chapter-18', num: '18', title: 'General Provisions' },
      { id: 'chapter-19', num: '19', title: 'Informed User Consent and Risk Acknowledgement' }
    ];

  const handleConsentChange = (id) => {
    setConsents(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAcceptAll = () => {
    setConsents({
      "19.1": true,
      "19.2": true,
      "19.3": true,
      "19.4": true,
      "19.5": true,
      "19.6": true,
      "19.7": true,
      "19.8": true
    });
  };

  // Track scroll position to update active side item
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (const chap of chapters) {
        const element = document.getElementById(chap.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
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
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  const filteredChapters = chapters.filter(chap => 
    chap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chap.num.includes(searchTerm)
  );

  return (
    <Layout activePage="Terms & Conditions">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Hero Banner Header */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-700 font-semibold text-sm mb-4 shadow-sm backdrop-blur-sm animate-pulse">
              <span>Mejoric Platform Policy</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-4">
              Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Conditions</span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed font-medium">
              Governing all User interactions on the Mejoric technology aggregator platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar Table of Contents */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-6 space-y-6 max-h-[80vh] flex flex-col">
                
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg mb-2">Table of Contents</h3>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">Explore policy chapters</p>
                  
                  {/* Search filter in TOC */}
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Search chapters..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
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
                      <span className={`w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold flex items-center justify-center ${
                        activeSection === chap.id
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {chap.num}
                      </span>
                      <span className="truncate">{chap.title}</span>
                    </button>
                  ))}
                  {filteredChapters.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No chapters match your search.</p>
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
                  Document Agreement Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  
                <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="font-semibold text-gray-500 text-sm sm:text-base">Company</span>
                  <span className="text-gray-900 font-bold text-sm sm:text-base text-left sm:text-right mt-0.5 sm:mt-0">Mejoric Private Limited</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="font-semibold text-gray-500 text-sm sm:text-base">Website</span>
                  <span className="text-gray-900 font-bold text-sm sm:text-base text-left sm:text-right mt-0.5 sm:mt-0">mejoric.com</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="font-semibold text-gray-500 text-sm sm:text-base">Effective Date</span>
                  <span className="text-gray-900 font-bold text-sm sm:text-base text-left sm:text-right mt-0.5 sm:mt-0">12 May 2026</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="font-semibold text-gray-500 text-sm sm:text-base">Version</span>
                  <span className="text-gray-900 font-bold text-sm sm:text-base text-left sm:text-right mt-0.5 sm:mt-0">1.0</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="font-semibold text-gray-500 text-sm sm:text-base">Governing Law</span>
                  <span className="text-gray-900 font-bold text-sm sm:text-base text-left sm:text-right mt-0.5 sm:mt-0">Laws of India; Jurisdiction: Courts of Mumbai, Maharashtra</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="font-semibold text-gray-500 text-sm sm:text-base">Contact</span>
                  <a href="mailto:legal@mejoric.com" className="text-purple-600 hover:text-purple-700 font-bold text-sm sm:text-base text-left sm:text-right mt-0.5 sm:mt-0">
                    legal@mejoric.com
                  </a>
                </div>
                </div>
              </div>

              {/* Red-themed Important Disclaimer Box */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-3xl shadow-xl shadow-red-900/5 p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 text-red-600 p-2 rounded-2xl mt-0.5">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-red-900 mb-2 uppercase tracking-wide">
                      IMPORTANT DISCLAIMER - READ BEFORE USING MEJORIC
                    </h3>
                    <p className="text-red-800 text-sm leading-relaxed font-medium">
                      Mejoric is only a technology platform / aggregator connecting Users with Mates, Mentors and independent Professionals. Mejoric does not itself provide legal, medical, therapy, counselling, tax, financial, certification, litigation, investment or other regulated professional services. All advice or services are provided solely by the concerned independent Professional, who remains responsible for the same. Mejoric does not endorse or guarantee any Professional, advice, service, result or outcome. Mejoric is liable only for its own proven platform-level breach, fraud or wilful misconduct, subject to applicable law. Mejoric is not an emergency service; for self-harm risk, medical emergency, psychiatric emergency or immediate danger, contact emergency services / 112 or a hospital.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rendered Chapter Blocks */}
              
          <section id="chapter-1" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 1</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Definitions and Platform Description</h2>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-4">The following definitions apply throughout these Terms and Conditions:</p>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 1.1</span>
                <span>Mejoric</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric means the technology platform operated by Mejoric Private Limited, a company incorporated under the Companies Act, 2013, providing an online marketplace / aggregator platform connecting Users with Mates, Mentors and independent Professionals for peer emotional support, general guidance, professional consultation and related services.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not itself practise law, medicine, psychology, counselling, psychotherapy, psychiatry, financial advisory, taxation, certification, or any other regulated profession.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 1.2</span>
                <span>Platform Services</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Platform Services means technology and facilitation services enabling Users to discover, connect with, communicate with, book sessions with and make payment for Mates, Mentors and independent Professionals. Platform Services may include listing, search, matching, booking, scheduling, audio / video / chat functionality, payment facilitation, grievance routing, technology support, safety escalation, feedback collection, account management and other platform-level services.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">For the purposes of this Agreement, a ‘proven platform-level breach’ shall strictly and exclusively mean a total, unannounced core server outage caused directly by Mejoric&#x27;s intentional acts, or a confirmed, systemic breach of Mejoric&#x27;s central database directly resulting in data exfiltration, and shall explicitly exclude any localized software bugs, call disconnections, automated sorting variations, or AI tool inaccuracies.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 1.3</span>
                <span>User</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any person who accesses, browses, registers with, books, pays for or uses the Mejoric platform or its content/sessions.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 1.4</span>
                <span>Mate</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">A Mate means a trained emotional listener / peer-support person onboarded through Mejoric processes. A Mate is not a licensed therapist, psychologist, counsellor, psychiatrist, doctor, advocate, chartered accountant, financial advisor or regulated professional and shall not provide regulated professional advice.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 1.5</span>
                <span>Mentor</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">A Mentor means a person with experience or domain knowledge who may provide structured guidance in areas such as career, relationships, parenting, personal development, business, wellness or general life matters. A Mentor does not provide regulated professional advice unless such Mentor is separately identified, qualified, registered, legally permitted and specifically engaged as a Professional for that regulated service.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 1.6</span>
                <span>Professional</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Professional means any independent qualified, licensed, registered, enrolled, certified or experienced service provider empanelled, listed, onboarded or made accessible through the Mejoric platform, including but not limited to Advocates, Legal Professionals, Psychologists, Counsellors, Therapists, Psychiatrists, Medical Practitioners, Chartered Accountants, Tax Consultants, Financial Professionals, Investment Professionals, Company Secretaries, Cost Accountants, Career Mentors, Business Mentors, Relationship Experts, Wellness Professionals, Domain Experts, Consultants or any other professional or consultant providing advice, consultation, counselling, therapy, legal opinion, tax view, financial guidance or other services through the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Each Professional shall hold and maintain such qualifications, registrations, licences, enrolments, certifications, approvals or credentials as may be required under applicable law, professional rules, ethical standards or regulatory requirements for the nature of services offered by him / her. All Professionals act in their own independent professional capacity and are not employees, agents, partners, representatives or authorised signatories of Mejoric, unless expressly agreed otherwise in writing.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 1.7</span>
                <span>Session</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Session means a scheduled or platform-enabled interaction between a User and a Mate, Mentor or Professional on the Mejoric platform, whether by audio, video, chat or any other mode permitted by Mejoric.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 1.8</span>
                <span>Guidance</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Guidance means general information, emotional support, experience-sharing, educational input or non-binding suggestions. Guidance does not constitute regulated professional advice unless expressly provided by an appropriately qualified Professional in his / her independent professional capacity.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 1.9</span>
                <span>Professional Service</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Professional Service means any advice, consultation, counselling, therapy, legal opinion, tax view, financial guidance, certification, representation or other service provided by an independent Professional in his / her own professional capacity. Mejoric is not the provider of any Professional Service.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 1.10</span>
                <span>Fees</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Fees means any charges payable for sessions, bookings, subscriptions, platform fees, professional fees, cancellation charges, taxes or other amounts displayed or communicated on Mejoric.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">#</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-2" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 2</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Acceptance of Terms and Eligibility</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 2.1</span>
                <span>Binding Agreement</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">By accessing, registering, booking a session, making payment, clicking “I agree”, using any feature of Mejoric or continuing to use the platform, the User confirms that the User has read, understood and agreed to these Terms. These Terms, together with the Privacy Policy, Refund Policy, consent forms, Professional-specific terms and any service-specific terms, constitute a binding legal agreement between the User and Mejoric.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 2.2</span>
                <span>Age Requirement</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">You must be at least 18 years of age to create an account, access or use the Mejoric platform. Mejoric does not knowingly permit persons below the age of 18 years to independently create accounts, access sessions, or use the platform. If Mejoric becomes aware that any account has been created or operated by a person below 18 years of age, Mejoric reserves the right to suspend or permanently terminate such account and delete associated data, subject to applicable law. If a User falsifies their age, identity, or legal capacity to bypass platform restrictions, the User&#x27;s parent, legal guardian, or estate shall be bound by these Terms and shall fully defend, indemnify, and hold Mejoric completely harmless against any third-party claims, parental lawsuits, statutory penalties, or legal damages arising directly out of such unauthorized platform utilization.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">By executing a transaction or accessing a session, the individual represents that they are utilizing a payment method legally issued to an adult. If a minor accesses the platform via falsification, the registered account holder who permitted access to the device, internet connection, or payment credential shall be deemed the primary contracting party and shall remain personally, strictly, and directly liable to defend, indemnify, and hold Mejoric harmless from all resulting actions</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 2.3</span>
                <span>Mental Capacity</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">By accepting these Terms, the User confirms that the User has legal capacity to enter into a binding agreement. If the User is currently experiencing a psychiatric emergency, acute psychosis, severe impairment, active self-harm risk, or has been assessed as lacking mental capacity, the User must not use this platform independently and must seek immediate professional / emergency assistance.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 2.4</span>
                <span>Modification of Terms</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric reserves the right to modify these Terms at any time. Users will be notified of material changes via registered email or in-platform notification at least 14 days before the changes take effect. Continued use of the platform after notification constitutes acceptance of the revised Terms.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 2.5</span>
                <span>Electronic Acceptance</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Acceptance of these Terms through electronic means, including clicking “I agree”, creating an account, booking a session, making payment or using the platform, constitutes valid and binding acceptance under the Information Technology Act, 2000 and other applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 2.6</span>
                <span>Electronic Records and Communications</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User consents to receiving notices, disclosures, policies, agreements, invoices, communications and legally required information electronically through email, platform notifications, SMS, WhatsApp, in-app messages or other electronic means. Electronic records and communications shall satisfy any legal requirement for written communication under applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">#</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-3" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 3</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Nature of Services \- Critical Disclaimers</h2>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg my-4 text-blue-800 font-medium">READ THIS SECTION CAREFULLY BEFORE PROCEEDING The following disclaimers are not merely limitations of liability; they are accurate descriptions of what Mejoric is and is not. If these descriptions do not meet your needs, you must not use the platform.</div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.1</span>
                <span>Mejoric is a Platform / Aggregator</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric is a technology-enabled peer support, guidance, professional discovery and consultation facilitation platform. Mejoric’s role is limited to operating the platform and providing Platform Services. Mejoric does not itself provide legal advice, medical advice, psychiatric care, psychotherapy, counselling, clinical diagnosis, tax advice, investment advice, financial advice, litigation services, certification or any other regulated professional service.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.2</span>
                <span>No Professional Supervision or Clinical Control</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not supervise, direct, control, prescribe, monitor or interfere with the independent professional judgment, methodology, advice, diagnosis, treatment approach, legal strategy, tax position, counselling approach, therapeutic intervention, financial recommendation or professional conduct of any Professional.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Any onboarding checks, credential collection, moderation, ratings, reviews, matching systems, verification processes, platform standards, scheduling assistance, operational guidelines, safety measures, codes of conduct, escalation procedures or quality – control processes implemented by Mejoric are solely administrative and platform – level measures and shall not be construed as professional supervision, clinical oversight, partnership, employment, agency, fiduciary responsibility or assumption of professional responsibility.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.3</span>
                <span>Independent Professional Responsibility</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Where a User books or interacts with a Professional through Mejoric, the underlying Professional Service is rendered directly by the concerned Professional in his / her independent capacity. The Professional is solely responsible for his / her advice, opinion, conduct, professional judgment, records, confidentiality obligations, professional ethics and compliance with applicable law. Any claim arising from a Professional Service shall be made against the concerned Professional and not against Mejoric, except to the limited extent arising solely from Mejoric’s own proven platform-level breach.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.4</span>
                <span>No Recommendation, Ranking or Matching Warranty</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any search result, ranking, recommendation, “best match,” “recommended,” “featured,” “top-rated,” “suggested professional,” category placement, review score, visibility ranking, AI-assisted suggestion, matching output or similar platform feature is generated through automated, operational, commercial, availability-based, preference-based, algorithmic or platform-level parameters.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such display or functionality shall not constitute a representation, certification, endorsement, guarantee or warranty by Mejoric regarding the competence, quality, legality, suitability, licensing status, safety, professional capability, ethical compliance, success probability or expected outcome of any Mate, Mentor or Professional. The User explicitly acknowledges that any automated matching, AI-assisted pairing, sorting, or recommendation feature represents an automated optimization tool operating solely on availability, basic preference filters, and technical sorting metrics selected by the User. It does not constitute a human clinical vetting, an endorsement, a diagnostic assessment, or a qualitative validation of the provider&#x27;s suitability by Mejoric. The User exercises sole discretion and assumes all risks when selecting any Mate, Mentor, or Professional suggested by automated platform sorting mechanisms.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.5</span>
                <span>No Endorsement or Guarantee of Professionals</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Listing, empanelment, display, ranking, recommendation, matching, rating, review, availability or visibility of any Mate, Mentor or Professional on Mejoric shall not be construed as endorsement, certification, guarantee, warranty or recommendation by Mejoric. Use of Mejoric does not create any advocate-client, doctor-patient, therapist-client, counsellor-client, auditor-client, CA-client, fiduciary, advisory, agency or professional relationship between the User and Mejoric. Any such professional relationship, if created under applicable law, shall be only between the User and the concerned independent Professional.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.6</span>
                <span>Mate and Mentor Limitations</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mate sessions are intended solely for peer-level emotional support and general conversation. Mentor sessions are general informational, educational and experience-based guidance only. Unless a Mentor is separately qualified, registered, legally permitted and specifically engaged as a Professional for a regulated service, Mate and Mentor sessions do not constitute therapy, counselling, psychiatric care, diagnosis, legal advice, medical advice, financial advice, tax advice or any regulated professional service.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric maintains a zero-tolerance policy for unauthorized professional practice. If a Mate or Mentor makes any unauthorized diagnostic statement, clinical recommendation, prescribing suggestion, or regulated professional assertion, such action constitutes a personal, unauthorized tortious act committed solely by that individual. Mejoric explicitly disclaims all joint, vicarious, or concurrent liability for such unauthorized statements, and the full legal, financial, and regulatory consequences shall remain the exclusive personal liability of the concerned Mate or Mentor.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.7</span>
                <span>Mejoric is NOT an Emergency Service</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric is not an emergency response service, suicide prevention service, crisis intervention platform, ambulance service, psychiatric emergency provider, legal emergency service, limitation tracking service, medical emergency service or substitute for immediate medical, psychiatric, legal or professional assistance.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">If you or someone you know is experiencing suicidal thoughts, self-harm risk, psychiatric emergency, violent thoughts, medical emergency, severe emotional distress or any immediate risk to life or safety, immediately contact emergency services/112, a licensed medical professional, a crisis helpline, or visit the nearest hospital emergency room. Do not rely on Mejoric for emergency intervention, urgent response, crisis support or emergency professional assistance.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.8</span>
                <span>Consumer Rights</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Nothing contained in these Terms shall restrict, waive or limit any non-excludable rights or remedies available to Users under the Consumer Protection Act, 2019\. Users retain the right to approach appropriate consumer dispute redressal forums or statutory authorities having jurisdiction in accordance with applicable law.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.9</span>
                <span>No Assurance of Outcomes</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not represent, warrant or guarantee any specific emotional, psychological, relational, professional, legal, regulatory, tax, financial, behavioural, medical, therapeutic or commercial result from use of the platform or participation in any session. Nothing on the platform shall be construed as a promise, warranty or assurance of any guaranteed result, relief, refund, certification, regulatory approval, legal outcome, tax outcome or improvement.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.10</span>
                <span>AI-Assisted Features and Automated Tools</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Certain platform features may utilise artificial intelligence, automated tools, recommendation systems, moderation systems, matching systems or algorithmic assistance for operational, support, informational, safety, moderation or platform functionality purposes.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such systems may generate inaccurate, incomplete, delayed, unsuitable or imperfect outputs and shall not be treated as medical advice, diagnosis, psychiatric assessment, legal advice, tax advice, financial advice, professional advice or guaranteed recommendations.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Users remain responsible for exercising independent judgment and seeking qualified professional assistance where necessary. The User explicitly acknowledges that any automated matching, AI-assisted pairing, sorting, or recommendation feature represents an automated optimization tool operating solely on availability, basic preference filters, and technical sorting metrics selected by the User. It does not constitute a human clinical vetting, an endorsement, a diagnostic assessment, or a qualitative validation of the provider&#x27;s suitability by Mejoric. The User exercises sole discretion and assumes all risks when selecting any Mate, Mentor, or Professional suggested by automated platform sorting mechanisms.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.11</span>
                <span>AI Output and Automated Processing Disclaimer</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">AI-generated outputs, summaries, prompts, recommendations, moderation decisions, matching suggestions, educational content, informational material, chatbot responses, automated analyses, alerts or platform-generated content may be inaccurate, incomplete, outdated, delayed, unsuitable, misleading, biased, offensive or legally incorrect.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such outputs shall not be treated as medical advice, psychiatric diagnosis, legal opinion, tax advice, financial advice, investment recommendation, therapeutic intervention, emergency response, professional certification or substitute for independent professional judgment.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Users remain solely responsible for independently verifying information and obtaining appropriate professional assistance before acting upon any AI-generated or automated output available through the platform.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.12</span>
                <span>Informational and Educational Content Disclaimer</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any blogs, articles, educational materials, self-help resources, wellness content, legal explainers, financial explainers, tax summaries, prompts, videos, AI-generated material or informational content made available on the platform are provided solely for general informational and educational purposes. Such content does not constitute medical advice, psychiatric treatment, psychotherapy, legal advice, financial advice, tax advice, investment advice, or any other regulated professional service and should not be relied upon as a substitute for consultation with a qualified Professional.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.13</span>
                <span>No Reliance and Independent Verification</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Users acknowledge that any information, guidance, educational material, AI-generated content, discussion, recommendation, summary, article, session communication or platform interaction may not be complete, accurate or suitable for the User’s specific circumstances.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Users shall independently evaluate and verify all material information and obtain appropriate professional advice before making legal, medical, financial, tax, investment, therapeutic, business, employment, relationship or other material decisions.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 3.14</span>
                <span>Live Streaming and Audio-Visual Media Disclaimer</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">While Mejoric provides the secure streaming, chat, and communication infrastructure, it cannot pre-screen, preview, or algorithmically filter live, real-time audio-visual transmissions. Mejoric explicitly disclaims any liability for real-time visual background displays, unscripted verbal statements, hand gestures, or behaviors exhibited by Mates, Mentors, or Professionals during a live session. The platform treats live sessions as unmoderated, real-time point-to-point communication between independent parties.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">To guarantee the immediate psychological and physical safety of platform participants, any Mate, Mentor, or Professional is granted an absolute, unreviewable right to trigger native platform interface disconnection tools (a ‘Panic Disconnect’) instantly if a User displays or speaks anything illegal, sexually explicit, abusive, or highly erratic. The execution of a Panic Disconnect by a provider shall never be deemed a deficiency of service or a breach of platform operational standards.</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-4" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 4</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">User Obligations and Prohibited Conduct</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 4.1</span>
                <span>Accurate Information</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Users shall provide accurate, truthful, current and complete information at registration, booking and during sessions. Providing false, incomplete, misleading or inaccurate information, or any omission, concealment or delay in providing material information (including age, identity, medical / mental health history, legal facts, deadlines, financial facts, tax facts or regulatory facts) shall constitute a material breach of these Terms.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Users shall be solely responsible for the accuracy and completeness of information provided. Mejoric shall not be responsible for unsuitable routing, adverse outcome, delay, harm, penalty, missed deadline or loss arising from or attributable to any inaccurate, incomplete, delayed or misleading information provided by the User. The User covenants that any omission, falsification, concealment, or delay in delivering material information completely negates the Professional&#x27;s duty of care. The User explicitly waives all rights to initiate professional malpractice actions, deficiency of service claims under the Consumer Protection Act, 2019, or regulatory misconduct grievances against the independent Professional, where such action is connected to, or stems from, incomplete or inaccurate user disclosures.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 4.2</span>
                <span>Prohibited Conduct</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Users shall not, directly or indirectly, engage in any of the following activities:</p>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Record any session, in whole or in part, without the prior written consent of Mejoric and the concerned Mate, Mentor or Professional;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Share, publish or disclose any session content publicly or to any third party without the prior written consent of Mejoric and the concerned Mate, Mentor or Professional;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Use the platform for solicitation, commercial promotion, recruitment or diversion of Mates, Mentors or Professionals for services outside the platform;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Harass, threaten, abuse, intimidate or otherwise engage in any inappropriate or offensive conduct towards any Mate, Mentor, Professional, User or Mejoric personnel;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Impersonate another person or entity or create multiple accounts for deceptive, fraudulent or misleading purposes;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Use the platform for any unlawful, fraudulent or harmful activity, including planning, facilitating or seeking assistance for any unlawful act;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Seek, request, induce or pressure any Mate, Mentor or Professional to provide services in violation of applicable law, professional ethics, confidentiality obligations, platform policy or regulatory requirements;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Attempt to reverse engineer, decompile, disassemble, scrape, hack, bypass security measures, gain unauthorised access to, or otherwise interfere with the platform, including User accounts, professional accounts, servers, networks or data;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Introduce, upload or transmit any malware, spyware, bots, viruses, scraping tools, automated scripts or any other code or material designed to impair, damage, disrupt, overload or compromise the platform or its functionality;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Misuse the platform to obtain emergency medical, legal, psychiatric, law enforcement or crisis support where immediate emergency services are required; or</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Circumvent, breach or attempt to circumvent any restrictions, safeguards or policies relating to platform use, including privacy, personal information, anonymity, sexual conduct, off-platform contact, payments or User safety.</li>
                  <p className="text-gray-600 leading-relaxed mb-4">The User explicitly acknowledges that the prohibitions against recording, publishing, leaking content, and harassing platform participants operate as a direct contractual covenant between the User and the individual Mate, Mentor, or Professional engaged. Any breach of these terms by the User grants the affected provider a personal, independent right of action to seek statutory damages, injunctive relief, and full legal fees directly from the breaching User, completely separate from Mejoric&#x27;s corporate remedies.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 4.3</span>
                <span>Feedback Responsibility</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Users may leave reviews and ratings for Mates, Mentors and Professionals, where such feature is enabled by Mejoric.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Reviews must be truthful, fair, lawful and based on actual experience. Users shall not post false, defamatory, abusive, misleading, confidential, privileged, obscene, threatening, promotional, paid or malicious reviews.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric may moderate, remove, restrict, refuse to publish or investigate any review that appears to violate these Terms, applicable law, privacy rights, professional confidentiality, platform policy or the rights of any Mate, Mentor or Professional.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">False or defamatory reviews that damage the reputation of a Mate, Mentor, Professional or Mejoric may result in suspension of the User’s account and legal action under applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall establish an expedited, internal, good-faith review appeal process accessible to all Mates, Mentors, and Professionals. Upon receiving a formal, written objection from a provider demonstrating that a User review is demonstrably false, retaliatory, extortionate, or features an abuse of platform boundaries, Mejoric shall mask or suspend the public visibility of the disputed review within 72 hours, pending a final internal administrative determination.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 4.4</span>
                <span>Abuse of Platform Process</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Users shall not misuse refund systems, grievance procedures, reporting mechanisms, payment systems, safety escalation channels, dispute processes, moderation systems or customer support mechanisms in a fraudulent, abusive, malicious, deceptive or bad-faith manner.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric reserves the right to investigate suspected misuse and take reasonable corrective action, including suspension or restriction of access, denial of refunds, preservation of records, reversal of benefits improperly obtained, or reporting to relevant authorities in accordance with applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Nothing in this clause shall restrict a User from making legitimate complaints, exercising legal rights, reporting genuine safety concerns or approaching appropriate statutory authorities.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 4.5</span>
                <span>Account Security</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User shall be solely responsible for maintaining the confidentiality and security of login credentials, authentication methods, registered devices and account access information associated with the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">The User shall immediately notify Mejoric of any suspected unauthorised access, account compromise, fraudulent activity, identity misuse or security incident relating to their account.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall not be responsible for losses, damages, unauthorised activity or account misuse arising from the User’s failure to maintain reasonable account security or protect login credentials.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">#</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-5" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 5</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Platform Conduct and Boundaries</h2>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-4">In order to protect safety, privacy and integrity of interactions on the platform, the User agrees to strictly comply with the following conditions:</p>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 5.1</span>
                <span>Platform Only Interaction and Non-Circumvention</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">All communication, scheduling, booking, payment, follow-up and session-related interaction between the User and any Mate, Mentor or Professional introduced, discovered, booked or accessed through Mejoric shall take place only through the Mejoric platform or Mejoric-authorised channels, except where Mejoric expressly permits otherwise or where applicable law, professional ethics, client confidentiality, emergency circumstances, court requirements or regulatory obligations require direct communication.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">The User shall not, directly or indirectly, bypass the platform or solicit, hire, retain, engage, recruit, contract with, divert or attempt to divert any Mate, Mentor or Professional introduced, discovered, booked or accessed through Mejoric for off-platform services, for a period of 12 months from the date of the last interaction through the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">This restriction shall apply only to Mates, Mentors or Professionals introduced, discovered, booked or accessed through Mejoric and shall not restrict the User from independently engaging any third-party professional who was not introduced, discovered, booked or accessed through Mejoric.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Nothing in this clause shall prevent a User from exercising any statutory right, consumer right, legal right, or from directly communicating with an Advocate, Chartered Accountant, Doctor, Psychologist, Counsellor or other regulated Professional where such direct communication is required under applicable law, professional rules, ethical obligations, informed consent requirements, emergency circumstances, court proceedings or regulatory requirements.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">The User acknowledges that this restriction is a reasonable and necessary protection of Mejoric’s legitimate business interests, platform investment, professional network, confidential business information, goodwill and operational infrastructure.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">In the event of a proven and intentional breach of this clause, Mejoric may recover reasonable compensation for actual or reasonably estimated loss suffered by Mejoric, including lost platform fees, administrative costs, investigation costs and legal costs, subject to applicable law. Such compensation shall not exceed the higher of:</p>
                  <li className="text-gray-600 leading-relaxed list-decimal ml-6 mb-2">INR 2,50,000; or</li>
                  <li className="text-gray-600 leading-relaxed list-decimal ml-6 mb-2">twelve months of the average platform service fee / commission earned by Mejoric from the relevant Mate, Mentor or Professional in relation to the User,</li>
                  <p className="text-gray-600 leading-relaxed mb-4">and shall be treated as a genuine pre-estimate of loss and not as a penalty.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Notwithstanding any lower baseline caps or parameters referenced in the paragraphs above, the parties explicitly covenant and agree that where the circumvented interaction involves an independent Professional or a Corporate Mentor, the maximum recoverable compensation under this Clause 5.1 shall scale up to a hard baseline floor of INR 25,00,000 (Rupees Twenty-Five Lakhs). The User explicitly acknowledges that this elevated floor is a genuine, contractually agreed pre-estimate required to protect Mejoric&#x27;s platform ecosystem, network capital, and corporate onboarding expenditures.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">For the avoidance of doubt, this premium baseline floor shall supersede any lower caps or administrative parameter calculations mentioned in the preceding paragraphs of this Clause 5.1 whenever an independent Professional or Corporate Mentor is involved.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 5.2</span>
                <span>Personal Information and Identity Protection</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User shall not request, solicit, disclose, exchange or attempt to obtain any personal, contact, location, identity, payment or private information of any Mate, Mentor, Professional, User or Mejoric staff member, including phone numbers, email addresses, social media handles, addresses, workplace details, photographs, identity documents, payment details or similar information. This prohibition applies to direct and indirect methods, including coded language, screenshots, usernames, QR codes, payment handles, links, images, documents or profile descriptions.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">This restriction shall not prevent a User from receiving professional identity, enrolment, registration, qualification, office address, firm details or legally required disclosures where such disclosure is required under applicable law, professional ethics, informed consent requirements or is expressly permitted by Mejoric through authorised platform features.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 5.3</span>
                <span>No Physical, Personal, Romantic or Sexual Contact</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User shall not attempt to identify beyond the information displayed or authorised by Mejoric, trace, locate, meet, approach or establish any physical, personal, romantic, intimate, sexual, financial, exploitative or otherwise inappropriate relationship with any Mate, Mentor or Professional. The User shall not make, share, request, transmit or engage in sexually explicit, sexually suggestive, romantic, obscene, fetish-related, graphic, abusive, threatening, coercive, exploitative, violent, self-harm-related, illegal or otherwise inappropriate communication, content, gesture or conduct during any session or platform interaction.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 5.4</span>
                <span>Identity Display and Anonymity</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The identity of Mates and certain Mentors may be anonymised or presented in a limited manner for safety and privacy purposes, and Users shall not attempt to uncover or verify such identity beyond what is displayed on the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">In the case of Professionals providing regulated services, Mejoric may display or disclose such professional identity, qualification, enrolment, registration or other details as may be required under applicable law, professional ethics, platform policy or User consent requirements.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Nothing in this clause shall require Mejoric to disclose private personal contact details of any Mate, Mentor or Professional except as required by law or authorised platform process.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 5.5</span>
                <span>Right to Terminate Session and Consequences</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">In the event of inappropriate conduct, safety concern, suspected misuse, attempted breach or violation of these Terms, the Mate, Mentor, Professional or Mejoric may immediately terminate the session without prior notice and without refund. Mejoric may also suspend or permanently terminate the User’s account, restrict future access, forfeit fees paid, preserve relevant records, report to law enforcement / regulators where appropriate and initiate legal proceedings including claims for damages and injunctive relief.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">#</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-6" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 6</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Self-Harm and Crisis Safety Protocol</h2>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg my-4 text-blue-800 font-medium">PLEASE READ IN FULL This section directly addresses Mejoric’s most important safety obligation. Non-compliance with this protocol may result in harm that Mejoric cannot prevent or remedy. Please read every clause carefully.</div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 6.1</span>
                <span>User Acknowledgement of Platform Limitations</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">By using Mejoric, the User acknowledges and accepts that:</p>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Mejoric is not equipped to respond to suicidal ideation, active self-harm, psychiatric emergencies, medical emergencies, law enforcement emergencies or urgent legal limitation matters;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Mates and Mentors are not crisis counsellors and cannot provide crisis intervention;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Mental health Professionals may provide professional support only within the scope of their qualifications, applicable law, informed consent and professional judgment; however, Mejoric is not an emergency response service;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">In any situation involving risk to life, safety or immediate harm, the User must contact emergency services, a hospital, crisis helpline or competent authority immediately and not rely on a Mate, Mentor or Mejoric;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Mejoric sessions are not a substitute for psychiatric care, clinical intervention, hospitalisation, emergency legal assistance or emergency medical treatment.</li>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 6.2</span>
                <span>Mejoric’s Crisis Response Protocol</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">If a Mate, Mentor, Professional or authorised Mejoric personnel becomes aware during a session or platform interaction that a User may present an imminent risk of suicide, self-harm, violence or serious harm to self or others, Mejoric may implement its internal Crisis Response and Safety Protocol.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such protocol may include:</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(a) provision of emergency helpline or crisis intervention details;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(b) escalation to authorised internal safety personnel;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(c) suspension or termination of the session where safety cannot reasonably be maintained;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(d) attempting to contact the User using registered contact details; and</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(e) where reasonably necessary to prevent imminent harm to life or safety, disclosure of relevant information to emergency services, law enforcement authorities, medical responders or legally authorised persons, with or without prior User consent, to the extent permitted under applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">The deployment, initiation, and execution of this Crisis Response and Safety Protocol is a purely voluntary, discretionary, and good-faith administrative safety framework. Mejoric assumes no custodial duty of care, medical obligation, or statutory liability to successfully locate, track, or rescue any User, and explicitly disclaims all liability if emergency tracking, local helpline routing, or contact attempts fail to avert an active crisis or self-harm outcome.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 6.3</span>
                <span>No Continuous Monitoring or Prediction Obligation</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not continuously monitor all sessions, communications, behavioural indicators, emotional conditions, crisis signals, suicide indicators, psychiatric symptoms, legal emergencies, medical emergencies or safety risks occurring on or through the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not guarantee identification, prediction, prevention, interruption or avoidance of self-harm, suicide, psychiatric deterioration, violence, emotional distress, medical harm or crisis-related outcomes.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Users acknowledge that crisis assessment and emergency intervention may require immediate in-person professional, medical, psychiatric, legal or law-enforcement assistance beyond the scope of the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 6.4</span>
                <span>Platform Liability in Crisis or Self-Harm Scenarios</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall implement reasonable platform-level safety procedures, escalation mechanisms and crisis protocols appropriate to the nature of the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">However, Mejoric does not guarantee prevention of self-harm, suicide, psychiatric deterioration, violence, medical deterioration, legal harm or crisis-related outcomes.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">To the maximum extent permitted under applicable law, Mejoric shall not be liable for harm arising from:</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(a) inaccurate, incomplete, misleading or delayed disclosures made by the User;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(b) a User’s failure to seek emergency medical, psychiatric, legal or professional assistance;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(c) misuse of the platform contrary to these Terms;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(d) events outside Mejoric’s reasonable control; or</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(e) independent clinical decisions, treatment approaches, assessments, therapeutic interventions, legal opinions, professional judgments or advice provided by Professionals acting in their independent professional capacity.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">The deployment and execution of this Crisis Response and Safety Protocol is a purely voluntary, discretionary, and good-faith administrative safety framework. Mejoric assumes no custodial duty of care or statutory obligation to successfully locate, track, or rescue any User, and explicitly disclaims all liability if emergency tracking, local helpline routing, or contact attempts fail to avert a crisis or self-harm outcome.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric maintains professional indemnity and platform liability insurance as reasonably required for its operations.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 6.5</span>
                <span>Disclosure of Mental Health Information</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Users are encouraged to provide accurate and complete information regarding any history of suicidal ideation, self-harm, psychosis or other serious mental health conditions at the time of registration or during relevant sessions. Such disclosures assist in routing Users to appropriate support.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Failure to provide relevant information may impact the suitability of services offered. To the extent permitted under applicable law, Mejoric shall not be responsible for adverse outcomes arising from incomplete or inaccurate disclosures.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 6.6</span>
                <span>Emergency Assistance and Good Faith Actions</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Where Mejoric, its personnel, Mates, Mentors, Professionals, safety teams or authorised representatives take good faith actions to prevent imminent harm, self-harm, suicide, violence, abuse, exploitation or serious safety risks, such actions shall be deemed reasonable protective measures. Such actions may include escalation, emergency disclosure, account restriction, contacting emergency responders, preservation of records, suspension of sessions or cooperation with lawful authorities. Nothing in this clause excludes liability for wilful misconduct, fraud or gross negligence.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">The User explicitly waives the right to claim damages or initiate civil, criminal, or consumer litigation against Mejoric for any action taken, delayed, or omitted in good faith under this Section 6\. The exclusions in this clause shall be limited strictly to instances of judicially proven fraud or wilful misconduct committed directly by Mejoric’s core corporate officers.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">#</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-7" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 7</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Professional Services \- Category-Specific Liability Clarifications</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 7.1</span>
                <span>Nature of Professional Services on Mejoric</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric may facilitate access to multiple categories of services, including legal, CA, tax, accounting, financial, business, therapy, counselling, medical, wellness, career, relationship and other professional or semi-professional services. The presence of multiple service categories on the platform does not make Mejoric a provider of such services.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 7.2</span>
                <span>No Practice of Regulated Profession by Mejoric</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not itself practice, render, advertise, solicit or hold itself out as providing legal practice, medical practice, psychotherapy, psychiatry, counselling, accounting, audit, taxation, financial advisory, investment advisory, certification, attestation or any other regulated professional service in its own capacity.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Any regulated service accessible through the platform is independently offered and rendered by the concerned Professional in accordance with applicable professional laws, ethical rules, licensing conditions, enrolment requirements and regulatory obligations applicable to such Professional.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 7.3</span>
                <span>Legal and Litigation-Related Responsibility</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any legal advice, drafting, case strategy, document review, representation, filing, limitation assessment, statutory notice, contract review or litigation-related service shall be the sole responsibility of the concerned Advocate / Legal Professional.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not monitor limitation dates, filing deadlines, court dates, procedural requirements, jurisdictional strategy or legal consequences unless expressly agreed as a separate platform feature, and even then such feature shall be only a facilitation / reminder tool, not legal advice.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 7.4</span>
                <span>CA, Tax, Accounting, Certification and Financial Responsibility</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any CA, tax, GST, income-tax, audit, certification, attestation, UDIN, accounting, financial advisory, valuation, business advisory, regulatory filing, compliance or representation service shall be the sole responsibility of the concerned Professional.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall not be liable for penalties, interest, disallowances, wrong filings, wrong tax positions, audit issues, regulatory notices, investment loss, business loss or financial consequences arising from reliance on any Professional’s advice or service.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 7.5</span>
                <span>Mental Health / Counselling / Therapy Responsibility</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any mental health, counselling, therapy, psychological assessment, wellness or medical service shall be the sole responsibility of the concerned qualified Professional, subject to applicable law, informed consent, professional standards and ethical obligations.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not guarantee improvement, cure, diagnosis, treatment success, emotional relief, clinical outcome, medication outcome or avoidance of hospitalisation / crisis escalation.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 7.6</span>
                <span>User Responsibility for Material Decisions</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any legal, financial, tax, business, medical, mental health, relationship, career or personal decision made by a User following a session is made at the User’s own risk and discretion, subject to any non-excludable responsibility of the concerned Professional under applicable law. The User should seek formal independent professional advice, written engagement terms and appropriate documentation wherever required before making material decisions.</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-8" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 8</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Professional Misrepresentation and Credential Verification</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 8.1</span>
                <span>Prohibition on Misrepresentation by Mates, Mentors and Professionals</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">No Mate, Mentor or Professional on the Mejoric platform is permitted to misrepresent his / her qualifications, experience, registration, enrolment, licence, authority, professional standing, specialization, success rate or ability to provide any regulated service.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">No person shall represent himself / herself as a licensed therapist, psychiatrist, clinical psychologist, registered medical practitioner, advocate, chartered accountant, company secretary, cost accountant, tax professional, financial advisor, investment advisor, counsellor or any other regulated professional unless he / she holds valid, current and verifiable qualifications, enrolment, registration, licence or authorisation with the relevant statutory, regulatory or professional body, where such registration or authorisation is required under applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Any Mate, Mentor or Professional found to have misrepresented credentials shall be suspended, delisted, removed from the platform, reported to relevant authorities and subjected to legal action under applicable law.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 8.2</span>
                <span>User Protection Against Misrepresentation</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">If a User believes that any Mate, Mentor or Professional has misrepresented his / her qualifications, registration, experience, authority or competence to provide services, the User must report this immediately to [grievance@mejoric.com](mailto:grievance@mejoric.com).</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall investigate such complaint in accordance with its internal grievance process. If misrepresentation is confirmed, Mejoric may take appropriate action, including warning, suspension, delisting, refund of eligible session fees, preservation of records and / or reporting to the relevant professional or regulatory body.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 8.3</span>
                <span>Limitation of Credential Verification</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Credential verification conducted by Mejoric may include collection or review of licences, enrolment certificates, registrations, declarations, identification documents or publicly available records.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such verification is limited in scope and duration and may not identify suspension, misconduct, disciplinary proceedings, ethical violations, competency concerns, future conduct, expired registrations, forged documentation or jurisdiction-specific restrictions.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Users remain responsible for independently evaluating the suitability of any Mate, Mentor or Professional before relying on any service or advice.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 8.4</span>
                <span>Platform Verification Standard</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric may conduct onboarding checks, credential collection, professional declarations, document review or other verification steps as per its internal policies. However, such verification shall not constitute a guarantee, warranty or certification by Mejoric regarding the competence, quality, suitability, professional conduct or future performance of any Mate, Mentor or Professional.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric’s liability for credential misrepresentation by a Mate, Mentor or Professional shall be limited to platform-level remedies, including eligible session fee refund, suspension or delisting of the concerned person and reasonable assistance in facilitating a complaint to the relevant authority, where appropriate.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 8.5</span>
                <span>Reliance on Self-Undertaking and No Employer Verification Duty</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User and all platform participants explicitly acknowledge that Mejoric does not perform independent background checks, corporate due diligence, or employer verifications regarding a Mate, Mentor, or Professional’s employment status, corporate restrictions, or external contractual covenants. Mejoric relies entirely, exclusively, and in good faith upon the absolute truthfulness of the self-undertakings, declarations, and representations provided by the respective Mentor or Professional during onboarding. Any failure by a provider to disclose external contractual restrictions remains their sole personal and exclusive liability.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">In furtherance of this undertaking, the User and all platform participants explicitly acknowledge that Mejoric is a passive infrastructure intermediary and disclaims any statutory, civil, or operational duty to monitor moonlighting compliance, execute corporate background checks, or actively verify third-party employer clearances. Mejoric relies strictly and exclusively in good faith upon the corporate undertakings self-certified by the Mentors. Any legal demands, corporate conflict-of-interest claims, or civil lawsuits initiated by an external employer or principal group regarding a Mentor&#x27;s platform activities shall remain the exclusive personal, legal, and financial liability of that individual provider.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 8.6</span>
                <span>Prohibition on Transmission of Proprietary and Third-Party Information</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">All Mates, Mentors, and Professionals are strictly prohibited from sharing, disclosing, utilizing, or transmitting any confidential information, trade secrets, patented methodologies, proprietary source code, or non-public financial/operational metrics belonging to their current employers, past employers, clients, agencies, or any third-party groups. Mejoric maintains a zero-tolerance policy for intellectual property contamination. Any data, insight, or advice provided by a Mentor must be entirely their own original creation or derived from public domain data. The platform explicitly disclaims any liability if a provider breaches an external corporate confidentiality or non-disclosure agreement during a session</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 8.7</span>
                <span>Independent Group and Agency Disclaimers</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Every Mentor onboarding onto the platform represents and warrants that they are not bound by any exclusive representation, agency mandate, incubation contract, talent management agreement, or group covenant that restricts their right to offer independent freelance guidance via Mejoric. If a Mentor belongs to an agency or external professional group, it is the sole personal responsibility of that Mentor to obtain all necessary corporate clearances, side-letters, or waivers before creating an account. Mejoric operates strictly on the faith of this corporate clearance representation.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 8.8</span>
                <span>Reliance on Mentor/Professional Self-Undertaking regarding Third-Party Obligations</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Every Mentor and Professional onboarding onto the platform provides an absolute, unconditional ongoing representation and undertaking that their registration, profile listing, and performance of online sessions does not violate any employment contract, non-compete covenant, corporate policy, exclusivity mandate, or confidentiality obligation owed to any current employer, past employer, professional agency, or third-party group.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 8.9</span>
                <span>Platform Disclaimer of Employer Verification Duty</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User and all platform participants explicitly acknowledge that Mejoric’s credential verification standard under Clause 8.4 is strictly administrative and confined to self-declared documentation. Mejoric disclaims any obligation to perform corporate due diligence, employer background checks, or moonlighting verifications. Mejoric relies strictly and exclusively in good faith upon the undertakings provided by the Mentors. Any legal claims, demands for corporate compensation, or lawsuits initiated by a Mentor’s employer or principal shall be the sole, exclusive, and personal liability of that Mentor.&quot;</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-9" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 9</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Data Privacy and Confidentiality</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 9.1</span>
                <span>Data Collected</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall collect and process only such personal data as is reasonably necessary for registration, booking of sessions, payment processing, platform safety, grievance redressal, legal compliance, fraud prevention, dispute resolution and provision of Platform Services.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such data may include identity and contact details, account and usage data, payment transaction records, booking details, and information or documents voluntarily shared by the User for availing a session or Professional Service.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mental-health, medical, legal, financial, tax or other sensitive/confidential information shall be collected, processed or retained only where voluntarily provided by the User, necessary for the requested service, required for safety or grievance handling, required by law, or processed with valid consent under applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall not record, store or review session recordings, transcripts, detailed notes or session content as a default practice. Such records may be created or retained only with prior notice and consent, or where necessary for safety, dispute resolution, fraud prevention, legal compliance, professional obligations or lawful authority.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">All personal data and sensitive information shall be handled in accordance with applicable data protection laws, including the Digital Personal Data Protection Act, 2023, the Digital Personal Data Protection Rules, 2025, the Information Technology Act, 2000 and applicable rules.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 9.2</span>
                <span>Data Protection Standard</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall implement reasonable technical and organisational measures to safeguard personal data, including encryption, access controls, need-to-know access, security monitoring, retention controls and data breach response processes appropriate to the nature and scale of the platform and applicable law.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 9.3</span>
                <span>Third – Party Infrastructure and Cross \- Border Processing</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric may engage third-party cloud providers, communication providers, analytics providers, payment processors, storage providers, infrastructure providers, AI service providers, cybersecurity vendors and other technology processors for operation of the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such service providers may process, store or transmit personal data within or outside India, subject to applicable law, contractual safeguards, security measures and reasonable data protection practices implemented by Mejoric.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Users acknowledge and consent to such processing, storage, transfer and use of data for operational, security, compliance, platform functionality, analytics, safety, fraud prevention and service-improvement purposes.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 9.4</span>
                <span>Confidentiality Obligations</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">All session content is confidential. Mejoric, Mates, Mentors, and Professionals are bound by confidentiality obligations that prohibit disclosure of session content to any third party except: (a) where the User has given express written consent; (b) where required by a court order or law enforcement authority under due process; or (c) where disclosure is necessary to prevent imminent risk of serious harm to the User or a third party.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 9.5</span>
                <span>Data Breach Response</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">In the event of a data breach affecting session content or personal data:</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(a) Mejoric shall notify affected users, where required, as soon as reasonably practicable after becoming aware of a confirmed breach, and in accordance with applicable law;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(b) such notification shall, to the extent reasonably available, include the nature of the breach, categories of data affected, and the measures being taken to address and mitigate the breach;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(c) Mejoric shall take appropriate technical and organizational measures to investigate, contain, and remediate the breach, which may include engagement of external cybersecurity experts where necessary; and</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(d) Mejoric shall notify the Data Protection Board of India or any other competent authority, where required, in accordance with the Digital Personal Data Protection Act, 2023\.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 9.6</span>
                <span>Data Retention and Deletion</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall retain personal data only for as long as reasonably necessary for providing Platform Services, account management, payment processing, safety, grievance redressal, fraud prevention, dispute resolution, legal compliance and enforcement of rights.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">1) Account and usage data shall be retained for the duration of the User’s active account and for a period of up to 24 months thereafter, unless earlier deletion is requested or longer retention is required under applicable law;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">2) Session recordings, transcripts, detailed notes or session content shall be retained only where specifically created with notice/consent, or where required for safety, grievance handling, dispute resolution, legal compliance, professional obligations or lawful authority.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">3) Financial, invoice and transaction records may be retained for up to 6 years from the end of the relevant financial year, or for such longer period as required under applicable tax, accounting, audit or regulatory laws.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">4) Records connected with complaints, investigations, legal proceedings, regulatory enquiries, fraud, safety incidents or enforcement of rights may be retained until the matter is finally resolved and for such further period as required by law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">5) Users may request deletion of their personal data by writing to [privacy@mejoric.com](mailto:privacy@mejoric.com)**.** Deletion requests shall be processed within 30 days, subject to retention requirements for legal compliance, fraud prevention, dispute resolution, and enforcement of legal rights.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Upon expiry of the applicable retention period, Mejoric shall take reasonable steps to delete, anonymise, de-identify or securely archive the relevant personal data.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 9.7</span>
                <span>Lawful Basis and Consent</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric processes personal data on the basis of User consent and for legitimate uses as permitted under applicable law, including the Digital Personal Data Protection Act, 2023\. By using the platform, the User provides free, informed, specific and unambiguous consent for processing of personal data for the purposes set out in these Terms and the Privacy Policy.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 9.8</span>
                <span>User Rights and Data Principal Rights</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Subject to applicable law, Users shall have the right to:</p>
                  <p className="text-gray-600 leading-relaxed mb-4">1) access and review their personal data;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">2) request correction, completion, updating, or erasure of personal data;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">3) withdraw consent for processing, subject to legal, operational, contractual, and regulatory limitations;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">4) nominate another individual to exercise rights in the event of death or incapacity, where applicable under law;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">5) seek grievance redressal regarding personal data processing; and</p>
                  <p className="text-gray-600 leading-relaxed mb-4">6) exercise any additional rights available under the Digital Personal Data Protection Act, 2023 or other applicable laws.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Requests may be submitted to [privacy@mejoric.com](mailto:privacy@mejoric.com) and shall be processed in accordance with applicable law.</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-10" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 10</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Anti-Harassment and Safe Conduct Policy</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 10.1</span>
                <span>Zero Tolerance Policy</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric operates a zero-tolerance policy for harassment, abuse, grooming or any form of sexual misconduct within the platform. This applies equally to Users, Mates, Mentors, Professionals and Mejoric personnel. Any party found to have engaged in such behaviour may be suspended, permanently removed from the platform, denied future access and reported to law enforcement or regulatory authorities where required or considered appropriate by Mejoric.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 10.2</span>
                <span>Definition of Prohibited Conduct</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Without limiting the general prohibited conduct under Clause 4.2 and the platform boundaries under Clause 5, prohibited harassment and safety misconduct shall include:</p>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Sexual harassment, including conduct falling within the scope of the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Grooming, stalking, threats, intimidation, coercion, blackmail, abuse, exploitation or any conduct intended to create fear, pressure, dependency or personal control;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Soliciting or attempting to obtain personal contact information, arranging or proposing physical meetings, or initiating or encouraging off-platform communication;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Sharing, transmitting or requesting any explicit, offensive or sexually suggestive content;</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Requesting, pressuring or manipulating any person to disclose personal or sensitive information, including contact details, address, workplace, location, photographs, identity documents, social media accounts or payment details; or</li>
                  <li className="text-gray-600 leading-relaxed list-disc ml-6 mb-2">Misusing any emotional support, mentoring or professional session for sexual gratification, romantic pursuit, grooming, exploitation, manipulation, blackmail, coercion or any purpose unrelated to the intended support, guidance or professional service.</li>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 10.3</span>
                <span>Reporting Mechanism and Grievance Redressal</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any User, Mate, Mentor or Professional who experiences or becomes aware of harassment, misconduct, unlawful activity, platform misuse, safety concerns or violations of these Terms may report the same through the in-platform reporting mechanism or by contacting:</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Grievance Officer: \[INSERT NAME\]</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Designation: Grievance Officer</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Email: [grievance@mejoric.com](mailto:grievance@mejoric.com)</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Address: \[INSERT REGISTERED OFFICE ADDRESS\]</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Phone: \[INSERT NUMBER\]</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall acknowledge complaints within 72 hours and endeavour to review and address such complaints within 15 days from receipt, in accordance with applicable law, including the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021\.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Depending on the nature and severity of the complaint, Mejoric may conduct internal review, seek additional information, preserve records, suspend or restrict access, remove content, notify regulatory or law enforcement authorities, or take any other action permitted under applicable law and these Terms.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall endeavour to maintain confidentiality of the reporting party, subject to legal requirements, investigation obligations and safety considerations.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 10.4</span>
                <span>Monitoring, Recording and Safety Review</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric may monitor, review, preserve, analyse, or investigate platform interactions, metadata, complaints, safety reports, technical logs, account activity, payment activity, communications, or related platform behaviour for purposes including safety, fraud prevention, dispute resolution, compliance, quality control, service improvement, enforcement of these Terms, and legal or regulatory compliance.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Where Mejoric records or stores any session content for safety, quality assurance, compliance, dispute resolution, fraud prevention, or legal purposes, such recording shall only occur:</p>
                  <p className="text-gray-600 leading-relaxed mb-4">1) with appropriate notice to the User;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">2) pursuant to applicable law, lawful authority, or regulatory obligation; or</p>
                  <p className="text-gray-600 leading-relaxed mb-4">3) where reasonably necessary for safety, dispute resolution, fraud prevention, platform integrity, or legal compliance.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Users acknowledge and consent to such processing and understand that retention periods may vary depending on legal, operational, contractual, regulatory, safety, or investigative requirements.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not undertake any obligation to continuously monitor all sessions, communications, users, practitioners, risks, emergencies, or content on the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 10.5</span>
                <span>Preservation of Technical and Evidentiary Records</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric may preserve metadata, timestamps, platform logs, technical records, session activity records, communication logs, IP logs, device information, moderation history, payment records, access records, audit trails and related technical information for evidentiary purposes, fraud prevention, dispute resolution, platform integrity, safety monitoring, legal enforcement, regulatory compliance and investigation of suspected misuse.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such records may be retained and disclosed in accordance with applicable law, platform policy, lawful authority or legitimate safety and compliance requirements.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 10.6</span>
                <span>POSH Compliance and Internal Complaints Mechanism</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric is committed to maintaining a platform environment free from sexual harassment, exploitation, abuse, grooming, intimidation, stalking, coercion, and gender-based misconduct.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Where applicable under the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013, Mejoric shall maintain an Internal Complaints Committee and appropriate reporting and redressal mechanisms in accordance with applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Complaints involving sexual harassment, exploitation, grooming, abuse, or gender-based misconduct may be investigated and addressed in accordance with applicable law, platform policies, internal procedures, and safety protocols.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric reserves the right to suspend accounts, preserve records, restrict access, cooperate with lawful authorities, or take other appropriate protective measures where reasonably necessary for safety or compliance.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">#</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-11" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 11</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Platform Liability and Indemnification</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 11.1</span>
                <span>Limitation of Platform Liability</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">To the maximum extent permitted under applicable law, Mejoric’s aggregate liability arising out of or relating to the platform or these Terms shall not exceed the total platform fees actually received and retained by Mejoric from the concerned User during the three months immediately preceding the event giving rise to the claim.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such limitation shall apply per claim or incident. Mejoric shall only be liable for direct losses arising solely from its proven gross negligence, wilful misconduct or material platform-level breach of these Terms.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall not be liable for:</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(a) indirect, consequential, punitive, incidental or special damages;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(b) emotional distress, reputational harm, loss of opportunity, loss of income, business loss, tax loss, legal loss, investment loss or regulatory consequences;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(c) outcomes arising from guidance provided by Mates or Mentors;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(d) professional advice, clinical decisions, legal opinions, tax positions, financial guidance, certifications, assessments, therapeutic interventions, treatment approaches, filings, professional judgments or services provided by independent Professionals; or</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(e) acts, omissions, disruptions or conduct of Users, Mates, Mentors, Professionals, third parties, payment providers, cloud providers, telecom providers or external infrastructure providers beyond Mejoric’s reasonable control.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Nothing in these Terms excludes liability that cannot lawfully be excluded under applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 11.2</span>
                <span>Insurance and Risk Allocation</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any insurance maintained by Mejoric, including professional indemnity insurance, cyber insurance, platform liability insurance or operational risk coverage, is maintained solely for internal commercial risk-management purposes.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">The existence of such insurance shall not create any third-party beneficiary rights, direct claim rights, guaranteed compensation rights or assumption of liability by Mejoric beyond the limits expressly set out in these Terms and applicable law.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 11.3</span>
                <span>Liability for Independent Professional Services</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall not be liable for any claim, loss, damage, cost, expense, professional negligence, deficiency in service, malpractice, misconduct, wrong advice, breach of professional duty, breach of confidentiality, non-appearance, delay, cancellation, non-availability, unfavourable outcome or consequence arising from or connected with any Professional Service. Any claim relating to a Professional’s advice, opinion, conduct or service shall be brought against the concerned Professional and not against Mejoric, except to the extent arising solely from Mejoric’s own proven breach of these Terms or applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 11.4</span>
                <span>Safe Harbour under IT Act 2000</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric operates as an intermediary/technology platform under Section 79 of the Information Technology Act 2000 and is entitled to safe harbour protection for third-party content on the platform, subject to compliance with applicable due diligence requirements under the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021\.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 11.5</span>
                <span>Third – Party Content and User – Generated Material</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not pre-screen, independently verify or endorse all User-generated content, uploaded material, communications, reviews, statements, documents, advice, messages, comments or representations made by Users, Mates, Mentors, Professionals or third parties on the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">To the maximum extent permitted under applicable law, Mejoric shall not be responsible for third-party content except to the extent required after receiving actual knowledge or lawful notice in accordance with the Information Technology Act, 2000 and applicable intermediary laws.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 11.6</span>
                <span>User Indemnification</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User agrees to indemnify and hold harmless Mejoric against losses, liabilities, penalties, damages, costs and reasonable legal expenses arising directly from:</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(a) fraudulent or unlawful use of the platform;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(b) deliberate misrepresentation of age, identity, facts, documents, professional requirements, legal deadlines, tax facts or health / mental health information;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(c) wilful breach of these Terms;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(d) infringement of intellectual property rights;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(e) malicious, abusive, fraudulent or criminal conduct committed through the platform; or</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(f) attempted off-platform diversion of Mates, Mentors or Professionals.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 11.7</span>
                <span>Force Majeure</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall not be liable for delay, interruption, suspension, degradation, or failure in performance arising from events beyond its reasonable control, including natural disasters, cyberattacks, governmental restrictions, regulatory action, internet failures, telecommunications outages, cloud infrastructure failures, payment gateway disruptions, labour disputes, pandemics, acts of third-party service providers, or other force majeure events.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Where a force majeure event substantially disrupts services for a continuous period exceeding 30 days, Mejoric may, at its reasonable discretion, provide refunds, credits, rescheduling, extensions, or other commercially reasonable remedies for unused prepaid sessions.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 11.8</span>
                <span>Intermediary Compliance and Regulatory Obligations</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric operates as an intermediary platform under the Information Technology Act, 2000 and shall undertake reasonable due diligence obligations in accordance with applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall:</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(a) appoint and publish details of a Grievance Officer in accordance with applicable law;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(b) acknowledge and address grievances within statutory timelines;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(c) act upon lawful orders, notices or actual knowledge in accordance with applicable law;</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(d) implement reasonable safety, fraud prevention, moderation and platform integrity measures; and</p>
                  <p className="text-gray-600 leading-relaxed mb-4">(e) maintain policies and procedures reasonably necessary for compliance with applicable consumer protection, intermediary, privacy and data protection laws.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 11.9</span>
                <span>Disclaimer of Warranties and Third-Party Conduct</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The platform is provided on an “as-is” and “as-available” basis without warranties of any kind, including fitness for a particular purpose, accuracy, reliability, availability, security or suitability for any legal, medical, financial, tax, professional or personal purpose. Mejoric does not warrant uninterrupted, error-free or secure access and is not responsible for the conduct, statements, advice, services or actions of any User, Mate, Mentor, Professional or third party on the platform.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">#</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-12" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 12</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Payment Framework</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 12.1</span>
                <span>Payment Processing</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">All payments on the platform shall be processed through authorised payment system providers regulated by the Reserve Bank of India or other permitted payment channels. The User agrees to comply with applicable terms and conditions of such providers. Mejoric shall not be responsible for failure, delay, error or security breach attributable to third-party payment systems.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 12.2</span>
                <span>Payment Confirmation</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">A session shall be deemed confirmed only upon successful receipt of payment and issuance of confirmation by the platform.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 12.3</span>
                <span>Platform Fee and Professional Fee</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Fees displayed on the platform may include platform fees, convenience fees, professional fees, taxes or bundled charges.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 12.4</span>
                <span>No Off-Platform Payments</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall not recognise, verify or be responsible for any payment made outside the platform or outside authorised payment channels. Users making off-platform payments do so at their own risk and may lose platform-level support, refund eligibility and grievance assistance.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 12.5</span>
                <span>Chargebacks and Payment Disputes</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User agrees to first raise any payment-related issue with Mejoric prior to initiating any chargeback or reversal request.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">In the event of a chargeback or unauthorised reversal, Mejoric reserves the right to suspend or restrict access to the platform and recover amounts due along with reasonable administrative, legal and recovery costs, in accordance with applicable law and payment system rules.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 12.6</span>
                <span>Taxes</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">All payments shall be subject to applicable taxes, including Goods and Services Tax (GST), payment gateway charges and any withholding, collection or levy applicable under prevailing law.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 12.7</span>
                <span>Pricing, Refund and Cancellation Policy</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">All pricing, refund, cancellation, rescheduling and related payment terms shall be governed by Mejoric’s Pricing and Refund Policy, as updated from time to time and made available on the platform. In the event of inconsistency between these Terms and the Pricing and Refund Policy, the Pricing and Refund Policy shall prevail solely with respect to pricing, refunds, cancellations and rescheduling.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 12.8</span>
                <span>Consumer and E-Commerce Compliance</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric shall endeavour to maintain disclosures, grievance mechanisms, refund processes, customer communication channels and compliance measures reasonably required under applicable consumer protection and e-commerce laws in India, including the Consumer Protection Act, 2019 and applicable rules thereunder.</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-13" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 13</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Intellectual Property</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 13.1</span>
                <span>Ownership of Platform</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">All intellectual property rights in the Mejoric platform, including its software, architecture, design, trademarks, branding, domain name, content, and underlying technology, are the exclusive property of Mejoric or its licensors and are protected under the Copyright Act, 1957, the Trade Marks Act, 1999, and other applicable laws.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 13.2</span>
                <span>Limited License to Use Platform</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Subject to compliance with these Terms, the User is granted a limited, non-exclusive, non-transferable, revocable license to access and use the platform solely for its intended purpose.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 13.3</span>
                <span>Feedback and Suggestions</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any feedback, suggestions, ratings, or reviews submitted by the User may be used, reproduced, modified, and displayed by Mejoric for operational, analytical, or promotional purposes without any compensation or attribution obligation.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 13.4</span>
                <span>Restrictions</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User shall not copy, reproduce, distribute, modify, reverse engineer, decompile, create derivative works from, or commercially exploit any part of the platform or its intellectual property.</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-14" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 14</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Relationship of Parties</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 14.1</span>
                <span>Platform Role</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric provides a technology platform enabling interaction between Users and independent Mates, Mentors and Professionals and does not itself provide the underlying services rendered during sessions.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 14.2</span>
                <span>Independent Mates, Mentors and Professionals</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">All Mates, Mentors and Professionals available on the platform are independent service providers and are not employees, agents, representatives, partners or authorised signatories of Mejoric, unless expressly agreed otherwise in writing.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 14.3</span>
                <span>Independent Professional Decision \- Making</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">All Mates, Mentors and Professionals independently determine whether to accept Users, continue sessions, refuse engagement, provide services, issue advice, prescribe treatment, recommend action, terminate sessions or decline professional engagement.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Mejoric does not direct, mandate, approve, review or control the substance of professional advice, diagnosis, treatment, legal opinion, tax position, financial recommendation, counselling approach, therapeutic methodology or professional outcome provided by any independent Professional.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 14.4</span>
                <span>No Agency or Employment Relationship</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Nothing in these Terms shall be construed to create any agency, partnership, joint venture, fiduciary, franchise, employment or professional relationship between Mejoric and any User, Mate, Mentor or Professional.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 14.5</span>
                <span>Practitioner / Professional Agreements and Independent Obligations</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mates, Mentors and Professionals engaged through the platform may be bound by separate onboarding terms, professional agreements, codes of conduct, confidentiality obligations, safety requirements, platform policies and service-specific obligations imposed by Mejoric.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such agreements may include obligations relating to professional conduct, confidentiality, anti-harassment compliance, credential verification, safety escalation, crisis response, professional ethics, regulatory compliance and applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Such separate agreements do not convert Mejoric into the provider of the underlying professional service.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">#</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 14.6</span>
                <span>Third-Party Contractual Compliance Obligations</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Every Mate, Mentor, and Professional accessible through the platform acts under a strict, unconditional ongoing representation that their onboarding and performance of sessions on Mejoric does not violate any employment agreement, non-compete covenant, corporate policy, exclusivity clause, or confidentiality obligation owed to any third-party employer, partner, or entity. The provider remains solely responsible for obtaining all necessary corporate consents, regulatory approvals, or &quot;No Objection Certificates&quot; (NOCs) required to legally offer their services via the marketplace.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 14.7</span>
                <span>Provider Indemnity Against Third-Party Employer Claims</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">In the event that a third-party employer, principal, or entity initiates a legal claim, sends a demand notice, or seeks compensation from Mejoric arising out of an alleged breach of an employment contract, moonlighting policy, or intellectual property restriction by a Mate, Mentor, or Professional, the concerned provider shall be solely, personally, and fully liable to defend, indemnify, and hold Mejoric completely harmless against all resulting damages, legal fees, settlements, and administrative costs.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 14.8</span>
                <span>Autonomy and Non-Exclusive Status of Mates</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">All Mates acknowledge that they retain absolute autonomy over their schedules, availability, and engagement parameters on the platform. Onboarding as a Mate does not create an exclusive relationship. Mates are free to provide similar peer-support, listing, or employment services on any other third-party platform or marketplace simultaneously. Mejoric does not guarantee any minimum volume of sessions, placement, or earnings to any Mate.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 14.9</span>
                <span>Disclaimer of Vicarious Liability for Mate Conduct</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric acts strictly as a neutral technology infrastructure provider and does not supervise, direct, script, or clinically control the conversations or peer-interactions conducted by Mates. Consequently, Mejoric explicitly disclaims all vicarious liability, tortious liability, or joint liability for any emotional distress, psychological harm, personal disputes, misrepresentations, or omissions arising during a session between a User and a Mate. The Mate acts strictly on their own account as an independent contractor.</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-15" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 15</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Platform Infrastructure and Availability</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 15.1</span>
                <span>Dependency on Third-Party Infrastructure</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The platform relies on third-party infrastructure including internet service providers, telecommunications networks, cloud providers, device hardware, software systems and payment gateways. Mejoric does not guarantee uninterrupted, error-free or secure access at all times.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 15.2</span>
                <span>Technical Disruptions</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">In the event of any technical failure or disruption attributable to the platform, Mejoric may, at its sole discretion, provide rescheduling, service credits or such other reasonable remedies as it deems appropriate.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 15.3</span>
                <span>Maintenance and Modifications</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric reserves the right to modify, suspend, restrict or discontinue any feature or functionality of the platform at any time, including for maintenance, upgrades, security, business reasons or compliance with applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">#</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-16" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 16</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Fraud, Payment Misuse and Compliance</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 16.1</span>
                <span>Fraudulent or Suspicious Activity</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric reserves the right to suspend, block or terminate access to the platform where any transaction or activity is suspected to be fraudulent, unauthorised, abusive or in violation of applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 16.2</span>
                <span>Investigation and Enforcement</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric may investigate suspected misuse and may take appropriate action including restriction of access, reversal of benefits, preservation of records, reporting to regulatory or law enforcement authorities and initiation of legal proceedings, in accordance with applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 16.3</span>
                <span>Cooperation with Authorities</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Mejoric may disclose information or records where required under the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, the Digital Personal Data Protection Rules, 2025, professional regulatory law, tax law, criminal law or any other applicable law or lawful order.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 16.4</span>
                <span>Financial Responsibility for Misuse</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User shall remain liable for any loss, damage, chargeback, reversal, penalty, or cost incurred by Mejoric arising from fraudulent, unauthorised, or abusive use of the platform or payment systems.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">#</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-17" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 17</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Dispute Resolution and Governing Law</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 17.1</span>
                <span>Grievance Mechanism \- First Step</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Any dispute, complaint, or grievance may be submitted to Mejoric’s Grievance Officer at grievance@mejoric.com. Mejoric shall acknowledge and address such grievances within the timelines prescribed under applicable law, including the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the Digital Personal Data Protection Act, 2023, where applicable.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 17.2</span>
                <span>Mediation \- Second Step</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">If the grievance mechanism does not resolve the dispute within 30 days, both parties agree to attempt resolution through mediation at a mutually agreed mediation centre in Mumbai, Maharashtra before initiating arbitration or litigation.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 17.3</span>
                <span>Arbitration \- Third Step</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">If mediation fails, disputes shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996\.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">The arbitration shall be conducted by a sole arbitrator mutually appointed by the parties. In the absence of agreement within 15 days, the arbitrator shall be appointed in accordance with applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">The seat and venue of arbitration shall be Mumbai, Maharashtra and proceedings shall be conducted in English.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Nothing contained in this clause shall restrict or prevent a User from approaching a Consumer Disputes Redressal Commission or statutory authority having jurisdiction under applicable law, including the Consumer Protection Act, 2019\.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">For disputes involving claims below INR 50,000, the parties shall first attempt online dispute resolution, virtual mediation or simplified settlement procedures before initiating arbitration proceedings.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 17.4</span>
                <span>Individual Resolution of Disputes</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">To the maximum extent permitted under applicable law, disputes arising out of or relating to the platform, these Terms or any services accessed through the platform shall be resolved only on an individual basis.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">No party shall bring or participate in any class action, representative action, collective proceeding, consolidated proceeding, mass arbitration or similar multi-party claim against Mejoric, except where such restriction is prohibited under applicable law.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">##</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 17.5</span>
                <span>Governing Law and Jurisdiction</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">These Terms are governed by the laws of India. For matters not subject to arbitration, the parties submit to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-18" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 18</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">General Provisions</h2>
            </div>
            
            
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 18.1</span>
                <span>Severability</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">If any provision of these Terms is held invalid, unlawful, unenforceable or contrary to applicable law by a competent authority or court, the remaining provisions shall continue in full force and effect to the maximum extent permitted by law.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 18.2</span>
                <span>Entire Agreement</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">These Terms, together with the Privacy Policy, Pricing and Refund Policy, Professional-specific terms, Clinical / Counselling Consent Terms, Legal Services Terms, Financial / Tax Services Terms and any policies expressly incorporated by reference, as and when made applicable to the relevant service category, constitute the entire agreement between the User and Mejoric relating to use of the platform.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 18.3</span>
                <span>Survival</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">Clauses relating to confidentiality, privacy, intellectual property, indemnification, limitation of liability, payments, dispute resolution, data protection, regulatory compliance, professional responsibility, non-circumvention and any provisions intended by their nature to survive termination shall continue in effect notwithstanding suspension, termination or discontinuation of platform access.</p>
              </div>
            </div>
            
            
            <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-semibold">Clause 18.4</span>
                <span>Waiver of Class Actions and Representative Proceedings</span>
              </h3>
              <div className="pl-0 md:pl-2 space-y-2">
                <p className="text-gray-600 leading-relaxed mb-4">The User explicitly agrees that any dispute resolution, arbitration, litigation, or consumer forum proceedings arising out of or relating to the platform, platform services, or these Terms shall be conducted strictly on an individual basis. The User expressly waives any right to initiate, join, participate in, or act as a class representative or class member in any class action, consolidated action, representative lawsuit, or collective litigation against Mejoric Private Limited or its directors.</p>
              </div>
            </div>
            
            
            
          </section>
        
        
          <section id="chapter-19" className="scroll-mt-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Chapter 19</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Informed User Consent and Risk Acknowledgement</h2>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-4">By using Mejoric, the User confirms that the User has read and understood all of the following statements. These form the User’s informed consent to use the platform:</p>
            <p className="text-gray-600 leading-relaxed mb-4">## **Consent Statements**</p>
            
            
            
            
            <div className="mt-6 space-y-3 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500 font-semibold mb-4 uppercase tracking-wider">Please review and check each statement:</p>
              
                <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer select-none">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      type="checkbox"
                      checked={consents['19.1'] || false}
                      onChange={() => handleConsentChange('19.1')}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-purple-700 mr-2">19.1</span>
                    <span className="text-gray-700 leading-relaxed">I acknowledge that Mejoric is only a technology platform / aggregator and does not itself provide medical, legal, CA, tax, financial, therapy, counselling, emergency or any other regulated professional service.</span>
                  </div>
                </label>
                
              
                <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer select-none">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      type="checkbox"
                      checked={consents['19.2'] || false}
                      onChange={() => handleConsentChange('19.2')}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-purple-700 mr-2">19.2</span>
                    <span className="text-gray-700 leading-relaxed">I acknowledge that Mates provide peer-level emotional support only and Mentors provide general guidance only, unless the concerned person is separately identified and engaged as a qualified Professional for a regulated service.</span>
                  </div>
                </label>
                
              
                <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer select-none">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      type="checkbox"
                      checked={consents['19.3'] || false}
                      onChange={() => handleConsentChange('19.3')}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-purple-700 mr-2">19.3</span>
                    <span className="text-gray-700 leading-relaxed">I acknowledge that any advice, consultation, counselling, therapy, legal view, document review, tax view, financial guidance, certification, attestation or other Professional Service is provided solely by the concerned independent Professional, who shall remain responsible for the same; Mejoric shall not be liable for wrong advice, professional negligence, wrong diagnosis, missed limitation period, incorrect tax / financial advice, certification error, misconduct, breach of professional duty or outcome of such Professional Service, except to the limited extent of Mejoric’s own proven platform-level breach.</span>
                  </div>
                </label>
                
              
                <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer select-none">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      type="checkbox"
                      checked={consents['19.4'] || false}
                      onChange={() => handleConsentChange('19.4')}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-purple-700 mr-2">19.4</span>
                    <span className="text-gray-700 leading-relaxed">I acknowledge that outcomes from any session, including legal, financial, tax, medical, therapeutic, counselling, professional or personal outcomes, are not guaranteed and may depend on facts, disclosures, evidence, professional judgment, legal requirements, third-party actions and circumstances beyond Mejoric’s control.</span>
                  </div>
                </label>
                
              
                <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer select-none">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      type="checkbox"
                      checked={consents['19.5'] || false}
                      onChange={() => handleConsentChange('19.5')}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-purple-700 mr-2">19.5</span>
                    <span className="text-gray-700 leading-relaxed">I acknowledge that if I experience suicidal ideation, self-harm risk, psychiatric emergency, medical emergency or immediate safety risk, I will contact emergency services, a hospital or a crisis helpline and will not rely on Mejoric for crisis support.</span>
                  </div>
                </label>
                
              
                <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer select-none">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      type="checkbox"
                      checked={consents['19.6'] || false}
                      onChange={() => handleConsentChange('19.6')}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-purple-700 mr-2">19.6</span>
                    <span className="text-gray-700 leading-relaxed">I acknowledge that any legal, financial, tax, medical, mental health, business, professional, relationship, career or personal decision made by me after a session shall be at my own discretion, and I will seek formal independent advice, referral, emergency intervention, hospitalisation, medication or independent treatment wherever required.</span>
                  </div>
                </label>
                
              
                <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer select-none">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      type="checkbox"
                      checked={consents['19.7'] || false}
                      onChange={() => handleConsentChange('19.7')}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-purple-700 mr-2">19.7</span>
                    <span className="text-gray-700 leading-relaxed">I consent to Mejoric collecting and processing my personal data, including sensitive health-related, legal, financial, tax or professional information disclosed by me, in accordance with the Privacy Policy and applicable data protection laws.</span>
                  </div>
                </label>
                
              
                <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer select-none">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      type="checkbox"
                      checked={consents['19.8'] || false}
                      onChange={() => handleConsentChange('19.8')}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-purple-700 mr-2">19.8</span>
                    <span className="text-gray-700 leading-relaxed">I confirm that I meet the applicable age requirement, have legal capacity to use the platform, am not currently experiencing any psychiatric, medical or safety emergency requiring immediate intervention, and will not attempt to contact, identify beyond authorised platform disclosures, divert, hire, engage or meet any Mate, Mentor or Professional outside the platform except through authorised platform processes or where expressly permitted by Mejoric or applicable law.</span>
                  </div>
                </label>
                
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-purple-500/10 active:scale-95"
                >
                  Accept All Consent Statements
                </button>
              </div>
            </div>
            
          </section>
        

              {/* Styled Contact Directory Box */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Legal Support Contact Directory</h3>
                <p className="text-sm text-gray-500 font-medium mb-6">If you have any questions, disputes or data deletion requests, contact our dedicated legal channels:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/10 transition-all">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">General Legal</span>
                <a href="mailto:legal@mejoric.com" className="text-purple-600 hover:text-purple-700 font-bold text-sm sm:text-base transition-colors truncate">
                  legal@mejoric.com
                </a>
              </div>
            
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/10 transition-all">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Grievance Officer</span>
                <a href="mailto:grievance@mejoric.com" className="text-purple-600 hover:text-purple-700 font-bold text-sm sm:text-base transition-colors truncate">
                  grievance@mejoric.com
                </a>
              </div>
            
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/10 transition-all">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Safety &amp; Harassment</span>
                <a href="mailto:safety@mejoric.com" className="text-purple-600 hover:text-purple-700 font-bold text-sm sm:text-base transition-colors truncate">
                  safety@mejoric.com
                </a>
              </div>
            
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/10 transition-all">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Privacy &amp; Data</span>
                <a href="mailto:privacy@mejoric.com" className="text-purple-600 hover:text-purple-700 font-bold text-sm sm:text-base transition-colors truncate">
                  privacy@mejoric.com
                </a>
              </div>
            
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/10 transition-all">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">User Support</span>
                <a href="mailto:support@mejoric.com" className="text-purple-600 hover:text-purple-700 font-bold text-sm sm:text-base transition-colors truncate">
                  support@mejoric.com
                </a>
              </div>
            
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/10 transition-all">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Website</span>
                <a href="https://mejoric.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-bold text-sm sm:text-base transition-colors">
                  mejoric.com
                </a>
              </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
      <Footer />
    </Layout>
  );
}
