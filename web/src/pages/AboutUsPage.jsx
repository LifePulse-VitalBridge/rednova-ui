import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import {
    Database, ScanLine, Globe, Lock, Zap,
    ChevronRight, ChevronLeft, Terminal, Cpu, Shield, Activity, Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HomeSidebar from '../components/HomeSidebar';

/* --- 1. THE SCROLL SCALE WRAPPER (Your requested logic) --- */
const ScrollScale = ({ children }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["0 1", "1.2 1"] // Trigger when element enters viewport
    });

    const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
    const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

    return (
        <motion.div
            ref={ref}
            style={{ scale: scaleProgress, opacity: opacityProgress }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

const AboutUsPage = () => {
    // --- STATE & REFS ---
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursorVariant, setCursorVariant] = useState("default");

    // Carousel Refs
    const carouselRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    // --- MOUSE TRACKING ---
    useEffect(() => {
        const mouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", mouseMove);
        return () => window.removeEventListener("mousemove", mouseMove);
    }, []);

    // --- CURSOR VARIANTS ---
    const variants = {
        default: { x: mousePosition.x - 12, y: mousePosition.y - 12, opacity: 0.8 },
        hover: {
            x: mousePosition.x - 32, y: mousePosition.y - 32,
            height: 64, width: 64, opacity: 1,
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "#ef4444", borderWidth: 1
        },
    };
    const textEnter = () => setCursorVariant("hover");
    const textLeave = () => setCursorVariant("default");

    // --- CAROUSEL LOGIC ---
    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -350 : 350;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <div className="min-h-screen bg-black text-red-50 font-sans selection:bg-red-500/30 overflow-x-hidden cursor-none relative">

            {/* CUSTOM CURSOR */}
            <motion.div
                className="fixed top-0 left-0 w-6 h-6 border border-red-500 rounded-full pointer-events-none z-[9999] flex items-center justify-center mix-blend-screen shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                variants={variants}
                animate={cursorVariant}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
            >
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
            </motion.div>

            {/* BACKGROUND GRID */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(20,0,0,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,0,0,0.5)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>
            <HomeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="cursor-none hover:rotate-90 p-2 mt-8 ml-4  text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all active:scale-95"
            >
                <Menu size={20} />
            </button>
            {/* --- SECTION 1: HERO (Tightened Gap) --- */}
            <div className="relative pt-32 pb-16 px-6 flex flex-col items-center justify-center z-10 text-center">
                
                <ScrollScale>
                    <div className="inline-flex items-center gap-2 px-3 py-1 border border-red-500/30 rounded bg-red-950/20 text-red-400 text-[10px] tracking-[0.2em] mb-6">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        SYSTEM STATUS: ONLINE
                    </div>

                    <h1
                        onMouseEnter={textEnter}
                        onMouseLeave={textLeave}
                        className="text-7xl md:text-9xl font-black tracking-tighter mb-4 relative z-20 cursor-none select-none"
                    >
                        <span className="bg-clip-text  text-transparent bg-[linear-gradient(to_right,theme(colors.red.600),theme(colors.purple.600),theme(colors.red.600),theme(colors.orange.500),theme(colors.red.600))] bg-[length:200%_auto] animate-gradient">
                            REDNOVA
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-mono">
             Decentralized Blood Banking Protocol.<br />
             Saving lives at the speed of code.
                    </p>
                </ScrollScale>
            </div>


            {/* --- SECTION 2: THE ENGINE CORE (Carousel Fixed) --- */}
            <div className="relative z-10 py-16 border-y border-red-900/10 bg-black/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 mb-10 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 text-red-500 mb-2">
                            <Cpu size={20} className="animate-spin-slow" />
                            <span className="font-bold tracking-widest text-sm">ENGINE CORE</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">SYSTEM MODULES</h2>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => scrollCarousel('left')}
                            onMouseEnter={textEnter} onMouseLeave={textLeave}
                            className="p-3 border border-zinc-800 bg-zinc-900/50 rounded-full hover:border-red-500 hover:text-red-500 transition-colors "
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scrollCarousel('right')}
                            onMouseEnter={textEnter} onMouseLeave={textLeave}
                            className="p-3 border cursor-none border-zinc-800 bg-zinc-900/50 rounded-full hover:border-red-500 hover:text-red-500 transition-colors "
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* The Carousel Container */}
                <div
                    className="relative w-full overflow-hidden"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Gradients to hide edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none"></div>

                    {/* Scrolling Track */}
                    <div
                        ref={carouselRef}
                        className="flex gap-6 overflow-x-auto no-scrollbar px-6 pb-10 snap-x"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {/* Auto-Scroll Animation Helper: We use CSS for the continuous move, but allow manual override */}
                        <div className={`flex gap-6 ${!isPaused ? 'animate-scroll-slow' : ''}`}>
                            <TechCard title="FIREBASE" icon={<Database />} subtitle="Realtime DB" desc="Sub-millisecond latency for live blood unit tracking." color="orange" />
                            <TechCard title="NEURAL SCAN" icon={<ScanLine />} subtitle="Tesseract OCR" desc="AI-driven content moderation and threat detection." color="purple" />
                            <TechCard title="BIO-RADAR" icon={<Globe />} subtitle="Leaflet Geo" desc="Precision mapping for donor and hospital triangulation." color="blue" />
                            <TechCard title="VAULT CHAIN" icon={<Lock />} subtitle="NFT Certs" desc="Immutable blockchain proof of donation history." color="yellow" />
                            <TechCard title="COMMS LINK" icon={<Zap />} subtitle="Twilio Voice" desc="Direct encrypted voice uplink between donor and host." color="red" />
                            {/* Duplicates for Loop feel */}
                            <TechCard title="FIREBASE" icon={<Database />} subtitle="Realtime DB" desc="Sub-millisecond latency for live blood unit tracking." color="orange" />
                            <TechCard title="NEURAL SCAN" icon={<ScanLine />} subtitle="Tesseract OCR" desc="AI-driven content moderation and threat detection." color="purple" />
                        </div>
                    </div>
                </div>
            </div>


            {/* --- SECTION 3: ADMIN DOSSIER (Content Updated) --- */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
                <ScrollScale>
                    <div className="relative bg-zinc-900/30 border border-zinc-800/60 p-8 md:p-12 rounded-3xl backdrop-blur-md overflow-hidden group hover:border-red-500/30 transition-all duration-500">

                        {/* Background Deco */}
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Terminal size={120} className="text-zinc-800" />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            {/* Profile Photo Area */}
                            <div
                                className="relative shrink-0 w-40 h-40 md:w-52 md:h-52 rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950 shadow-2xl  group-hover:shadow-red-900/20"
                                onMouseEnter={textEnter} onMouseLeave={textLeave}
                            >
                                {/* Image Placeholder */}
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
                                    <span className="text-6xl grayscale group-hover:grayscale-0 transition-all">👨‍💻</span>
                                </div>

                                {/* Scan Line Effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent w-full h-1 translate-y-[-100%] animate-scan"></div>
                                <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-black text-[10px] font-bold text-center py-1 tracking-widest">
                                    IDENTITY VERIFIED
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                        ANKIT KUMAR SINGH
                                    </h2>
                                    <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold tracking-widest rounded shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                        ADMIN_ROOT
                                    </span>
                                </div>

                                <p className="text-zinc-400 text-lg italic border-l-2 border-red-500/50 pl-4">
                                    "We don't just write code. We build digital ecosystems that ensure no call for help goes unanswered."
                                </p>

                                {/* VISION STATS (Updated) */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6">
                                    <VisionStat label="TARGET RESPONSE" value="< 2ms" />
                                    <VisionStat label="DATA ENCRYPTION" value="AES-256" />
                                    <VisionStat label="GLOBAL UPTIME" value="99.9%" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollScale>
            </div>


            {/* --- SECTION 4: CTA (Enlist) --- */}
            <div className="relative z-10 pb-32 text-center">
                <ScrollScale>
                    <motion.button
                        onMouseEnter={textEnter} onMouseLeave={textLeave}
                        onClick={() => navigate('/joinDonor')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative cursor-none inline-flex items-center justify-center"
                    >
                        {/* Glowing Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg blur-lg opacity-50 group-hover:opacity-100 transition duration-500"></div>

                        {/* Button Content */}
                        <div className="relative px-10 py-5 bg-black rounded-lg border border-red-500/50 flex items-center gap-3">
                            <span className="text-xl font-bold text-white tracking-[0.2em] uppercase">Initialize Enlistment</span>
                            <ChevronRight className="text-red-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.button>
                </ScrollScale>
            </div>


            {/* --- STYLES --- */}
            <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes scroll-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-slow {
          animation: scroll-slow 40s linear infinite;
        }
        
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
        .animate-scan {
          animation: scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes gradient {
         0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
        }
        .animate-gradient {
         animation: gradient 3s linear infinite;
        }
      `}</style>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const TechCard = ({ title, icon, subtitle, desc, color }) => (
    <div className={`
    relative shrink-0 w-80 p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80 
    backdrop-blur-md cursor-none group overflow-hidden hover:border-${color}-500/50 transition-all duration-300
  `}>
        <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity`}></div>

        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg bg-zinc-900 text-${color}-500 border border-zinc-800 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <Activity size={16} className="text-zinc-700 group-hover:text-green-500 transition-colors" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1 tracking-wide">{title}</h3>
        <p className={`text-xs font-bold text-${color}-400 mb-3 uppercase tracking-wider`}>{subtitle}</p>
        <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">{desc}</p>
    </div>
);

const VisionStat = ({ label, value }) => (
    <div className="flex flex-col p-3 bg-black/40 rounded border border-zinc-800/50 hover:border-red-500/30 transition-colors cursor-none">
        <span className="text-lg font-bold text-white font-mono">{value}</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
);

export default AboutUsPage;