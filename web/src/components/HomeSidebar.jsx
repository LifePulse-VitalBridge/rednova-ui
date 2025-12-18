import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Heart, Activity, User, Phone, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { fetchUserProfile } from '../services/authService'; // Ensure this path is correct

const HomeSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // --- STATE FOR USER DATA (Mirrors Home.jsx logic) ---
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH USER DATA ON MOUNT ---
  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email) {
        try {
          const data = await fetchUserProfile(currentUser.email);
          setProfileImageUrl(data.profilePicture);
          setName(data.name);
        } catch (error) {
          console.error("Sidebar: Error fetching profile", error);
        }
      }
      setLoading(false);
    };

    if (isOpen) {
      fetchUser(); // Refresh data every time sidebar opens
    }
  }, [isOpen]);

  // --- MENU CONFIGURATION ---
  const menuItems = [
    {
      label: "Find Blood",
      icon: Activity,
      action: () => { onClose(); document.getElementById("blood-market")?.scrollIntoView({ behavior: "smooth" }); },
      highlight: true
    },
    {
      label: "Join as Donor",
      icon: Heart,
      action: () => { onClose(); /* Add your Join Logic Here */ },
      highlight: false
    },
    {
      label: "About RedNova",
      icon: Info,
      action: () => { onClose(); navigate('/about'); },
      highlight: false
    },
    {
      label: "Contact Command",
      icon: Phone,
      action: () => { onClose(); navigate('/contact'); },
      highlight: false
    },
  ];

  return (
    <>
      {/* 1. BACKDROP */}
      <div
        className={`fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* 2. SIDEBAR PANEL */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-sm z-[70] bg-black/90 border-r border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.2)] transform transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* --- Header Area --- */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-red-900/10 to-transparent">
          <h2 className="text-2xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500">
            MENU
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-red-600 transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Navigation List --- */}
        <div className="flex flex-col p-6 gap-4 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`group relative flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 overflow-hidden
                ${item.highlight
                  ? 'bg-gradient-to-r from-red-600/20 to-purple-600/20 border border-red-500/30 hover:border-red-500'
                  : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={`relative z-10 p-2 rounded-lg ${item.highlight ? 'text-red-400' : 'text-gray-400 group-hover:text-white'}`}>
                <item.icon size={22} />
                {/* The Beacon Animation */}
                {item.highlight && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </div>
              <div className="relative z-10 flex-1">
                <div className={`font-bold tracking-wider uppercase text-sm ${item.highlight ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                  {item.label}
                </div>
              </div>
              <ChevronRight size={18} className="relative z-10 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        {/* --- FOOTER: USER PROFILE (Exact Logic from Home.jsx) --- */}
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/10 bg-black/40 backdrop-blur-md">
          <button
            onClick={() => { onClose(); navigate('/profile'); }}
            className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-white/5 transition-colors group"
          >
            {/* LOGIC START: Check Image -> Check Name -> Default Icon */}
            {profileImageUrl ? (
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"></div>
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="relative w-12 h-12 rounded-full object-cover border-2 border-black"
                />
              </div>
            ) : name ? (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 flex items-center justify-center group-hover:border-purple-500 transition-colors">
                <span className="text-xl font-bold text-white">{name.charAt(0)}</span>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                <User size={24} className="text-gray-400 group-hover:text-white" />
              </div>
            )}
            {/* LOGIC END */}

            <div className="text-left">
              <div className="text-sm font-bold text-white">
                {name ? name : "Guest User"}
              </div>
              <div className="text-xs text-gray-500 group-hover:text-red-400 transition-colors">
                {name ? "Access Profile" : "Log in to manage"}
              </div>
            </div>
          </button>
        </div>

      </div>
    </>
  );
};

export default HomeSidebar;