import api from './api';

class AuthService {
  async login(email, password) {
    const response = await api.post('/login', {
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
  
  async register(name, email, password,phone) {
    return api.post('/users', {
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