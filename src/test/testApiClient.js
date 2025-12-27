import axios from 'axios';
import { API_CONFIG } from '../services/api/config.js';
import { getValueFor } from './mockSecureStorage.js'; // <-- 修改点

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getValueFor('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token for request interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    if (status === 401) {
      console.warn('Unauthorized access - 401');
    } else if (status === 403) {
      console.warn('Forbidden access - 403');
    } else if (status === 500) {
      console.warn('Server error - 500');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
