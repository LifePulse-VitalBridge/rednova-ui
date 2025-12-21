import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

// // --- 1. CONNECT TO DB ---
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected for Seeding'))
//   .catch(err => console.log('❌ Connection Error:', err));

// --- 2. DEFINE MODEL DIRECTLY (No 'require' needed) ---
const bloodBankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String },
  rating: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  
  // GeoJSON for "Find Nearby" queries
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  },

  // Real-time Stock Data
  stock: {
    "A+": { type: Number, default: 0 },
    "A-": { type: Number, default: 0 },
    "B+": { type: Number, default: 0 },
    "B-": { type: Number, default: 0 },
    "O+": { type: Number, default: 0 },
    "O-": { type: Number, default: 0 },
    "AB+": { type: Number, default: 0 },
    "AB-": { type: Number, default: 0 }
  }
}, { timestamps: true });

// Create the GeoSpatial Index (Essential for "Nearest To Me" sorting)
bloodBankSchema.index({ coordinates: '2dsphere' });

export const BloodBank = mongoose.model('MapBank', bloodBankSchema);


// --- 3. HELPER: Random Stock Generator ---
const getStock = () => ({
  "A+": Math.floor(Math.random() * 50),
  "A-": Math.floor(Math.random() * 10),
  "B+": Math.floor(Math.random() * 60),
  "B-": Math.floor(Math.random() * 8),
  "O+": Math.floor(Math.random() * 40),
  "O-": Math.floor(Math.random() * 5),
  "AB+": Math.floor(Math.random() * 20),
  "AB-": Math.floor(Math.random() * 3)
});

// --- 4. THE DATASET (64 ENTRIES) ---
// Note: coordinates are [Longitude, Latitude] for MongoDB
const banks = [
  // === PHAGWARA ===
  { name: "Civil Hospital Blood Bank", location: "Phagwara", coordinates: { type: "Point", coordinates: [75.7709, 31.2217] }, phone: "01824-260201", verified: true, rating: 4.5, stock: getStock() },
  { name: "Johal Multispeciality Hospital", location: "Phagwara", coordinates: { type: "Point", coordinates: [75.8050, 31.2350] }, phone: "01824-222222", verified: true, rating: 4.2, stock: getStock() },
  { name: "Gandhi Hospital", location: "Phagwara", coordinates: { type: "Point", coordinates: [75.7720, 31.2160] }, phone: "01824-261100", verified: false, rating: 3.8, stock: getStock() },
  { name: "Virk Trauma Centre", location: "Phagwara", coordinates: { type: "Point", coordinates: [75.7850, 31.2280] }, phone: "01824-262200", verified: true, rating: 4.0, stock: getStock() },
  { name: "Patel Hospital Phagwara", location: "Phagwara", coordinates: { type: "Point", coordinates: [75.7800, 31.2250] }, phone: "01824-263300", verified: true, rating: 4.1, stock: getStock() },
  { name: "Pawar Hospital", location: "Phagwara", coordinates: { type: "Point", coordinates: [75.7750, 31.2180] }, phone: "01824-264400", verified: false, rating: 3.5, stock: getStock() },
  { name: "Guru Nanak Mission Hospital", location: "Phagwara", coordinates: { type: "Point", coordinates: [75.7600, 31.2100] }, phone: "01824-265500", verified: true, rating: 4.3, stock: getStock() },
  { name: "LPU University Infirmary", location: "Phagwara", coordinates: { type: "Point", coordinates: [75.7035391, 31.2533614] }, phone: "01824-444444", verified: true, rating: 4.8, stock: getStock() },  // updated:contentReference[oaicite:7]{index=7}

  // === LUDHIANA ===
  { name: "Hero DMC Heart Institute", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8231, 30.9155] }, phone: "0161-2304242", verified: true, rating: 4.9, stock: getStock() },  // updated:contentReference[oaicite:8]{index=8}
  { name: "CMC Hospital Blood Center", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8624, 30.9087] }, phone: "0161-2115000", verified: true, rating: 4.8, stock: getStock() },  // updated:contentReference[oaicite:9]{index=9}
  { name: "Fortis Hospital", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.9000, 30.9200] }, phone: "0161-5222333", verified: true, rating: 4.7, stock: getStock() },
  { name: "SPS Hospitals", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.887222, 30.883333] }, phone: "0161-6617111", verified: true, rating: 4.6, stock: getStock() },  // updated:contentReference[oaicite:10]{index=10}
  { name: "Mohan Dai Oswal Hospital", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8800, 30.8800] }, phone: "0161-2676100", verified: true, rating: 4.5, stock: getStock() },  // (approx; sources vary)
  { name: "Deep Hospital", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.835519, 30.886348] }, phone: "0161-4687000", verified: true, rating: 4.4, stock: getStock() },  // updated:contentReference[oaicite:11]{index=11}
  { name: "Civil Hospital Ludhiana", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8597, 30.9066] }, phone: "0161-2444333", verified: true, rating: 4.0, stock: getStock() },  // updated:contentReference[oaicite:12]{index=12}
  { name: "Raghunath Hospital", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8000, 30.8900] }, phone: "0161-2458000", verified: false, rating: 3.9, stock: getStock() },
  { name: "Preet Blood Bank", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8700, 30.9300] }, phone: "0161-2600000", verified: true, rating: 4.2, stock: getStock() },
  { name: "Life Line Blood Centre", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8400, 30.8600] }, phone: "0161-5000000", verified: true, rating: 4.1, stock: getStock() },
  { name: "Mediways Hospital", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.7900, 30.8920] }, phone: "0161-4688888", verified: true, rating: 4.3, stock: getStock() },
  { name: "Global Heart & Super Specialty", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.7950, 30.8910] }, phone: "0161-5205555", verified: true, rating: 4.5, stock: getStock() },
  { name: "Kulwant Heart Centre", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8150, 30.9050] }, phone: "0161-2470000", verified: false, rating: 3.8, stock: getStock() },
  { name: "Ludhiana Mediciti", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.7850, 30.8890] }, phone: "0161-4440000", verified: true, rating: 4.4, stock: getStock() },
  { name: "Guru Teg Bahadur Hospital", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8400, 30.8950] }, phone: "0161-2555555", verified: true, rating: 4.2, stock: getStock() },
  { name: "Orthonova Hospital", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.7900, 30.8880] }, phone: "0161-2333333", verified: false, rating: 3.7, stock: getStock() },
  { name: "Sigma Hospital", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8200, 30.8940] }, phone: "0161-2222111", verified: true, rating: 4.0, stock: getStock() },
  { name: "Krishna Charitable Hospital", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8500, 30.8700] }, phone: "0161-2777777", verified: true, rating: 4.1, stock: getStock() },
  { name: "Satguru Partap Singh", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8850, 30.8750] }, phone: "0161-6617222", verified: true, rating: 4.6, stock: getStock() },
  { name: "AIMC Bassi Hospital", location: "Ludhiana", coordinates: { type: "Point", coordinates: [75.8300, 30.9000] }, phone: "0161-2444444", verified: true, rating: 4.2, stock: getStock() },

  // === JALANDHAR ===
  { name: "PIMS Medical Institute", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5920, 31.3060] }, phone: "0181-6606000", verified: true, rating: 4.6, stock: getStock() },
  { name: "Sacred Heart Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5620, 31.3480] }, phone: "0181-2222222", verified: true, rating: 4.5, stock: getStock() },
  { name: "Gulab Devi Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5700, 31.3300] }, phone: "0181-2255555", verified: true, rating: 4.3, stock: getStock() },
  { name: "Civil Hospital Jalandhar", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5820, 31.3210] }, phone: "0181-2233333", verified: true, rating: 4.0, stock: getStock() },
  { name: "Capitol Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5500, 31.3600] }, phone: "0181-2344444", verified: true, rating: 4.4, stock: getStock() },
  { name: "Patel Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5850, 31.3220] }, phone: "0181-2223333", verified: true, rating: 4.7, stock: getStock() },
  { name: "Kidney Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5950, 31.3150] }, phone: "0181-2445555", verified: false, rating: 3.9, stock: getStock() },
  { name: "New Ruby Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5820, 31.3250] }, phone: "0181-2556666", verified: true, rating: 4.1, stock: getStock() },
  { name: "SGL Charitable Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5920, 31.3000] }, phone: "0181-2667777", verified: true, rating: 4.5, stock: getStock() },
  { name: "Jalandhar Blood Centre", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.6000, 31.3100] }, phone: "0181-2778888", verified: true, rating: 4.2, stock: getStock() },
  { name: "Ohri Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.6100, 31.3400] }, phone: "0181-2889999", verified: false, rating: 3.8, stock: getStock() },
  { name: "Care Max Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.6300, 31.3000] }, phone: "0181-2990000", verified: true, rating: 4.3, stock: getStock() },
  { name: "Apex Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5700, 31.3100] }, phone: "0181-2112222", verified: true, rating: 4.1, stock: getStock() },
  { name: "Mann Medicity", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5750, 31.3150] }, phone: "0181-2334444", verified: true, rating: 4.4, stock: getStock() },
  { name: "NHS Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5650, 31.3280] }, phone: "0181-2556666", verified: true, rating: 4.5, stock: getStock() },
  { name: "Tagore Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.5880, 31.3240] }, phone: "0181-2778888", verified: true, rating: 4.3, stock: getStock() },
  { name: "Oxford Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.6400, 31.2900] }, phone: "0181-2999999", verified: true, rating: 4.2, stock: getStock() },
  { name: "Mittal Hospital", location: "Jalandhar", coordinates: { type: "Point", coordinates: [75.6050, 31.3120] }, phone: "0181-2111111", verified: false, rating: 3.6, stock: getStock() },

  // === CHANDIGARH / TRI-CITY ===
  { name: "PGIMER Blood Bank", location: "Chandigarh", coordinates: { type: "Point", coordinates: [76.7750, 30.7660] }, phone: "0172-2755555", verified: true, rating: 5.0, stock: getStock() },
  { name: "GMCH Sector 32", location: "Chandigarh", coordinates: { type: "Point", coordinates: [76.77549, 30.709457] }, phone: "0172-2665555", verified: true, rating: 4.8, stock: getStock() },  // updated:contentReference[oaicite:13]{index=13}
  { name: "GMSH Sector 16", location: "Chandigarh", coordinates: { type: "Point", coordinates: [76.7650, 30.7450] }, phone: "0172-2768888", verified: true, rating: 4.6, stock: getStock() },
  { name: "Rotary Blood Bank", location: "Chandigarh", coordinates: { type: "Point", coordinates: [76.7500, 30.7400] }, phone: "0172-2779999", verified: true, rating: 4.7, stock: getStock() },
  { name: "Command Hospital", location: "Panchkula", coordinates: { type: "Point", coordinates: [76.8800, 30.7200] }, phone: "0172-2554444", verified: true, rating: 4.9, stock: getStock() },
  { name: "Alchemist Hospital", location: "Panchkula", coordinates: { type: "Point", coordinates: [76.8500, 30.6850] }, phone: "0172-4500000", verified: true, rating: 4.5, stock: getStock() },
  { name: "Fortis Hospital Mohali", location: "Mohali", coordinates: { type: "Point", coordinates: [76.7250, 30.6950] }, phone: "0172-4692222", verified: true, rating: 4.8, stock: getStock() },
  { name: "Max Super Speciality", location: "Mohali", coordinates: { type: "Point", coordinates: [76.7100, 30.7200] }, phone: "0172-6652000", verified: true, rating: 4.7, stock: getStock() },
  { name: "Ivy Hospital", location: "Mohali", coordinates: { type: "Point", coordinates: [76.7150, 30.7050] }, phone: "0172-7170000", verified: true, rating: 4.4, stock: getStock() },
  { name: "Civil Hospital Mohali", location: "Mohali", coordinates: { type: "Point", coordinates: [76.7120, 30.7220] }, phone: "0172-2225555", verified: true, rating: 4.1, stock: getStock() },
  { name: "Civil Hospital Panchkula", location: "Panchkula", coordinates: { type: "Point", coordinates: [76.8400, 30.7000] }, phone: "0172-2566666", verified: true, rating: 4.0, stock: getStock() },
  { name: "Mukat Hospital", location: "Chandigarh", coordinates: { type: "Point", coordinates: [76.7650, 30.7250] }, phone: "0172-4344444", verified: true, rating: 4.3, stock: getStock() },
  { name: "Landmark Hospital", location: "Chandigarh", coordinates: { type: "Point", coordinates: [76.7600, 30.7200] }, phone: "0172-4000000", verified: true, rating: 4.2, stock: getStock() },
  { name: "Grecian Hospital", location: "Mohali", coordinates: { type: "Point", coordinates: [76.7100, 30.6900] }, phone: "0172-4696600", verified: true, rating: 4.5, stock: getStock() },
  { name: "Paras Hospital", location: "Panchkula", coordinates: { type: "Point", coordinates: [76.8600, 30.6800] }, phone: "0172-3986666", verified: true, rating: 4.6, stock: getStock() },
  { name: "Eden Hospital", location: "Chandigarh", coordinates: { type: "Point", coordinates: [76.7900, 30.7050] }, phone: "0172-2633333", verified: true, rating: 4.3, stock: getStock() },
  { name: "Cloudnine Hospital", location: "Chandigarh", coordinates: { type: "Point", coordinates: [76.7850, 30.7000] }, phone: "0172-3300000", verified: true, rating: 4.8, stock: getStock() },
  { name: "Healing Hospital", location: "Chandigarh", coordinates: { type: "Point", coordinates: [76.7630, 30.7260] }, phone: "0172-2667890", verified: true, rating: 4.4, stock: getStock() }
];



// --- 5. EXECUTION ---
const seedDB = async () => {
  try {
    // A. Delete existing
    await BloodBank.deleteMany({});
    console.log('🗑️  Old Data Cleared');

    // B. Insert new
    await BloodBank.insertMany(banks);
    console.log(`🚀 Successfully Seeded ${banks.length} Blood Banks with GeoJSON!`);
    
    // C. Exit
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error Seeding Data:', error);
    process.exit(1);
  }
};

//seedDB();