import React, { useState, useEffect, memo } from 'react';
import { initialBanks } from '../data/bankData';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import ScrollScale from './ScrollScale';

// ✅ 1. MOVED OUTSIDE: Prevents re-render glitches and improves performance
// Wrapped in 'memo' so it only updates if its specific props change
const BankCard = memo(({ bank, highlight }) => {
    return (
        <div className="group relative w-[350px] flex-shrink-0 bg-[#0a0a0a]/80 border border-white/10 rounded-2xl p-6 hover:border-red-500/50 hover:bg-black hover:scale-[1.02] transition-all duration-300 backdrop-blur-md overflow-hidden mx-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="overflow-hidden">
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors truncate">{bank.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">{bank.contact}</p>
                </div>
                <div className="p-2 bg-white/5 rounded-full text-red-500">
                    <Activity size={16} />
                </div>
            </div>

            {/* Dense Grid */}
            <div className="grid grid-cols-4 gap-2">
                {Object.entries(bank.stock).map(([group, units]) => {
                    const isCritical = units < 3;
                    const isAbundant = units > 10;
                    
                    // Check if this specific cell is the one being updated right now
                    const isUpdating = highlight?.group === group;
                    const flashClass = isUpdating 
                        ? (highlight.direction === 'up' ? 'animate-flash-green' : 'animate-flash-red') 
                        : '';
                    
                    const groupName = group.replace('_POS', '+').replace('_NEG', '-');

                    return (
                        <div key={group} className={`flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 border border-white/5 ${flashClass} transition-colors duration-500`}>
                            <span className="text-[10px] text-gray-500 font-bold">{groupName}</span>
                            <span className={`text-sm font-mono font-bold ${isCritical ? 'text-red-500' : isAbundant ? 'text-green-400' : 'text-white'}`}>
                                {units}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Decorative Glow */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all pointer-events-none"></div>
        </div>
    );
});

const BloodMarket = () => {
  const [banks, setBanks] = useState(initialBanks);
  
  // Track multiple updates at once: { bankId: { group: 'A_POS', direction: 'up' } }
  const [updates, setUpdates] = useState({}); 

  useEffect(() => {
    // ✅ 2. FASTER TIMER: Runs every 800ms
    const interval = setInterval(() => {
      setBanks(currentBanks => {
        const newBanks = [...currentBanks];
        const currentUpdates = {};

        // ✅ 3. HIGH ACTIVITY: Update 20 banks at once!
        for(let i = 0; i < 20; i++) {
            const randomBankIndex = Math.floor(Math.random() * newBanks.length);
            
            // Create a deep copy of the bank and its stock to ensure React sees the change
            const bank = { ...newBanks[randomBankIndex] };
            const stock = { ...bank.stock };

            const bloodGroups = Object.keys(stock);
            const randomGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
            
            // 60% chance to decrease (High Demand simulation)
            const change = Math.random() > 0.6 ? -1 : 1;
            
            let newValue = stock[randomGroup] + change;
            if (newValue < 0) newValue = 0;
            
            stock[randomGroup] = newValue;
            bank.stock = stock;
            newBanks[randomBankIndex] = bank;

            // Record this update so the card knows to flash
            currentUpdates[bank.id] = { group: randomGroup, direction: change > 0 ? 'up' : 'down' };
        }
        
        setUpdates(currentUpdates);
        return newBanks;
      });
    }, 800); 

    return () => clearInterval(interval);
  }, []);

  const half = Math.ceil(banks.length / 2);
  const row1 = banks.slice(0, half);
  const row2 = banks.slice(half);

  return (
    <div className="relative -mt-30 w-full bg-black/15 overflow-hidden">
      <ScrollScale>
      {/* 1. THE BRIDGE */}
      <div className="absolute top-0 left-0 w-full h-32  z-10 pointer-events-none"></div>

      {/* 2. SECTION HEADER */}
      <div className="relative z-20 w-full max-w-7xl mx-auto pt-20 pb-8 px-4 text-center">
          <h3 className="text-red-500 font-bold tracking-widest uppercase text-xs md:text-sm mb-2">Global Network</h3>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              LIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">DATA STREAM</span>
          </h2>
      </div>

      {/* 3. TICKER TAPE */}
      <div className="relative z-20 w-full bg-red-950/20 border-y border-red-500/20 overflow-hidden py-3 backdrop-blur-sm mb-12">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {row1.slice(0, 10).map((bank) => {
            const update = updates[bank.id]; // Check if this bank has an update
            const isDown = update?.direction === 'down'; // If no update then default to stable or up
            return (
            <div key={`ticker-${bank.id}`} className="flex items-center gap-2 text-sm font-mono text-gray-300">
              <span className="font-bold text-red-400">{bank.region}:</span>
              <span className="flex items-center gap-1">
                {/* Shows dynamic icon based on update direction */}
                {isDown ? "Dropping" : "Rising" }
                {isDown ? (
                  <TrendingDown size={14} className="text-red-500 animate-bounce" />
                ) : (
                  <TrendingUp size={14} className="text-green-400 animate-bounce" />
                )}
              </span>
              <span className="w-px h-4 bg-white/20 mx-2"></span>
            </div>
            )})}
        </div>
      </div>

      {/* 4. MAIN STREAM (The Dual Carousel) */}
      
        <div className="w-full pb-24 space-y-8">
            
            {/* ROW 1: Moves LEFT */}
            <div className="relative w-full overflow-hidden">
                <div className="flex w-max animate-scroll-left pause-on-hover hover:[animation-play-state:paused]">
                    {[...row1, ...row1].map((bank, i) => (
                        <BankCard 
                           key={`row1-${bank.id}-${i}`} 
                           bank={bank} 
                           highlight={updates[bank.id]} // Pass the update info
                        />
                    ))}
                </div>
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
            </div>

            {/* ROW 2: Moves RIGHT */}
            <div className="relative w-full overflow-hidden">
                <div className="flex w-max animate-scroll-right pause-on-hover hover:[animation-play-state:paused]">
                    {[...row2, ...row2].map((bank, i) => (
                        <BankCard 
                           key={`row2-${bank.id}-${i}`} 
                           bank={bank}
                           highlight={updates[bank.id]} 
                        />
                    ))}
                </div>
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
            </div>

        </div>
      </ScrollScale>

    </div>
  );
};

export default BloodMarket;