import React, { useState, useEffect, useRef } from 'react';
import GalaxyBackground from '../components/GalaxyBackground';
import ReactorCard from '../components/ReactorCard';
import TacticalMap from '../components/TacticalMap';
import HomeSidebar from '../components/HomeSidebar';
import { Search, Satellite, XCircle, Menu } from 'lucide-react'; // Import XCircle for the button

const NexusPage = () => {
  // --- STATE ---
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [statusMsg, setStatusMsg] = useState(() => navigator.geolocation ? "INITIALIZING SYSTEMS..." : "GPS HARDWARE MISSING");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Ref to prevent double-fetching
  const needsInitialFetch = useRef(true);

  // --- API LOGIC ---
  const fetchBanks = async (lat, lng, search = "") => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_API_URL}/api/auth/bloodbanks/nearby?lat=${lat}&lng=${lng}&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();
      setBanks(data);
      if (data.length > 0) setSelectedBank(data[0]);
      setLoading(false);
    } catch (error) {
      console.error("Fetch Error:", error);
      setStatusMsg("NETWORK DOWN");
      setLoading(false);
    }
  };

  // --- HANDLER: SMART CARD CLICK (Toggle Logic) ---
  const handleCardClick = (bank) => {
    // If clicking the SAME bank that is already selected -> Deselect it (Reset)
    if (selectedBank && selectedBank._id === bank._id) {
      setSelectedBank(null);
    } else {
      // Otherwise -> Select the new bank
      setSelectedBank(bank);
    }
  };

  // --- HANDLER: CLEAR TARGET BUTTON ---
  const clearSelection = () => {
    setSelectedBank(null);
  };

  // --- LIFECYCLE: LIVE GPS ---
  useEffect(() => {
    if (!navigator.geolocation) return;

    const geoOptions = { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        if (needsInitialFetch.current) {
          fetchBanks(latitude, longitude);
          needsInitialFetch.current = false;
        }
      },
      (err) => {
        setStatusMsg("GPS SIGNAL LOST");
        setLoading(false);
      },
      geoOptions
    );

    return () => navigator.geolocation.clearWatch(watchId);
    
  }, []);

  // --- LIFECYCLE: DEBOUNCE SEARCH ---
  useEffect(() => {
    if (!userLocation) return;
    const delaySearch = setTimeout(() => {
      fetchBanks(userLocation.lat, userLocation.lng, searchTerm);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm, userLocation]);


  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans selection:bg-red-500/30">

      <GalaxyBackground />

      <HomeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

     
        {/* MAIN LAYOUT */}
         <div className="relative z-10 w-full h-full flex flex-col">

        {/* HEADER SECTION UPDATE */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 
    border-b border-white/10 shadow-lg relative overflow-hidden
    text-white bg-gradient-to-r from-black/70 via-slate-900 via-red-700 via-slate-800 to-black/70
    animate-gradient-x">

          <div className="flex items-center gap-4">

            {/* --- NEW HAMBURGER BUTTON --- */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="cursor-pointer hover:rotate-90 p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>

            {/* LOGO */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase">
                REDNOVA <span className="text-gray-600 text-sm ml-2 tracking-normal border-l border-gray-700 pl-2">SECTOR SCAN</span>
              </h1>
            </div>

          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-500">
            <Satellite size={14} /> GPS: LOCKED
          </div>
        </header>
      
        
        {/* SPLIT LAYOUT */}
        <div className="flex-1 flex overflow-hidden">

          {/* LEFT SIDE: ASSET LIST */}
          <div className="w-[40%] h-full flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl">

            {/* Search Bar */}
            <div className="p-4 border-b border-white/5 relative">
              <Search className="absolute left-7 top-7 text-gray-500" size={14} />
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH LOCATION OR HOSPITAL..."
                className="w-full bg-black/50 border border-white/10 rounded-full py-2 pl-9 text-xs text-white focus:border-red-500/50 focus:outline-none font-mono uppercase placeholder-gray-600"
              />
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 relative no-scrollbar">
              <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

              <div className="text-[10px] text-gray-400 font-mono mb-2">
                {loading ? "SCANNING SECTOR..." : `> DETECTED ${banks.length} UNITS`}
              </div>

              {loading ? (
                <div className="space-y-3 opacity-50">
                  {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white/5 rounded animate-pulse" />)}
                </div>
              ) : (
                banks.map((bank) => (
                  <ReactorCard
                    key={bank._id}
                    bank={bank}
                    isSelected={selectedBank?._id === bank._id}
                    onClick={handleCardClick} // <--- PASSING THE NEW HANDLER
                  />
                ))
              )}
              <div className="h-12" />
            </div>
          </div>

          {/* RIGHT SIDE: TACTICAL MAP */}
          <div className="w-[60%] h-full relative bg-black/20 border-l border-white/10">

            <TacticalMap
              banks={banks}
              userLocation={userLocation}
              selectedBank={selectedBank}
            />

            {/* MAP HUD OVERLAY */}
            <div className="absolute top-6 right-6 z-[400] flex flex-col items-end gap-2 pointer-events-none">

              {/* Status Badge */}
              <div className="bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg text-right pointer-events-auto">
                <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-1">Sector Status</div>
                <div className="text-emerald-500 font-bold text-xs flex items-center justify-end gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LIVE SATELLITE FEED
                </div>
              </div>

              {/* Target Info Box (Only shows when selected) */}
              {selectedBank && (
                <div className="pointer-events-auto bg-black/90 backdrop-blur-md border border-emerald-500/50 px-4 py-3 rounded-lg text-right animate-in fade-in slide-in-from-right-4 duration-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">

                  <div className="flex items-center justify-end gap-3 mb-1">
                    <div className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Target Locked</div>
                    {/* DISCONNECT BUTTON */}
                    <button onClick={clearSelection} className="text-gray-500 cursor-pointer hover:text-red-500 transition-colors">
                      <XCircle size={14} />
                    </button>
                  </div>

                  <div className="text-white font-bold text-sm">
                    {selectedBank.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-mono">
                    EST. ARRIVAL: {((selectedBank.dist?.calculated || 0) / 1000 / 30 * 60).toFixed(0)} MINS
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default NexusPage;