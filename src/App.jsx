import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import EmotionalCare from './components/EmotionalCare';
import Mentors from './components/Mentors';
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
import CallNotification from './components/CallNotification';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import { isInAppBrowser } from './utils/browserDetect';
import { Toaster } from 'react-hot-toast';
import MateDetailsPage from './components/MateDetailsPage';
import VerifyEmail from './components/VerifyEmail';

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
      window.gtag('config', import.meta.env.VITE_GA_ID, {
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
    if (isAuthenticated && user && user.role !== "guest" && user.role !== "mate" && user.isMobileVerified === false) {
      const publicOrAuthRoutes = [
        "/verify-email", 
        "/login", 
        "/signup", 
        "/forgot-password", 
        "/reset-password",
        "/mentors",
      ];
      
      const isPublicRoute = publicOrAuthRoutes.includes(location.pathname);
      
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
    <Router>
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
            <Route path="/mentor" element={<Mentors />} />

            <Route path="/emotional-care" element={<EmotionalCare />} />
            <Route path="/mentors" element={<Mentors />} />
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
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/mate-profile/:id" element={<MateDetailsPage />} />
            <Route path="/dashboard" element={<MateDashboard />} />
          </Routes>
        </div>
      </EmailVerificationGate>
    </Router>
    </AuthProvider>
  );
}

export default App;