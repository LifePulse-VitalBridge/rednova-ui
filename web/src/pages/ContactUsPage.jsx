import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Shield, Zap, Globe, Cpu, ChevronRight, Menu } from 'lucide-react';
import ContactTerminal from '../components/ContactTerminal';
import HomeSidebar from '../components/HomeSidebar';

// --- 5D STAR BEACON DATA (Updated Positions) ---
const STAR_DATA = [
  {
    id: 1,
    title: "PROTOCOL ALPHA",
    question: "What is Rednova's Primary Objective?",
    answer: "To eliminate the latency between blood requisition and supply. We utilize a decentralized, real-time bio-radar network to connect donors directly to hospitals instantly.",
    icon: <Zap size={32} />, color: "yellow",
    pos: { top: "12%", left: "5%" }, // Pushed to top-left corner
    delay: 0
  },
  {
    id: 2,
    title: "BIO-DATA SECURITY",
    question: "Is my biological information secure?",
    answer: "Affirmative. All user data is secured via AES-256 encryption. Medical verifications are stored on an immutable Vault Chain (Blockchain) ledger.",
    icon: <Shield size={32} />, color: "blue",
    pos: { top: "15%", right: "5%" }, // Pushed to top-right corner
    delay: 1
  },
  {
    id: 3,
    title: "GLOBAL UPLINK",
    question: "Where is the Rednova network active?",
    answer: "Current primary node is Sector-7 (Punjab, India). The protocol is architected for instant global scalability to any region with internet access.",
    icon: <Globe size={32} />, color: "green",
    pos: { top: "40%", left: "8%" }, // Middle-left
    delay: 0.5
  },
  {
    id: 4,
    title: "NEURAL VERIFICATION",
    question: "How are donors vetted?",
    answer: "We deploy an AI-driven Neural Scan (Tesseract OCR) to analyze government IDs and medical certificates, ensuring only verified agents are active.",
    icon: <Cpu size={32} />, color: "purple",
    pos: { top: "45%", right: "8%" }, // Middle-right
    delay: 1.5
  },
  // Removed the 5th star because it sits behind the form
];

const ContactUsPage = () => {
  const [activeStar, setActiveStar] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-sans selection:bg-red-500/30 perspective-1000">

      {/* --- THE UNIVERSE (Animated Backgrounds) --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-red-900/20 via-purple-900/10 to-transparent blur-3xl"></div>
      </div>
      <HomeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="cursor-pointer hover:rotate-90 p-2 m-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all active:scale-95"
      >
        <Menu size={20} />
      </button>
      {/* --- THE FLOATING STAR BEACONS --- */}
      {/* Increased Z-Index to 20 to physically sit ON TOP of the content layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {STAR_DATA.map((star) => (
          <motion.button
            key={star.id}
            onClick={() => setActiveStar(star)}
            style={star.pos}
            className="absolute pointer-events-auto group cursor-pointer" // pointer-events-auto ensures clickability
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 5 + star.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative flex items-center justify-center w-16 h-16">
              <div className={`absolute inset-0 bg-${star.color}-500 rounded-full blur-xl opacity-50 group-hover:opacity-100 animate-pulse`}></div>
              <div className={`relative w-6 h-6 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.9)] group-hover:scale-125 transition-transform duration-300 z-10 flex items-center justify-center`}>
                <div className={`w-2 h-2 bg-${star.color}-500 rounded-full`}></div>
              </div>
              <div className={`absolute w-full h-full border-2 border-${star.color}-500/30 rounded-full animate-[spin_8s_linear_infinite]`}></div>
              <div className={`absolute w-[140%] h-[140%] border border-${star.color}-500/10 rounded-full animate-[spin_12s_linear_infinite_reverse]`}></div>
            </div>
            {/* Tooltip */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2">
              <div className="bg-black/90 border border-zinc-800 px-4 py-2 rounded-lg text-xs font-bold tracking-widest text-white shadow-xl flex items-center gap-2">
                <span className={`w-2 h-2 bg-${star.color}-500 rounded-full animate-pulse`}></span>
                {star.title}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* --- CONTENT LAYER --- */}
      {/* ADDED 'pointer-events-none' HERE: This removes the "Invisible Glass" effect */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-10 min-h-screen flex flex-col pointer-events-none">

        {/* Header */}
        <div className="text-center mb-24 relative z-20">
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <span className="inline-block mb-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono tracking-[0.3em]">SYSTEM: ORBITAL VIEW</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-4">
              COMMS <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">SECTOR</span>
            </h1>
            <p className="text-zinc-400 font-mono tracking-widest text-sm">
              [ Click beacons to decrypt intel // Use terminal for direct uplink ]
            </p>
          </motion.div>
        </div>

        {/* --- THE COMMS TERMINAL --- */}
        {/* ADDED 'pointer-events-auto' HERE: To re-enable clicks ONLY on the form */}
        <div className="mt-auto relative z-30 w-full pointer-events-auto">
          <ContactTerminal />
        </div>
      </div>

      {/* --- THE SPACESHIP CARD MODAL --- */}
      <AnimatePresence>
        {activeStar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 px-6 bg-black/80 backdrop-blur-md pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateX: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className={`relative w-full max-w-3xl bg-zinc-950 border-2 border-${activeStar.color}-900/50 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(var(--${activeStar.color}-rgb),0.2)] group perspective-1000`}
            >
              <div className={`absolute top-0 left-0 w-1/3 h-8 bg-${activeStar.color}-900/20 skew-x-[30deg] origin-bottom-left`}></div>
              <div className={`absolute bottom-0 right-0 w-1/3 h-8 bg-${activeStar.color}-900/20 skew-x-[30deg] origin-top-right`}></div>

              <button onClick={() => setActiveStar(null)} className="absolute top-6 right-6 p-2 bg-black/50 rounded-full text-zinc-400 hover:text-white hover:bg-red-600 transition-all z-30">
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row h-full relative z-20">
                <div className={`w-full md:w-2/5 bg-gradient-to-br from-${activeStar.color}-900/30 to-black p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-${activeStar.color}-900/30 relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10`}></div>
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 bg-${activeStar.color}-500/10 border border-${activeStar.color}-500/30 rounded-full text-${activeStar.color}-400 text-[10px] font-mono tracking-widest mb-6`}>
                      <Zap size={12} /> DATA LOG ENTRY #{activeStar.id}
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase leading-none">{activeStar.title}</h3>
                  </div>
                  <div className={`relative w-32 h-32 mt-10 mx-auto`}>
                    <div className={`absolute inset-0 bg-${activeStar.color}-500 blur-[60px] opacity-40 animate-pulse`}></div>
                    <div className={`relative w-full h-full bg-black/50 border-4 border-${activeStar.color}-500/50 rounded-2xl flex items-center justify-center text-${activeStar.color}-400`}>
                      {activeStar.icon}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-3/5 p-10 md:p-12 flex flex-col justify-center bg-black/80">
                  <h2 className="text-2xl font-bold text-white mb-8 leading-tight relative">
                    {activeStar.question}
                    <div className={`absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-1 bg-${activeStar.color}-500`}></div>
                  </h2>
                  <div className="h-px w-full bg-zinc-800 mb-8 relative overflow-hidden">
                    <div className={`absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-${activeStar.color}-500/50 to-transparent animate-[shimmer_2s_infinite]`}></div>
                  </div>
                  <p className="text-lg text-zinc-300 leading-relaxed font-mono relative pl-6 border-l-2 border-zinc-800">
                    <span className={`absolute left-0 top-0 -translate-x-[2px] h-8 w-[2px] bg-${activeStar.color}-500`}></span>
                    {activeStar.answer}
                  </p>
                  <button onClick={() => setActiveStar(null)} className={`mt-12 self-start flex items-center gap-3 text-sm font-bold text-${activeStar.color}-400 hover:text-white transition-colors group/btn`}>
                    <span>CLOSE DATA LOG</span>
                    <ChevronRight size={16} className={`group-hover/btn:translate-x-1 transition-transform text-${activeStar.color}-500`} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default ContactUsPage;