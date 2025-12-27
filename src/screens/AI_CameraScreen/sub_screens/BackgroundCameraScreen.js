import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, Linking, AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

/**
 * BackgroundCameraScreen 组件
 * 
 * 这是一个使用 react-native-vision-camera 实现的自定义相机拍摄页面。
 * 主要功能包括：
 * 1. 实时预览相机画面
 * 2. 拍照功能
 * 3. 完整的相机权限管理（请求、跳转设置）
 * 4. 应用状态监听（从设置返回时自动重新检查权限，以及控制相机激活状态）
 */
const BackgroundCameraScreen = ({ navigation }) => {
    // 获取相机权限状态和请求权限的方法
    const { hasPermission, requestPermission } = useCameraPermission();

    // 获取页面聚焦状态
    const isFocused = useIsFocused();
    // 获取应用前后台状态
    const [appState, setAppState] = React.useState(AppState.currentState);

    // 获取当前设备上的相机设备
    const device = useCameraDevice('back');

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
                isActive={isActive}             // 激活相机流
                photo={true}                    // 启用拍照功能
                video={false}                   // 明确禁用视频
                audio={false}                   // 明确禁用音频
                pixelFormat="yuv"               // 强制使用 yuv 格式，提升模拟器兼容性
                onError={onCameraError}         // 错误监听
                onInitialized={onCameraInitialized} // 初始化监听
            />
            {/* 底部控制栏 */}
            <View style={styles.bottomControls}>
                <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
                    <View style={styles.captureBtnInner} />
                </TouchableOpacity>
            </View>
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // 半透明黑色背景，增加按钮对比度
    },
    captureBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.7)', // 半透明白色边框
    },
    captureBtnInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
});

export default BackgroundCameraScreen;
