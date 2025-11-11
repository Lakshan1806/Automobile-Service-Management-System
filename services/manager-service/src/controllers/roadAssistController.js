import mongoose from 'mongoose';
import RoadAssist from '../models/RoadAssist.js';
import Technician from '../models/Technician.js';
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
 * Get road assist appointments assigned to a specific technician
 * @route GET /api/roadassists/assigned/:technicianId
 */
export const getRoadAssistsByTechnician = async (req, res) => {
  try {
    const technicianId = req.params?.technicianId?.trim();

    if (!technicianId) {
      return res.status(400).json({
        success: false,
        message: 'Technician ID is required',
      });
    }

    const roadAssists = await RoadAssist.find({
      assignedTechnician: technicianId,
    }).sort({ requestDate: -1 });

    return res.status(200).json({
      success: true,
      count: roadAssists.length,
      data: roadAssists,
    });
  } catch (error) {
    console.error('Error fetching technician road assists:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch technician road assists',
      error: error.message,
    });
  }
};

/**
 * Manually sync road assist data from external API
 * @route GET /api/roadassists/sync
 * @returns {Object} Result of the sync operation
 */
/**
 * Assign a technician to a road assist appointment
 * @route PUT /api/roadassists/:id/assign-technician
 * @param {string} technicianId - ID of the technician to assign
 * @param {string} technicianName - Name of the technician to assign
 * @returns {Object} Updated road assist appointment and technician details
 */
export const assignTechnician = async (req, res) => {
  try {
    const { customId } = req.params;
    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({
        success: false,
        message: 'Technician ID is required'
      });
    }

    // 1. Get technician details
    const technician = await Technician.findOne({ technicianId });
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // 2. Update RoadAssist document using customId
    console.log('Looking up road assist with customId:', customId);
    console.log('Technician ID to assign:', technicianId);
    
    const roadAssist = await RoadAssist.findOneAndUpdate(
      { customId: customId.trim() },
      {
        assignedTechnician: technicianId,
        assignedTechnicianName: `${technician.firstName} ${technician.lastName}`,
        status: 'in-progress'
      },
      { new: true }
    );
    
    if (!roadAssist) {
      return res.status(404).json({
        success: false,
        message: 'Road assist appointment not found'
      });
    }

    // 3. Update Technician document with road assist assignment
    await Technician.findOneAndUpdate(
      { technicianId },
      {
        $push: {
          roadAssistAssignments: {
            roadAssistId: customId,
            status: 'assigned',
            assignedAt: new Date()
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      data: {
        roadAssist,
        technician: {
          technicianId: technician.technicianId,
          name: `${technician.firstName} ${technician.lastName}`
        }
      }
    });
  } catch (error) {
    console.error('Error assigning technician:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign technician',
      error: error.message
    });
  }
};

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
  getRoadAssistsByTechnician,
  syncRoadAssists,
  assignTechnician
};
