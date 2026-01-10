import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { startImageGeneration, getGenerationStatus } from '../../../services/api';
import { useImageCompression } from './useImageCompression';
import { useTimer } from './useTimer';

// 配置：压缩质量
const COMPRESSION_QUALITY = 90;

/**
 * AI 图片生成 Hook
 * 封装了图片压缩、上传、轮询任务状态的完整流程
 */
export const useAIImageGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    
    const { compressImage } = useImageCompression();
    const { timer, startTimer, stopTimer } = useTimer();

    /**
     * 轮询任务状态
     */
    const pollForResult = (taskId) => {
        const POLLING_INTERVAL = 3000;
        return new Promise((resolve, reject) => {
            setStatusMessage('AI 正在接收指令...');
            startTimer();

            const intervalId = setInterval(async () => {
                try {
                    const response = await getGenerationStatus(taskId);
                    setStatusMessage('AI 正在构想中，请耐心等待...');

                    if (response.status === 'completed') {
                        clearInterval(intervalId);
                        stopTimer();
                        resolve(response.result);
                    } else if (response.status === 'failed') {
                        clearInterval(intervalId);
                        stopTimer();
                        reject(new Error(response.error || '任务处理失败'));
                    }
                } catch (error) {
                    clearInterval(intervalId);
                    stopTimer();
                    reject(error);
                }
            }, POLLING_INTERVAL);
        });
    };

    /**
     * 生成图片主流程
     * @param {string} photoUri - 原始图片 URI
     * @returns {Promise<object>} - 返回 { generatedImageUrl, templateImage }
     */
    const generateImage = async (photoUri) => {
        if (!photoUri) return null;

        setLoading(true);
        setStatusMessage('正在整理拍摄素材...');

        try {
            // 1. 处理 URI (适配 Android)
            const cleanUri = Platform.OS === 'android' ? photoUri.replace('file://', '') : photoUri;
            let finalUri = Platform.OS === 'android' ? `file://${cleanUri}` : photoUri;

            // 2. 压缩
            setStatusMessage('正在优化图片...');
            try {
                const compressedUri = await compressImage(finalUri, COMPRESSION_QUALITY);
                if (compressedUri) {
                    console.log(`[Generator] Compressed image used: ${compressedUri}`);
                    finalUri = compressedUri;
                }
            } catch (err) {
                console.warn('[Generator] Compression skipped:', err);
            }

            const backgroundImage = {
                uri: finalUri,
                name: finalUri.split('/').pop() || 'photo.jpg',
                type: 'image/jpeg',
            };

            // 3. 上传并启动
            setStatusMessage('正在上传云端...');
            const startResponse = await startImageGeneration(backgroundImage);
            const { task_id } = startResponse;

            if (!task_id) throw new Error('服务器未能成功启动任务。');

            // 4. 轮询
            const finalResult = await pollForResult(task_id);

            // 5. 解析结果
            setStatusMessage('作品完成！即将为您揭晓...');
            
            // 稍微延迟以展示完成状态
            await new Promise(resolve => setTimeout(resolve, 500));

            if (Array.isArray(finalResult) && finalResult.length > 0 && finalResult[0]?.URL) {
                return {
                    generatedImageUrl: finalResult[0].URL,
                    templateImage: backgroundImage
                };
            } else {
                throw new Error('服务器返回的结果格式不正确。期望一个对象数组，例如: [{URL: "..."}, ...]');
            }

        } catch (error) {
            stopTimer(); // 确保出错时停止计时
            const errorMessage = error.response?.data?.error || error.message || '发生未知错误';
            Alert.alert('操作失败', errorMessage);
            setStatusMessage(`错误: ${errorMessage}`);
            // 抛出错误以便组件处理（如需要）
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        statusMessage,
        timer,
        generateImage
    };
};
