// routes/appointmentRoutes.js
import express from 'express';
import { 
  getNewAppointments, 
  syncAppointments, 
  getAppointments, 
  assignTechnician,
  getActiveAppointments,
  getFinishedAppointments,
  getAppointmentsForTechnician,
} from '../controllers/appointmentController.js';

const router = express.Router();

// Sync appointments from external service
router.get('/sync', async (req, res) => {
  try {
    const result = await syncAppointments();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all appointments from local database
router.get('/', getAppointments);

// Get appointments assigned to a specific technician
router.get('/assigned/:technicianId', getAppointmentsForTechnician);

// Get active appointments (pending, inprocess, scheduled)
router.get('/active', getActiveAppointments);

// Get finished appointments
router.get('/finished', getFinishedAppointments);

// Get new appointments from external service
router.get('/new', getNewAppointments);

// Assign technician to an appointment
router.post('/assign', assignTechnician);

export default router;
