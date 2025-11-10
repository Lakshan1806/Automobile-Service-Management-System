import axios from 'axios';
import mongoose from 'mongoose';
import RoadAssist from '../models/RoadAssist.js';

const API_URL = 'http://localhost:5000/api/roadassist';

/**
 * Fetches road assist data from the external API
 * @returns {Promise<Array>} Array of road assist records
 */
const fetchRoadAssistData = async () => {
  try {
    console.log('Fetching road assist data from external API...');
    const response = await axios.get(API_URL);
    console.log(`Successfully fetched ${response.data.length} road assist records`);
    return response.data;
  } catch (error) {
    console.error('Error fetching road assist data:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    throw new Error('Failed to fetch road assist data');
  }
};

/**
 * Saves road assist data to the database
 * @param {Array} data - Array of road assist records
 * @returns {Promise<Object>} Result of the operation
 */
const saveRoadAssistData = async (data) => {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { success: true, message: 'No data to save', count: 0 };
    }

    console.log(`Processing ${data.length} road assist records...`);

    // Process each record
    const processedData = data.map(item => {
      // Create a new object with only the fields that exist in the schema
      // and ensure required fields have values
      return {
        vehicleId: item.vehicleId || new mongoose.Types.ObjectId().toString(),
        vehicleNo: item.vehicleNo || 'UNKNOWN',
        customerId: item.customerId || new mongoose.Types.ObjectId().toString(),
        customerName: item.customerName || 'Unknown Customer',
        customerPhone: item.customerPhone || 'N/A',
        currentLocation: item.currentLocation || 'Location not specified',
        description: item.description || 'No description provided',
        serviceType: item.serviceType || 'multi-service',
        requestDate: item.requestDate || new Date(),
        status: item.status || 'pending',
        ...(item.assignedTechnician && { assignedTechnician: item.assignedTechnician }),
        ...(item.notes && { notes: item.notes })
      };
    });

    // Get all existing vehicleIds to prevent duplicates
    const existingVehicleIds = (await RoadAssist.find({}, 'vehicleId')).map(doc => doc.vehicleId);
    
    // Filter out records that already exist
    const newRecords = processedData.filter(doc => !existingVehicleIds.includes(doc.vehicleId));
    
    if (newRecords.length === 0) {
      console.log('No new road assist records to add');
      return {
        success: true,
        message: 'No new records to add',
        count: 0
      };
    }
    
    // Insert only new records
    const result = await RoadAssist.insertMany(newRecords, { ordered: false });
    
    console.log(`Added ${result.length} new road assist records`);
    return {
      success: true,
      message: `Added ${result.length} new road assist records`,
      count: result.length
    };
  } catch (error) {
    console.error('Error saving road assist data:', error.message);
    return {
      success: false,
      message: 'Failed to save road assist data',
      error: error.message,
      count: 0
    };
  }
};

/**
 * Syncs road assist data from the external API to the local database
 * @returns {Promise<Object>} Result of the sync operation
 */
export const syncRoadAssistData = async () => {
  try {
    console.log('Starting road assist data sync...');

    // Fetch data from external API
    const roadAssistData = await fetchRoadAssistData();

    // Save data to database
    const result = await saveRoadAssistData(roadAssistData);

    return result;
  } catch (error) {
    console.error('Error in syncRoadAssistData:', error.message);
    return {
      success: false,
      message: 'Failed to sync road assist data',
      error: error.message,
      count: 0
    };
  }
};

export default {
  syncRoadAssistData
};
