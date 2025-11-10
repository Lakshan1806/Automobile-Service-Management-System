// controllers/appointmentController.js
import mongoose from 'mongoose';
import axios from 'axios';
import Appointment from '../models/Appointment.js';
import Technician from '../models/Technician.js';

const EXTERNAL_SERVICE_URL = 'http://localhost:5000';

/**
 * Sync appointments from external service to local database
 */
export async function syncAppointments() {
  try {
    console.log('Fetching appointments from external service...');
    const response = await axios.get(`${EXTERNAL_SERVICE_URL}/api/appointments/new`);
    let appointments = [];

    // Handle both array and single object responses
    if (Array.isArray(response.data)) {
      appointments = response.data;
    } else if (response.data) {
      // If single object is returned, convert it to array
      appointments = [response.data];
    }

    if (appointments.length === 0) {
      console.log('No new appointments found in external service');
      return { success: true, message: 'No new appointments to sync' };
    }

    console.log(`Found ${appointments.length} appointments to process`);

    // Process all appointments in parallel for better performance
    const results = await Promise.allSettled(
      appointments.map(async (appt) => {
        try {
          if (!appt) return { success: false, error: 'Empty appointment data' };

          // Generate a unique ID for the appointment if not present
          const appointmentId = appt._id || appt.id || new mongoose.Types.ObjectId().toString();
          
          // Prepare appointment data with proper defaults
          const appointmentData = {
            appointmentId: appointmentId,
            vehicleId: appt.vehicleId || 'N/A',
            vehicleNo: appt.vehicleNo || 'N/A',
            chaseNo: appt.chaseNo || '',
            type: appt.type || 'service',
            brand: appt.brand || '',
            customerId: appt.customerId || '',
            millage: appt.millage || 0,
            lastServiceDate: appt.lastServiceDate ? new Date(appt.lastServiceDate) : null,
            customerPhone: appt.customerPhone || '',
            repair: appt.repair || '',
            description: appt.description || '',
            suggested_started_date: appt.suggested_started_date ? new Date(appt.suggested_started_date) : null,
            predicted_duration_date: appt.predicted_duration_date || 1,
            status: appt.status || 'pending',
            // Include any additional fields from the external API
            ...appt
          };

          // Use upsert to either insert or update existing record
          const result = await Appointment.findOneAndUpdate(
            { appointmentId: appointmentId },
            { $set: appointmentData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          return { success: true, id: result._id };
        } catch (error) {
          console.error('Error processing appointment:', error.message);
          return { success: false, error: error.message, appt };
        }
      })
    );

    // Count successful and failed operations
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedCount = results.length - successCount;

    console.log(`Sync completed. Success: ${successCount}, Failed: ${failedCount}`);

    if (failedCount > 0) {
      const errors = results
        .filter(r => r.status === 'fulfilled' && !r.value.success)
        .map(r => r.value.error);
      
      console.error('Some appointments failed to sync:', errors);
      return { 
        success: true, 
        message: `Synced ${successCount} appointments, ${failedCount} failed`,
        successCount,
        failedCount,
        errors: errors.slice(0, 5) // Return first 5 errors to avoid huge response
      };
    }

    return { 
      success: true, 
      message: `Successfully synced ${successCount} appointments`,
      successCount
    };
  } catch (error) {
    console.error('Error syncing appointments:', error.message);
    throw error;
  }
}

/**
 * Assign a technician to an appointment
 * POST /api/appointments/assign
 * Body: { appointmentId, technicianId, scheduledDate, estimatedDuration }
 */
export const assignTechnician = async (req, res) => {
  try {
    const { appointmentId, technicianId } = req.body;

    // Validate input
    if (!appointmentId || !technicianId) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId and technicianId are required'
      });
    }

    // 1. Get the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // 2. Get the technician
    const technician = await Technician.findOne({ technicianId });
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // 3. Get the appointment's start date and duration
    const startDate = appointment.suggested_started_date || new Date();
    const workDuration = appointment.predicted_duration_date || 4; // Default to 4 hours if not specified

    // 4. Check for scheduling conflicts (only check start date since we're not using endDate)
    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: appointmentId },
      technicianId,
      startDate: startDate
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Technician is already assigned to another appointment during this time',
        conflictingAppointmentId: conflictingAppointment._id
      });
    }

    // 5. Update the appointment
    console.log(`Updating appointment ${appointment._id} with technician ${technician.technicianName}`);
    console.log(`Current status before update: ${appointment.status}`);
    
    appointment.technicianId = technician.technicianId;
    appointment.technicianName = technician.technicianName;
    appointment.startDate = startDate;
    appointment.endDate = null; // Initialize endDate as null, will be set when work is completed
    appointment.status = 'scheduled';
    // Store workDuration from appointment (predicted_duration_date)
    appointment.workDuration = appointment.predicted_duration_date || 4;
    
    console.log(`Saving appointment with new status: ${appointment.status}`);
    const updatedAppointment = await appointment.save();
    console.log(`Appointment saved. New status: ${updatedAppointment.status}`);

    // 6. Update the technician's assigned tasks
    technician.assignedTasks = technician.assignedTasks || [];
    
    // Remove any existing task for this appointment to prevent duplicates
    technician.assignedTasks = technician.assignedTasks.filter(
      task => task.appointmentId.toString() !== appointment._id.toString()
    );
    
    // Add new task to technician's assigned tasks
    technician.assignedTasks.push({
      appointmentId: appointment._id,
      startDate: startDate,
      workDuration: workDuration, // Use the workDuration calculated earlier
      status: 'scheduled'
    });
    
    // Save the technician with updated tasks
    await technician.save();

    res.json({
      success: true,
      message: 'Technician assigned successfully',
      data: {
        appointmentId: appointment._id,
        technicianId: technician.technicianId,
        startDate: startDate,
        workDuration: appointment.predicted_duration_date || 4,
        scheduledDate: startDate
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

/**
 * Get all appointments from local database
 */
export async function getAppointments(req, res) {
  try {
    // Refresh appointments from external service before returning cached data
    try {
      await syncAppointments();
    } catch (syncError) {
      console.warn('Failed to sync appointments before fetch:', syncError.message);
    }

    const appointments = await Appointment.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get all active appointments (pending, inprocess, or scheduled)
 * GET /api/appointments/active
 */
export async function getActiveAppointments(req, res) {
  try {
    const activeAppointments = await Appointment.find({
      status: { $in: ['pending', 'inprocess', 'scheduled'] }
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: activeAppointments.length,
      data: activeAppointments
    });
  } catch (error) {
    console.error('Error fetching active appointments:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active appointments',
      error: error.message
    });
  }
}

/**
 * Get all finished appointments
 * GET /api/appointments/finished
 */
export async function getFinishedAppointments(req, res) {
  try {
    const finishedAppointments = await Appointment.find({
      status: 'finished'
    }).sort({ endDate: -1 });
    
    res.json({
      success: true,
      count: finishedAppointments.length,
      data: finishedAppointments
    });
  } catch (error) {
    console.error('Error fetching finished appointments:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch finished appointments',
      error: error.message
    });
  }
}

/**
 * Get new appointments from external service
 */
export async function getNewAppointments(req, res) {
  try {
    const response = await axios.get(`${EXTERNAL_SERVICE_URL}/api/appointments/new`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching new appointments:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new appointments',
      error: error.message
    });
  }
}
