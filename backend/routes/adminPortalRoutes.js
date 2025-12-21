import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import { 
  getBanks, addBank, updateBank, 
  getPendingRequests, verifyRequest, 
  getApplicants, updateDonorStats 
} from '../controllers/adminPortalController.js';

const router = express.Router();

// Apply Security Check to ALL routes below
router.use(protectAdmin);

// Sector A
router.get('/banks', getBanks);
router.post('/banks', addBank);
router.put('/banks/:id', updateBank);

// Sector B
router.get('/requests', getPendingRequests);
router.put('/requests/:id/verify', verifyRequest);

// Sector C
router.get('/donors', getApplicants);
router.put('/donors/:id', updateDonorStats);

export default router;