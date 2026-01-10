import apiClient from './client';

/**
 * 图像分析 API
 * 
 * 对应后端 /api/v1/ai/analyze-image 接口
 */

/**
 * 上传图片进行 AI 分析
 * @param {{uri: string, name: string, type: string}} imageFile - 从 React Native 图片选择器获取的文件对象
 * @returns {Promise<{head: string, upper: string, lower: string}>} - 返回包含头部、上身、下身分析结果的对象
 */
export const analyzeImage = async (imageFile) => {
    const formData = new FormData();

    // 构建 FormData
    // 注意：React Native 中上传文件需要包含 uri, name, type
    formData.append('file', {
        uri: imageFile.uri,
        name: imageFile.name || 'photo.jpg',
        type: imageFile.type || 'image/jpeg',
    });

    console.log('正在调用 analyzeImage API (Axios)...');
    console.log('File URI:', imageFile.uri);

    // 参照 AIGenerateImage.js 的写法，但添加 Connection: close 以避免连接复用问题
    return apiClient.post('/ai/analyze-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            // 尝试禁用连接复用，解决 Android 上偶发的 Network Error
            'Connection': 'close',
        },
        timeout: 60000,
    });
};
