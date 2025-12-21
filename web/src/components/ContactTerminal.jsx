import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Radio, Signal, Cpu, Zap, AlertCircle, Loader2 } from 'lucide-react';

const ContactTerminal = () => {
  const [status, setStatus] = useState('IDLE'); // IDLE, TRANSMITTING, SECURE, ERROR
  const [formData, setFormData] = useState({
    identity: '',
    frequency: '', // User's Email
    transmission: '' // Message
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('TRANSMITTING');

    try {
      // --- SECURE UPLINK TO YOUR BACKEND ---
      // Replace with your actual backend URL (e.g., http://localhost:5000/api/contact)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Signal Locked:', data);
        setStatus('SECURE');
        // Reset form
        setTimeout(() => {
          setStatus('IDLE');
          setFormData({ identity: '', frequency: '', transmission: '' });
        }, 5000);
      } else {
        throw new Error(data.message || 'Signal Jammed');
      }

    } catch (error) {
      console.error('Transmission Failed:', error);
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 3000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative group perspective-1000">
      {/* Holographic Projector Base */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-red-600/20 blur-xl rounded-full animate-pulse"></div>
      
      <div className="relative bg-black/90 backdrop-blur-xl border-x border-b border-red-900/50 border-t-4 border-t-red-600 rounded-b-3xl rounded-t-lg p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 pointer-events-none"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-red-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded animate-pulse">
              <Radio className="text-red-500" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold tracking-wider">LONG-RANGE COMMS UPLINK</h3>
              <p className="text-red-400 text-xs font-mono tracking-widest">TARGET: REDNOVA COMMAND</p>
            </div>
          </div>
          <div className="hidden md:flex gap-4 text-[10px] font-mono text-zinc-500">
             <div className="flex items-center gap-1"><Signal size={12} className="text-green-500"/>SIGNAL: 100%</div>
             <div className="flex items-center gap-1"><Cpu size={12} className="text-blue-500"/>SECURE</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'SECURE' ? (
            <SuccessScreen />
          ) : status === 'ERROR' ? (
             <ErrorScreen />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <CyberInput 
                    label="IDENTITY / CALLSIGN" 
                    name="identity" 
                    value={formData.identity}
                    onChange={handleChange}
                    placeholder="e.g. CMDR. ANKIT SINGH" 
                 />
                 <CyberInput 
                    label="RETURN FREQUENCY (EMAIL)" 
                    name="frequency" 
                    type="email" 
                    value={formData.frequency}
                    onChange={handleChange}
                    placeholder="agent@domain.com" 
                 />
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-red-400 tracking-widest">
                  <span>TRANSMISSION DATA</span>
                  <span className="text-zinc-600 font-mono">PACKET SIZE: MAX 5KB</span>
                </label>
                <div className="relative group/input">
                  <textarea 
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    rows="5" 
                    placeholder="Enter encoded mission parameters here..."
                    required
                    className="w-full bg-black/50 border-2 border-zinc-800 rounded-lg p-4 text-sm text-white placeholder-zinc-700 focus:border-red-500 focus:ring-0 outline-none transition-all font-mono resize-none group-hover/input:border-zinc-700"
                  ></textarea>
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500 opacity-50 group-focus-within/input:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500 opacity-50 group-focus-within/input:opacity-100 transition-opacity"></div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={status === 'TRANSMITTING'}
                className="w-full relative overflow-hidden bg-zinc-900 hover:bg-red-950 text-white font-bold py-5 rounded-lg group/btn border-y border-zinc-800 hover:border-red-500 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/30 to-red-600/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {status === 'TRANSMITTING' ? (
                    <><Loader2 className="animate-spin text-yellow-400" size={20} /><span className="tracking-[0.2em]">UPLOADING PACKETS...</span></>
                  ) : (
                    <><span className="tracking-[0.2em]">INITIALIZE TRANSMISSION</span><Send size={20} className="group-hover/btn:translate-x-2 transition-transform" /></>
                  )}
                </div>
              </button>
            </form>
          )}
        </AnimatePresence>
        
        <div className="mt-6 pt-4 border-t border-zinc-900/50 flex justify-between text-[10px] text-zinc-600 font-mono">
           <span>SYSTEM STATUS: NOMINAL</span>
           <span>SECURE CHANNEL ID: #RN-RESEND-V1</span>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---
const CyberInput = ({ label, type = "text", name, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-red-400 tracking-widest">{label}</label>
    <div className="relative group/input">
       <input 
         type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required
         className="w-full bg-black/50 border-2 border-zinc-800 rounded-lg p-4 text-sm text-white placeholder-zinc-700 focus:border-red-500 focus:ring-0 outline-none transition-all font-mono group-hover/input:border-zinc-700"
       />
       <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500 opacity-50 group-focus-within/input:opacity-100 transition-opacity"></div>
    </div>
  </div>
);

const SuccessScreen = () => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center space-y-6">
    <div className="relative w-24 h-24 mx-auto">
       <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
       <div className="relative w-full h-full bg-black border-2 border-green-500 rounded-full flex items-center justify-center">
         <CheckCircle className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" size={48} />
       </div>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-white tracking-widest mb-2">TRANSMISSION SECURE</h3>
      <p className="text-zinc-400 font-mono">PACKET DELIVERED TO REDNOVA HQ.</p>
    </div>
  </motion.div>
);

const ErrorScreen = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center space-y-6">
      <div className="relative w-24 h-24 mx-auto">
         <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
         <div className="relative w-full h-full bg-black border-2 border-red-500 rounded-full flex items-center justify-center">
           <AlertCircle className="text-red-500" size={48} />
         </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white tracking-widest mb-2">TRANSMISSION FAILED</h3>
        <p className="text-zinc-400 font-mono">SIGNAL JAMMED. CHECK SERVER LOGS.</p>
      </div>
    </motion.div>
);

export default ContactTerminal;