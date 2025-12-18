import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged,signOut } from "firebase/auth";
import { fetchUserProfile, saveUserProfile, uploadUserAvatar } from "../services/authService";
import ProfileBackground from "../components/ProfileBackground"; // Your new background component
import {
  Camera, Lock, User, Mail, Droplet, MapPin, Phone, Calendar,
  Loader2, Save, X, ChevronDown, LogOut
} from "lucide-react";


const ProfilePage = () => {
  // State Management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [abuseError, setAbuseError] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bloodGroup: "",
    phone: "",
    location: "",
    dob: "",
    profilePicture: "",
  });

  // BackUp For Cancel Action
  const [originalData, setOriginalData] = useState(null);

  // Listener Logic for Firebase Auth State Mounts on load
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        try {
          const dbUser = await fetchUserProfile(currentUser.email);
          // Date Format Handling to YYYY-MM-DD
          let formattedDob = "";
          if (dbUser.dob) {
            formattedDob = new Date(dbUser.dob).toISOString().split('T')[0];
          }
          const cleanData = {
            name: dbUser.name || "",
            email: dbUser.email || "",
            phone: dbUser.phoneNumber || "",
            bloodGroup: dbUser.bloodGroup || "",
            location: dbUser.location || "",
            dob: formattedDob,
            profilePicture: dbUser.profilePicture || "",
          };
          // Set both form and original data
          setFormData(cleanData);
          setOriginalData(cleanData);
        } catch (error) {
          setError("Failed to load profile data: " + error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("Please log in to view profile.");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await saveUserProfile(formData);
      setOriginalData(formData); // Update original data on successful save
      setShowSuccess(true);
    } catch (error) {
      setError(error.toString());
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setAbuseError("");
    try {
      const response = await uploadUserAvatar(file, formData.email);
      window.location.reload();
    } catch (error) {
      setAbuseError(error.toString());
    } finally {
      setUploading(false);
    }
  };

  const calculateProgress = () => {
    const fields = [ formData.name, formData.bloodGroup, formData.phone, formData.location, formData.dob, formData.profilePicture, formData.email];
    const isFilled = (val) => {
      // 1. Check for null/undefined
      if (!val) return false;
      
      // 2. Convert to string and trim whitespace
      const str = String(val).trim();
      
      // 3. Check for empty string or "bad" placeholders
      if (str === "" || str === "null" || str === "undefined") return false;
      
      return true;
    };

    // Count valid fields
    const filledCount = fields.filter(isFilled).length;
    return Math.round( (filledCount / fields.length) * 100 );
  };
   const progress = calculateProgress();
  useEffect( () => {
    if (progress === 100) {
      const timer = setTimeout( () => setShowProgress(false), 1500 );
      return () => clearTimeout(timer);
    } else {
      setShowProgress(true);
    }
  }, [progress] );

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      window.location.href = "/"; // Redirect to homepage or login page after logout
    } catch (error) {
      console.error("Logout Failed:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    )
  }

  return (
    // FIX: Added 'bg-gray-900' so white text is always visible
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden text-white font-sans bg-gray-900">

      {/* FIX: Absolute positioning for background to ensure it stays behind */}
      <div className="absolute inset-0 z-0">
        <ProfileBackground />
      </div>

      {/* Red FlashCard for Image Upload */}
      {/* --- ABUSE DETECTION FLASHCARD (RED) --- */}
      {abuseError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAbuseError("")}></div>
          <div className="relative bg-red-950/90 border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-6 border border-red-500/20">
              <X size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Upload Rejected</h3>
            <p className="text-red-200 text-xl mb-6">{abuseError}</p>
            <button onClick={() => setAbuseError("")} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold">
              Close
            </button>
          </div>
        </div>
      )}

      {/* The Glass Dashboard Card */}
      <div className="relative z-10 w-full max-w-4xl p-4 mx-4 animate-fade-in-up">

        <div className=" bg-black/60 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          {/* ✅ ADD THIS: PROGRESS BAR (Only shows if < 100%) */}
          { showProgress && (
            <div className="bg-gray-900/80 border-b border-white/5 px-8 py-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Profile Completion</span>
                <span className="text-purple-400 font-bold">{progress}%</span>
              </div>
              {/* Bar Container */}
              <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                {/* Dynamic Fill */}
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Complete your profile to verify your account.
              </p>
            </div>
          )}

          {/* Header / Cover Area */}
          <div className="h-32 bg-gradient-to-r from-purple-900/50 to-blue-900/50 relative">
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <h1 className="text-5xl  font-extrabold tracking-tight bg-gradient-to-r  from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text  drop-shadow-[0_0_25px_rgba(139,92,246,0.35)] p-6 drop-shadow-[0_3px_0px_rgba(255,255,255,0.25)]  drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]    drop-shadow-[0_12px_24px_rgba(88,28,135,0.35)]">
                REDNOVA</h1>
            </div>
            <button 
               onClick={handleLogout}
               className="absolute top-4 right-4 z-20 p-2.5 bg-red-500/10 hover:bg-red-500 text-red-200 hover:text-white rounded-full backdrop-blur-md transition-all border border-red-500/20 hover:border-red-500 shadow-lg group"
               title="Secure Logout"
             >
               <LogOut size={20} className="group-hover:scale-110 transition-transform" />
             </button>
          </div>

          <div className="px-8 pb-8">

            {/* Avatar Section */}
            <div className="relative -mt-16 mb-6 flex flex-col items-center sm:items-start">
              <div className="relative group">

                {/* Profile Image Container */}
                <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-800 overflow-hidden shadow-lg relative flex items-center justify-center">

                  {/* 🟢 CHANGED: Logic to show actual Image if it exists */}
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : formData.name ? (
                    <span className="text-4xl font-bold">{formData.name.charAt(0)}</span>
                  ) : (
                    <User size={64} className="text-gray-400" />
                  )}

                  {/* 🟢 CHANGED: Overlay to show "Uploading..." spinner inside the image circle too (Optional UX improvement) */}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                  )}
                </div>

                {/* 🟢 CHANGED: Replaced <button> with <label> + <input> for File Upload */}
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 p-2 rounded-full text-white transition-all shadow-lg border-2 border-black group-hover:scale-110 
                   ${uploading ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-500 cursor-pointer"}`}
                >
                  {/* Show Spinner if uploading, else Camera */}
                  {uploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Camera size={18} />
                  )}

                  {/* 🟢 ADDED: Hidden Input to trigger file selection */}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>

              </div>
            </div>

            <div className="mt-4 text-center sm:text-left h-16">
              {/* Visual placeholder prevents layout shift when empty */}
              <h2 className="text-3xl font-bold">{formData.name || "Loading Name..."}</h2>
              <p className="text-gray-400 text-sm">Blood Donor • Gold Member</p>
            </div>
          

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Full Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
              />
            </div>

            {/* Email (Locked) */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <Mail size={14} /> Email Address
              </label>
              <div className="relative ">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  placeholder="email@example.com"
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                />
                <Lock size={16} className="absolute right-4 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <Droplet size={14} className="text-red-500" /> Blood Group
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors [&>option]:bg-gray-900"
              >
                <option value="" disabled>Select Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <Phone size={14} /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <MapPin size={14} /> Location / City
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <Calendar size={14} /> Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex items-center justify-end gap-4 border-t border-white/10 pt-6">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <X size={18} />
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
      {/* --- SUCCESS FLASHCARD OVERLAY --- */ }
  {
    showSuccess && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

        {/* 1. Backdrop (Blur & Darken) */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setShowSuccess(false)} // Click outside to close
        ></div>

        {/* 2. The Card (Glassmorphism) */}
        <div className="relative bg-gray-900/90 border border-green-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-green-500/20 transform transition-all scale-100 animate-fade-in-up text-center">

          {/* Decorative Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 mb-6 border border-green-500/20">
            <div className="h-10 w-10 text-green-400">
              {/* If you haven't imported CheckCircle, use Check or import it from lucide-react */}
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>

          {/* Text */}
          <h3 className="text-2xl font-bold text-white mb-2">Saved!</h3>
          <p className="text-gray-400 mb-8">
            Your profile information has been successfully updated in our secure database.
          </p>

          {/* Button */}
          <button
            onClick={() => setShowSuccess(false)}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-900/20 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Continue
          </button>

        </div>
      </div>)
  }
    </div >
  );
};

export default ProfilePage;