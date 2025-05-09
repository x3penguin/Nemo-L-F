import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_USER_API_URL;

class AuthService {
  async login(email, password) {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  }
  
  logout() {
    localStorage.removeItem('user');
  }
  
  async register(name, email, password, phone, city, postalCode, streetAddress, unitNumber) {
    
    return axios.post(`${API_BASE_URL}/users`, {
      name,
      email,
      password,
      phone,
      city,
      postalCode,
      streetAddress,
      unitNumber
    });
  }
  
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getUserPotentialMatches(userId) {
    return axios.get(`${API_BASE_URL}/api/users/${userId}/potential-matches`);
  }
}

export default new AuthService();