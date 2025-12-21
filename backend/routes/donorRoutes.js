import express from 'express';
import { joinDonor, checkDonorStatus } from '../controllers/donorController.js';

const router = express.Router();

// POST /api/donor/join -> Create new donor
router.post('/join', joinDonor);

// GET /api/donor/status/:email -> Check if user is already a donor
router.get('/status/:email', checkDonorStatus);

export default router;