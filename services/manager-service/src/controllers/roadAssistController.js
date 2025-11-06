import RoadAssist from '../models/RoadAssist.js';
import { syncRoadAssistData } from '../services/roadAssistService.js';

/**
 * Get all road assist appointments
 * @route GET /api/roadassists
 * @returns {Object} List of road assist appointments
 */
export const getRoadAssists = async (req, res) => {
  try {
    const roadAssists = await RoadAssist.find({}).sort({ requestDate: -1 });
    
    res.status(200).json({
      success: true,
      count: roadAssists.length,
      data: roadAssists
    });
  } catch (error) {
    console.error('Error fetching road assists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch road assists',
      error: error.message
    });
  }
};

/**
 * Manually sync road assist data from external API
 * @route GET /api/roadassists/sync
 * @returns {Object} Result of the sync operation
 */
export const syncRoadAssists = async (req, res) => {
  try {
    const result = await syncRoadAssistData();
    
    if (result.success) {
      // Get the synced data to include in the response
      const roadAssists = await RoadAssist.find({}).sort({ requestDate: -1 });
      
      return res.status(200).json({
        success: true,
        message: result.message,
        count: result.count,
        data: roadAssists
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error syncing road assists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync road assists',
      error: error.message
    });
  }
};

export default {
  getRoadAssists,
  syncRoadAssists
};
