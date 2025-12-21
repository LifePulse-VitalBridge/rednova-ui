import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NetworkStatus from './components/NetworkStatus';
import NexusPage from "./pages/NexusPage";
import FindBloodPage from "./pages/FindBloodPage";
import JoinDonorPage from "./pages/JoinDonor";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";
import AdminLoginPage from "./pages/adminLoginPage";
import AdminPortalPage from "./pages/AdminPortalPage";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

export default function App() {
  return (
    
    <BrowserRouter>
     <NetworkStatus />
      <Routes>
        <Route path="/" element={<LandingPage />} />
         <Route path="/auth" element={<AuthPage/>} />
        <Route path="/home" element={ <ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={ <ProtectedRoute><ProfilePage /></ProtectedRoute>} /> 
        <Route path="/nexus" element={<ProtectedRoute><NexusPage /></ProtectedRoute>} />
        <Route path="/findBlood" element={<ProtectedRoute><FindBloodPage/></ProtectedRoute>} />
        <Route path="/joinDonor" element={<ProtectedRoute><JoinDonorPage/></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><AboutUsPage /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><ContactUsPage /></ProtectedRoute>} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin-portal" element={<AdminProtectedRoute><AdminPortalPage /></AdminProtectedRoute>} />
      </Routes>  
    </BrowserRouter>
    

  );
}
