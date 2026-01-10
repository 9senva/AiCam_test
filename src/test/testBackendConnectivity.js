const apiClient = require('./testApiClient.js');

/**
 * 测试后端连通性脚本
 */
const testConnectivity = async () => {
    console.log('--- 开始测试后端连通性 ---');
    console.log(`目标服务器: ${apiClient.defaults.baseURL}`);

    try {
        // 尝试访问根路径或一个不需要认证的健康检查接口
        // 这里假设 /docs 或 /openapi.json 或 根路径 / 存在，或者直接尝试一个简单的 API
        // 如果没有专门的 health check，通常访问 base url 或者 api root 可能会返回 404 但说明连接成功，或者 200
        // 我们尝试访问一个大概率存在的路径，或者直接捕获连接错误
        
        // 尝试 GET 请求
        // 注意：如果 baseURL 包含 /api/v1，这里请求 '/' 就是请求 /api/v1/
        const response = await apiClient.get('/'); 
        
        console.log('连接成功！服务器返回数据：');
        console.log(JSON.stringify(response, null, 2));
        console.log('--- 测试通过 ---');

    } catch (error) {
        if (error.response) {
            // 服务器有响应，只是状态码不是 2xx
            console.log(`连接成功，但服务器返回错误状态码: ${error.response.status}`);
            console.log('响应数据:', error.response.data);
            console.log('--- 测试通过 (服务器可达) ---');
        } else if (error.request) {
            // 请求发出但没有收到响应 (网络问题)
            console.error('连接失败: 无法连接到服务器。请检查网络或服务器状态。');
            console.error('错误信息:', error.message);
            console.log('--- 测试失败 ---');
        } else {
            // 其他错误
            console.error('发生错误:', error.message);
            console.log('--- 测试失败 ---');
        }
    }
};

testConnectivity();
