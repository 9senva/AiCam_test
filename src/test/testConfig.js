/**
 * Node.js 测试环境专用的 API 配置文件
 * 复制自 src/services/api/config.js 并转换为 CommonJS
 */
const API_CONFIG = {
    // 开发阶段，带有基本认证信息的 API 服务器地址
    BASE_URL: 'https://60.205.143.96:443/api/v1',

    // 请求超时时间（毫秒），默认 15 秒
    TIMEOUT: 15000,
};

module.exports = { API_CONFIG };
