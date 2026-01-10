/**
 * 模拟 SecureStorage - 用于 Node.js 测试环境。
 * CommonJS 版本
 */

/**
 * 模拟 getValueFor 函数。
 */
const getValueFor = async (key) => {
    // console.log(`[Mock] 调用了 secureStorage.getValueFor('${key}')，返回 null。`);
    return null;
};

module.exports = { getValueFor };
