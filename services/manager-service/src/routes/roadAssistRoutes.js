import express from 'express';
import { getRoadAssists, syncRoadAssists } from '../controllers/roadAssistController.js';

const router = express.Router();

// @desc    Get all road assist appointments
// @route   GET /api/roadassists
// @access  Public
router.get('/', getRoadAssists);

// @desc    Sync road assist data from external API
// @route   GET /api/roadassists/sync
// @access  Public
router.get('/sync', syncRoadAssists);

export default router;
