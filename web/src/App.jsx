import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NetworkStatus from './components/NetworkStatus';

export default function App() {
  return (
    
    <BrowserRouter>
     <NetworkStatus />
      <Routes>
        <Route path="/" element={<LandingPage />} />
         <Route path="/auth" element={<AuthPage/>} />
        <Route path="/home" element={ <ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={ <ProtectedRoute><ProfilePage /></ProtectedRoute>} /> */}

        
      </Routes>  
    </BrowserRouter>

  );
}
