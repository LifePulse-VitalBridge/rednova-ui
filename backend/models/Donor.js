import mongoose from 'mongoose';

const DonorSchema = new mongoose.Schema({
  // --- IDENTITY ---
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  
  // --- BIOMETRICS ---
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  weight: { type: Number },
  
  
  medicalConditions: [{ type: String }], 
  
  lastDonationDate: { type: Date },
  
  // --- TACTICAL DATA ---
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  address: { type: String },
  searchRadius: { type: Number, default: 10 },
  availability: { type: Boolean, default: true },
  isAppliedForMission: { type: Boolean, default: false },
  certificateApproved: { type: Boolean, default: false },
  certificateCID: { type: String, default: null },
  // --- GAMIFICATION ---
  // Initial rank is always RECRUIT for new joiners
  rank: { type: String, default: 'RECRUIT', enum: ['RECRUIT', 'OFFICER', 'COMMANDER', 'LEGEND', 'VETERAN'] },
  donationCount: { type: Number, default: 0 }, // To track progression
  xp: { type: Number, default: 100 },
  badges: [{ 
    id: String, 
    dateEarned: { type: Date, default: Date.now } 
  }],
  
  joinedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Donor', DonorSchema);