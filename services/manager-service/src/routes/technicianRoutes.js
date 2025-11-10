import express from 'express';
import { 
  getTechnicians, 
  syncTechniciansRoute, 
  getAvailableTechnicians, 
  getAvailableTechniciansForRoadAssist 
} from '../controllers/technicianController.js';

const router = express.Router();

// GET /api/technicians - Get all technicians from local database
router.get('/', getTechnicians);

// GET /api/technicians/available - Get available technicians for an appointment
router.get('/available', getAvailableTechnicians);

// GET /api/technicians/available/roadassist/:customId - Get technicians available for a specific road assist
router.get('/available/roadassist/:customId', getAvailableTechniciansForRoadAssist);

// GET /api/technicians/sync - Manually trigger technician sync
router.get('/sync', syncTechniciansRoute);

export default router;