import { useCallback } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { Alert } from 'react-native';

/**
 * 相册选择 Hook
 * 
 * 封装了从系统相册选择图片的逻辑
 * @param {Function} onImageSelected - 图片选择成功后的回调函数，参数为 { uri, type, name }
 */
export const useImagePicker = (onImageSelected) => {
    
    const pickImage = useCallback(async () => {
        const options = {
            mediaType: 'photo',
            selectionLimit: 1, // 仅限一张
            quality: 1.0,      // 原图质量，后续由压缩模块处理
            includeBase64: false,
        };

        try {
            const result = await launchImageLibrary(options);

            if (result.didCancel) {
                console.log('User cancelled image picker');
            } else if (result.errorCode) {
                console.error('ImagePicker Error: ', result.errorMessage);
                Alert.alert('错误', '无法打开相册，请检查权限。');
            } else if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (onImageSelected) {
                    onImageSelected({
                        uri: asset.uri,
                        type: asset.type,
                        name: asset.fileName || 'photo.jpg',
                    });
                }
            }
        } catch (error) {
            console.error('PickImage Error:', error);
            Alert.alert('错误', '选择图片时发生未知错误。');
        }
    }, [onImageSelected]);

    return { pickImage };
};
