import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin, Edit3, Save, X, Phone, Star, Navigation } from 'lucide-react';

const BloodBankManager = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [tempData, setTempData] = useState({});

  // Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newBankData, setNewBankData] = useState({
    name: '', location: '', phone: '', rating: 4.5, lat: '', lng: ''
  });

  const token = localStorage.getItem('adminToken');

  // --- 1. FETCH BANKS ---
  const fetchBanks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin-portal/banks`, {
        headers: { 'Authorization': token }
      });
      if (!res.ok) throw new Error("Connection Refused");
      const data = await res.json();
      setBanks(data);
      setLoading(false);
    } catch (err) { 
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanks(); }, []);

  // --- 2. EDIT LOGIC ---
  const startEditing = (bank) => {
    setEditingId(bank._id);
    setTempData(bank.stock || {});
  };

  const handleStockChange = (type, value) => {
    setTempData(prev => ({ ...prev, [type]: parseInt(value) || 0 }));
  };

  const handleSave = async (id) => {
    try {
        await fetch(`http://localhost:5000/api/admin-portal/banks/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({ stock: tempData })
        });
        setEditingId(null);
        fetchBanks();
    } catch (err) { console.error("Save Failed:", err); }
  };

  // --- 3. ADD NODE LOGIC ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newBankData.name,
        location: newBankData.location,
        phone: newBankData.phone,
        rating: parseFloat(newBankData.rating),
        verified: true,
        stock: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 },
        coordinates: {
            type: "Point",
            coordinates: [parseFloat(newBankData.lng) || 0, parseFloat(newBankData.lat) || 0] 
        }
      };

      const res = await fetch('http://localhost:5000/api/admin-portal/banks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAdding(false);
        setNewBankData({ name: '', location: '', phone: '', rating: 4.5, lat: '', lng: '' });
        fetchBanks();
      } else {
        const errData = await res.json();
        alert("Deployment Failed: " + errData.message);
      }
    } catch (err) { alert("Network Error"); }
  };

  const filteredBanks = banks.filter(b => 
    (b.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (b.location || "").toLowerCase().includes(search.toLowerCase())
  );
  
  // --- 4. FLOWING WATER ENGINE ---
  // Duplicate list for seamless infinite loop
  const seamlessBanks = filteredBanks.length > 0 ? [...filteredBanks, ...filteredBanks] : [];
  // Dynamic Speed: More cards = Longer duration to maintain constant speed
  const animationDuration = `${Math.max(filteredBanks.length * 5, 20)}s`; 

  if (loading) return <div className="text-center py-20 text-red-500 animate-pulse font-mono">ESTABLISHING UPLINK...</div>;
  if (error) return <div className="text-center py-20 text-red-600 font-mono">SIGNAL LOST: {error}</div>;

  return (
    <div className="relative">
      
      {/* CSS INJECTION FOR CONTINUOUS FLOW */}
      <style>{`
        @keyframes flowLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .flowing-river {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: flowLeft ${animationDuration} linear infinite;
        }
        /* PAUSE MECHANISM */
        .flowing-wrapper:hover .flowing-river,
        .flowing-river.paused {
          animation-play-state: paused;
        }
      `}</style>

      {/* --- CONTROLS HEADER --- */}
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-96">
          <Search className="absolute left-3 top-3 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH NAME OR LOCATION..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all text-white"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button 
            onClick={() => setIsAdding(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all"
        >
            <Plus size={16} /> DEPLOY NEW NODE
        </button>
      </div>

      {/* --- FLOWING CAROUSEL --- */}
      <div className="relative overflow-hidden w-full pb-10 flowing-wrapper">
        {filteredBanks.length === 0 ? (
           <div className="text-center py-20 opacity-50 font-mono border border-dashed border-zinc-800 rounded-xl">NO ACTIVE NODES FOUND.</div>
        ) : (
            <div className={`flowing-river ${editingId ? 'paused' : ''}`}>
            {seamlessBanks.map((bank, index) => (
                <div 
                  // Use combined key because IDs are duplicated in the seamless list
                  key={`${bank._id}-${index}`} 
                  className={`w-[380px] bg-zinc-900/50 border p-6 rounded-2xl backdrop-blur-sm relative group transition-all flex-shrink-0
                    ${editingId === bank._id ? 'border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)] bg-black z-10' : 'border-zinc-800 hover:border-red-500/50'}
                  `}
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 truncate w-52" title={bank.name}>{bank.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <MapPin size={12} className="text-red-500" /> {bank.location}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Phone size={12} className="text-blue-500" /> {bank.phone}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                            <Star size={10} fill="currentColor" /> {bank.rating || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right bg-black/40 p-2 rounded-lg border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 font-mono tracking-widest">TOTAL STOCK</div>
                      <div className="text-2xl font-black text-green-500">
                        {Object.values(bank.stock || {}).reduce((a,b)=>a+b,0)}
                        <span className="text-sm text-zinc-600 ml-1">U</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                        <div key={type} className="bg-black border border-zinc-800 p-2 rounded text-center">
                            <div className="text-[10px] text-zinc-500 font-bold">{type}</div>
                            {editingId === bank._id ? (
                                <input 
                                  className="w-full bg-transparent text-center border-b border-zinc-700 focus:border-red-500 outline-none text-white text-sm font-bold mt-1" 
                                  value={tempData[type] !== undefined ? tempData[type] : (bank.stock?.[type] || 0)}
                                  onChange={(e) => handleStockChange(type, e.target.value)}
                                />
                            ) : (
                                <div className={`text-sm font-bold mt-1 ${(bank.stock?.[type] || 0) < 5 ? 'text-red-500' : 'text-white'}`}>
                                    {bank.stock?.[type] || 0}
                                </div>
                            )}
                        </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-4 border-t border-zinc-800">
                    {editingId === bank._id ? (
                        <div className="flex gap-2 w-full">
                            <button onClick={() => setEditingId(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-zinc-400 font-bold text-xs">CANCEL</button>
                            <button onClick={() => handleSave(bank._id)} className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2"><Save size={14}/> SAVE</button>
                        </div>
                    ) : (
                        <button onClick={() => startEditing(bank)} className="w-full py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2">
                            <Edit3 size={14} /> MODIFY INVENTORY
                        </button>
                    )}
                  </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* --- ADD NODE MODAL --- */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl p-8 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)]"
            >
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
                  <Plus className="text-red-500" /> DEPLOY NEW NODE
                </h2>
                <button onClick={() => setIsAdding(false)}><X className="text-zinc-500 hover:text-white" /></button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs text-zinc-500 font-mono">NODE NAME (HOSPITAL)</label>
                        <input 
                            required 
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-red-500 outline-none mt-1"
                            value={newBankData.name}
                            onChange={(e) => setNewBankData({...newBankData, name: e.target.value})}
                            placeholder="e.g. Civil Hospital Blood Bank"
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs text-zinc-500 font-mono">LOCATION (CITY)</label>
                        <input 
                            required 
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-red-500 outline-none mt-1"
                            value={newBankData.location}
                            onChange={(e) => setNewBankData({...newBankData, location: e.target.value})}
                            placeholder="e.g. Phagwara"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 font-mono">CONTACT FREQUENCY</label>
                        <input 
                            required 
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-red-500 outline-none mt-1"
                            value={newBankData.phone}
                            onChange={(e) => setNewBankData({...newBankData, phone: e.target.value})}
                            placeholder="e.g. 01824-260201"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 font-mono flex items-center gap-1"><Navigation size={12}/> LATITUDE</label>
                        <input 
                            type="number" step="any"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-red-500 outline-none mt-1 font-mono"
                            value={newBankData.lat}
                            onChange={(e) => setNewBankData({...newBankData, lat: e.target.value})}
                            placeholder="31.2217"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 font-mono flex items-center gap-1"><Navigation size={12}/> LONGITUDE</label>
                        <input 
                            type="number" step="any"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-red-500 outline-none mt-1 font-mono"
                            value={newBankData.lng}
                            onChange={(e) => setNewBankData({...newBankData, lng: e.target.value})}
                            placeholder="75.7709"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="text-xs text-zinc-500 font-mono">INITIAL RATING: <span className="text-yellow-500">{newBankData.rating}</span></label>
                        <input 
                            type="range" min="0" max="5" step="0.1"
                            className="w-full mt-2 accent-red-600"
                            value={newBankData.rating}
                            onChange={(e) => setNewBankData({...newBankData, rating: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-zinc-900 text-zinc-400 font-bold rounded hover:bg-zinc-800">ABORT</button>
                  <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 shadow-[0_0_15px_red]">INITIALIZE NODE</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BloodBankManager;