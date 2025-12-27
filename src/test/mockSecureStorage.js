/**
 * 模拟 SecureStorage - 用于 Node.js 测试环境。
 * 它移除了对 'react-native-keychain' 的依赖。
 */

/**
 * 模拟 getValueFor 函数。
 * 在测试环境中，我们通常不需要真实的 token，所以直接返回 null，
 * 模拟一个未登录或没有保存 token 的场景。
 * @param {string} key - 要获取的键（在此模拟中未使用）。
 * @returns {Promise<null>} - 总是返回一个解析为 null 的 Promise。
 */
export const getValueFor = async (key) => {
    console.log(`[Mock] 调用了 secureStorage.getValueFor('${key}')，返回 null。`);
    return null;
};

// 如果原始文件中有其他函数，也可以在这里添加它们的模拟版本
// export const save = async (key, value) => { ... };
// export const deleteItemFor = async (key) => { ... };
