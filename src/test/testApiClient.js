const axios = require('axios');
const https = require('https');
const { API_CONFIG } = require('./testConfig.js');
const { getValueFor } = require('./mockSecureStorage.js');

// 创建一个忽略 SSL 证书错误的 Agent (仅用于 Node.js 测试环境)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  httpsAgent: httpsAgent // 添加 agent 以支持自签名证书或 IP 访问
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

module.exports = apiClient;
