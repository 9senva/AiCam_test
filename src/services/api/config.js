/**
 * API 配置文件
 * 
 * 此文件集中管理 API 相关的基础配置，方便在不同环境间切换和维护。
 */
export const API_CONFIG = {
  // 开发阶段，带有基本认证信息的 API 服务器地址
  // 注意：React Native 中不应使用 https 模块的 Agent 来忽略证书，需在原生层配置
  BASE_URL: 'http://60.205.143.96/api/v1',

  // 请求超时时间（毫秒），默认 15 秒
  TIMEOUT: 15000,
};

// 移除 CommonJS 导出，保持 ES Module 风格
