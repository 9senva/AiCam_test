import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, Linking, AppState } from 'react-native';
import { Camera, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';

const BackgroundCameraScreen = ({ navigation }) => {
    const { hasPermission, requestPermission } = useCameraPermission();
    const devices = useCameraDevices();
    const device = devices.back;
    const cameraRef = useRef(null);

    // Handle app state changes to re-check permissions if user grants them in settings
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            if (nextAppState === 'active' && !hasPermission) {
                await requestPermission();
            }
        });
        return () => subscription.remove();
    }, [hasPermission, requestPermission]);


    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePhoto({
                    qualityPrioritization: 'speed',
                    flash: 'off',
                    enableShutterSound: false
                });
                console.log('Picture taken: ', photo.path);
                // The photo path is temporary, if you want to use it later, you need to move it.
                // For example, using react-native-fs
                // navigation.navigate('Editor', { imageUri: 'file://' + photo.path });
            } catch (error) {
                console.error('Failed to take picture: ', error);
                Alert.alert('拍照失败', '无法完成拍照，请稍后重试。');
            }
        }
    };

    const handlePermissionRequest = async () => {
        const granted = await requestPermission();
        if (!granted) {
            Alert.alert(
                '权限请求',
                '我们需要相机权限来拍照。请在设置中开启权限。',
                [
                    { text: '取消', style: 'cancel' },
                    { text: '去设置', onPress: () => Linking.openSettings() },
                ]
            );
        }
    };

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

    if (device == null) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>未找到可用的相机设备。</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
            />
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
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
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

export default BackgroundCameraScreen;
