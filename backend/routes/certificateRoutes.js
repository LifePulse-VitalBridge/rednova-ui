import express from 'express';
import { handleCertificate } from '../controllers/certificateController.js';

const router = express.Router();

// Define endpoint to check or create certificate
router.get('/:firebaseUid', handleCertificate);

export default router;