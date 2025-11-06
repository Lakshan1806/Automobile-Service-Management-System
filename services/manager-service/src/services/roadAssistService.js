import axios from 'axios';
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

    console.log(`Saving ${data.length} road assist records to database...`);
    
    // Clear existing data
    await RoadAssist.deleteMany({});
    
    // Insert new data
    const result = await RoadAssist.insertMany(data);
    
    console.log(`Successfully saved ${result.length} road assist records`);
    return {
      success: true,
      message: `Successfully synced ${result.length} road assist records`,
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
