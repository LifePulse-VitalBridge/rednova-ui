import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Phone } from 'lucide-react';

const RequestVerifier = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('adminToken');

  const fetchRequests = async () => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin-portal/requests`, {
            headers: { 'Authorization': token }
        });
        const data = await res.json();
        setRequests(data);
    } catch (err) { console.error("Sector B Error:", err); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleVerify = async (id) => {
    try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/admin-portal/requests/${id}/verify`, {
            method: 'PUT',
            headers: { 'Authorization': token }
        });
        // Optimistic UI Update (Remove instantly from list)
        setRequests(requests.filter(r => r._id !== id));
    } catch (err) { console.error("Verify Failed:", err); }
  };

  const handleReject = (id) => {
  // Simply filter out the rejected ID from the current state
  setRequests(requests.filter(r => r._id !== id));
};

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-6 text-yellow-500">
        <AlertTriangle size={20} />
        <span className="text-sm font-mono tracking-widest">PENDING VERIFICATION QUEUE: {requests.length}</span>
      </div>

      {requests.length === 0 && (
         <div className="text-center py-20 text-zinc-600 font-mono">ALL CHANNELS CLEAR. NO PENDING SIGNALS.</div>
      )}

      {requests.map((req) => (
        <motion.div 
          key={req._id}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border-l-4 border-yellow-500 p-6 rounded-r-xl flex flex-col md:flex-row justify-between items-center gap-6"
        >
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                 <span className="text-2xl font-black text-white">{req.bloodGroup}</span>
                 <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-1 rounded border border-red-500/20 font-bold tracking-widest">{req.urgency}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{req.patientName} <span className="text-zinc-500 text-sm font-normal">at {req.hospitalName}</span></h3>
              <div className="flex items-center gap-2 text-zinc-400 text-sm mt-1 font-mono">
                 <Phone size={14} /> {req.contactNumber}
              </div>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={() => handleReject(req._id)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-red-500 hover:bg-red-900/20 hover:border-red-500 transition-all font-bold text-xs tracking-widest"
              >
                <XCircle size={16} /> REJECT
              </button>
              <button 
                onClick={() => handleVerify(req._id)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all font-bold text-xs tracking-widest"
              >
                <CheckCircle size={16} /> VERIFY SIGNAL
              </button>
           </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RequestVerifier;