import mongoose from 'mongoose';
import RoadAssist from '../models/RoadAssist.js';
import { locationApi, locationServiceBaseUrl } from '../utils/locationServiceClient.js';

const API_URL = `${locationServiceBaseUrl}/api/roadside/requests`;
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

/**
 * Fetches road assist data from the external API
 * @returns {Promise<Array>} Array of road assist records
 */
const fetchRoadAssistData = async () => {
  try {
    console.log(`Fetching road assist data from ${API_URL} ...`);
    const response = await locationApi.get('/api/roadside/requests');
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
      const vehicle = item.vehicle || {};
      const customer = item.customer || {};

      return {
        customId:
          item.customId ||
          item.reference ||
          item.id ||
          new mongoose.Types.ObjectId().toString(),
        vehicleId:
          vehicle.id ||
          item.vehicleId ||
          new mongoose.Types.ObjectId().toString(),
        vehicleNo:
          vehicle.numberPlate ||
          item.vehicleNo ||
          'UNKNOWN',
        customerId:
          customer.id ||
          item.customerId ||
          new mongoose.Types.ObjectId().toString(),
        customerName:
          customer.name ||
          item.customerName ||
          'Unknown Customer',
        customerPhone: item.customerPhone || 'N/A',
        currentLocation: item.currentLocation || 'Location not specified',
        description: item.description || 'No description provided',
        serviceType: 'multi-service',
        requestDate: item.requestDate || item.createdAt || new Date(),
        status: normalizeStatus(item.status),
        ...(item.assignedTechnician && { assignedTechnician: item.assignedTechnician }),
        ...(item.notes && { notes: item.notes })
      };
    });

    // Get all existing customIds to prevent duplicates
    const existingCustomIds = (await RoadAssist.find({}, 'customId')).map(doc => doc.customId);
    
    // Filter out records that already exist
    const newRecords = processedData.filter(doc => !existingCustomIds.includes(doc.customId));
    
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
