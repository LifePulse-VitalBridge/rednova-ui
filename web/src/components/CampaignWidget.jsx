import React, { useState, useEffect } from 'react';
import { initialEvents } from '../data/eventData';
import { EventCard } from './EventTracker'; // Importing the card we just exported
import EventTracker from './EventTracker';   // Importing the full component for the modal
import { X, Maximize2, Activity } from 'lucide-react';
import ScrollScale from './ScrollScale';
import CosmicBackground from "../components/CosmicBackground";

const CampaignWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // --- LOGIC: Handle ESC Key & Scroll Lock ---
  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      const handleEsc = (e) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        window.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      {/* ===================================================
          STATE A: THE PREVIEW WIDGET (Embedded on Home)
          =================================================== */}
      <div 
        className="w-full max-w-5xl mx-auto px-4 py-12 relative z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      > <ScrollScale>
        {/* The Click Trigger Wrapper */}
        <div 
          onClick={() => setIsOpen(true)}
          className="group relative bg-black/15 border border-red-500/25 rounded-3xl overflow-hidden cursor-pointer hover:border-red-500/50 transition-all duration-500 shadow-2xl"
        >
          
          {/* 1. Small Widget Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-red-500/10 rounded-full text-red-500 animate-pulse">
                  <Activity size={20} />
               </div>
               <h3 className="text-xl font-bold text-white tracking-wide">
                 Live Campaign Feed
               </h3>
            </div>
            {/* Expand Icon hint */}
            <div className="text-gray-500 group-hover:text-white transition-colors">
               <Maximize2 size={20} />
            </div>
          </div>

          {/* 2. The Content Teaser (Only 2 Cards) */}
          <div className="p-6 space-y-6 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
             {/* We manually slice the first 2 events just for the preview */}
             {initialEvents.slice(0, 2).map((event) => (
                <div key={event.id} className="pointer-events-none"> 
                  {/* pointer-events-none prevents button clicks inside the preview */}
                  <EventCard event={event} isLive={event.status === "Live Now"} />
                </div>
             ))}
          </div>
        </div>
        </ScrollScale>
      </div>


      {/* ===================================================
          STATE B: THE FULLSCREEN MODAL (Overlay)
          =================================================== */}
      
      {/* LOGIC FIX:
         1. Removed {isOpen &&} wrapper so elements exist for animation.
         2. Added 'invisible' vs 'visible' class.
            - When closed: 'opacity-0 invisible' (Completely gone).
            - When open: 'opacity-100 visible' (Shows up).
         3. Lowered Z-Index to 50 (Standard for overlays).
      */}

      {/* 1. The Backdrop & Stars (Fades In/Out) */}
      <div 
        className={`fixed inset-0 z-50 bg-black transition-all duration-900 ease-in-out 
            ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
           <CosmicBackground />
      </div>

      {/* 2. The Close Button (Fades In/Out) */}
      <button 
        onClick={() => setIsOpen(false)}
        className={`fixed top-6 right-6 z-[60] p-3 bg-white/10 text-white rounded-full hover:bg-red-600 hover:rotate-90 transition-all duration-500 shadow-lg border border-white/10 group
            ${isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-50'}
        `}
      >
         <X size={28} />
      </button>
      
      {/* 3. The Sliding Content Container (Slides Up/Down) */}
      <div 
        className={`fixed inset-0 z-[55] overflow-y-auto transition-transform duration-700 cubic-bezier(0.22, 1, 0.36, 1) 
            ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
         {/* We render the original EventTracker here */}
         <div className="min-h-screen pt-20">
            <EventTracker />
         </div>
      </div>
    </>
  );
};

export default CampaignWidget;