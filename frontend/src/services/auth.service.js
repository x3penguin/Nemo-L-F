import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3004';

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
  
  async register(name, email, password, phone) {
    return axios.post(`${API_BASE_URL}/users`, {
      name,
      email,
      password,
      phone
    });
  }
  
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
}

export default new AuthService();