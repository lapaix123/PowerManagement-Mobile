import axios from 'axios';

// Configure your API base URL - use your actual local IP
const BASE_URL = 'http://192.168.1.72:5000';
const TIMEOUT = 15000;

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true // Important for session cookies
});

// Add a request interceptor for handling tokens if needed
api.interceptors.request.use(
  (config) => {
    // You can add token logic here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API Service class to handle all API requests
class ApiService {
  // Authentication
  static async login(username, password) {
    try {
      // Create form data for login (server expects form data, not JSON)
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  }

  static async register(userData) {
    try {
      // Create form data for registration (server expects form data, not JSON)
      const formData = new FormData();
      for (const key in userData) {
        formData.append(key, userData[key]);
      }

      const response = await api.post('/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Registration error', error);
      throw error;
    }
  }

  // User data
  static async getCurrentPower(meterNumber) {
    try {
      const response = await api.get(`/api/current_power/${meterNumber}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getLatestReading(meterNumber) {
    try {
      const response = await api.get(`/api/latest-reading/${meterNumber}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getPortReport(meterNumber) {
    try {
      const response = await api.get(`/api/port_report/${meterNumber}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Power management
  static async updateConsumption(data) {
    try {
      const response = await api.post('/api/update_consumption', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update consumption error', error);
      throw error;
    }
  }

  static async controlRelay(data) {
    try {
      const response = await api.post('/api/relay_control', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Control relay error', error);
      throw error;
    }
  }

  // Admin functions
  static async getUsers(search = '') {
    try {
      const response = await api.get(`/admin/api/users?search=${search}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(userId, userData) {
    try {
      const response = await api.post(`/admin/api/users/${userId}/update`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update user error', error);
      throw error;
    }
  }

  static async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/api/users/${userId}/delete`);
      return response.data;
    } catch (error) {
      console.error('Delete user error', error);
      throw error;
    }
  }
}

export default ApiService;
