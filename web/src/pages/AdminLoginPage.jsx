import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, ChevronRight, ScanLine, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, GRANTED, DENIED

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('SCANNING');

    try {
      // Connect to your Backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setTimeout(() => {
            setStatus('GRANTED');
            // Store the Admin Token
            localStorage.setItem('adminToken', data.token);
            setTimeout(() => navigate('/admin-portal'), 1500); // Redirect after effect
        }, 1500); // Fake scanning delay for effect
      } else {
        setStatus('DENIED');
        setTimeout(() => setStatus('IDLE'), 2000);
      }
    } catch (err) {
      setStatus('DENIED');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-mono selection:bg-red-500/50">
      
      {/* Background Grid - The Matrix */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-20 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-red-900/10 pointer-events-none"></div>

      {/* The Central Access Terminal */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md p-1"
      >
        {/* Holographic Border Effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${status === 'DENIED' ? 'from-red-600 to-orange-600' : status === 'GRANTED' ? 'from-green-500 to-emerald-500' : 'from-red-600 via-purple-600 to-red-600'} rounded-2xl blur opacity-75 animate-tilt transition-all duration-500`}></div>
        
        <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl p-8 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 text-red-500">
                    <ShieldAlert size={24} />
                    <span className="font-bold tracking-[0.2em] text-sm">COMMAND_ACCESS</span>
                </div>
                <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${status === 'SCANNING' ? 'bg-yellow-500 animate-ping' : 'bg-red-500'}`}></div>
                    SECURE CONNECTION
                </div>
            </div>

            {/* Status Screen Overlay */}
            {status === 'GRANTED' && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 z-50 bg-green-500/90 flex flex-col items-center justify-center text-black">
                    <ScanLine size={64} className="animate-ping mb-4"/>
                    <h2 className="text-3xl font-black tracking-widest">ACCESS GRANTED</h2>
                    <p className="font-bold">WELCOME BACK, COMMANDER</p>
                </motion.div>
            )}
            
            {status === 'DENIED' && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 z-50 bg-red-600/90 flex flex-col items-center justify-center text-white">
                    <ShieldAlert size={64} className="animate-bounce mb-4"/>
                    <h2 className="text-3xl font-black tracking-widest">ACCESS DENIED</h2>
                    <p className="font-mono">IP LOGGED. SECURITY ALERT.</p>
                </motion.div>
            )}

            {/* The Form */}
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-zinc-500 text-xs mb-2 tracking-widest">ADMINISTRATOR ID (EMAIL)</label>
                    <div className="relative group">
                        <Terminal className="absolute left-3 top-3 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input 
                           type="email" 
                           name="email" 
                           onChange={handleChange}
                           className="w-full bg-black/50 border border-zinc-800 rounded text-red-500 p-3 pl-10 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder-zinc-800 font-bold"
                           placeholder="admin@sector7.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-zinc-500 text-xs mb-2 tracking-widest">PASSCODE (HASH)</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input 
                           type="password" 
                           name="password"
                           onChange={handleChange} 
                           className="w-full bg-black/50 border border-zinc-800 rounded text-red-500 p-3 pl-10 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder-zinc-800"
                           placeholder="••••••••••••"
                        />
                    </div>
                </div>

                <button 
                    disabled={status === 'SCANNING'}
                    className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 rounded flex items-center justify-center gap-2 group transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'SCANNING' ? (
                        <span className="animate-pulse">VERIFYING BIOMETRICS...</span>
                    ) : (
                        <>
                           INITIATE UPLINK <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-[10px] text-zinc-600">
                    UNAUTHORIZED ACCESS IS A CLASS-A FELONY UNDER REDNOVA PROTOCOLS.
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;