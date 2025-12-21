import mongoose from 'mongoose';

const BloodRequestSchema = new mongoose.Schema({
  requesterEmail: { type: String, required: true },
  patientName: { type: String, required: true },
  age: { type: Number },
  bloodGroup: { type: String, required: true },
  units: { type: Number, default: 1 },
  urgency: { type: String, enum: ['CRITICAL', 'URGENT', 'STANDARD'], default: 'STANDARD' },
  
  // Location Data
  hospitalName: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  },

  contactNumber: { type: String, required: true },
  
  // STATUS FLAGS
  status: { type: String, enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  isVerified: { type: Boolean, default: false }, // <--- ADMIN SWITCH
  
  createdAt: { type: Date, default: Date.now }
});

// Create index for geo-queries if needed later
BloodRequestSchema.index({ location: '2dsphere' });

export const BloodRequest = mongoose.model('BloodRequest', BloodRequestSchema);