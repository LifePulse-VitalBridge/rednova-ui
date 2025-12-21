import React from 'react';
import { MapPin, AlertTriangle, ChevronRight, Zap, Droplet } from 'lucide-react';

const ReactorCard = ({ bank, onClick, isSelected }) => {
  
  // --- LOGIC ---
  const isCritical = Object.values(bank.stock).some(count => count === 0);

  // Dynamic "Plasma" Gradients for the Liquid
  const getPlasmaGradient = (count) => {
    if (count === 0) return 'bg-gradient-to-t from-red-950 via-red-600 to-red-400 shadow-[0_0_20px_rgba(220,38,38,0.6)]'; 
    if (count < 8) return 'bg-gradient-to-t from-orange-950 via-orange-600 to-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]';  
    return 'bg-gradient-to-t from-emerald-950 via-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'; 
  };

  const formatDistance = (dist) => {
    if (!dist || !dist.calculated) return "--";
    return (dist.calculated / 1000).toFixed(1);
  };

  return (
    <div 
      onClick={() => onClick(bank)}
      className={`
        group relative w-full mb-6 cursor-pointer select-none
        transition-all duration-500 ease-out preserve-3d
        ${isSelected ? 'scale-[1.02] z-20' : 'hover:scale-[1.02] hover:-translate-y-1 hover:z-10'}
      `}
      style={{ perspective: '1200px' }}
    >
      
      {/* ==========================================================
          LAYER 1: THE HOLOGRAPHIC CHASSIS (Background) 
      ========================================================== */}
      <div className={`
        absolute inset-0  transition-all duration-500 rounded-xl overflow-hidden
        border border-white/10
        ${isSelected 
           ? 'bg-[#150505]/95 shadow-[0_0_50px_rgba(220,38,38,0.25),inset_0_0_30px_rgba(220,38,38,0.1)] border-red-500/50' 
           : 'bg-[#08080a]/70 shadow-[0_15px_40px_rgba(0,0,0,0.6)] group-hover:bg-[#0c0c0e]/90 group-hover:border-white/20'
        }
      `}>
        {/* Subtle Grid Texture Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
        
        {/* Moving Sheen Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
      </div>

      {/* ==========================================================
          LAYER 2: CONTENT DECK (Floating above glass)
      ========================================================== */}
      <div className="relative p-5 z-10 flex flex-col gap-5 h-full">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-1.5">
            <h3 className={`text-lg font-bold tracking-wide transition-all duration-300 ${isSelected ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-200 group-hover:text-white'}`}>
              {bank.name}
            </h3>
            <div className="flex items-center gap-2">
               <div className={`flex items-center justify-center w-5 h-5 rounded-md ${isSelected ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-gray-500 group-hover:text-gray-300'}`}>
                  <MapPin size={12} />
               </div>
               <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">{bank.location}</span>
            </div>
          </div>
          
          {/* 3D Distance Module */}
          <div className={`
             flex flex-col items-end justify-center px-4 py-2 rounded-lg border backdrop-blur-md transition-all duration-500
             ${isSelected 
                ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                : 'bg-black/40 border-white/5 group-hover:border-white/15'
             }
          `}>
             <span className={`text-2xl font-black font-mono leading-none ${isSelected ? 'text-red-400' : 'text-white/90'}`}>
               {formatDistance(bank.dist)}
             </span>
             <span className="text-[8px] font-bold text-gray-500 tracking-[0.25em] mt-1">KM</span>
          </div>
        </div>

        {/* --- THE REACTOR CORE (Fuel Tanks) --- */}
        <div className="relative grid grid-cols-8 gap-2 p-3 rounded-xl bg-black/40 border border-white/5 shadow-inner">
           
           {/* "Core" Label Background */}
           <div className="absolute top-1/2 left-0 w-full text-center pointer-events-none opacity-[0.03] text-4xl font-black tracking-widest text-white select-none">
             REACTOR CORE
           </div>

           {Object.entries(bank.stock).map(([type, count]) => {
             const heightPct = Math.min((count / 40) * 100, 100); 
             const displayCount = count < 10 ? `0${count}` : count;
             
             return (
               <div key={type} className="flex flex-col items-center h-[70px] group/tank relative">
                  
                  {/* GLASS VIAL CONTAINER */}
                  <div className="w-full h-full bg-white/5 rounded-md relative flex items-end justify-center overflow-hidden ring-1 ring-white/5 group-hover/tank:ring-white/20 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                     
                     {/* The Liquid */}
                     <div 
                       style={{ height: `${heightPct}%` }}
                       className={`w-full rounded-b-md transition-all duration-700 ease-out relative ${getPlasmaGradient(count)}`}
                     >
                        {/* Meniscus Highlight (Shiny top edge of liquid) */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-white/40 blur-[1px]"></div>
                     </div>

                     {/* NUMBER INSIDE THE TANK (Floating in liquid) */}
                     <span className={`
                       absolute bottom-1 text-[10px] font-mono font-bold z-10 transition-colors duration-300
                       ${count < 10 && heightPct < 20 ? 'text-white/60 -translate-y-4' : 'text-white drop-shadow-md'} 
                     `}>
                       {displayCount}
                     </span>

                  </div>
                  
                  {/* Type Label */}
                  <span className={`text-[9px] font-bold mt-2 font-mono transition-colors ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>
                     {type}
                  </span>
               </div>
             )
           })}
        </div>

        {/* --- FOOTER --- */}
        <div className="flex items-center justify-between pl-1">
           {isCritical ? (
             <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] text-red-400 font-bold tracking-[0.15em] uppercase">Critical Supply</span>
             </div>
           ) : (
             <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <Droplet size={12} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-bold tracking-[0.15em] uppercase">Optimal</span>
             </div>
           )}

           {/* Holo-Button */}
           <div className={`
             flex items-center justify-center w-8 h-8 rounded-lg border backdrop-blur-sm transition-all duration-300
             ${isSelected 
                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_25px_rgba(220,38,38,0.5)] scale-110' 
                : 'bg-white/5 border-white/10 text-gray-500 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/30'
             }
           `}>
             <ChevronRight size={16} className={isSelected ? "" : ""} />
           </div>
        </div>

      </div>
    </div>
  );
};

export default ReactorCard;