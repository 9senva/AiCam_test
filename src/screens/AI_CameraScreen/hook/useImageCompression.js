import { useState, useCallback } from 'react';
import ImageResizer from 'react-native-image-resizer';
import { Image, Platform } from 'react-native';

/**
 * 图像压缩 Hook
 * 用于在上传前压缩图片画质（数据量）
 */
export const useImageCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false);

  /**
   * 压缩图片
   * @param {string} uri - 原始图片 URI
   * @param {number} quality - 压缩质量 (0-100)，默认 90 (大约减少 10% 数据量，具体取决于原图)
   * @returns {Promise<string>} - 压缩后的图片 URI
   */
  const compressImage = useCallback(async (uri, quality = 90) => {
    if (!uri) return uri;
    
    setIsCompressing(true);
    try {
        // 1. 获取原始尺寸，确保不改变分辨率，只改变画质
        const { width, height } = await new Promise((resolve, reject) => {
            Image.getSize(uri, (w, h) => resolve({ width: w, height: h }), (err) => reject(err));
        });

        // 2. 使用 ImageResizer 进行压缩
        // createResizedImage(uri, newWidth, newHeight, compressFormat, quality, rotation, outputPath, keepMeta, options)
        const response = await ImageResizer.createResizedImage(
            uri,
            width,
            height,
            'JPEG',
            quality,
            0, // rotation
            undefined, // outputPath (default to cache)
            false // keep meta
        );

        console.log(`[ImageCompression] Compressed: Quality=${quality}, Old=${uri}, New=${response.uri}, Size=${response.size}`);
        return response.uri;
    } catch (error) {
        console.error('[ImageCompression] Failed:', error);
        // 如果压缩失败，返回原图 URI，保证流程不中断
        return uri;
    } finally {
        setIsCompressing(false);
    }
  }, []);

  return { compressImage, isCompressing };
};
