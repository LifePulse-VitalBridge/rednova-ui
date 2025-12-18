import React from 'react';
import { Heart, Twitter, Linkedin, Instagram, Github, Facebook, Activity, Zap, Users, Globe, MapPin, Wifi, Mail } from 'lucide-react';

const Footer = () => {
  // CONFIG: Social Links with Brand-Specific Colors
  const socialLinks = [
    { 
      icon: Twitter, 
      href: "https://x.com/AnkitKumar92454", 
      color: "hover:bg-black hover:border-black hover:text-white",
      label: "X (Twitter)"
    },
    { 
      icon: Linkedin, 
      href: "https://www.linkedin.com/in/ankitkumarsingh333561297", 
      color: "hover:bg-[#0077b5] hover:border-[#0077b5] hover:text-white",
      label: "LinkedIn"
    },
    { 
      icon: Instagram, 
      href: "https://www.instagram.com/ankitprofessional1/", 
      color: "hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500 hover:border-transparent hover:text-white",
      label: "Instagram"
    },
    { 
      icon: Github, 
      href: "https://github.com/Ankit-K-Singh-0527",
      color: "hover:bg-[#333] hover:border-[#333] hover:text-white",
      label: "GitHub"
    },
    
  ];

  return (
    <footer className="relative w-full pt-1 overflow-hidden z-20">
      
      {/* 1. THE HORIZON LINE */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>

      {/* 2. GLASS PANEL BACKGROUND */}
      <div className="bg-black/40 backdrop-blur-xl border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-start">

            {/* COLUMN 1: IDENTITY & SOCIALS */}
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 tracking-tighter">
                REDNOVA
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Revolutionizing the lifeline of humanity. We connect donors to recipients at lightspeed, ensuring no call for help goes unanswered.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {socialLinks.map((social, i) => (
                  <a 
                    key={i} 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 shadow-lg hover:scale-110 ${social.color}`}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* COLUMN 2: NETWORK VITALS */}
            <div className="space-y-6">
              <h3 className="text-white font-bold tracking-widest text-sm uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Network Vitals
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                       <Users size={14} /> <span className="text-[10px] uppercase font-bold">Active Donors</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-white">8,240</div>
                 </div>
                 
                 <div className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                       <Globe size={14} /> <span className="text-[10px] uppercase font-bold">Regions</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-white">14</div>
                 </div>

                 <div className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                       <Activity size={14} /> <span className="text-[10px] uppercase font-bold">Daily Saves</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-white">126</div>
                 </div>

                 <div className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                       <Zap size={14} /> <span className="text-[10px] uppercase font-bold">Latency</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-green-400">12ms</div>
                 </div>
              </div>
            </div>

            {/* COLUMN 3: FIELD COORDINATES */}
            <div className="space-y-6">
              <h3 className="text-white font-bold tracking-widest text-sm uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Field Coordinates
              </h3>
              
              <div className="space-y-4">
                 {/* LPU Address Block */}
                 <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                    <div className="p-2 bg-white/5 rounded-lg text-red-400">
                       <MapPin size={20} />
                    </div>
                    <div>
                       <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Operational HQ</div>
                       <div className="text-sm text-gray-300 leading-snug font-mono">
                          Lovely Professional University,<br/>
                          Jalandhar - Delhi, G.T. Road,<br/>
                          Phagwara, Punjab (INDIA)
                       </div>
                    </div>
                 </div>

                 {/* EMAIL BLOCK (Added Here) */}
                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                    <div className="p-2 bg-white/5 rounded-lg text-blue-400">
                       <Mail size={20} />
                    </div>
                    <div>
                       <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Electronic Mail</div>
                       <div className="text-sm text-gray-300 font-mono">
                          help@rednova.network
                       </div>
                    </div>
                 </div>

                 {/* Status Tag */}
                 <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-3 py-2 rounded-lg border border-green-500/20 w-fit">
                    <Wifi size={14} className="animate-pulse" />
                    <span>Grid Uplink // Secure</span>
                 </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="border-t border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              SYSTEM OPERATIONAL // V.2.4
            </div>
            <div className="text-xs text-gray-600">
              © 2025 REDNOVA. All Rights Reserved.
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              Designed with <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" /> for Humanity
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;