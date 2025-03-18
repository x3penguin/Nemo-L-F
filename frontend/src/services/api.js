import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for JWT token
instance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 Unauthorized and not already retrying 
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.refreshToken) {
          const rs = await axios.post('/auth/refresh-token', {
            refreshToken: user.refreshToken
          });
          
          const { token } = rs.data;
          
          // Update user in localStorage
          user.token = token;
          localStorage.setItem('user', JSON.stringify(user));
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        }
      } catch (_error) {
        // If refresh token fails, logout
        localStorage.removeItem('user');
        location.href = '/login';
        return Promise.reject(_error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;