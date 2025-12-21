import React, { useState } from 'react';
import { Navigation, Zap } from 'lucide-react';

const NavigateButton = ({ coordinates, label = "ESTABLISH TRAJECTORY" }) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [buttonText, setButtonText] = useState(label);

  // --- 1. THE LOGIC: UNIVERSAL DEEP LINK ---
  const handleNavigation = () => {
    if (!coordinates) return;

    // Trigger the "Flash" animation
    setIsLaunching(true);
    setButtonText("COORDINATES LOCKED");

    // 2. CONSTRUCT GOOGLE MAPS URL
    // api=1: Forces the new Maps API
    // destination: The exact lat,lng from your data
    const [lat, lng] = coordinates;
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    // 3. EXECUTE WITH DELAY (For weight/feel)
    setTimeout(() => {
      window.open(mapUrl, '_blank');
      
      // Reset after launch
      setTimeout(() => {
        setIsLaunching(false);
        setButtonText(label);
      }, 500); 
    }, 600); // 600ms delay for the user to see the "Lock" effect
  };

  return (
    <div className="relative group">
      
      {/* --- DECORATIVE: HOLOGRAPHIC TOOLTIP --- */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        <div className="bg-black/80 backdrop-blur border border-red-500/30 px-3 py-1 text-[10px] font-mono text-red-300 rounded shadow-[0_0_15px_rgba(220,38,38,0.3)]">
          &gt; TARGET: {coordinates[0].toFixed(4)}° N, {coordinates[1].toFixed(4)}° E
        </div>
        {/* Little triangle pointing down */}
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-red-500/30 absolute left-1/2 -translate-x-1/2 top-full"></div>
      </div>

      {/* --- THE BUTTON ITSELF --- */}
      <button
        onClick={handleNavigation}
        disabled={isLaunching}
        className={`
          relative overflow-hidden px-8 py-4 w-full md:w-auto
          font-mono font-bold tracking-[0.15em] text-sm uppercase
          transition-all duration-200 transform cursor-pointer
          
          /* SHAPE: Cut Corners (Sci-Fi Look) */
          [clip-path:polygon(10%_0,100%_0,100%_70%,90%_100%,0_100%,0_30%)]
          
          /* COLORS & BORDERS */
          ${isLaunching 
            ? 'bg-white text-black scale-105 shadow-[0_0_50px_rgba(255,255,255,0.8)]' // Flash State
            : 'bg-red-600/90 text-white hover:bg-red-600 hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.4)]' // Normal State
          }
        `}
      >
        {/* INNER GLOW (PLASMA BORDER EFFECT) */}
        <div className="absolute inset-0 border-2 border-white/20 pointer-events-none [clip-path:polygon(10%_0,100%_0,100%_70%,90%_100%,0_100%,0_30%)]"></div>

        {/* CONTENT ROW */}
        <div className="relative z-10 flex items-center justify-center gap-3">
          {isLaunching ? (
            <Zap size={18} className="animate-bounce" /> // Icon changes on click
          ) : (
            <Navigation size={18} className="group-hover:rotate-45 transition-transform duration-300" />
          )}
          
          <span>{buttonText}</span>
        </div>

        {/* HOVER GLITCH EFFECT (Scanline) */}
        {!isLaunching && (
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out"></div>
        )}
      </button>

      {/* --- DECORATIVE: UNDER TEXT --- */}
      <div className="absolute -bottom-6 right-0 text-[9px] font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 text-right">
        VECTORS ALIGNED <br/> READY FOR LAUNCH
      </div>

    </div>
  );
};

export default NavigateButton;