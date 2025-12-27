import apiClient from './client';

/**
 * 启动一个异步的图像生成任务。
 * @param {{uri: string, name: string, type: string}} backgroundImage - 从 React Native 图片选择器获取的文件对象。
 * @returns {Promise<{task_id: string}>} - 返回一个包含任务ID的 Promise。
 */
export const startImageGeneration = (backgroundImage) => {
    const formData = new FormData();

    // 为 React Native 的文件对象构建 FormData
    formData.append('background_image', {
        uri: backgroundImage.uri,
        name: backgroundImage.name,
        type: backgroundImage.type,
    });

    return apiClient.post('/ai/async-generate/start', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * 查询指定任务的状态和结果。
 * @param {string} taskId - 启动任务时获取的 task_id。
 * @returns {Promise<{status: string, result?: {URL: string}, error?: string}>} - 返回任务状态的 Promise。
 */
export const getGenerationStatus = (taskId) => {
    return apiClient.get(`/ai/async-generate/status/${taskId}`);
};
