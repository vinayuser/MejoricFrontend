import { useState, useEffect } from 'react';
import { isIOS, isStandalonePWA } from '../utils/browserDetect';

/**
 * iOS PWA Install Prompt
 * 
 * Push notifications on iOS Safari only work when the app is installed
 * as a PWA (Add to Home Screen). This component shows a dismissable
 * banner prompting iOS users to install the app.
 * 
 * Only shown when:
 * - User is on iOS
 * - App is NOT already running in standalone (PWA) mode
 * - User hasn't previously dismissed the prompt
 */
export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('iosInstallDismissed');
    
    if (isIOS() && !isStandalonePWA() && !dismissed) {
      // Delay showing to not overwhelm the user on first load
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('iosInstallDismissed', Date.now().toString());
  };

  if (!show) return null;

  return (
    <div 
      className="fixed bottom-0 inset-x-0 z-[9998]"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      <div className="bg-white border-t-2 border-purple-500 shadow-2xl p-4">
        <div className="flex items-start gap-3 max-w-md mx-auto">
          <div className="text-3xl flex-shrink-0">📲</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">
              Install Mejoric for Call Notifications
            </p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Tap the <strong>Share</strong> button{' '}
              <span className="inline-block" style={{ transform: 'translateY(1px)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </span>
              {' '}then <strong>"Add to Home Screen"</strong> to receive incoming call alerts on your iPhone.
            </p>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 text-xl font-light flex-shrink-0 p-1"
            aria-label="Dismiss install prompt"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
