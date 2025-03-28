// Update your existing frontend/src/services/notifService.js with these additions
import axios from 'axios';


const API_BASE_URL = 'http://localhost:3004/api';

let processedNotificationIds = new Set();

/**
 * Fetch new match notifications for a user
 * @param {string} userId - The user ID to fetch notifications for
 * @returns {Promise} - Promise that resolves with notification data
 */
export const getNewMatches = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/matches/new`);
    
    // Filter out already processed notifications
    if (response.data && response.data.matches) {
      const newMatches = response.data.matches.filter(match => 
        !processedNotificationIds.has(match.id)
      );
      
      // Add the IDs of these new matches to our processed set
      newMatches.forEach(match => processedNotificationIds.add(match.id));
      
      // Return only the new matches
      return { ...response.data, matches: newMatches };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching new matches:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification ID to mark as read
 * @returns {Promise} - Promise that resolves when notification is marked as read
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Add this function to start a polling interval for match notifications
export const startMatchPolling = (callback, userId, interval = 30000) => {
  if (!userId) {
    console.error('No user ID provided for notification polling');
    return null;
  }
  
  // Do an initial check
  checkForNewMatches(userId, callback);
  
  // Set up interval for regular checking
  const intervalId = setInterval(() => {
    checkForNewMatches(userId, callback);
  }, interval);
  
  return intervalId;
}

// Helper function to check for new matches
const checkForNewMatches = async (userId, callback) => {
  try {
    const response = await getNewMatches(userId);
    
    if (response && response.matches && response.matches.length > 0) {
      callback(response.matches);
    }
  } catch (error) {
    console.error('Error checking for new matches:', error);
  }
}

// Function to stop polling
export const stopMatchPolling = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
}

// Function to reset notification tracking (useful when logging out)
export const resetNotificationTracking = () => {
  processedNotificationIds.clear();
}