import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions,
    Modal,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import ImageResizer from 'react-native-image-resizer';

const { width } = Dimensions.get('window');
const IMAGE_MARGIN = 20;
const IMAGE_WIDTH = width - (IMAGE_MARGIN * 2);

import { analyzeImage } from '../../../services/api';
import { useImageCompression } from '../hook/useImageCompression';

/**
 * 图片生成结果展示页面
 * 
 * @param {{ navigation: object, route: object }} props
 * - route.params.templateImage: 用户选择的模板图信息 { uri, text }
 * - route.params.generatedImageUrl: AI 生成的图片 URL
 */
export default function ImgGenerateScreen({ navigation, route }) {
    // 从导航参数获取数据，并提供默认值以防出错
    const { templateImage, generatedImageUrl } = route.params || {};
    const [modalVisible, setModalVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // 使用 hook
    const { compressImage } = useImageCompression();

    // 确认并跳转到 PoseCamera
    const handleConfirm = async () => {
        setModalVisible(false);
        setIsProcessing(true);

        try {
            console.log('1. 开始处理图片流程，原始地址:', generatedImageUrl);

            // 使用 useImageCompression 压缩图片至 80% 质量
            // 此步骤同时也起到了将远程 URL 下载为本地文件的作用
            const compressedUri = await compressImage(generatedImageUrl, 80);

            console.log('2. 图片压缩/下载完成，本地地址:', compressedUri);

            // 检查是否成功转换为本地路径
            if (compressedUri.startsWith('http')) {
                throw new Error('图片下载或压缩失败，未能生成本地缓存文件');
            }

            // 添加 500ms 延时，确保文件写入完成并释放系统锁，避免 Network Error
            await new Promise(resolve => setTimeout(resolve, 500));

            const imageFile = {
                uri: compressedUri,
                name: 'compressed_image.jpg',
                type: 'image/jpeg',
            };

            console.log('3. 准备调用 API 上传...');
            // 调用后端 API 获取动作指导
            const analysisResult = await analyzeImage(imageFile);
            console.log('收到 API 处理结果:', analysisResult);

            // 跳转到 PoseCamera，并传递当前背景图的 URI 和 API 处理结果
            // 建议传递本地缓存的 URI，加载更快且稳定
            navigation.navigate('PoseCamera', {
                backgroundUri: compressedUri,
                apiResult: {
                    success: true,
                    data: {
                        suggestions: [
                            analysisResult.head && `${analysisResult.head}`,
                            analysisResult.upper && `${analysisResult.upper}`,
                            analysisResult.lower && `${analysisResult.lower}`
                        ].filter(Boolean)
                    }
                }
            });

        } catch (error) {
            console.error('Image processing failed:', error);
            if (error.response) {
                // 请求已发出，服务器以状态码响应
                console.error('Data:', error.response.data);
                console.error('Status:', error.response.status);
                console.error('Headers:', error.response.headers);
            } else if (error.request) {
                // 请求已发出但未收到响应
                console.error('Request:', error.request);
                // 在 React Native 中，Network Error 通常在这里
                // 可能是 SSL 证书问题（IP直连 HTTPS）或网络不可达
            } else {
                console.error('Error Message:', error.message);
            }

            // 即使失败，也允许用户进入相机，只是没有指导或使用默认指导
            Alert.alert(
                '提示',
                '无法获取智能动作指导，将使用默认模式进入相机。\n(如为开发环境，请检查 SSL 证书或网络连接)',
                [
                    {
                        text: '重试',
                        onPress: () => handleConfirm()
                    },
                    {
                        text: '直接进入',
                        onPress: () => {
                            navigation.navigate('PoseCamera', {
                                backgroundUri: generatedImageUrl,
                                // 不传 apiResult，让 PoseCamera 使用默认值
                            });
                        }
                    }
                ]
            );
        } finally {
            setIsProcessing(false);
        }
    };

    // 渲染图片，如果 URI 无效则显示占位符
    const renderImage = (uri, isTemplate = false) => {
        if (uri) {
            return (
                <Image
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="cover"
                />
            );
        }
        return (
            <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>
                    {isTemplate ? '模板图加载失败' : 'AI 生成的图片'}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.container}>
                    {/* 生成图区域 */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => generatedImageUrl && setModalVisible(true)}
                    >
                        <View style={styles.imageContainer}>
                            {renderImage(generatedImageUrl)}
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                {/* 图片放大弹窗 */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    >
                        {generatedImageUrl ? (
                            <Image
                                source={{ uri: generatedImageUrl }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                        ) : null}

                        {/* 确认按钮 */}
                        <TouchableOpacity
                            style={styles.modalConfirmButton}
                            onPress={handleConfirm}
                        >
                            <Icon name="checkmark-circle" size={60} color="white" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>

                {/* Loading Overlay */}
                {isProcessing && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>正在处理...</Text>
                    </View>
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        alignItems: 'center',
        padding: IMAGE_MARGIN,
    },
    imageContainer: {
        width: IMAGE_WIDTH,
        aspectRatio: 3 / 4, // 保持图片比例
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden', // 确保子元素不会超出圆角
        backgroundColor: '#f0f0f0', // 占位符背景色
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e9e9e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#aaa',
        fontSize: 16,
    },
    textOverlay: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    imageText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.3)', // 半透明背景以增强可读性
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden', // 确保背景不会超出圆角
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: width,
        height: '80%',
    },
    modalConfirmButton: {
        marginTop: 20,
        padding: 10,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    loadingText: {
        color: 'white',
        marginTop: 15,
        fontSize: 16,
        fontWeight: '600',
    },
});
