import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // The Link to Firebase
  firebaseUid: { 
    type: String, 
    required: true, 
    unique: true, 
    default: null,
  },
  // We store name for the "Welcome" message
  name: { 
    type: String,
    required: true,
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    default: null,
  },
  // Will be filled in the next chat (Phone Verification)
  phoneNumber: { 
    type: String, 
    default: null, 
  },
  bloodGroup: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  dob: {
    type: Date,
    default: null,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isWelcomeEmailSent: { 
    type: Boolean, 
    default: false
  },
  profilePicture: {
    type: String,
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);