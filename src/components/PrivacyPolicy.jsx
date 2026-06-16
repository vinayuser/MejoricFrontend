import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Footer from "../components/Footer";

const sections = [
  {
    id: "section-1",
    num: "1",
    title: "Data Collected",
    clause: "Clause 9.1",
    paragraphs: [
      "Mejoric shall collect and process only such personal data as is reasonably necessary for registration, booking of sessions, payment processing, platform safety, grievance redressal, legal compliance, fraud prevention, dispute resolution and provision of Platform Services.",
      "Such data may include identity and contact details, account and usage data, payment transaction records, booking details, and information or documents voluntarily shared by the User for availing a session or Professional Service.",
      "Mental-health, medical, legal, financial, tax or other sensitive/confidential information shall be collected, processed or retained only where voluntarily provided by the User, necessary for the requested service, required for safety or grievance handling, required by law, or processed with valid consent under applicable law.",
      "Mejoric shall not record, store or review session recordings, transcripts, detailed notes or session content as a default practice. Such records may be created or retained only with prior notice and consent, or where necessary for safety, dispute resolution, fraud prevention, legal compliance, professional obligations or lawful authority.",
      "All personal data and sensitive information shall be handled in accordance with applicable data protection laws, including the Digital Personal Data Protection Act, 2023, the Digital Personal Data Protection Rules, 2025, the Information Technology Act, 2000 and applicable rules.",
    ],
  },
  {
    id: "section-2",
    num: "2",
    title: "Data Protection Standard",
    clause: "Clause 9.2",
    paragraphs: [
      "Mejoric shall implement reasonable technical and organisational measures to safeguard personal data, including encryption, access controls, need-to-know access, security monitoring, retention controls and data breach response processes appropriate to the nature and scale of the platform and applicable law.",
    ],
  },
  {
    id: "section-3",
    num: "3",
    title: "Third-Party Infrastructure and Cross-Border Processing",
    clause: "Clause 9.3",
    paragraphs: [
      "Mejoric may engage third-party cloud providers, communication providers, analytics providers, payment processors, storage providers, infrastructure providers, AI service providers, cybersecurity vendors and other technology processors for operation of the platform.",
      "Such service providers may process, store or transmit personal data within or outside India, subject to applicable law, contractual safeguards, security measures and reasonable data protection practices implemented by Mejoric.",
      "Users acknowledge and consent to such processing, storage, transfer and use of data for operational, security, compliance, platform functionality, analytics, safety, fraud prevention and service-improvement purposes.",
    ],
  },
  {
    id: "section-4",
    num: "4",
    title: "Confidentiality Obligations",
    clause: "Clause 9.4",
    paragraphs: [
      "All session content is confidential. Mejoric, Mates, Mentors, and Professionals are bound by confidentiality obligations that prohibit disclosure of session content to any third party except: (a) where the User has given express written consent; (b) where required by a court order or law enforcement authority under due process; or (c) where disclosure is necessary to prevent imminent risk of serious harm to the User or a third party.",
    ],
  },
  {
    id: "section-5",
    num: "5",
    title: "Data Breach Response",
    clause: "Clause 9.5",
    paragraphs: [
      "In the event of a data breach affecting session content or personal data:",
      "(a) Mejoric shall notify affected users, where required, as soon as reasonably practicable after becoming aware of a confirmed breach, and in accordance with applicable law;",
      "(b) such notification shall, to the extent reasonably available, include the nature of the breach, categories of data affected, and the measures being taken to address and mitigate the breach;",
      "(c) Mejoric shall take appropriate technical and organizational measures to investigate, contain, and remediate the breach, which may include engagement of external cybersecurity experts where necessary; and",
      "(d) Mejoric shall notify the Data Protection Board of India or any other competent authority, where required, in accordance with the Digital Personal Data Protection Act, 2023.",
    ],
  },
  {
    id: "section-6",
    num: "6",
    title: "Data Retention and Deletion",
    clause: "Clause 9.6",
    paragraphs: [
      "Mejoric shall retain personal data only for as long as reasonably necessary for providing Platform Services, account management, payment processing, safety, grievance redressal, fraud prevention, dispute resolution, legal compliance and enforcement of rights.",
      "Account and usage data shall be retained for the duration of the User's active account and for a period of up to 24 months thereafter, unless earlier deletion is requested or longer retention is required under applicable law.",
      "Session recordings, transcripts, detailed notes or session content shall be retained only where specifically created with notice/consent, or where required for safety, grievance handling, dispute resolution, legal compliance, professional obligations or lawful authority.",
      "Financial, invoice and transaction records may be retained for up to 6 years from the end of the relevant financial year, or for such longer period as required under applicable tax, accounting, audit or regulatory laws.",
      "Records connected with complaints, investigations, legal proceedings, regulatory enquiries, fraud, safety incidents or enforcement of rights may be retained until the matter is finally resolved and for such further period as required by law.",
      "Users may request deletion of their personal data by writing to privacy@mejoric.com. Deletion requests shall be processed within 30 days, subject to retention requirements for legal compliance, fraud prevention, dispute resolution, and enforcement of legal rights.",
      "Upon expiry of the applicable retention period, Mejoric shall take reasonable steps to delete, anonymise, de-identify or securely archive the relevant personal data.",
    ],
  },
  {
    id: "section-7",
    num: "7",
    title: "Lawful Basis and Consent",
    clause: "Clause 9.7",
    paragraphs: [
      "Mejoric processes personal data on the basis of User consent and for legitimate uses as permitted under applicable law, including the Digital Personal Data Protection Act, 2023. By using the platform, the User provides free, informed, specific and unambiguous consent for processing of personal data for the purposes set out in these Terms and the Privacy Policy.",
    ],
  },
  {
    id: "section-8",
    num: "8",
    title: "User Rights and Data Principal Rights",
    clause: "Clause 9.8",
    paragraphs: [
      "Subject to applicable law, Users shall have the right to:",
    ],
    listItems: [
      "access and review their personal data;",
      "request correction, completion, updating, or erasure of personal data;",
      "withdraw consent for processing, subject to legal, operational, contractual, and regulatory limitations;",
      "nominate another individual to exercise rights in the event of death or incapacity, where applicable under law;",
      "seek grievance redressal regarding personal data processing; and",
      "exercise any additional rights available under the Digital Personal Data Protection Act, 2023 or other applicable laws.",
    ],
    footer:
      "Requests may be submitted to privacy@mejoric.com and shall be processed in accordance with applicable law.",
  },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("section-1");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const sec of sections) {
        const element = document.getElementById(sec.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const filteredSections = sections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.num.includes(searchTerm),
  );

  return (
    <Layout activePage="Privacy Policy">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-700 font-semibold text-sm mb-4 shadow-sm backdrop-blur-sm">
              <span>Mejoric Private Limited</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-4">
              Privacy{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Policy
              </span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed font-medium">
              Chapter 9 — Data Privacy and Confidentiality from the Mejoric User
              Terms (Version 1.0, effective 12 May 2026).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-6 space-y-6 max-h-[80vh] flex flex-col">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg mb-2">
                    Table of Contents
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">
                    Explore policy chapters
                  </p>
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
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="overflow-y-auto pr-1 flex-1 space-y-1">
                  {filteredSections.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${
                        activeSection === sec.id
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/10 scale-[1.02]"
                          : "text-gray-600 hover:bg-purple-50/50 hover:text-purple-700"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold flex items-center justify-center ${
                          activeSection === sec.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {sec.num}
                      </span>
                      <span className="truncate">{sec.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-purple-100/50 shadow-xl shadow-purple-900/5 p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Policy Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-500 text-sm">Company</span>
                    <span className="text-gray-900 font-bold text-sm">Mejoric Private Limited</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-500 text-sm">Website</span>
                    <a
                      href="https://mejoric.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline font-bold text-sm"
                    >
                      mejoric.com
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-500 text-sm">Effective Date</span>
                    <span className="text-gray-900 font-bold text-sm">12 May 2026</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-3">
                    <span className="font-semibold text-gray-500 text-sm">Version</span>
                    <span className="text-gray-900 font-bold text-sm">1.0</span>
                  </div>
                </div>
              </div>

              {sections.map((sec) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-6 md:p-8 space-y-5"
                >
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-lg shadow-sm">
                      {sec.num}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                        {sec.clause}
                      </p>
                      <h2 className="text-2xl font-extrabold text-gray-900">
                        {sec.title}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {sec.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-gray-600 leading-relaxed text-sm md:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {sec.listItems?.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ))}

                    {sec.footer && (
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium">
                        {sec.footer}
                      </p>
                    )}
                  </div>
                </section>
              ))}

              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 md:p-10">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                  Contact Directory
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-6">
                  For privacy, grievance, safety, or support enquiries:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Privacy & Data", email: "privacy@mejoric.com" },
                    { label: "Grievance Officer", email: "grievance@mejoric.com" },
                    { label: "Safety & Harassment", email: "safety@mejoric.com" },
                    { label: "General Legal", email: "legal@mejoric.com" },
                    { label: "User Support", email: "support@mejoric.com" },
                  ].map((contact) => (
                    <div
                      key={contact.email}
                      className="bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:border-purple-200 transition-all"
                    >
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                        {contact.label}
                      </span>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-purple-600 hover:text-purple-700 font-bold text-sm break-all"
                      >
                        {contact.email}
                      </a>
                    </div>
                  ))}
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
