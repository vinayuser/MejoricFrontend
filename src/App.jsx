import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MentorBookingProvider } from './context/MentorBookingContext';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import EmotionalCare from './components/EmotionalCare';
import ProfessionalMentors from './components/ProfessionalMentors';
import MentorExplainPage from './components/mentor-platform/explain/MentorExplainPage';
import MentorDomainsPage from './components/mentor-platform/domains/MentorDomainsPage';
import MentorProfilePage from './components/mentor-platform/profile/MentorProfilePage';
import MentorBookingConfirmPage from './components/mentor-platform/booking/MentorBookingConfirmPage';
import { MentorTypeGuard } from './components/mentor-platform/shared/MentorTypeGuard';
import Mentor from './components/Mentor';
import KnowYourMateMentor from './components/KnowYourMateMentor';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Signup from './components/Signup';
import VideoCall from './components/VideoCall';
import Wallet from './components/Wallet';
import ScrollToTop from './components/ScrollToTop';
import Certificate from './components/Certificate';
import MateDashboard from './components/MateDashboard';
import MateProfile from './components/MateProfile';
import MentorDashboard from './components/MentorDashboard';
import MyAppointments from './components/MyAppointments';
import MentorSessionCall from './components/MentorSessionCall';
import CallNotification from './components/CallNotification';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import { isInAppBrowser } from './utils/browserDetect';
import { Toaster } from 'react-hot-toast';
import MateDetailsPage from './components/MateDetailsPage';
import VerifyEmail from './components/VerifyEmail';
import CommunityComingSoon from './components/CommunityComingSoon';
import TherapySessionJoin from './components/TherapySessionJoin';
import Careers from './components/Careers';
import CareerDetail from './components/CareerDetail';
import { getRouterBasename } from './utils/basePath';

import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';

// In-app browser detection banner
const InAppBrowserBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInAppBrowser()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-3 px-4 shadow-lg">
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        <span className="text-lg">📱</span>
        <p className="text-sm font-medium flex-1">
          For call notifications, 
          <a 
            href={window.location.href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-bold ml-1"
          >
            open in your browser ↗
          </a>
        </p>
        <button 
          onClick={() => setShow(false)} 
          className="text-white/80 hover:text-white text-lg font-light ml-2"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Analytics tracking component
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Google Analytics PageView
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-V9B5MVVW1L', {
        page_path: location.pathname + location.search,
      });
    }

    // Facebook Pixel PageView
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null;
  
};

// Email Verification Gate
const EmailVerificationGate = ({ children }) => {
  const { user, isAuthenticated, authInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authInitialized) return;

    // Only intercept if user is authenticated, not a guest, not a mate, and not verified
    if (isAuthenticated && user && user.role !== "guest" && user.role !== "mate" && user.role !== "mentor" && user.isMobileVerified === false) {
      const publicOrAuthRoutes = [
        "/verify-email", 
        "/login", 
        "/signup", 
        "/forgot-password", 
        "/reset-password",
        "/mentors",
        "/community",
      ];
      
      const isPublicRoute =
        publicOrAuthRoutes.includes(location.pathname) ||
        location.pathname.startsWith("/mentors");
      
      if (!isPublicRoute) {
        console.log("🔒 Redirecting unverified user to email verification");
        navigate("/verify-email", { replace: true });
      }
    }
  }, [user, isAuthenticated, authInitialized, location.pathname, navigate]);

  return children;
};

function App() {
  return (
    <AuthProvider>
    <MentorBookingProvider>
    <Router basename={getRouterBasename()}>
      <AnalyticsTracker />
      <ScrollToTop />
      <InAppBrowserBanner />
      <IOSInstallPrompt />
      <CallNotification />
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        containerStyle={{
          zIndex: 100003
        }}
      />
      <EmailVerificationGate>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/mate" element={<Mentor />} />
            <Route path="/mentor" element={<Navigate to="/mentors/professional/browse" replace />} />

            <Route path="/emotional-care" element={<EmotionalCare />} />
            <Route path="/mentors" element={<Navigate to="/mentors/professional/browse" replace />} />
            {/* Emotional mentors → platform HTML design (about → browse sidebar) */}
            <Route path="/mentors/emotional" element={<Navigate to="/mentors/emotional/about" replace />} />
            <Route path="/mentors/professional" element={<ProfessionalMentors />} />
            <Route path="/mentors/:type/about" element={<MentorTypeGuard><MentorExplainPage /></MentorTypeGuard>} />
            <Route path="/mentors/:type/browse" element={<MentorTypeGuard><MentorDomainsPage /></MentorTypeGuard>} />
            <Route path="/mentors/:type/mentor/:mentorId" element={<MentorTypeGuard><MentorProfilePage /></MentorTypeGuard>} />
            <Route path="/mentors/:type/booking/confirm" element={<MentorTypeGuard><MentorBookingConfirmPage /></MentorTypeGuard>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/know-your-mate-mentor" element={<KnowYourMateMentor />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/video-call" element={<VideoCall />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/mentor-session/:bookingId" element={<MentorSessionCall />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/mate-profile/:id" element={<MateDetailsPage />} />
            <Route path="/dashboard" element={<MateDashboard />} />
            <Route path="/dashboard/profile" element={<MateProfile />} />
            <Route path="/mentor-dashboard" element={<MentorDashboard />} />
            <Route path="/community" element={<CommunityComingSoon />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:id" element={<CareerDetail />} />
            <Route
              path="/therapy-session/:enrollmentId"
              element={<TherapySessionJoin />}
            />
          </Routes>
        </div>
      </EmailVerificationGate>
    </Router>
    </MentorBookingProvider>
    </AuthProvider>
  );
}

export default App;