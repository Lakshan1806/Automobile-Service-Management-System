import mongoose from 'mongoose';
import RoadAssist from '../models/RoadAssist.js';
import Technician from '../models/Technician.js';
import { syncRoadAssistData } from '../services/roadAssistService.js';
import { locationApi } from '../utils/locationServiceClient.js';

const normalizeStatus = (status) => {
  const value = typeof status === 'string' ? status.toLowerCase() : '';
  if (['in-progress', 'in_progress', 'assigned'].includes(value)) {
    return 'in-progress';
  }
  if (value === 'completed') {
    return 'completed';
  }
  return 'pending';
};

async function updateRemoteAssignment(requestId, technicianId) {
  const path = `/api/roadside/requests/${encodeURIComponent(requestId)}/assign`;
  const response = await locationApi.patch(path, { technicianId });
  return response.data;
}

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

    const trimmedCustomId = customId?.trim();
    if (!trimmedCustomId) {
      return res.status(400).json({
        success: false,
        message: 'Road assist customId is required'
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

    // 2. Fetch the road assist entry to ensure we have the latest IDs
    const roadAssist = await RoadAssist.findOne({ customId: trimmedCustomId });
    if (!roadAssist) {
      return res.status(404).json({
        success: false,
        message: 'Road assist appointment not found'
      });
    }

    // 3. Update location-service so the canonical record knows about the assignment
    let remoteAssignment;
    try {
      remoteAssignment = await updateRemoteAssignment(trimmedCustomId, technicianId);
    } catch (error) {
      console.error('Failed to update location service assignment:', error?.response?.data || error.message);
      const statusCode = error?.response?.status ?? 502;
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update remote assignment';
      return res.status(statusCode).json({
        success: false,
        message,
      });
    }

    // 4. Update local RoadAssist document
    roadAssist.assignedTechnician = technicianId;
    roadAssist.assignedTechnicianName = `${technician.firstName} ${technician.lastName}`;
    roadAssist.status = normalizeStatus(remoteAssignment?.status || 'in-progress');
    await roadAssist.save();

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
