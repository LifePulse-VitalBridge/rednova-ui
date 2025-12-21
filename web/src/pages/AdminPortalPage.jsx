import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Radio, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BloodBankManager from '../components/admin/BloodBankManager';
import RequestVerifier from '../components/admin/RequestVerifier';
import DonorRecruiter from '../components/admin/DonorRecruiter';

const AdminPortalPage = () => {
  const navigate = useNavigate();
  const [activeSector, setActiveSector] = useState('BANKS'); // BANKS | REQUESTS | DONORS

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30">
      {/* --- COMMAND HEADER --- */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
            <h1 className="text-xl font-bold tracking-[0.2em] text-zinc-100">
              REDNOVA <span className="text-red-500">COMMAND</span>
            </h1>
          </div>
          
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-red-500 transition-colors">
            <LogOut size={14} /> TERMINATE SESSION
          </button>
        </div>

        {/* --- SECTOR TABS --- */}
        <div className="container mx-auto px-6 flex gap-8 mt-2 overflow-x-auto">
          <TabButton 
            active={activeSector === 'BANKS'} 
            onClick={() => setActiveSector('BANKS')} 
            icon={<Activity size={16} />} 
            label="SECTOR A: BLOOD BANKS" 
          />
          <TabButton 
            active={activeSector === 'REQUESTS'} 
            onClick={() => setActiveSector('REQUESTS')} 
            icon={<Radio size={16} />} 
            label="SECTOR B: VERIFICATIONS" 
          />
          <TabButton 
            active={activeSector === 'DONORS'} 
            onClick={() => setActiveSector('DONORS')} 
            icon={<Users size={16} />} 
            label="SECTOR C: RECRUITMENT" 
          />
        </div>
      </div>

      {/* --- MAIN DISPLAY AREA --- */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          key={activeSector}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeSector === 'BANKS' && <BloodBankManager />}
          {activeSector === 'REQUESTS' && <RequestVerifier />}
          {activeSector === 'DONORS' && <DonorRecruiter />}
        </motion.div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`pb-4 flex items-center gap-2 text-xs font-bold tracking-widest transition-all relative ${
      active ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
    }`}
  >
    {icon} {label}
    {active && (
      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-[0_0_15px_red]" />
    )}
  </button>
);

export default AdminPortalPage;