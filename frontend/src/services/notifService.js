import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const sendItemFoundNotification = async (itemData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/found-items/notify`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};