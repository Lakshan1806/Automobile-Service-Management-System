// controllers/technicianController.js
import axios from 'axios';
import mongoose from 'mongoose';
import Technician from '../models/Technician.js';
import Appointment from '../models/Appointment.js';
import RoadAssist from '../models/RoadAssist.js';

/**
 * Sync technicians from external service to local database
 */
export const syncTechnicians = async () => {
  try {
    const adminBase = (process.env.ADMIN_SERVICE_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const technicianFeedUrl = process.env.ADMIN_TECHNICIAN_URL || `${adminBase}/api/technicians/`;

    console.log('Syncing technicians from external service...');
    console.log('Technician feed URL:', technicianFeedUrl);
    const response = await axios.get(technicianFeedUrl);
    let technicians = Array.isArray(response.data) ? response.data : [response.data];

    console.log(`Found ${technicians.length} technicians to sync`);

    // Process each technician to ensure required fields
    const processedTechs = technicians.map(tech => {
      const externalId =
        tech.technicianId ||
        tech.employee_id ||
        tech.id ||
        (tech._id ? tech._id.toString() : null) ||
        new mongoose.Types.ObjectId().toString();

      return {
        technicianId: externalId.toString(),
        technicianName: tech.technicianName || tech.name || tech.fullName || 'Unknown Technician',
        phoneNumber: tech.phoneNumber || tech.phone || tech.phone_number || '',
        email: tech.email || '',
        status: tech.status || 'active',
        role: tech.role || 'Technician',
        // Preserve any other fields from the API
        ...tech
      };
    });

    // Clear existing technicians
    await Technician.deleteMany({});
    
    // Insert all technicians
    const result = await Technician.insertMany(processedTechs, { ordered: false });

    console.log(`Successfully synced ${result.length} technicians`);
    return {
      success: true,
      message: `Successfully synced ${result.length} technicians`,
      count: result.length
    };
  } catch (error) {
    console.error('Error syncing technicians:', error.message);
    
    // If it's a bulk write error, some records might still have been inserted
    if (error.writeErrors) {
      const insertedCount = error.result?.nInserted || 0;
      console.warn(`Partially synced: ${insertedCount} technicians were inserted before error`);
      return {
        success: false,
        message: `Partially synced ${insertedCount} technicians`,
        error: error.message,
        insertedCount
      };
    }
    
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
    // Attempt to refresh local cache before serving data so frontend always sees latest technicians
    try {
      await syncTechnicians();
    } catch (syncError) {
      console.warn('Failed to sync technicians before fetch:', syncError.message);
    }

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
/**
 * GET /api/technicians/available/roadassist/:customId
 * Get all technicians available for a specific road assist assignment
 * Uses the road assist's request date to check availability
 * Query params: 
 * - duration: (optional) Duration in hours (default: 2)
 */
export const getAvailableTechniciansForRoadAssist = async (req, res) => {
  try {
    const { customId } = req.params;
    
    // Find the road assist request by customId
    const roadAssist = await RoadAssist.findOne({ customId });
    
    if (!roadAssist) {
      return res.status(404).json({
        success: false,
        message: 'Road assist request not found'
      });
    }
    
    // Use the road assist's request date
    const requestDate = roadAssist.requestDate || new Date();
    const targetDate = new Date(requestDate);
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use ISO format (e.g., 2023-11-07T10:00:00.000Z)'
      });
    }

    // Normalize dates to compare only the date part (ignoring time)
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get all technicians (removed status filter)
    const allTechs = await Technician.find({});
    
    const availableTechs = [];

    for (const tech of allTechs) {
      let isAvailable = true;
      let reason = 'Available for road assist';

      // Check assigned tasks for the same date
      if (tech.assignedTasks && tech.assignedTasks.length > 0) {
        for (const task of tech.assignedTasks) {
          if (task.status === 'completed') continue;
          
          const taskDate = new Date(task.startDate).toISOString().split('T')[0];
          
          // Check if the task is on the same date
          if (taskDate === targetDateStr) {
            isAvailable = false;
            reason = `Assigned to a task on ${taskDate}`;
            break;
          }
        }
      }

      // Check road assist assignments if still available
      if (isAvailable && tech.roadAssistAssignments && tech.roadAssistAssignments.length > 0) {
        // Get all road assists for this technician
        const roadAssistIds = tech.roadAssistAssignments.map(a => a.roadAssistId);
        const roadAssists = await RoadAssist.find({ 
          _id: { $in: roadAssistIds },
          status: { $in: ['pending', 'in-progress'] }
        });

        // Check each road assist for same date
        for (const ra of roadAssists) {
          const raDateStr = new Date(ra.requestDate).toISOString().split('T')[0];
          
          if (raDateStr === targetDateStr) {
            isAvailable = false;
            reason = `Already assigned to a road assist on ${raDateStr}`;
            break;
          }
        }
      }

      // Include technician details in the response
      availableTechs.push({
        technicianId: tech.technicianId,
        technicianName: tech.technicianName,
        available: isAvailable,
        reason: reason
      });
    }

    // Return array of available technicians with ID and name
    const availableTechsList = availableTechs
      .filter(tech => tech.available)
      .map(tech => ({
        id: tech.technicianId,
        name: tech.technicianName
      }));

    return res.json(availableTechsList);

  } catch (error) {
    console.error('Error finding available technicians for road assist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find available technicians for road assist',
      error: error.message
    });
  }
};

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
