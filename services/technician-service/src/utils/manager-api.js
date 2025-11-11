/**
 * Manager Service API Client
 * Handles communication with manager-service to fetch assigned tasks/appointments
 */

import axios from 'axios';

const MANAGER_SERVICE_URL = process.env.MANAGER_SERVICE_URL || 'http://localhost:3002/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: MANAGER_SERVICE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

/**
 * Fetch all technicians from manager service
 * @returns {Promise<Array>} - Array of technicians
 */
export const fetchTechniciansFromManager = async () => {
  try {
    console.log('Fetching technicians from manager service...');
    
    const response = await api.get('/technicians');
    
    if (response.data && response.data.success) {
      console.log(`Successfully fetched ${response.data.count} technicians from manager service`);
      return response.data.data || [];
    }
    
    console.warn('Manager service returned unsuccessful response:', response.data);
    throw new Error('Failed to fetch technicians from manager service');
  } catch (error) {
    console.error('Error fetching technicians from manager service:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    throw new Error('Failed to fetch technicians from manager service');
  }
};

/**
 * Fetch assigned tasks for a specific technician from manager service
 * Uses the existing GET /api/technicians endpoint and filters by technicianId
 * @param {string} technicianId - The technician ID
 * @returns {Promise<Array>} - Array of assigned tasks
 */
export const fetchAssignedTasksFromManager = async (technicianId) => {
  try {
    console.log(`Fetching assigned tasks for technician: ${technicianId} from manager service...`);
    
    // Fetch all technicians
    const technicians = await fetchTechniciansFromManager();
    
    // Find the specific technician
    const technician = technicians.find(t => t.technicianId === technicianId);
    
    if (!technician) {
      console.warn(`Technician ${technicianId} not found in manager service`);
      return [];
    }
    
    // Return the assignedTasks array
    const tasks = technician.assignedTasks || [];
    console.log(`Found ${tasks.length} assigned tasks for technician ${technicianId}`);
    
    return tasks;
  } catch (error) {
    console.error('Error fetching assigned tasks from manager service:', error.message);
    throw new Error('Failed to fetch assigned tasks from manager service');
  }
};

/**
 * Fetch appointment details by appointment ID from manager service
 * Since manager-service doesn't have a GET by ID endpoint, we fetch all appointments and filter
 * @param {string} appointmentId - The appointment MongoDB _id
 * @returns {Promise<Object>} - Appointment details
 */
export const fetchAppointmentByIdFromManager = async (appointmentId) => {
  try {
    console.log(`Fetching appointment ${appointmentId} from manager service...`);
    
    // Fetch all appointments
    const response = await api.get('/appointments');
    
    if (response.data && response.data.success) {
      const appointments = response.data.data || [];
      
      // Find the appointment by _id
      const appointment = appointments.find(a => a._id.toString() === appointmentId.toString());
      
      if (appointment) {
        console.log('Successfully fetched appointment from manager service');
        return appointment;
      }
      
      console.warn(`Appointment ${appointmentId} not found in manager service`);
      return null;
    }
    
    throw new Error('Failed to fetch appointments from manager service');
  } catch (error) {
    console.error('Error fetching appointment from manager service:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return null;
  }
};

export default {
  fetchTechniciansFromManager,
  fetchAssignedTasksFromManager,
  fetchAppointmentByIdFromManager
};
