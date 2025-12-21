// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchSignInMethodsForEmail, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  getAdditionalUserInfo
} from 'firebase/auth';
import { auth, googleProvider, yahooProvider, microsoftProvider } from '../config/firebase'; // Adjust path as needed
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { syncUserToBackend, updateUserPhone } from '../services/authService';
import ParticlesBackground from '../components/ParticlesBackground';

const AuthPage = () => {
  // --- STATE ---
  const [step, setStep] = useState(1); // 1: Email, 2: Password/Name, 3: Success
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only used for new users
  const [resetSent, setResetSent] = useState(false);
  const [userId, setUserId] = useState(null); // To store user ID after step 1

  const [isNewUser, setIsNewUser] = useState(false); // Detected automatically
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerType, setProviderType] = useState('password');
  
  
  // --- HANDLERS ---

  // STEP 1: Check if Email Exists (The "Modern" Way)
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // This checks your Firebase DB for the email
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.length > 0) {
        // Methods found = User Exists -> Go to Login Mode
        setIsNewUser(false);
        if (methods.includes('google.com')) {setProviderType('google'); setStep(4);}
        else if (methods.includes('yahoo.com')) {setProviderType('yahoo'); setStep(4);}
        else if (methods.includes('microsoft.com')) {setProviderType('microsoft'); setStep(4);}
        else {setProviderType('password'); setStep(2);}
       
      } else {
        // No methods = User New -> Go to Signup Mode
        setIsNewUser(true);
        setProviderType('password');
        setStep(2);
      }
      
    } catch (err) {
      console.error(err);
      setError("Invalid email or network error.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Authenticate (Login OR Signup based on Step 1)
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isNewUser) {
        // --- SIGN UP LOGIC ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        // Optional: Update their display name immediately
        await updateProfile(user, { displayName: name });
        // Reload to make sure userName is attached
        await user.reload();
      } else {
        // --- LOG IN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      }

      // Syncs on both login and signup in mongoDB
      try {
        const syncResponse = await syncUserToBackend(user); 
        console.log("✅ Database Synced");
        if (syncResponse.user && syncResponse.user.phoneNumber) {
          setExistingPhone(syncResponse.user.phoneNumber);
        } else {
          setExistingPhone(null);
        }
      } catch (dbError) {
        // We log the error, but we DO NOT stop the user.
        console.error("⚠️ Database Error (Ignored for Login):", dbError);
      }

      setUserId(user.uid); // Store user ID for phone verification
      setStep(3); // Move to phone verification step

    } catch (err) {
      console.error(err);
      // Map Firebase error codes to human messages
      if (err.code === 'auth/wrong-password') setError("Incorrect password.");
      else if (err.code === 'auth/weak-password') setError("Password should be at least 6 characters.");
      else if (err.code === 'auth/email-already-in-use') setError("Account already exists.");
      else setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async () => {
    if(!email) {
      setError("Please enter your email to reset password.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 3000);
    } catch (err) {
      console.error(err);
      if(err.code === 'auth/user-not-found') setError("No account found with this email.");
      else setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // SOCIAL AUTH HANDLER
  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const details = getAdditionalUserInfo(result);
      if (details?.isNewUser) {
          // This only runs if they just created an account
          // Assuming you have a state setter like setIsNewUser
          setIsNewUser(true); 
      }
      // Sync user to backend
      const syncResponse = await syncUserToBackend(result.user);
      if (syncResponse.user && syncResponse.user.phoneNumber) {
        setExistingPhone(syncResponse.user.phoneNumber);
      }
      setUserId(result.user.uid); // Store user ID for phone verification
      setStep(3); // Go straight to success on social login
    } catch (err) {
      console.error(err);
      setError("Social login failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  
  const navigate = useNavigate();
  // --- RENDER: SUCCESS VIEW (Step 3) ---
  useEffect(() => {
   
  // Check if we are on the Success Step
  if (step === 3) {
    // Start the timer
    const timer = setTimeout(() => {
      setStep(1); // Reset internal state
      navigate('/home', { replace: true }); // Navigate away And Even on Click back No Return
    }, 3000); // 2 seconds to match animation

    // Cleanup: Kills the timer if the user closes the component early
    return () => clearTimeout(timer);
  }
}, [step /*navigate*/]);
  // --- RENDER: SUCCESS VIEW (Step 3) ---
  if (step === 3) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4 font-sans relative overflow-hidden">
        {/* Reuse the particle background so the transition feels seamless */}
        <ParticlesBackground />
        
        {/* Internal Style for the Loading Animation */}
        <style>
          {`
            @keyframes loading {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}
        </style>
        
        {/* Success Card */}
        <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)] w-full max-w-md text-center animate-in zoom-in fade-in duration-500">
          
          {/* Glowing Green Icon Container */}
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)] ring-1 ring-green-500/30 animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Access Granted
          </h2>
          
          <p className="text-gray-400 text-lg mb-8">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold">RedNova</span>
          </p>

          {/* Loading Indicator for the redirect */}
          <div className="flex flex-col items-center gap-3">
             <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden max-w-[150px]">
                {/* The animation duration is set to 2s here to match the setTimeout */}
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full animate-[loading_2s_ease-in-out_forwards] origin-left"></div>
             </div>
             <p className="text-xs text-gray-500 uppercase tracking-widest">Redirecting...</p>
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER: FORM VIEW (Step 1 & 2) ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-2 font-sans relative overflow-hidden">
      <ParticlesBackground />
      <div className="relative w-full max-w-md p-18 overflow-hidden transition-all duration-500
        rounded-full
        bg-gradient-to-r from-black/10 via-purple-900/30 to-black/10                         
        hover: translate-y-[-2px] hover:scale-[1.02] transition-all duration-300 ease-in-out hover:brightness-110 hover:shadow-xl 
        shadow-lg shadow-fuchsia-500/70    
        ring-1 ring-pink-700/20">
        <div className="absolute inset-0 z-0 
    opacity-[0.07] pointer-events-none 
    bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'1\'/%3E%3C/svg%3E')]"/>
        {/* Back Arrow (Only Step 2) */}
        { (step === 2 || step === 4) && (
          <button 
            onClick={() => setStep(1)}
            className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Dynamic Headers */}
        {/* --- DYNAMIC HEADER SECTION --- */}
<div className="text-center mb-10 mt-6 relative z-10">
  
  <h1 className="relative inline-block">
    {step === 1 || step === 4 ? (
      /* STATE 1: BRAND MODE (Cinematic & Glowing) */
      <div className="relative">
        <span className="text-4xl md:text-5xl font-black tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] animate-in fade-in zoom-in duration-700">
          RedNova
        </span>
        {/* The "Star" Glint Effect */}
        <div className="absolute -top-2 -right-6 w-8 h-8 bg-white/60 blur-xl rounded-full animate-pulse"></div>
      </div>
    ) : (
      /* STATE 2: FUNCTIONAL MODE (Clean & Clear) */
      <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-300">
        {isNewUser ? "Create your account" : "Welcome back"}
      </span>
    )}
  </h1>

  {/* SUBTEXT SECTION */}
  <div className="mt-4 flex items-center justify-center gap-3">
    
    {/* Decorative Lines (Only appear for the short intro text) */}
    {step === 1 && (
      <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-indigo-200/30"></div>
    )}

    <p className={`font-medium tracking-wide transition-colors duration-300 ${
      step === 1 
        ? "text-blue-200/60 uppercase text-[12px]"  // Small, stylish caps for intro
        : "text-gray-400 text-[15px]"                   // Normal, readable text for email confirmation
    }`}>
      {step === 1 
        ? "Enter your email to get started" 
        : step === 2 
          ? (isNewUser ? `Sign up as ${email}` : `Enter password for ${email}`)
          : "" /* If Step 4 or 5, render nothing here */
        }
    </p>

    {/* Decorative Lines (Only appear for the short intro text) */}
    {step === 1 && (
      <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-indigo-200/30"></div>
    )}
    
  </div>
</div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Social Buttons (Only Step 1) */}
        {step === 1 && (
          <div className="space-y-3 mb-6">
            <button 
              onClick={() => handleSocialLogin(googleProvider)}
              type="button"
              disabled={loading}
              className="w-full cursor-pointer flex items-center justify-center hover:scale-105 hover:brightness-110 hover:translate-y-[-1px] active:translate-y-[1px] gap-3 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white font-medium py-3 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(66,133,244,0.6)] backdrop-blur-sm active:scale-[0.98]"
            >
              {/* Google SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </button>
            <button 
              onClick={() => handleSocialLogin(yahooProvider)}
              type="button"
              disabled={loading}
              className="w-full cursor-pointer flex items-center justify-center hover:scale-105 hover:brightness-110 hover:translate-y-[-1px] active:translate-y-[1px] gap-3 bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-white font-medium py-3 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(147,51,234,0.6)] backdrop-blur-sm active:scale-[0.98]"
            >
              {/* Yahoo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#6001D2"><path d="M2 5.5L8.5 15V23H15.5V15L22 5.5H18.5L12 15L5.5 5.5H2Z" /></svg>
              Continue with Yahoo
            </button>
            <button 
              onClick={() => handleSocialLogin(microsoftProvider)}
              type="button"
              disabled={loading}
              className="w-full cursor-pointer flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-sky-500/50 hover:bg-sky-500/10 text-white font-medium py-3 rounded-full transition-all duration-400 hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.6)] backdrop-blur-sm active:scale-[0.98] hover:scale-105 hover:brightness-110 hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              {/* Microsoft SVG */}
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#F25022" d="M1 1h10v10H1z"/>
                <path fill="#7FBA00" d="M12 1h10v10H12z"/>
                <path fill="#00A4EF" d="M1 12h10v10H1z"/>
                <path fill="#FFB900" d="M12 12h10v10H12z"/>
              </svg>
              Continue with Microsoft
             </button>

             {/* --- OPTION 2: GLASS CAPSULE DIVIDER --- */}
             <div className="relative my-8 group">
                {/* Background Line with subtle glow */}
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/20 transition-all duration-500"></div>
               </div>
  
                {/* Floating Glass Badge */}
               <div className="relative flex justify-center text-xs">
                <span className="px-3 py-1 bg-neutral-900/50 backdrop-blur-md border border-white/10 text-gray-400 rounded-full uppercase tracking-widest shadow-[0_0_10px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 group-hover:border-white/20 group-hover:text-white/70">
                 or
                </span>
               </div>
               </div>
                </div>
                )}

          {resetSent && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-200">
            <CheckCircle className="w-4 h-4" />
            Password reset email sent! Check your inbox.
          </div>
        )}

        {/* --- STEP 4: THE BIG SOCIAL CARD (New & Isolated) --- */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="transform scale-105 transition-transform duration-300">
              
              {/* GOOGLE CARD */}
              {providerType === 'google' && (
                <div className="bg-black/10 p-1">
                   <div className=" border-2  p-8  text-center shadow-lg shadow-pink-500 relative overflow-hidden rounded-full">
                      <div className="relative z-10">
                        <p className="text-indigo-600 font-bold text-[25px] mb-2">Welcome back!</p>
                        <p className="text-blue-600 font-medium text-md mb-6">
                          You use <span className="text-blue-700 font-bold">Google</span> to sign in.
                        </p>
                        
                        <button 
                          onClick={() => handleSocialLogin(googleProvider)}
                          className="w-full flex items-center justify-center hover:scale-105 hover:brightness-110 hover:translate-y-[-1px] active:translate-y-[1px] gap-3 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white font-medium py-3 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(66,133,244,0.6)] backdrop-blur-sm active:scale-[0.98]"
                        >
                          <svg className="w-6 h-6 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                          <span className="text-lg text-orange-500">Continue with Google</span>
                        </button>
                      </div>
                      {/* Decorative Glow */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-400/20 blur-3xl rounded-full pointer-events-none"></div>
                   </div>
                </div>
              )}

              {/* YAHOO CARD */}
              {providerType === 'yahoo' && (
                <div className="bg-black/10 p-1">
                   <div className="border-2  p-8  text-center shadow-lg shadow-pink-500 relative overflow-hidden rounded-full">
                      <div className="relative z-10">
                        <p className="text-indigo-600 font-bold text-[25px] mb-2">Welcome back!</p>
                        <p className="text-purple-600/80 font-medium text-sm mb-6">
                          You use <span className="text-purple-700 font-bold">Yahoo</span> to sign in.
                        </p>
                        
                        <button 
                          onClick={() => handleSocialLogin(yahooProvider)}
                          className="w-full flex items-center justify-center hover:scale-105 hover:brightness-110 hover:translate-y-[-1px] active:translate-y-[1px] gap-3 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white font-medium py-3 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(66,133,244,0.6)] backdrop-blur-sm active:scale-[0.98]"
                        >
                          <svg className="w-6 h-6 group-hover:fill-white transition-colors" viewBox="0 0 24 24" fill="#6001D2"><path d="M2 5.5L8.5 15V23H15.5V15L22 5.5H18.5L12 15L5.5 5.5H2Z" /></svg>
                          <span className="text-lg">Continue with Yahoo</span>
                        </button>
                      </div>
                      <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-400/20 blur-3xl rounded-full pointer-events-none"></div>
                   </div>
                </div>
              )}

              {/* MICROSOFT CARD */}
              {providerType === 'microsoft' && (
                <div className="bg-black/10 p-1">
                   <div className="border-2  p-6  text-center shadow-lg shadow-pink-500 relative overflow-hidden rounded-full">
                      <div className="relative z-10">
                        <p className="text-indigo-600 font-bold text-[25px] mb-2">Welcome back!</p>
                        <p className="text-blue-600 font-medium text-md mb-6">
                          You use <span className="text-blue-700 font-bold">Microsoft</span> to sign in.
                        </p>
                        
                        <button 
                          onClick={() => handleSocialLogin(microsoftProvider)}
                          className="w-full  flex items-center justify-center hover:scale-105 hover:brightness-110 hover:translate-y-[-1px] active:translate-y-[1px] gap-3 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white font-medium py-3 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(66,133,244,0.6)] backdrop-blur-sm active:scale-[0.98]"
                        >
                          <svg className="w-6 p-0.5 h-6" viewBox="0 0 23 23">
                            <path fill="#F25022" d="M1 1h10v10H1z"/>
                            <path fill="#7FBA00" d="M12 1h10v10H12z"/>
                            <path fill="#00A4EF" d="M1 12h10v10H1z"/>
                            <path fill="#FFB900" d="M12 12h10v10H12z"/>
                          </svg>
                          <span className="text-lg">Continue with Microsoft</span>
                        </button>
                      </div>
                      {/* Decorative Glow */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gray-400/10 blur-3xl rounded-full pointer-events-none"></div>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- STEP 5: PHONE VERIFICATION --- */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             
             
             <div>
               
               {/* SCENARIO B: Existing Phone (Auto-Target) */}
               {existingPhone ? (
                 <div className="space-y-4">
                    
                    
                    {/* Here, to make the phone number uneditable, I have used the flowId "step-up" 
                        from Descope which is designed for verification of existing users.
                    */}
                    <Descope
                        key={existingPhone} // To ensure no Ghost sessions and force react to destroy and remount
                        flowId="step-up"
                        form={{ loginId: existingPhone }} // Pre-fills the number
                        onSuccess={handleDescopeSuccess}
                        onError={(e) => setError("Verification failed.")}
                        theme="dark"
                    />
                 </div>
               ) : (
                 /* SCENARIO A: New Phone (Full Input) */
                 <Descope
                    flowId="sign-up-or-in"
                    onSuccess={handleDescopeSuccess}
                    onError={(e) => setError("Verification failed.")}
                    theme="dark"
                 />
               )}

             </div>
             
             <button 
               onClick={() => setStep(1)}
               className="mt-6 text-sm text-gray-500 hover:text-gray-700 w-full text-center"
             >
               Cancel
             </button>
          </div>
        )}

        {/* --- MAIN FORM --- */}
        {(step === 1 || step === 2) && (
        <form onSubmit={step === 1 ? handleCheckEmail : handleAuth} className='relative z-10'>
          <div className="space-y-4">
            
            {/* STEP 1 INPUT: EMAIL */}
{step === 1 && (
  <div>
    <label className="block text-sm font-medium text-violet-300 mb-1 ml-1">Email address</label>
    <div className="group relative">
      {/* Mail Icon with Focus Glow */}
      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300 " />
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500/50 text-purple-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500/20 outline-none
        
 [&:-webkit-autofill]:transition-[background-color] 
  [&:-webkit-autofill]:duration-[50000s]
  [&:-webkit-autofill]:[-webkit-text-fill-color:#E9D5FF]
        transition-all duration-300 hover:backdrop-blur-md hover:scale-100 hover:brightness-110 hover:translate-y-[-1px] focus:scale-105 "
        placeholder="name@example.com"
        required
        
      />
      {/* Bottom Glow Line on Focus */}
      <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
    </div>
  </div>
)}

            {/* STEP 2 INPUTS: PASSWORD (& NAME) */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
                
                {/* Name Field (Only if New User) */}
                {isNewUser && (
                  <div>
                    <label className="block text-sm font-medium text-pink-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500/50 text-purple-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 hover:backdrop-blur-md hover:scale-100 hover:brightness-110 hover:translate-y-[-1px] focus:scale-105"
                      placeholder="Your full name"
                      required
                      autoFocus
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-indigo-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500/50 text-purple-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 hover:backdrop-blur-md hover:scale-100 hover:brightness-110 hover:translate-y-[-1px] focus:scale-105"
                    placeholder="••••••••"
                    required
                    autoFocus={!isNewUser} // Autofocus password if Login mode
                  />
                  {/* Forgot Password Link (Only if Login mode) */}
                  {!isNewUser && (
                    <div className="text-right mt-1">
                      <button type="button" className="text-xs text-indigo-600 hover:underline" onClick={handleForgotPassword}>Forgot password?</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            {/* SUBMIT BUTTON */}
<button
  type="submit"
  disabled={loading}
  className="group relative w-full mt-4 flex items-center justify-center p-0.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.6)]"
>
  {/* 1. Animated Gradient Border */}
  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 blur-sm transition-opacity duration-500 group-hover:opacity-100 animate-gradient-xy"></div>

  {/* 2. Button Inner Container */}
  <div className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3.5 rounded-full transition-all duration-300 backdrop-blur-sm text-white font-semibold shadow-md hover: translate-y-[1px] hover:brightness-110 ">
    
    {loading ? (
      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      <>
        <span className="text-white font-bold tracking-wide">
          {step === 1 ? 'Continue' : (isNewUser ? 'Agree & Create Account' : 'Sign In')}
        </span>
        {step === 1 && (
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
        )}
      </>
    )}
  </div>
</button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;