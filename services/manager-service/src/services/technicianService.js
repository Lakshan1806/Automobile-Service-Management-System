// services/technicianService.js
import axios from 'axios';
import mongoose from 'mongoose';
import Technician from '../models/Technician.js';
import ServiceAppointment from '../models/Appointment.js';

/**
 * Get all active technicians
 */
export async function getAllTechnicians() {
  try {
    return await Technician.find({ status: 'active' }).lean();
  } catch (error) {
    console.error('Error getting all technicians:', error);
    throw new Error('Failed to fetch technicians');
  }
}

/**
 * Sync technicians from a source API (sourceUrl).
 * It upserts technicians using `technicianId` as key.
 * Returns count of upserted items.
 */
export async function syncTechniciansFromSource(sourceUrl = 'http://localhost:5000/api/technicians') {
  try {
    const resp = await axios.get(sourceUrl);
    const list = Array.isArray(resp.data) ? resp.data : [];
    let count = 0;

    for (const t of list) {
      const techId = t.technicianId || t.id || t._id || t.techId || t.tech_id;
      const techName = t.technicianName || t.name || t.fullName || t.technician_name;
      const phone = t.phoneNumber || t.phone || t.mobile;
      const specialization = t.specialization || t.skill || t.expertise;
      const skills = Array.isArray(t.skills) ? t.skills : [];

      if (!techId || !techName) continue;

      await Technician.findOneAndUpdate(
        { technicianId: techId },
        {
          technicianId: techId,
          technicianName: techName,
          phoneNumber: phone,
          specialization,
          skills,
          status: 'active'
        },
        { upsert: true, new: true }
      );
      count++;
    }

    return { synced: count, success: true };
  } catch (error) {
    console.error('Error syncing technicians:', error);
    throw new Error('Failed to sync technicians from source');
  }
}

/**
 * Compute end date given start date and duration in hours.
 * If start is missing, fallback to suggested_started_date or now.
 */
function computeAppointmentWindow(appointment) {
  const start = appointment.suggested_started_date || appointment.startDate || new Date();
  const durationHours = Number(appointment.duration) || 1; // Default to 1 hour if duration not specified
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
  return { startDate, endDate };
}

/**
 * Check if two time ranges overlap
 */
function isTimeRangeOverlap(range1, range2) {
  return (
    range1.startDate < range2.endDate &&
    range1.endDate > range2.startDate
  );
}

/**
 * Return available technicians for a given appointment id.
 * A technician is available if they don't have any overlapping appointments.
 */
export async function findAvailableTechniciansForAppointment(appointmentId) {
  try {
    const appointment = await ServiceAppointment.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const { startDate, endDate } = computeAppointmentWindow(appointment);
    const appointmentWindow = { startDate, endDate };

    // Get all active technicians
    const allTechs = await Technician.find({ status: 'active' });

    // Get all appointments that overlap with the target time window
    const overlappingAppointments = await ServiceAppointment.find({
      _id: { $ne: appointmentId }, // Exclude current appointment
      status: { $in: ['scheduled', 'in-progress'] },
      $or: [
        {
          startDate: { $lt: endDate },
          endDate: { $gt: startDate }
        },
        {
          startDate: { $exists: false },
          suggested_started_date: {
            $lt: endDate,
            $gt: new Date(startDate.getTime() - 24 * 60 * 60 * 1000) // 24 hours before start
          }
        }
      ]
    });

    // Create a map of technician IDs to their busy time slots
    const busyTechs = new Set();
    overlappingAppointments.forEach(appt => {
      if (appt.technicianId) {
        busyTechs.add(appt.technicianId.toString());
      }
    });

    // Filter out busy technicians
    const availableTechs = allTechs.filter(tech => !busyTechs.has(tech.technicianId));

    return {
      success: true,
      availableTechnicians: availableTechs.map(tech => ({
        technicianId: tech.technicianId,
        technicianName: tech.technicianName,
        specialization: tech.specialization,
        skills: tech.skills
      })),
      appointmentWindow: {
        start: startDate,
        end: endDate
      }
    };
  } catch (error) {
    console.error('Error finding available technicians:', error);
    throw new Error('Failed to find available technicians');
  }
}

/**
 * Assign a technician to an appointment
 * @param {string} appointmentId - The ID of the appointment to assign
 * @param {Object} techObj - The technician object containing technicianId and technicianName
 * @returns {Object} - The updated appointment and technician
 */
export async function assignTechnicianToAppointment(appointmentId, techObj) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await ServiceAppointment.findById(appointmentId).session(session);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const technician = await Technician.findOne({ technicianId: techObj.technicianId }).session(session);
    if (!technician) {
      throw new Error('Technician not found');
    }

    const { startDate, endDate } = computeAppointmentWindow(appointment);

    // Check if technician is still available
    const existingAppointments = await ServiceAppointment.find({
      _id: { $ne: appointmentId },
      technicianId: techObj.technicianId,
      status: { $in: ['scheduled', 'in-progress'] },
      $or: [
        { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
        {
          startDate: { $exists: false },
          suggested_started_date: {
            $lt: endDate,
            $gt: new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
          }
        }
      ]
    }).session(session);

    if (existingAppointments.length > 0) {
      throw new Error('Technician is no longer available for the selected time slot');
    }

    // Update appointment
    appointment.status = 'scheduled';
    appointment.technicianId = techObj.technicianId;
    appointment.technicianName = techObj.technicianName;
    appointment.startDate = startDate;
    appointment.endDate = endDate;

    // Add to technician's assigned tasks
    technician.assignedTasks.push({
      appointmentId: appointment._id,
      startDate: startDate,
      endDate: endDate,
      status: 'scheduled'
    });

    await appointment.save({ session });
    await technician.save({ session });
    await session.commitTransaction();

    return {
      success: true,
      appointment: appointment,
      technician: {
        technicianId: technician.technicianId,
        technicianName: technician.technicianName
      }
    };
  } catch (error) {
    await session.abortTransaction();
    console.error('Error assigning technician:', error);
    throw error;
  } finally {
    session.endSession();
  }
  // All logic is handled in the transaction above
}
