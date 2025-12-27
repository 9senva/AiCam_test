/**
 * Node.js 测试脚本，用于测试异步图像生成 API。
 *
 * 注意：此脚本在 Node.js 环境中运行，而不是 React Native。
 * 因此，它不能直接复用 `startImageGeneration` 函数，因为该函数是为 RN 的文件对象设计的。
 * 相反，我们直接使用 `apiClient` 和 `form-data` 库来模拟文件上传，这是在 Node.js 中测试此类功能的标准方法。
 */
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { default: apiClient } = require('./testApiClient.js'); // <-- 修改点：使用测试专用的 API Client
const { getGenerationStatus } = require('../services/api/AIGenerateImage.js'); // 复用状态查询函数

// --- 配置 ---
// 确保此路径下有一个用于测试的图片文件
const TEST_IMAGE_PATH = path.resolve(__dirname, 'OIP.webp');
const POLLING_INTERVAL = 3000; // 轮询间隔（毫秒）

/**
 * 轮询任务状态直到完成或失败
 * @param {string} taskId - 要查询的任务ID
 * @returns {Promise<object>} - 成功时返回最终的任务结果
 */
const pollForResult = (taskId) => {
    return new Promise((resolve, reject) => {
        console.log(`[Polling] 开始轮询任务 ${taskId}，每 ${POLLING_INTERVAL / 1000} 秒一次...`);

        const intervalId = setInterval(async () => {
            try {
                const response = await getGenerationStatus(taskId);
                console.log(`[Polling] 当前状态: ${response.status}`);

                if (response.status === 'completed') {
                    clearInterval(intervalId);
                    console.log('[Polling] 任务完成！');
                    resolve(response.result);
                } else if (response.status === 'failed') {
                    clearInterval(intervalId);
                    console.error(`[Polling] 任务失败: ${response.error}`);
                    reject(new Error(response.error));
                }
                // 如果是 'pending' 或 'processing'，则继续轮询
            } catch (error) {
                clearInterval(intervalId);
                console.error('[Polling] 轮询过程中发生错误:', error.message);
                reject(error);
            }
        }, POLLING_INTERVAL);
    });
};

/**
 * 主测试函数
 */
const runTest = async () => {
    console.log('--- 开始异步图像生成 API 测试 ---');

    // 检查测试图片是否存在
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
        console.error(`\n错误：测试图片未找到！`);
        const dir = path.dirname(TEST_IMAGE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(TEST_IMAGE_PATH, '请在这里替换为一个真实的图片文件，例如 test-image.png');
        console.error(`请在以下路径放置一个测试图片: ${TEST_IMAGE_PATH}\n`);
        return;
    }

    try {
        // --- 步骤 1: 启动生成任务 ---
        console.log('[Step 1] 正在上传图片以启动任务...');
        const form = new FormData();
        form.append('background_image', fs.createReadStream(TEST_IMAGE_PATH));

        const startResponse = await apiClient.post('/async-generate/start', form, {
            headers: {
                ...form.getHeaders(), // form-data 库会自动计算 Content-Type 和 Content-Length
            },
        });

        const { task_id } = startResponse;
        if (!task_id) {
            throw new Error('服务器未返回 task_id');
        }
        console.log(`[Step 1] 任务成功启动，Task ID: ${task_id}`);

        // --- 步骤 2: 轮询结果 ---
        console.log('\n[Step 2] 开始轮询任务状态...');
        const finalResult = await pollForResult(task_id);

        console.log('\n--- 测试成功 ---');
        console.log('最终结果:', finalResult);
        console.log('生成的图片 URL:', finalResult.URL);

    } catch (error) {
        console.error('\n--- 测试失败 ---');
        if (error.response) {
            // Axios 错误
            console.error(`HTTP 状态: ${error.response.status}`);
            console.error('响应数据:', error.response.data);
        } else {
            console.error('错误详情:', error.message);
        }
    }
};

// 运行测试
runTest();
