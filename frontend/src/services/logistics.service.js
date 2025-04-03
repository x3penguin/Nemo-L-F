import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_LOGISTICS_API_URL;

class LogisticsService {
  async checkRates(shipmentData) {
    const response = await axios.post(`${API_BASE_URL}/rate-check`, shipmentData);
    return response.data;
  }
  
  async getShippingHistory(limit = 10) {
    const response = await axios.get(`${API_BASE_URL}/shipping-history?limit=${limit}`);
    return response.data;
  }
}

export default new LogisticsService();
