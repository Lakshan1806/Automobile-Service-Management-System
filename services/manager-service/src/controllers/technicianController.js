// controllers/technicianController.js
import axios from 'axios';
import mongoose from 'mongoose';
import Technician from '../models/Technician.js';
import Appointment from '../models/Appointment.js';

const EXTERNAL_SERVICE_URL = 'http://localhost:5000';

/**
 * Sync technicians from external service to local database
 */
export const syncTechnicians = async () => {
  try {
    console.log('Syncing technicians from external service...');
    const response = await axios.get(`${EXTERNAL_SERVICE_URL}/api/technicians`);
    const technicians = Array.isArray(response.data) ? response.data : [response.data];
    
    const results = await Promise.allSettled(
      technicians.map(async (tech) => {
        try {
          if (!tech || !tech.technicianId) {
            return { success: false, error: 'Invalid technician data' };
          }
          
          const technicianData = {
            technicianId: tech.technicianId,
            technicianName: tech.technicianName || 'Unnamed Technician',
            phoneNumber: tech.phoneNumber || '',
            status: tech.status || 'active',
            // Preserve existing assignedTasks if any
            $setOnInsert: { assignedTasks: [] }
          };
          
          const result = await Technician.findOneAndUpdate(
            { technicianId: tech.technicianId },
            technicianData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          
          return { success: true, id: result._id };
        } catch (error) {
          console.error('Error processing technician:', error.message);
          return { success: false, error: error.message, tech };
        }
      })
    );
    
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedCount = results.length - successCount;
    
    console.log(`Technician sync completed. Success: ${successCount}, Failed: ${failedCount}`);
    
    return {
      success: true,
      message: `Successfully synced ${successCount} technicians`,
      successCount,
      failedCount,
      errors: results
        .filter(r => r.status === 'fulfilled' && !r.value.success)
        .map(r => r.value.error)
    };
  } catch (error) {
    console.error('Error syncing technicians:', error.message);
    return {
      success: false,
      message: 'Failed to sync technicians',
      error: error.message
    };
  }
};

/**
 * GET /api/technicians
 * Fetches all technicians from the local database
 */
export const getTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.find({});
    res.json({
      success: true,
      count: technicians.length,
      data: technicians
    });
  } catch (error) {
    console.error('Error fetching technicians:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technicians',
      error: error.message
    });
  }
};

/**
 * GET /api/technicians/sync
 * Manually trigger technician sync
 */
export const syncTechniciansRoute = async (req, res) => {
  try {
    const result = await syncTechnicians();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to sync technicians',
      error: error.message
    });
  }
};

/**
 * GET /api/technicians/available
 * Get all technicians available for a specific appointment
 * Query params: appointmentId (required)
 */
export const getAvailableTechnicians = async (req, res) => {
  try {
    const { appointmentId } = req.query;
    
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId is required as a query parameter'
      });
    }

    // Get the appointment details
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // If appointment already has an assigned technician, return only that technician
    if (appointment.technicianId && appointment.status === 'scheduled') {
      const assignedTech = await Technician.findOne({ technicianId: appointment.technicianId });
      if (assignedTech) {
        return res.json({
          success: true,
          count: 1,
          message: 'Appointment already has an assigned technician',
          alreadyAssigned: true,
          availableTechnicians: [{
            _id: assignedTech._id,
            technicianId: assignedTech.technicianId,
            technicianName: assignedTech.technicianName,
            phoneNumber: assignedTech.phoneNumber,
            status: assignedTech.status
          }]
        });
      }
    }

    // 2. Get the appointment start date and duration
    const appointmentStart = new Date(appointment.suggested_started_date || new Date());
    const appointmentDuration = appointment.predicted_duration_date || 1; // Default to 1 day if not specified
    
    // 3. Find all active technicians (excluding the currently assigned one if any)
    const allTechs = await Technician.find({
      status: 'active',
      technicianId: appointment.technicianId ? { $ne: appointment.technicianId } : { $exists: true }
    });

    // 4. For each technician, check their availability based on start date and duration
    const availableTechs = [];
    
    for (const tech of allTechs) {
      // If no tasks, they're definitely available
      if (!tech.assignedTasks || tech.assignedTasks.length === 0) {
        availableTechs.push({
          _id: tech._id,
          technicianId: tech.technicianId,
          technicianName: tech.technicianName,
          phoneNumber: tech.phoneNumber,
          status: tech.status,
          available: true,
          reason: 'No assigned tasks',
          currentTasks: 0
        });
        continue;
      }
      
      // Check for any time conflicts with existing tasks
      let isAvailable = true;
      let conflictReason = '';
      
      for (const task of tech.assignedTasks) {
        if (task.status === 'completed') continue;
        
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(taskStart.getTime() + (task.workDuration || 1) * 24 * 60 * 60 * 1000);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointmentDuration * 24 * 60 * 60 * 1000);
        
        // Check for date overlap
        if (appointmentStart < taskEnd && appointmentEnd > taskStart) {
          isAvailable = false;
          conflictReason = `Busy from ${taskStart.toISOString().split('T')[0]} for ${task.workDuration || 1} days`;
          break;
        }
      }
      
      if (isAvailable) {
        availableTechs.push({
          _id: tech._id,
          technicianId: tech.technicianId,
          technicianName: tech.technicianName,
          phoneNumber: tech.phoneNumber,
          status: tech.status,
          available: true,
          reason: 'Available for the requested time',
          currentTasks: tech.assignedTasks.length
        });
      } else {
        console.log(`Technician ${tech.technicianName} is not available: ${conflictReason}`);
      }
    }
    
    // If no available technicians, return all active technicians with their busy status
    if (availableTechs.length === 0) {
      const allActiveTechs = await Technician.find({ status: 'active' });
      const busyTechs = allActiveTechs.map(tech => ({
        _id: tech._id,
        technicianId: tech.technicianId,
        technicianName: tech.technicianName,
        phoneNumber: tech.phoneNumber,
        status: tech.status,
        available: false,
        reason: 'Fully booked',
        currentTasks: tech.assignedTasks?.length || 0
      }));
      
      return res.json({
        success: true,
        count: 0,
        message: 'No technicians available for the requested time slot',
        allTechnicians: busyTechs,
        availableTechnicians: []
      });
    }
    
    // Return available technicians
    return res.json({
      success: true,
      count: availableTechs.length,
      availableTechnicians: availableTechs
    });
  } catch (error) {
    console.error('Error finding available technicians:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find available technicians',
      error: error.message
    });
  }
};
