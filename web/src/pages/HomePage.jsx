import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth"; // Import Auth
import { fetchUserProfile } from "../services/authService"; // Import your Service
import CosmicBackground from "../components/CosmicBackground";
import BloodMarket from "../components/BloodMarket";
import CampaignWidget from "../components/CampaignWidget";
import Footer from "../components/HomeFooter";
import HomeSidebar from "../components/HomeSidebar";
import { FaBars, FaUserCircle, FaExclamationTriangle } from "react-icons/fa";
import { User } from "lucide-react";
import heartImage from "../assets/heartTransparent.png";


const Home = () => {
  const navigate = useNavigate();
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  // We can calculate a simple progress number just for the text display
  const [progressPercent, setProgressPercent] = useState(100);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [name, setName] = useState(null);
  useEffect(() => {
    const checkProfileStatus = async () => {
      const auth = getAuth();
      // Wait a moment for Firebase to restore auth state if needed
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email) {
        try {
          // 1. Fetch Data using your existing service
          const data = await fetchUserProfile(currentUser.email);
          setProfileImageUrl(data.profilePicture);
          setName(data.name);
          // 2. Define the fields you consider "Required"
          // Note: API likely returns 'phoneNumber', but checking both just in case
          const fieldsToCheck = [
            data.name,
            data.email,
            data.bloodGroup,
            data.phoneNumber || data.phone, // Check either key
            data.location,
            data.dob,
            data.profilePicture
          ];

          // 3. Check if ANY field is empty/null/undefined
          const emptyFields = fieldsToCheck.filter(field =>
            !field || String(field).trim() === "" || field === "null"
          );

          // 4. Calculate Percentage for the UI
          const total = fieldsToCheck.length;
          const filled = total - emptyFields.length;
          const percent = Math.round((filled / total) * 100);
          setProgressPercent(percent);

          // 5. If there is even ONE empty field, show the alert
          if (emptyFields.length > 0) {
            // Small delay for smooth UX (so it doesn't pop up instantly on load)
            setTimeout(() => setShowProfileAlert(true), 1500);
          }

        } catch (error) {
          console.error("Home Page: Could not check profile status", error);
        }
      }
    };

    checkProfileStatus();
  }, []); // Runs once when Home mounts

  const bloodMarketRef = useRef(null);
  const campaignFeedRef = useRef(null);
  const scrollToSection = (ref) => {
  ref.current?.scrollIntoView({ behavior: 'smooth' });
};

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="relative w-full min-h-screen text-white overflow-x-hidden font-sans selection:bg-red-500 selection:text-white bg-black">

      <style>{`
        @keyframes nebula-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-nebula-glass {
          background-size: 300% 300%;
          animation: nebula-flow 20s ease infinite;
        }
      `}</style>

      {/* 1. The 3D Star Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <CosmicBackground />
      </div>

      {/* --- INCOMPLETE PROFILE FLASH CARD (Logic Remains Same) --- */}
      {showProfileAlert && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-[90%] max-w-md p-8 rounded-3xl bg-[#0a0a0a]/90 border border-red-500/40 shadow-[0_0_50px_rgba(220,38,38,0.25)] transform transition-all scale-100 animate-slide-up text-center">

            {/* Warning Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6 border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              <FaExclamationTriangle className="text-3xl text-red-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">
              Action Required
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your profile is <span className="text-red-400 font-bold">{progressPercent}% complete</span>.
              <br />
              To access blood banks and real-time tracking, we need your full details.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 hover:scale-[1.02] shadow-lg shadow-red-500/20 transition-all border border-transparent hover:border-red-400"
              >
                Complete Profile Now
              </button>
              <button
                onClick={() => setShowProfileAlert(false)}
                className="w-full py-3.5 rounded-xl font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 w-full h-20 flex justify-between items-center px-6 md:px-12 z-50 
        bg-[linear-gradient(90deg,rgba(2,6,23,0.8)_0%,rgba(76,29,149,0.6)_25%,rgba(17,94,89,0.5)_50%,rgba(157,23,77,0.6)_75%,rgba(2,6,23,0.8)_100%)]
         border-b border-white/5 shadow-lg shadow-purple-500/10 backdrop-blur-sm
        animate-nebula-glass">

        {/* --- LEFT SECTION: Logo + Navigation Links --- */}
        <div className="flex items-center gap-8">

          {/* 1. Hamburger & Logo */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="cursor-pointer text-2xl text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 duration-300">
              <FaBars />
            </button>
            <h1 onClick={() => navigate("/")} className="text-2xl md:text-3xl font-black tracking-[0.2em] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent cursor-pointer select-none hover:opacity-80 transition-opacity">
              REDNOVA
            </h1>
          </div>

          {/* Button Section */}
          <div className="hidden md:flex items-center gap-2 pl-8 border-l border-white/10 h-10">

            {/* BUTTON 1: LIVE SUPPLY (Points to BloodMarket) */}
            <button
              onClick={() => scrollToSection(bloodMarketRef)}
              className="cursor-pointer relative px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest text-indigo-200/80 hover:text-white transition-all duration-300 hover:bg-white/5 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Supply
              </span>
              {/* Nebula Underline */}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300 group-hover:w-full"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            </button>

            {/* BUTTON 2: OPS FEED (Points to CampaignWidget) */}
            <button
              onClick={() => scrollToSection(campaignFeedRef)}
              className=" cursor-pointer relative px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest text-indigo-200/80 hover:text-white transition-all duration-300 hover:bg-white/5 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Ops Feed
              </span>
              {/* Nebula Underline */}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-400 to-pink-400 transition-all duration-300 group-hover:w-full"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
            </button>

          </div>
        </div>

        {/* --- RIGHT SECTION: Action Buttons + Profile --- */}
        <div className="hidden md:flex items-center gap-4">

          {/* 1. 'Join' Button (Ghost Style - Cleaner look) */}
          <button onClick={() => navigate('/joinDonor')} className="px-5 cursor-pointer py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/30 hover:bg-white/10 hover:border-white transition-all text-white backdrop-blur-md">
            Join as Donor
          </button>

          {/* 2. 'Find Blood' Button (Primary Gradient - The main focus) */}
          <button onClick={() => navigate('/findBlood')} className="px-6 cursor-pointer py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-105 transition-all">
            Find Blood
          </button>

          {/* 3. Divider before Profile */}
          <div className="h-8 w-px bg-white/10 ml-2 mr-2"></div>

          {/* Right: Profile */}
          <div className="flex items-center gap-4">
            {profileImageUrl ? (
              <div className="relative group cursor-pointer" onClick={() => navigate("/profile")}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"></div>
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="relative w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-black"
                />
              </div>
            ) : name ? (
              <div onClick={() => navigate("/profile")} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                <span className="text-xl font-bold text-white">{name.charAt(0)}</span>
              </div>
            ) : (
              <User size={32} className="text-gray-400 cursor-pointer hover:text-white transition-colors" onClick={() => navigate("/profile")} />
            )}
          </div>
        </div>
      </nav>

      {/* 3. Main Hero Section */}
      <main className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 md:px-16 pt-24 lg:pt-0 gap-12 lg:gap-0">

        {/* --- LEFT COLUMN: CONTENT --- */}
        <div className="flex flex-col justify-center items-start w-full lg:w-1/2 space-y-10 animate-fade-in-up">

          {/* Headline Group */}
          <div className="space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold tracking-wider uppercase mb-2">
              Save Lives Today
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
              MODERNIZING
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                BLOOD DONATION
              </span>
            </h2>
          </div>

          {/* Subtext with Border Accent */}
          <div className="border-l-4 border-white/20 pl-6 max-w-xl">
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed font-light">
              We connect donors, hospitals, and patients in <span className="text-white font-semibold">real-time</span>.
              Join the network that turns every drop into a lifeline.
            </p>
          </div>

          {/* Buttons & Stats Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 w-full">

            {/* Divider (Hidden on Mobile) */}
            <div className="hidden md:block h-12 w-px bg-white/20"></div>

            {/* Mini Stats */}
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold text-white">60+</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Banks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400 animate-pulse">LIVE</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Status</p>
              </div>
            </div>

          </div>

        </div>

        {/* --- RIGHT COLUMN: 3D HEART --- */}
        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end h-[50vh] lg:h-auto relative">

          {/* Background Glow for Heart */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

          {/* The Heart Image */}
          <img
            src={heartImage}
            alt="Cyber Heart"
            className="hover:rotate-3 transition-all ease-in-out duration-150  relative z-10 w-full max-w-[500px] lg:max-w-[700px] object-contain animate-rainbow-heart drop-shadow-[0_0_50px_rgba(168,85,247,0.4)]"
          />
        </div>

      </main>
      <div ref={bloodMarketRef}><BloodMarket /></div>
      <div ref={campaignFeedRef}><CampaignWidget /></div>
      <Footer />
      <HomeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

export default Home;