import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
   Shield, MapPin, CheckCircle,
   Cpu, Activity, Zap, ChevronRight, AlertCircle,
   Star, Crown, Hash, Menu
} from 'lucide-react';
import GalaxyBackground from '../components/GalaxyBackground';
import HomeSidebar from '../components/HomeSidebar';
import axios from 'axios';

// --- MEDICAL CONDITIONS LIST ---
const MEDICAL_OPTIONS = [
   'None', 'Diabetes', 'Heart Condition',
   'Recent Tattoo/Piercing', 'Recent Travel (High Risk)',
   'Chronic Infection', 'Low Iron/Anemia'
];

const JoinDonorPage = () => {
   const navigate = useNavigate();
   const auth = getAuth();

   // --- STATE ---
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);
   const [rotate, setRotate] = useState({ x: 0, y: 0 });
   const [existingUserMode, setExistingUserMode] = useState(false);
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   const [formData, setFormData] = useState({
      name: '', bloodGroup: '', weight: '', address: 'Locating...',
      coordinates: null, medicalConditions: ['None'],
      // READ ONLY STATS (Controlled by Admin)
      rank: 'RECRUIT',
      xp: 0,
      donationCount: 0,
      badges: [] // Assuming badges is an array in DB
   });

   // --- EFFECTS: AUTO-DETECT AGENT STATUS ---
   useEffect(() => {
      const checkStatus = async (currentUser) => {
         try {
            const res = await axios.get(`http://localhost:5000/api/donor/status/${currentUser.email}`);

            if (res.data.isDonor) {
               const d = res.data.donor;
               setFormData({
                  name: d.name,
                  bloodGroup: d.bloodGroup,
                  weight: d.weight,
                  address: d.address || "Sector Locked",
                  coordinates: d.location ? { lat: d.location.coordinates[1], lng: d.location.coordinates[0] } : null,
                  medicalConditions: d.medicalConditions || ['None'],
                  // Load stats from DB
                  donationCount: d.donationCount || 0,
                  rank: d.rank || 'RECRUIT',
                  xp: d.xp || 0,
                  badges: d.badges || []
               });
               setExistingUserMode(true);
            }
         } catch (err) {
            console.log("User is new recruit");
         }
      };

      const unsubscribe = auth.onAuthStateChanged((u) => {
         if (u) {
            setUser(u);
            setFormData(prev => ({ ...prev, name: prev.name || u.displayName || '' }));
            checkStatus(u);
         }
      });
      return () => unsubscribe();
   }, [auth]);

   // --- 3D CARD TILT LOGIC ---
   const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const box = card.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      const centerX = box.width / 2;
      const centerY = box.height / 2;
      setRotate({ x: (y - centerY) / 20, y: (centerX - x) / 20 });
   };
   const resetTilt = () => setRotate({ x: 0, y: 0 });

   // --- ACTIONS ---
   const getGPS = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
         const { latitude, longitude } = pos.coords;
         try {
            const res = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            setFormData(prev => ({
               ...prev,
               coordinates: { lat: latitude, lng: longitude },
               address: res.data.city || res.data.locality || "Sector Locked"
            }));
         } catch (e) {
            setFormData(prev => ({ ...prev, coordinates: { lat: latitude, lng: longitude }, address: "Coordinates Locked" }));
         }
      });
   };

   const toggleCondition = (condition) => {
      setFormData(prev => {
         let newConditions = [...prev.medicalConditions];
         if (condition === 'None') newConditions = ['None'];
         else {
            if (newConditions.includes('None')) newConditions = newConditions.filter(c => c !== 'None');
            if (newConditions.includes(condition)) newConditions = newConditions.filter(c => c !== condition);
            else newConditions.push(condition);
            if (newConditions.length === 0) newConditions = ['None'];
         }
         return { ...prev, medicalConditions: newConditions };
      });
   };

   // --- SUBMIT: UPDATES PROFILE ONLY ---
   const handleSubmit = async () => {
      if (!formData.bloodGroup || !formData.coordinates || !formData.weight) return;
      setLoading(true);

      try {
         // ⚠️ CRITICAL: Separate Editable Data from Stats
         // We do NOT send donationCount/rank/badges to the server.
         // This ensures we never overwrite the Admin's numbers with local data.
         const { donationCount, rank, xp, badges, ...editableProfileData } = formData;

         const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/donor/join`, {
            ...editableProfileData,
            email: user.email,
            uid: user.uid
         });

         // ✅ SYNC: The server returns the FULL donor object (including Admin updates)
         // We update our local state to match the database exactly.
         const updatedDonor = res.data.donor;

         setFormData(prev => ({
            ...prev,
            // Update fields that might have changed
            bloodGroup: updatedDonor.bloodGroup,
            weight: updatedDonor.weight,
            address: updatedDonor.address,
            // REFRESH STATS FROM DB (In case Admin updated them)
            rank: updatedDonor.rank,
            xp: updatedDonor.xp,
            donationCount: updatedDonor.donationCount,
            badges: updatedDonor.badges || []
         }));

         setSuccess(true);
         setExistingUserMode(true);

         setTimeout(() => navigate('/nexus'), 3000);

      } catch (error) {
         console.error("Profile Update Error:", error);
         alert("System Malfunction. Please retry.");
      } finally {
         setLoading(false);
      }
   };

   // --- RANK STYLES (PURELY VISUAL) ---
   const getRankFromCount = (count = 0) => {
      if (count >= 8) return 'COMMANDER';
      if (count >= 2) return 'OFFICER';
      return 'RECRUIT';
   };

   const getRankStyles = (count = 0) => {
      const rank = getRankFromCount(count);
      switch (rank) {
         case 'COMMANDER': return { icon: <Crown size={40} className="text-white" />, color: 'from-yellow-600 to-orange-800', shadow: 'shadow-[0_0_40px_#eab308]', border: 'border-yellow-500', title: 'SECTOR COMMANDER' };
         case 'OFFICER': return { icon: <Star size={40} className="text-white" />, color: 'from-blue-600 to-indigo-800', shadow: 'shadow-[0_0_40px_#3b82f6]', border: 'border-blue-500', title: 'ELITE OFFICER' };
         default: return { icon: <Shield size={40} className="text-white" />, color: 'from-red-600 to-purple-800', shadow: 'shadow-[0_0_40px_rgba(220,38,38,0.4)]', border: 'border-red-500', title: 'ACTIVE RECRUIT' };
      }
   };

   const rankStyle = getRankStyles(formData.donationCount || 0);

   return (
      <div className="relative w-full min-h-screen overflow-hidden bg-black font-sans flex items-center justify-center p-6">
         <GalaxyBackground />
         <HomeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
         {/* --- DYNAMIC AMBIENT GLOW --- */}
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
         </div>

         <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">

            {/* LEFT: THE FORM (EDITABLE PROFILE) */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-700 my-auto">

               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="cursor-pointer hover:rotate-90 p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all active:scale-95"
                     >
                        <Menu size={20} />
                     </button>
                     <Shield className="text-red-500" size={32} />
                     <h1 className="text-4xl font-black text-white tracking-tighter">
                        AGENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">ENLISTMENT</span>
                     </h1>
                  </div>
                  <p className="text-gray-400 font-mono text-sm max-w-md">
                     Update your biological metrics. Mission clearance and Rank are assigned by Command (Admin).
                  </p>
               </div>

               <div className="space-y-6">

                  {/* 1. NAME */}
                  <div className="relative group">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
                     <div className="relative bg-black border border-white/10 rounded-lg p-1">
                        <input
                           type="text"
                           value={formData.name}
                           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                           placeholder="ENTER CODENAME / REAL NAME"
                           className="w-full bg-transparent p-4 text-white font-bold outline-none placeholder:text-gray-700 font-mono tracking-wider"
                        />
                     </div>
                  </div>

                  {/* 2. BLOOD GROUP */}
                  <div>
                     <label className="text-xs font-mono text-gray-500 mb-3 block">BIOMETRIC TYPE</label>
                     <div className="grid grid-cols-4 gap-3">
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                           <button
                              key={bg}
                              onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                              className={`relative cursor-pointer h-12 rounded border transition-all duration-300 overflow-hidden group ${formData.bloodGroup === bg ? 'border-red-500 bg-red-900/20 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'border-white/10 bg-black/40 text-gray-500 hover:border-white/30 hover:text-white'}`}
                           >
                              <span className="relative z-10 font-black font-mono">{bg}</span>
                              {formData.bloodGroup === bg && <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* 3. LOCATION & SPECS */}
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={getGPS} className={`p-4 cursor-pointer rounded-lg border flex flex-col items-start gap-2 transition-all ${formData.coordinates ? 'border-emerald-500 bg-emerald-900/10 text-emerald-400' : 'border-white/10 bg-black/40 text-gray-400 hover:bg-white/5'}`}>
                        <MapPin size={20} />
                        <span className="text-xs font-bold font-mono text-left">{formData.coordinates ? "BASE LOCKED" : "SET HOME BASE"}</span>
                     </button>
                     <div className="relative bg-black/40 border border-white/10 rounded-lg p-4 flex items-center">
                        <input type="number" placeholder="WEIGHT (KG)" onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="bg-transparent w-full text-white font-bold outline-none placeholder:text-gray-700" />
                     </div>
                  </div>

                  {/* 4. MEDICAL HISTORY */}
                  <div>
                     <div className="flex items-center gap-2 mb-3">
                        <label className="text-xs font-mono text-gray-500 block">MEDICAL STATUS CHECK</label>
                        <AlertCircle size={14} className="text-gray-500" />
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {MEDICAL_OPTIONS.map(condition => {
                           const isSelected = formData.medicalConditions.includes(condition);
                           return (
                              <button
                                 key={condition}
                                 onClick={() => toggleCondition(condition)}
                                 className={`px-3 cursor-pointer py-2 rounded-full border text-[10px] font-bold font-mono uppercase transition-all
                             ${isSelected
                                       ? condition === 'None' ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400 shadow-[0_0_10px_#10b981]' : 'border-red-500 bg-red-900/20 text-red-400 shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                                       : 'border-white/10 bg-black/40 text-gray-500 hover:bg-white/5 hover:text-white'
                                    }
                           `}
                              >
                                 {condition}
                              </button>
                           )
                        })}
                     </div>
                  </div>

                  {/* SUBMIT BUTTON (No Donation Toggle) */}
                  <button
                     onClick={handleSubmit}
                     disabled={loading || success || !formData.bloodGroup || !formData.coordinates || !formData.weight}
                     className="w-full cursor-pointer py-5 rounded-xl font-black tracking-[0.2em] text-lg uppercase relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-800 transition-all duration-300 group-hover:scale-105"></div>
                     <div className="relative z-10 flex items-center justify-center gap-3 text-white">
                        {loading ? (
                           <>PROCESSING <Activity className="animate-spin" /></>
                        ) : success ? (
                           <>DATA SYNCED <CheckCircle /></>
                        ) : existingUserMode ? (
                           <>UPDATE BIOMETRICS <Zap size={20} /></>
                        ) : (
                           <>ACTIVATE AGENT <ChevronRight /></>
                        )}
                     </div>
                  </button>

               </div>
            </div>

            {/* RIGHT COLUMN: READ-ONLY STATS CARD */}
            <div className="flex flex-col justify-center items-center my-auto space-y-8">

               <div className="perspective-1000">
                  <div
                     className="relative w-[400px] h-[600px] transition-transform duration-100 ease-out preserve-3d cursor-default"
                     onMouseMove={handleMouseMove} onMouseLeave={resetTilt}
                     style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`, transformStyle: 'preserve-3d' }}
                  >
                     {[2, 4, 6].map(z => <div key={z} className="absolute inset-0 bg-gray-800 rounded-3xl transform" style={{ transform: `translateZ(-${z}px)` }}></div>)}

                     <div className={`
                     absolute inset-0 bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden 
                     shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] 
                     transition-all duration-500 
                     ${success ? `border-opacity-50 ${rankStyle.border} ${rankStyle.shadow}` : ''}
                  `}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 pointer-events-none z-20"></div>
                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

                        <div className="relative z-10 p-8 h-full flex flex-col justify-between">

                           {/* CARD HEADER */}
                           <div className="flex justify-between items-start">
                              <div>
                                 <div className="text-[10px] text-gray-500 font-mono tracking-[0.3em] uppercase mb-1">RedNova Corps</div>
                                 <div className="flex items-center gap-2">
                                    <Cpu size={16} className={success ? "text-emerald-500" : "text-red-500"} />
                                    <span className="font-bold text-white text-sm">ID CARD</span>
                                 </div>
                              </div>
                              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
                                 <Zap size={20} className="text-yellow-500" />
                              </div>
                           </div>

                           {/* RANK BADGE (Visual Representation) */}
                           <div className="text-center space-y-4">
                              <div className="w-32 h-32 mx-auto flex items-center justify-center relative">
                                 <div className={`absolute inset-0 rounded-full border-2 border-dashed opacity-30 animate-[spin_12s_linear_infinite] ${success ? 'border-white' : 'border-red-500'}`}></div>

                                 <div className={`
                                 w-24 h-24 bg-gradient-to-br rounded-xl transform rotate-45 flex items-center justify-center relative transition-all duration-500
                                 ${success ? `scale-110 ${rankStyle.color} ${rankStyle.shadow}` : 'from-red-600 to-purple-800 shadow-[0_0_30px_rgba(220,38,38,0.4)]'}
                              `}>
                                    <div className="transform -rotate-45">
                                       {success ? rankStyle.icon : <Shield size={40} className="text-white" />}
                                    </div>
                                 </div>
                              </div>

                              <div>
                                 <h2 className="text-2xl font-black text-white uppercase tracking-wider break-words">{formData.name || "UNKNOWN"}</h2>

                                 <div className="mt-2">
                                    <div className={`
                                    inline-block px-3 py-1 border rounded-full text-xs font-black tracking-widest uppercase mb-2 transition-all
                                    ${success ? `bg-white/10 text-white ${rankStyle.border}` : 'bg-red-500/20 border-red-500/50 text-red-400'}
                                 `}>
                                       {rankStyle.title}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* STATS GRID (Including Donation History & Badges) */}
                           <div className="grid grid-cols-3 gap-2 mt-4">
                              {/* Blood Type */}
                              <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                                 <div className="text-[8px] text-gray-500 uppercase font-mono">Blood</div>
                                 <div className="text-xl font-black text-red-500">{formData.bloodGroup || "--"}</div>
                              </div>

                              {/* Donation History (Admin Managed) */}
                              <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                                 <div className="text-[8px] text-gray-500 uppercase font-mono text-center">Missions</div>
                                 <div className="flex items-center gap-1">
                                    <div className="text-xl font-black text-white">{formData.donationCount}</div>
                                    <CheckCircle size={10} className="text-emerald-500" />
                                 </div>
                              </div>

                              {/* Badges Count */}
                              <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                                 <div className="text-[8px] text-gray-500 uppercase font-mono">Badges</div>
                                 <div className="flex items-center gap-1">
                                    <div className="text-xl font-black text-yellow-500">{formData.badges ? formData.badges.length : 0}</div>
                                    <Hash size={10} className="text-yellow-500" />
                                 </div>
                              </div>
                           </div>

                           {/* ADDRESS / SECTOR */}
                           <div className="bg-white/5 rounded-lg p-3 border border-white/5 mt-2">
                              <div className="text-[9px] text-gray-500 uppercase font-mono">Current Sector</div>
                              <div className="text-xs font-bold text-white truncate leading-6">
                                 {formData.address === "Locating..." ? <span className="animate-pulse">SCANNING...</span> : formData.address.split(',')[0] || "--"}
                              </div>
                           </div>

                           <div className="mt-4 opacity-30">
                              <div className="h-4 w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,white_2px,white_4px)]"></div>
                              <div className="text-[8px] font-mono text-center mt-1">{user?.uid || "NO_ID_SIGNAL"}</div>
                           </div>

                        </div>
                     </div>
                  </div>
               </div>

            </div>

         </div>
      </div>
   );
};

export default JoinDonorPage;