import express from 'express';
import { createRequest, getRequestStatus,  } from '../controllers/bloodRequestController.js';

const router = express.Router();

router.post('/create', createRequest);

router.get('/:id', getRequestStatus);



export default router;