import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, Linking, AppState, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission, useCameraFormat } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { useImagePicker } from '../hook/useImagePicker';
import { useAIImageGenerator } from '../hook/useAIImageGenerator';

/**
 * BackgroundCameraScreen 组件
 * 
 * 这是一个使用 react-native-vision-camera 实现的自定义相机拍摄页面。
 * 主要功能包括：
 * 1. 实时预览相机画面
 * 2. 拍照功能
 * 3. 相册选择功能
 * 4. 完整的相机权限管理
 * 5. 应用状态监听
 */
const BackgroundCameraScreen = ({ navigation }) => {
    // 获取相机权限状态和请求权限的方法
    const { hasPermission, requestPermission } = useCameraPermission();

    // AI 生成 Hook
    const { loading, statusMessage, generateImage } = useAIImageGenerator();

    // 处理图片选择后的逻辑 (复用 AI 生成逻辑)
    const handleImageSelection = async (image) => {
        if (!image || !image.uri) return;

        try {
            const result = await generateImage(image.uri);
            if (result) {
                navigation.navigate('ImgGenerate', {
                    templateImage: result.templateImage,
                    generatedImageUrl: result.generatedImageUrl,
                });
            }
        } catch (error) {
            console.log('Gallery image generation failed:', error);
            // 错误已在 Hook 中 alert
        }
    };

    // 相册选择 Hook
    const { pickImage } = useImagePicker(handleImageSelection);

    // 获取页面聚焦状态
    const isFocused = useIsFocused();
    // 获取应用前后台状态
    const [appState, setAppState] = React.useState(AppState.currentState);

    // 获取当前设备上的相机设备
    const device = useCameraDevice('back');

    // 获取最佳相机格式（优先保证拍照功能）
    const format = useCameraFormat(device, [
        { photo: true }
    ]);

    // 调试：监听设备获取情况
    React.useEffect(() => {
        if (device) {
            console.log('Camera Device found:', device.id, device.name);
        } else {
            console.log('No back camera device found');
        }
    }, [device]);

    // 创建相机引用，用于调用拍照等方法
    const cameraRef = useRef(null);

    // 相机错误处理
    const onCameraError = React.useCallback((error) => {
        console.error('Camera Runtime Error:', error);
        Alert.alert('相机错误', `启动相机失败: ${error.message}`);
    }, []);

    // 相机初始化完成
    const onCameraInitialized = React.useCallback(() => {
        console.log('Camera Session Initialized!');
    }, []);

    /**
     * 监听应用状态变化 (AppState)
     */
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            setAppState(nextAppState);
            // 如果应用回到前台 (active) 且当前仍未获取权限
            if (nextAppState === 'active' && !hasPermission) {
                await requestPermission();
            }
        });
        // 组件卸载时移除监听
        return () => subscription.remove();
    }, [hasPermission, requestPermission]);

    // 计算相机是否应该处于激活状态
    // 只有当页面被聚焦 (isFocused) 且 应用在前台 (active) 时才激活相机
    const isActive = isFocused && appState === 'active';


    /**
     * 拍照处理函数
     * 
     * 调用相机的 takePhoto 方法进行拍摄。
     * 配置了优先速度、关闭闪光灯和静音快门（如果设备支持）。
     */
    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                // 执行拍照
                const photo = await cameraRef.current.takePhoto({
                    qualityPrioritization: 'speed', // 优先拍摄速度
                    flash: 'off',                   // 关闭闪光灯
                    enableShutterSound: false       // 尝试关闭快门声音
                });
                // 确保路径以 file:// 开头（Android 需要）
                const photoPath = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;

                // 导航到预览页面，并传递照片的 URI
                navigation.navigate('BackgroundPreview', { photoUri: photoPath });
            } catch (error) {
                console.error('Failed to take picture: ', error);
                Alert.alert('拍照失败', '无法完成拍照，请稍后重试。');
            }
        }
    };

    /**
     * 手动请求权限处理函数
     * 
     * 当用户点击授权按钮时调用。
     * 如果首次请求被拒绝，弹出提示框引导用户去系统设置手动开启。
     */
    const handlePermissionRequest = async () => {
        const granted = await requestPermission();
        if (!granted) {
            Alert.alert(
                '权限请求',
                '我们需要相机权限来拍照。请在设置中开启权限。',
                [
                    { text: '取消', style: 'cancel' },
                    { text: '去设置', onPress: () => Linking.openSettings() }, // 跳转到应用设置页
                ]
            );
        }
    };

    // 渲染逻辑 1: 如果没有相机权限，显示授权提示页面
    if (!hasPermission) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>应用需要您的授权才能使用相机功能。</Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={handlePermissionRequest}>
                        <Text style={styles.permissionButtonText}>授权相机</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // 渲染逻辑 2: 如果未找到可用的相机设备（例如加载中或设备不支持），显示提示
    if (device == null) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>未找到可用的相机设备。</Text>
            </View>
        );
    }

    // 渲染逻辑 3: 显示相机预览和拍照控制 UI
    return (
        <View style={styles.container}>
            {/* 全屏相机预览组件 */}
            <Camera
                ref={cameraRef}
                style={styles.camera} // 使用 flex 布局替代 absoluteFill
                device={device}                 // 指定使用的摄像头设备
                format={format}                 // 指定相机格式
                isActive={isActive}             // 激活相机流
                photo={true}                    // 启用拍照功能
                video={false}                   // 明确禁用视频
                audio={false}                   // 明确禁用音频
                onError={onCameraError}         // 错误监听
                onInitialized={onCameraInitialized} // 初始化监听
            />
            {/* 底部控制栏 */}
            <View style={styles.bottomControls}>
                {/* 相册按钮 - 左侧 */}
                <TouchableOpacity onPress={pickImage} style={styles.galleryButton} disabled={loading}>
                    <Icon name="images-outline" size={28} color="#fff" />
                </TouchableOpacity>

                {/* 拍照按钮 - 中间 */}
                <TouchableOpacity onPress={takePicture} style={styles.captureBtn} disabled={loading}>
                    <View style={styles.captureBtnInner} />
                </TouchableOpacity>

                {/* 右侧占位，保持布局平衡 */}
                <View style={styles.galleryButtonPlaceholder} />
            </View>

            {/* 加载遮罩 */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>{statusMessage}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        // 移除居中对齐，避免干扰 Camera 的 flex 布局
    },
    camera: {
        flex: 1, // 占满剩余空间
    },
    permissionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    permissionButtonText: {
        color: '#000',
        fontSize: 16,
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-between', // 改为两端对齐
        alignItems: 'center', // 垂直居中
        paddingVertical: 30,
        paddingHorizontal: 40, // 增加水平内边距
        backgroundColor: 'rgba(0, 0, 0, 1)',
    },
    galleryButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    galleryButtonPlaceholder: {
        width: 50,
        height: 50,
    },
    captureBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    captureBtnInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingText: {
        color: 'white',
        marginTop: 10,
        fontSize: 16,
    },
});

export default BackgroundCameraScreen;
