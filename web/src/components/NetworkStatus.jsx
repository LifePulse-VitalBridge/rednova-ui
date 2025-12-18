import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw, X } from 'lucide-react';

const NetworkStatus = () => {
  const [status, setStatus] = useState('online'); // 'online' | 'offline' | 'restored'
  const [isDismissed, setIsDismissed] = useState(false); // New state to handle manual close
  const hasLostConnection = useRef(false);

  useEffect(() => {
    const handleOffline = () => {
      setStatus('offline');
      setIsDismissed(false); // Reset this so the alert shows on every new disconnection
      hasLostConnection.current = true;
    };

    const handleOnline = () => {
      if (hasLostConnection.current) {
        setStatus('restored');
        setTimeout(() => {
          setStatus('online');
          hasLostConnection.current = false;
        }, 4000);
      } else {
        setStatus('online');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If online, or if the user manually dismissed the offline alert, show nothing (or just the success card)
  if (status === 'online') return null;

  return (
    <>
      {/* =========================================================
          STATE 1: INTERNET LOST (Red Warning Flashcard)
          ========================================================= */}
      {status === 'offline' && !isDismissed && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
          
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0F0F13] border border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-slide-up">
            
            {/* --- NEW: CLOSE BUTTON --- */}
            <button 
              onClick={() => setIsDismissed(true)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
              title="Dismiss warning and continue using site"
            >
              <X size={20} />
            </button>

            {/* Top Red Glow Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse"></div>

            <div className="p-8 text-center relative z-10">
              {/* Animated Icon */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border border-red-500/40 animate-ping opacity-20"></div>
                <WifiOff size={32} className="text-red-500 relative z-10" />
              </div>

              {/* Sci-Fi Text */}
              <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">
                SIGNAL LOST
              </h2>
              <p className="text-red-400 font-mono text-sm tracking-wider mb-6">
                // ERROR_CODE: NET_404 <br/>
                UNABLE TO REACH REDNOVA MAINFRAME
              </p>

              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Your device has disconnected from the grid. You can dismiss this warning to view cached data, but live updates will be paused.
              </p>

              {/* Fake "Retrying" Loader */}
              <div className="flex items-center justify-center gap-3 py-3 px-5 rounded-full bg-white/5 border border-white/10 w-fit mx-auto">
                <RefreshCw size={16} className="text-gray-400 animate-spin" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Retrying Uplink...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          STATE 2: INTERNET RESTORED (Green Success Card)
          ========================================================= */}
      {status === 'restored' && (
        <div className="fixed bottom-8 right-0 left-0 md:left-auto md:right-8 z-[9999] flex justify-center md:justify-end px-4 animate-slide-in-right">
          
          <div className="relative overflow-hidden rounded-xl bg-[#0a0f0d] border border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.15)] w-full max-w-sm">
            <div className="absolute inset-0 bg-green-500/5"></div>

            <div className="relative p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                 <Wifi size={20} className="text-green-400" />
              </div>

              <div>
                <h4 className="text-green-400 font-black uppercase text-sm tracking-widest mb-0.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  System Online
                </h4>
                <p className="text-gray-400 text-xs font-medium">
                  Uplink restored. Syncing data packets...
                </p>
              </div>

              <button onClick={() => setStatus('online')} className="ml-auto text-gray-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkStatus;