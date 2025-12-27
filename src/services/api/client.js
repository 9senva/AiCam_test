/**
 * API 客户端封装
 * 
 * 本文件配置了一个 Axios 实例，包含全局的请求和响应拦截器。
 * 作用：统一处理 Token 注入、请求头配置、响应数据解包以及全局错误处理。
 */
import axios from 'axios';
import { API_CONFIG } from './config.js';
import { getValueFor } from '../storage/secureStorage';

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * 请求拦截器
 * 
 * 在发送请求之前自动执行。
 * 主要功能：从安全存储中获取用户 Token，如果存在则自动添加到 Authorization 请求头中。
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // 从 SecureStorage 获取 Token
      // 注意：Key 必须与登录时保存的 Key 一致 ('userToken')
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

/**
 * 响应拦截器
 * 
 * 在收到响应后自动执行。
 * 主要功能：
 * 1. 成功时：直接返回 response.data，简化调用方的代码。
 * 2. 失败时：统一处理 HTTP 状态码（如 401 未授权），并抛出错误供调用方进一步处理。
 */
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回数据部分，调用时无需再写 .data
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // TODO: 处理未授权访问（例如：重定向到登录页或尝试刷新 Token）
      console.warn('Unauthorized access - 401');
      // 如果您可以访问 Redux store，可以在这里 dispatch 登出 action
    } else if (status === 403) {
      console.warn('Forbidden access - 403');
    } else if (status === 500) {
      console.warn('Server error - 500');
    }

    // 将错误继续抛出，以便具体的 API 调用处可以捕获并处理
    return Promise.reject(error);
  }
);

export default apiClient;