import apiClient from './client';

/**
 * 认证相关 API
 * 
 * 包含登录、注册、注销、第三方登录（Google/Apple）及 Token 刷新等接口。
 */
export const authApi = {
  /**
   * 邮箱密码登录
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   * @returns {Promise} - 返回登录结果（通常包含 Token 和用户信息）
   */
  login: (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  /**
   * 注册新用户
   * @param {Object} userData - 用户注册数据（如邮箱、密码、昵称等）
   * @returns {Promise} - 返回注册结果
   */
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  /**
   * 注销当前用户
   * @returns {Promise} - 返回注销结果
   */
  logout: () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Google 登录
   * @param {string} token - Google 返回的 idToken
   * @returns {Promise} - 返回后端验证后的登录结果
   */
  googleLogin: (token) => {
    return apiClient.post('/auth/google', { token });
  },

  /**
   * Apple 登录
   * @param {string} identityToken - Apple 返回的 identityToken
   * @returns {Promise} - 返回后端验证后的登录结果
   */
  appleLogin: (identityToken) => {
    return apiClient.post('/auth/apple', { identityToken });
  },

  /**
   * 刷新 Access Token
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise} - 返回新的 Token 信息
   */
  refreshToken: (refreshToken) => {
    return apiClient.post('/auth/refresh-token', { refreshToken });
  }
};