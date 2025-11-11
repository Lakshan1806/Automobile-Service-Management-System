import express from 'express';
import { getRoadAssists, getRoadAssistsByTechnician, syncRoadAssists, assignTechnician } from '../controllers/roadAssistController.js';
import RoadAssist from '../models/RoadAssist.js';

const router = express.Router();

// @desc    Get all road assist appointments
// @route   GET /api/roadassists
// @access  Public
router.get('/', getRoadAssists);

// @desc    Get road assists assigned to a specific technician
// @route   GET /api/roadassists/assigned/:technicianId
// @access  Public
router.get('/assigned/:technicianId', getRoadAssistsByTechnician);

// @desc    Sync road assist data from external API
// @route   GET /api/roadassists/sync
// @access  Public
router.get('/sync', syncRoadAssists);

// @desc    Debug endpoint to test road assist lookup
// @route   GET /api/roadassists/debug/:id
// @access  Public
router.get('/debug/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Debug - Looking up road assist with ID:', id);
    const roadAssist = await RoadAssist.findById(id.trim());
    
    if (!roadAssist) {
      return res.status(404).json({
        success: false,
        message: 'Road assist not found',
        idUsed: id,
        idType: typeof id,
        idLength: id.length
      });
    }
    
    res.status(200).json({
      success: true,
      data: roadAssist
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

// @desc    Assign a technician to a road assist appointment
// @route   PUT /api/roadassists/by-custom-id/:customId/assign-technician
// @access  Public
router.put('/by-custom-id/:customId/assign-technician', assignTechnician);

export default router;
