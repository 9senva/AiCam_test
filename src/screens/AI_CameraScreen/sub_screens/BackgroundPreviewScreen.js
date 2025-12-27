import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { startImageGeneration, getGenerationStatus } from '../../../services/api';


/**
 * 用于测试等待时间的简单 Hook
 */
const useTimer = () => {
  const [timer, setTimer] = useState(0);
  const timerRef = React.useRef(null);

  const startTimer = () => {
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimer(0);
  };

  // 自动清理
  React.useEffect(() => {
    return () => stopTimer();
  }, []);

  return { timer, startTimer, stopTimer, resetTimer };
};

/**
 * 拍照后预览照片与上传后端的页面
 * 
 * @param {{ navigation: object, route: object }} props
 * - route.params.photoUri: 拍摄的照片的本地 URI
 */
export default function BackgroundPreviewScreen({ navigation, route }) {
  const { photoUri } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // 使用抽离的计时 Hook
  const { timer, startTimer, stopTimer } = useTimer();

  // 返回拍照界面
  const handleRetake = () => {
    if (loading) return; // 防止在加载时误操作
    navigation.goBack();
  };

  /**
   * 轮询任务状态直到完成或失败
   * @param {string} taskId - 要查询的任务ID
   * @returns {Promise<object>} - 成功时返回最终的任务结果
   */
  const pollForResult = (taskId) => {
    const POLLING_INTERVAL = 3000;
    return new Promise((resolve, reject) => {
      setStatusMessage('AI 正在接收指令...');

      // 启动计时器
      startTimer();

      const intervalId = setInterval(async () => {
        try {
          const response = await getGenerationStatus(taskId);
          // 状态更新为更温和的提示
          setStatusMessage('AI 正在构想中，请耐心等待...');

          if (response.status === 'completed') {
            clearInterval(intervalId);
            stopTimer(); // 停止计时
            resolve(response.result);
          } else if (response.status === 'failed') {
            clearInterval(intervalId);
            stopTimer(); // 停止计时
            reject(new Error(response.error || '任务处理失败'));
          }
        } catch (error) {
          clearInterval(intervalId);
          stopTimer(); // 停止计时
          reject(error);
        }
      }, POLLING_INTERVAL);
    });
  };

  // 使用这张照片（上传并开始 AI 处理）
  const handleUsePhoto = async () => {
    if (!photoUri) return;

    setLoading(true);
    setStatusMessage('正在整理拍摄素材...');

    try {
      // 1. 处理 URI 路径 (适配 Android)
      const cleanUri = Platform.OS === 'android' ? photoUri.replace('file://', '') : photoUri;
      const finalUri = Platform.OS === 'android' ? `file://${cleanUri}` : photoUri;

      const backgroundImage = {
        uri: finalUri,
        name: photoUri.split('/').pop() || 'photo.jpg',
        type: 'image/jpeg',
      };

      // 1. 上传图片并启动任务
      setStatusMessage('正在上传云端...');
      const startResponse = await startImageGeneration(backgroundImage);
      const { task_id } = startResponse;

      if (!task_id) {
        throw new Error('服务器未能成功启动任务。');
      }

      // 2. 轮询结果
      const finalResult = await pollForResult(task_id);

      // 3. 跳转到结果页
      setStatusMessage('作品完成！即将为您揭晓...');
      // 稍微延迟一点跳转，以便用户看到完成状态（可选）
      setTimeout(() => {
        if (Array.isArray(finalResult) && finalResult.length > 0 && typeof finalResult[0] === 'object' && finalResult[0] && finalResult[0].URL) {
          const generatedImageUrl = finalResult[0].URL;
          navigation.navigate('ImgGenerate', {
            templateImage: backgroundImage,
            generatedImageUrl: generatedImageUrl,
          });
        } else {
          // 更新错误信息，使其更具体
          throw new Error('服务器返回的结果格式不正确。期望一个对象数组，例如: [{URL: "..."}, ...]');
        }
      }, 500);

    } catch (error) {
      stopTimer(); // 确保出错时也停止计时
      const errorMessage = error.response?.data?.error || error.message || '发生未知错误';
      Alert.alert('操作失败', errorMessage);
      setStatusMessage(`错误: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!photoUri) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text style={styles.errorText}>没有可预览的照片。</Text>
            <TouchableOpacity onPress={handleRetake} style={styles.button}>
              <Text style={styles.buttonText}>返回</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground source={{ uri: photoUri }} style={styles.previewImage}>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>{statusMessage}</Text>
              {timer > 0 && <Text style={styles.timerText}>已等待: {timer} 秒</Text>}
            </View>
          )}

          {/* Bottom control bar */}
          {!loading && (
            <View style={styles.bottomBar}>
              {/* Bottom-left button for retaking (Back) */}
              <TouchableOpacity onPress={handleRetake} style={styles.backButton}>
                <Icon name="chevron-back" size={35} color="white" />
              </TouchableOpacity>

              {/* Bottom-center button for confirming */}
              <TouchableOpacity onPress={handleUsePhoto} style={styles.confirmButton}>
                <Icon name="checkmark" size={45} color="white" />
              </TouchableOpacity>

              {/* Placeholder for symmetry if needed, or just absolute positioning */}
              <View style={styles.placeholderButton} />
            </View>
          )}
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  previewImage: {
    flex: 1,
    justifyContent: 'flex-end', // Align children to bottom
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    color: '#ddd',
    marginTop: 8,
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)', // Optional: subtle background for better visibility
    paddingTop: 20,
  },
  backButton: {
    padding: 10,
  },
  confirmButton: {
    padding: 10,
    backgroundColor: '#007AFF', // Blue circle for confirm
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 55, // Approximate width of back button to keep confirm button centered if using space-between
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
