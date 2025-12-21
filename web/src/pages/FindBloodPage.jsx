import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Activity, MapPin, 
  Send, ChevronRight, ChevronLeft, Satellite, 
  CheckCircle, Loader2, Phone, Clock, ShieldCheck, Menu
} from 'lucide-react';
import GalaxyBackground from '../components/GalaxyBackground'; 
import { createBloodRequest } from '../services/authService'; 
import HomeSidebar from '../components/HomeSidebar';
import axios from 'axios';

const FindBloodPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  
  // --- STATE ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState(null); // To track the created request
  const [requestStatus, setRequestStatus] = useState('DRAFT'); // DRAFT -> PENDING -> APPROVED
  const [nearestBank, setNearestBank] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Polling Ref
  const pollTimer = useRef(null);

  // Form Data
  const [formData, setFormData] = useState({
    urgency: 'CRITICAL', 
    bloodGroup: '',
    locationCoordinates: null,
    patientName: '',
    age: '',
    units: 1,
    contactNumber: '',
    note: ''
  });

  // --- 1. SETUP ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserEmail(user.email);
    });
    return () => {
      unsubscribe();
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [auth]);

  // --- 2. GPS & AUTO-FIND NEAREST HOSPITAL ---
  const getGPSAndFindHospital = () => {
    if (!navigator.geolocation) return;
    
    setLoading(true); // Show scanning UI

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // 1. Save Coordinates
      setFormData(prev => ({
        ...prev,
        locationCoordinates: { lat, lng }
      }));

      try {
        // 2. Reuse your existing 'Nearby' API to find banks
        // We assume this endpoint returns an array of banks with 'dist.calculated' (in meters)
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/bloodbanks/nearby?lat=${lat}&lng=${lng}`);
        const banks = res.data;

        if (banks.length > 0) {
          // Sort by distance just to be safe
          const sorted = banks.sort((a, b) => a.dist.calculated - b.dist.calculated);
          const closest = sorted[0];
          
          setNearestBank(closest);

          // 3. Calculate Time (Assuming 30km/h avg speed in emergency)
          // Distance is in meters. Speed = 30000 meters / 60 mins = 500 meters/min
          const meters = closest.dist.calculated;
          const minutes = Math.ceil(meters / 500) + 5; // +5 mins buffer
          setEstimatedTime(minutes);
        }
      } catch (err) {
        console.error("Scanning failed", err);
      } finally {
        setLoading(false);
      }
    });
  };

  // --- 3. SUBMISSION ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        email: userEmail,
        status: 'PENDING',
        hospitalName: nearestBank?.name || "Unknown", // Auto-filled from scan
        ...formData
      };

      // Create Request in Backend
      const response = await createBloodRequest(payload);
      
      // Store ID and Switch to Waiting Room
      setRequestId(response._id || response.id); // Adjust based on your backend response
      setRequestStatus('PENDING');
      setStep(5); // Go to "Waiting for Approval" screen
      
      // START POLLING FOR ADMIN APPROVAL
      startPolling(response._id || response.id);

    } catch (error) {
      console.error("Submission Error", error);
      alert("TRANSMISSION FAILED");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. POLLING MECHANISM (The "Manual Verify" Listener) ---
  const startPolling = (id) => {
    pollTimer.current = setInterval(async () => {
      try {
        // You need an endpoint to get a single request status
        // Example: GET /api/blood-request/:id
        const res = await axios.get(`http://localhost:5000/api/blood-request/${id}`);
        const data = res.data;

        // CHECK IF ADMIN VERIFIED IT
        if (data.isVerified === true) {
          clearInterval(pollTimer.current);
          setRequestStatus('APPROVED');
          // Trigger the visual "Call" effect
          setTimeout(() => setStep(6), 1000); 
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000); // Check every 3 seconds
  };


  // --- STEPS RENDERERS ---

  // STEP 1: URGENCY & TYPE (Same as before)
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="grid grid-cols-3 gap-3">
        {['CRITICAL', 'URGENT', 'STANDARD'].map((level) => (
          <button
            key={level}
            onClick={() => setFormData({ ...formData, urgency: level })}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${formData.urgency === level ? 'bg-red-900/40 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-black/40 border-white/10 opacity-60'}`}>
            <AlertTriangle size={24} className={level === 'CRITICAL' ? 'text-red-500' : 'text-blue-500'} />
            <span className="text-[10px] font-black tracking-widest text-white">{level}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
          <button key={bg} onClick={() => setFormData({ ...formData, bloodGroup: bg })} className={`h-12 rounded-full cursor-pointer hover:scale-[105%]  font-black font-mono text-sm transition-all ${formData.bloodGroup === bg ? 'bg-gradient-to-br from-red-700 via-orange-600 to-red-900 text-gray-100' : 'bg-white/5 text-gray-400 border border-white/10'}`}>{bg}</button>
        ))}
      </div>
    </div>
  );

  // STEP 2: AUTO-SCAN (New Logic)
  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      
      {/* SCAN BUTTON / STATUS */}
      <button
        onClick={getGPSAndFindHospital}
        disabled={loading || nearestBank}
        className={`w-full py-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden
          ${nearestBank ? 'bg-emerald-900/30 border-emerald-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}
        `}
      >
        {loading ? (
           <>
             <Loader2 size={30} className="animate-spin text-red-500" />
             <div className="text-xs font-mono text-red-400 animate-pulse">TRIANGULATING NEAREST FACILITY...</div>
           </>
        ) : nearestBank ? (
           <>
             <CheckCircle size={30} className="text-emerald-500" />
             <div className="text-sm font-bold text-white uppercase tracking-widest">Target Locked</div>
           </>
        ) : (
           <>
             <Satellite size={30} className="text-gray-400" />
             <div className="text-xs font-mono cursor-pointer text-gray-400">TAP TO INITIATE SECTOR SCAN</div>
           </>
        )}
      </button>

      {/* RESULT CARD */}
      {nearestBank && (
        <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-3 animate-in fade-in zoom-in duration-300">
           <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] text-gray-500 font-mono uppercase">Nearest Secure Facility</div>
                <div className="text-lg font-bold text-white">{nearestBank.name}</div>
                <div className="text-xs text-gray-400">{nearestBank.location}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 font-mono uppercase">Est. Arrival</div>
                <div className="text-2xl font-black text-emerald-400">{estimatedTime} <span className="text-xs font-normal text-gray-500">MIN</span></div>
              </div>
           </div>
           
           {/* Distance Bar */}
           <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[70%] shadow-[0_0_10px_#10b981]"></div>
           </div>
           <div className="text-[10px] text-gray-500 font-mono text-right">DISTANCE: {(nearestBank.dist.calculated / 1000).toFixed(1)} KM</div>
        </div>
      )}
    </div>
  );

  // STEP 3: DETAILS (Same as before)
  const renderStep3 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <input type="text" placeholder="PATIENT NAME" value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} className="bg-black/60 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-red-500 outline-none" />
        <input type="number" placeholder="AGE" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="bg-black/60 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-red-500 outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input type="number" placeholder="UNITS" value={formData.units} onChange={(e) => setFormData({...formData, units: e.target.value})} className="bg-black/60 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-red-500 outline-none" />
        <input type="tel" placeholder="CONTACT #" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} className="bg-black/60 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-red-500 outline-none" />
      </div>
    </div>
  );

  // STEP 5: WAITING ROOM (Polling)
  const renderStep5 = () => (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-500">
       <div className="relative">
         <div className="w-24 h-24 border-4 border-white/10 border-t-red-500 rounded-full animate-spin"></div>
         <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck size={30} className="text-white/20" />
         </div>
       </div>
       <div>
         <h2 className="text-xl font-black text-white tracking-widest uppercase">Awaiting Approval</h2>
         <p className="text-xs font-mono text-gray-500 mt-2 max-w-[250px] mx-auto">
           COMMAND IS VERIFYING YOUR DISTRESS SIGNAL. STAND BY.
         </p>
         <p className="text-[10px] text-red-500/50 mt-4 animate-pulse">DO NOT CLOSE THIS TERMINAL</p>
       </div>
    </div>
  );

  // STEP 6: APPROVED & IN TRANSIT
  const renderStep6 = () => (
    <div className="flex flex-col h-full animate-in fade-in zoom-in duration-500">
       
       {/* SUCCESS BANNER */}
       <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_#10b981]">
             <Phone size={20} className="text-black animate-pulse" />
          </div>
          <div>
             <div className="text-sm font-bold text-white uppercase">Dispatch Approved</div>
             <div className="text-[10px] font-mono text-emerald-400">VOICE CHANNEL OPENING...</div>
          </div>
       </div>

       {/* TRANSIT DASHBOARD */}
       <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

          <div className="relative z-10">
             <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Estimated Time to Reach</div>
             <div className="text-6xl font-black text-white tracking-tighter">
                {estimatedTime}<span className="text-lg text-gray-500 ml-2">MIN</span>
             </div>
             
             {/* Dynamic Progress Bar */}
             <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                   <span>DISPATCH</span>
                   <span className="text-emerald-500 animate-pulse">EN ROUTE</span>
                   <span>ARRIVAL</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-[45%] shadow-[0_0_15px_#10b981] relative">
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-ping"></div>
                   </div>
                </div>
             </div>
          </div>

          {/* HOSPITAL INFO FOOTER */}
          <div className="relative z-10 border-t border-white/10 pt-4 mt-4">
             <div className="flex items-center gap-3">
                <MapPin className="text-emerald-500" size={16} />
                <div className="text-sm font-bold text-gray-300">{nearestBank?.name}</div>
             </div>
          </div>
       </div>
       
       <button onClick={() => navigate('/nexus')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-xs font-mono rounded-lg transition-colors">
          RETURN TO SECTOR SCAN
       </button>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans selection:bg-red-500/30 flex items-center justify-center p-4">
      <GalaxyBackground />
      <HomeSidebar 
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}/>

      <div className="relative z-10 w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
        
        {/* HEADER */}
        <div className="h-20 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-red-900/10 to-transparent">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="cursor-pointer hover:rotate-90 p-2 -ml-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <Menu size={24} />
              </button>

              <div className="flex items-center gap-3">
                <Activity className="text-red-500" size={20} />
                <div>
                   <div className="text-[10px] text-red-400 font-mono tracking-widest uppercase">Emergency Link</div>
                   <div className="text-white font-bold text-lg leading-none">Find Blood</div>
                </div>
              </div>
           </div>
           {step < 5 && <div className="text-xs font-mono text-gray-500">STEP <span className="text-white">{step}</span> / 4</div>}
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto">
           {step === 1 && renderStep1()}
           {step === 2 && renderStep2()}
           {step === 3 && renderStep3()}
           {step === 4 && (
              <div className="text-center space-y-4">
                 <div className="text-2xl font-bold text-white">Confirm Transmission</div>
                 <div className="text-sm text-gray-400">Send signal to <span className="text-emerald-400">{nearestBank?.name}</span>?</div>
                 <div className="p-4 bg-white/5 text-gray-300 rounded-lg text-left text-xs font-mono space-y-2">
                    <div>PATIENT: {formData.patientName}</div>
                    <div>URGENCY: <span className="text-red-500">{formData.urgency}</span></div>
                    <div>BLOOD: {formData.bloodGroup}</div>
                    <div>EST. TIME: {estimatedTime} MIN</div>
                 </div>
              </div>
           )}
           {step === 5 && renderStep5()}
           {step === 6 && renderStep6()}
        </div>

        {/* CONTROLS (Hide during waiting/approved) */}
        {step < 5 && (
           <div className="h-20 border-t border-white/10 flex items-center justify-between px-6 bg-black/20">
              <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className={`p-3 rounded-full border border-white/10 ${step === 1 ? 'opacity-0' : 'text-gray-400 hover:text-white'}`}><ChevronLeft size={24} /></button>
              
              {step === 4 ? (
                 <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-3 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full shadow-[0_0_20px_red]">
                    <span>{loading ? "TRANSMITTING..." : "BROADCAST SIGNAL"}</span>
                 </button>
              ) : (
                 <button 
                   onClick={() => setStep(s => s + 1)} 
                   disabled={(step === 1 && !formData.bloodGroup) || (step === 2 && !nearestBank)}
                   className="flex hover:scale-[105%] items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-900 via-purple-700 to-slate-800 text-white cursor-pointer font-bold rounded-full disabled:opacity-50"
                 >
                   <span>CONTINUE</span><ChevronRight size={18} />
                 </button>
              )}
           </div>
        )}

      </div>
    </div>
  );
};

export default FindBloodPage;