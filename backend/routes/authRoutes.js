import express from 'express';
import multer from 'multer';
import { syncUser, updatePhone, getUserProfile, updateUserProfile, uploadAvatar, getNearbyBanks } from '../controllers/authController.js';

const router = express.Router();

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// This single route handles both Login and Signup sync
router.post('/sync', syncUser);
router.post('/update-phone', updatePhone);
router.get('/:email', getUserProfile);
router.put('/update', updateUserProfile);
router.post('/upload-avatar', upload.single('avatar'), uploadAvatar);
router.get('/bloodbanks/nearby', getNearbyBanks);
export default router;