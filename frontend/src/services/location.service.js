import axios from 'axios';

const API_URL = process.env.VUE_APP_LOCATION_SERVICE_URL || 'http://localhost:3005';

export default {
  async getPlacePredictions(input) {
    try {
      const response = await axios.get(`${API_URL}/api/places/autocomplete`, {
        params: { input }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching place predictions:', error);
      return { predictions: [] };
    }
  },

  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${API_URL}/api/places/details`, {
        params: { place_id: placeId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw error;
    }
  },

  async geocodeAddress(address) {
    try {
      const response = await axios.get(`${API_URL}/api/geocode`, {
        params: { address }
      });
      return response.data;
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  },

  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${API_URL}/api/reverse-geocode`, {
        params: { lat, lng }
      });
      return response.data;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }
};
