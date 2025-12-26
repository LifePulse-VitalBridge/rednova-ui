import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Medal, Edit2, Save, Award } from 'lucide-react';

const DonorRecruiter = () => {
  const [applicants, setApplicants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [tempData, setTempData] = useState({});
  const token = localStorage.getItem('adminToken');

  const fetchDonors = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin-portal/donors`, {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      setApplicants(data);
    } catch (err) { console.error("Sector C Error:", err); }
  };

  useEffect(() => { fetchDonors(); }, []);

  // START EDITING
  const startEditing = (donor) => {
    setEditingId(donor._id);
    // Initialize temp state with current donor values
    setTempData({
      rank: donor.rank,
      donationCount: donor.donationCount,
      xp: donor.xp,
      certificateApproved: donor.certificateApproved,
    });
  };

  const handleUpdate = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin-portal/donors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(tempData) // Send changed fields
      });
      setEditingId(null);
      fetchDonors();
    } catch (err) { console.error("Update Failed:", err); }
  };

  // TRACK INPUT CHANGES
  const handleInputChange = (field, value) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applicants.map((donor) => (
        <motion.div
          key={donor._id}
          className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group"
        >
          {/* Background Decor */}
          <div className="absolute top-0 right-0 p-4 opacity-10 text-white group-hover:opacity-20 transition-opacity">
            <Shield size={100} />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">{donor.name}</h3>
                <p className="text-xs text-zinc-500 font-mono mt-1">{donor.location?.address}</p>
              </div>
              <div className="bg-red-600 text-white font-black text-xl w-10 h-10 flex items-center justify-center rounded-lg shadow-lg">
                {donor.bloodGroup}
              </div>
            </div>

            {/* Editable Stats */}
            <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-mono flex items-center gap-2"><Medal size={12} /> RANK</span>
                {editingId === donor._id ? (
                  <select
                    className="bg-black border border-zinc-700 text-xs text-white p-1 rounded outline-none"
                    value={tempData.rank}
                    onChange={(e) => handleInputChange('rank', e.target.value)}
                  >
                    <option value="RECRUIT">RECRUIT</option>
                    <option value="VETERAN">VETERAN</option>
                    <option value="COMMANDER">COMMANDER</option>
                  </select>
                ) : (
                  <span className="text-sm font-bold text-yellow-500 tracking-widest">{donor.rank}</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-mono flex items-center gap-2"><Award size={12} /> Certificate</span>
                {editingId === donor._id ? (
                  <select
                    className="bg-black border border-zinc-700 text-xs text-white p-1 rounded outline-none"
                    value={tempData.certificateApproved}
                    onChange={(e) => handleInputChange('certificateApproved', e.target.value)}
                  >
                    <option value={true}>True</option>
                    <option value={false}>False</option>
                  </select>
                ) : (
                  <span className="text-sm font-bold text-yellow-500 tracking-widest">
                    {donor.certificateApproved ? "APPROVED" : "PENDING"}
                  </span>

                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-mono">MISSIONS (COUNT)</span>
                {editingId === donor._id ? (
                  <input
                    type="number"
                    className="w-16 bg-black border border-zinc-700 text-right text-xs text-white p-1 rounded"
                    value={tempData.donationCount}
                    onChange={(e) => handleInputChange('donationCount', e.target.value)}
                  />
                ) : (
                  <span className="text-sm font-bold text-white">{donor.donationCount}</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-mono">XP POINTS</span>
                {editingId === donor._id ? (
                  <input
                    type="number"
                    className="w-16 bg-black border border-zinc-700 text-right text-xs text-white p-1 rounded"
                    value={tempData.xp}
                    onChange={(e) => handleInputChange('xp', e.target.value)}
                  />
                ) : (
                  <span className="text-sm font-bold text-blue-400">{donor.xp} XP</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {editingId === donor._id ? (
                <button onClick={() => handleUpdate(donor._id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-bold tracking-widest flex items-center justify-center gap-2">
                  <Save size={14} /> SAVE DATA
                </button>
              ) : (
                <button onClick={() => startEditing(donor)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg text-xs font-bold tracking-widest flex items-center justify-center gap-2">
                  <Edit2 size={14} /> EDIT FILE
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DonorRecruiter;