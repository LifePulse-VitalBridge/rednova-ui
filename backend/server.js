import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import bloodRequestRoutes from './routes/bloodRequestRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adminPortalRoutes from './routes/adminPortalRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",                 // For local testing
  "https://rednova-ui.vercel.app",         // Keep as backup
  "https://rednovavital.tech",             // ✅ NEW: Main Domain
  "https://www.rednovavital.tech"          // ✅ NEW: WWW Version
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/blood-request', bloodRequestRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-portal', adminPortalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));