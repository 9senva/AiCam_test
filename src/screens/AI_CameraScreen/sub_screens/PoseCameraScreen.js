import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, Linking, AppState, Image } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission, useCameraFormat } from 'react-native-vision-camera';
import PoseGuideOverlay from '../Common/PoseGuideOverlay';

/**
 * PoseCameraScreen 组件
 * 
 * 这是一个专用于 Pose 拍摄的相机页面。
 * 主要功能包括：
 * 1. 实时预览相机画面
 * 2. 接收并展示 Pose 叠加层数据 (预留 API)
 * 3. 基础拍照功能 (仅保存/返回照片，不涉及后台 AI 处理)
 */
const PoseCameraScreen = ({ navigation, route }) => {
    // 获取相机权限状态和请求权限的方法
    const { hasPermission, requestPermission } = useCameraPermission();

    // 预留 Pose 数据状态
    const [poseOverlayData, setPoseOverlayData] = useState(null);

    // 动作指导文本数据 (默认值)
    const [guideTexts, setGuideTexts] = useState([
        '正在获取动作指导...',
    ]);

    // 监听路由参数，如果有 API 传入的指导数据则更新
    useEffect(() => {
        const apiData = route.params?.apiResult?.data;
        if (apiData && Array.isArray(apiData.suggestions) && apiData.suggestions.length > 0) {
            setGuideTexts(apiData.suggestions);
        } else {
            // 如果没有传入数据，则显示失败提示
            setGuideTexts([
                '指导文本获取失败',
                '请检查网络或稍后重试'
            ]);
        }
    }, [route.params]);

    // 模拟接收 Pose 数据的 API (预留)
    useEffect(() => {
        const fetchPoseData = async () => {
            try {
                // TODO: 替换为实际的 API 调用
                // const data = await api.getPoseOverlay();
                // setPoseOverlayData(data);
                console.log('PoseCameraScreen: Waiting for Pose Overlay Data...');
            } catch (error) {
                console.error('Failed to fetch pose data:', error);
            }
        };

        fetchPoseData();
    }, []);

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

                const photoPath = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
                console.log('Photo taken:', photoPath);

                // TODO: 处理拍照结果，例如跳转到预览页或返回上一页
                // navigation.navigate('PosePreview', { photoUri: photoPath });
                Alert.alert('拍照成功', `图片已保存至: ${photoPath}`);

            } catch (error) {
                console.error('Failed to take picture: ', error);
                Alert.alert('拍照失败', '无法完成拍照，请稍后重试。');
            }
        }
    };

    /**
     * 手动请求权限处理函数
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
                style={styles.camera}
                device={device}
                format={format}
                isActive={isActive}
                photo={true}
                video={false}
                audio={false}
                onError={onCameraError}
                onInitialized={onCameraInitialized}
            />

            {/* Pose 叠加层 (示例) */}
            {poseOverlayData && (
                <View style={styles.overlayContainer} pointerEvents="none">
                    {/* TODO: 根据 poseOverlayData 渲染叠加层 */}
                    <Text style={{ color: 'red' }}>Pose Overlay Placeholder</Text>
                </View>
            )}

            {/* 动作指导悬浮窗 */}
            <PoseGuideOverlay guideTexts={guideTexts} />

            {/* 底部控制栏 */}
            <View style={styles.bottomControls}>
                {/* 左侧占位 */}
                <View style={styles.sideButtonPlaceholder} />

                {/* 拍照按钮 - 中间 */}
                <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
                    <View style={styles.captureBtnInner} />
                </TouchableOpacity>

                {/* 右侧占位 */}
                <View style={styles.sideButtonPlaceholder} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 40,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        zIndex: 50, // 提高层级，确保在 PoseGuideOverlay 之上
    },
    sideButtonPlaceholder: {
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
});

export default PoseCameraScreen;
