const apiClient = require('./testApiClient.js');
const FormData = require('form-data');
const fs = require('fs');

/**
 * 启动一个异步的图像生成任务 (Node.js 测试版)。
 * @param {string} backgroundImagePath - 图片文件的本地路径。
 * @returns {Promise<{task_id: string}>} - 返回一个包含任务ID的 Promise。
 */
const startImageGeneration = (backgroundImagePath) => {
    const formData = new FormData();

    // Node.js 环境下使用 fs.createReadStream
    formData.append('background_image', fs.createReadStream(backgroundImagePath));

    return apiClient.post('/ai/async-generate/start', formData, {
        headers: {
            ...formData.getHeaders(), // 必须合并 form-data 生成的 headers (包含 boundary)
        },
    });
};

/**
 * 查询指定任务的状态和结果。
 * @param {string} taskId - 启动任务时获取的 task_id。
 * @returns {Promise<{status: string, result?: {URL: string}, error?: string}>} - 返回任务状态的 Promise。
 */
const getGenerationStatus = (taskId) => {
    return apiClient.get(`/ai/async-generate/status/${taskId}`);
};

module.exports = {
    startImageGeneration,
    getGenerationStatus
};
