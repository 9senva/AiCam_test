const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const https = require('https');

// API 配置
const API_URL = 'http://60.205.143.96/api/v1/ai/analyze-image';
// 使用当前目录下存在的图片文件
const IMAGE_PATH = path.join(__dirname, '021767544104035aafb70253f86f133b2b849e439c9606431a827_0.jpeg');

async function testAnalyzeImage() {
    console.log('开始测试图像分析 API...');
    console.log(`API URL: ${API_URL}`);
    console.log(`测试图片: ${IMAGE_PATH}`);

    // 检查图片是否存在
    if (!fs.existsSync(IMAGE_PATH)) {
        console.error('错误: 找不到测试图片文件。请确保 d:\\MyAPP_v1\\src\\test\\OIP.jpg 存在。');
        return;
    }

    try {
        // 创建 FormData 对象
        const form = new FormData();

        // 添加图片文件
        // 注意：在 Node.js 环境中使用 form-data，需要传入文件流
        form.append('file', fs.createReadStream(IMAGE_PATH));

        // 移除文本描述字段，API 不再需要
        // const question = '识别图中的人物pose，用简短的几个字概括，直接返回pose名称即可';
        // form.append('text', question);
        // console.log(`请求文本: ${question}`);

        // 配置 axios 请求
        // 由于是 IP 地址且可能是自签名证书，忽略 SSL 验证
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
            httpsAgent: agent,
            // 增加超时时间，以防大模型处理较慢
            timeout: 30000
        });

        console.log('\n--- API 请求成功 ---');
        console.log('状态码:', response.status);
        const data = response.data;
        console.log('响应数据:', JSON.stringify(data, null, 2));

        if (data.head !== undefined) console.log('Head:', data.head);
        if (data.upper !== undefined) console.log('Upper:', data.upper);
        if (data.lower !== undefined) console.log('Lower:', data.lower);

    } catch (error) {
        console.error('\n--- API 请求失败 ---');
        if (error.response) {
            // 服务器返回了状态码，但超出了 2xx 范围
            console.error('状态码:', error.response.status);
            console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            // 请求已发出但没有收到响应
            console.error('未收到响应:', error.message);
        } else {
            // 设置请求时发生错误
            console.error('请求配置错误:', error.message);
        }
    }
}

testAnalyzeImage();
