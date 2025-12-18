import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider 
} from "firebase/auth";

const firebaseConfig ={
  apiKey: "AIzaSyBkrcY4suxcfXukeSsNqIA5TLzL3VYTX60",
  authDomain: "rednova-79c02.firebaseapp.com",
  projectId: "rednova-79c02",
  storageBucket: "rednova-79c02.firebasestorage.app",
  messagingSenderId: "945138460792",
  appId: "1:945138460792:web:a83c6a9baa194143c0a58d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Pre-configured Providers
export const googleProvider = new GoogleAuthProvider();
export const yahooProvider = new OAuthProvider('yahoo.com');
export const microsoftProvider = new OAuthProvider('microsoft.com');