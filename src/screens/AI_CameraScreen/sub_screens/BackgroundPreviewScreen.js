import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAIImageGenerator } from '../hook/useAIImageGenerator';


/**
 * 拍照后预览照片与上传后端的页面
 * 
 * @param {{ navigation: object, route: object }} props
 * - route.params.photoUri: 拍摄的照片的本地 URI
 */
export default function BackgroundPreviewScreen({ navigation, route }) {
  const { photoUri } = route.params || {};

  // 使用封装的 AI 生成 Hook
  const { loading, statusMessage, timer, generateImage } = useAIImageGenerator();

  // 返回拍照界面
  const handleRetake = () => {
    if (loading) return; // 防止在加载时误操作
    navigation.goBack();
  };

  // 使用这张照片（上传并开始 AI 处理）
  const handleUsePhoto = async () => {
    if (!photoUri) return;

    try {
      const result = await generateImage(photoUri);
      if (result) {
        navigation.navigate('ImgGenerate', {
          templateImage: result.templateImage,
          generatedImageUrl: result.generatedImageUrl,
        });
      }
    } catch (error) {
      // 错误已在 Hook 中处理（Alert），此处无需额外操作
      console.log('Generation failed:', error);
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
        </ImageBackground>

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
    paddingVertical: 30,
    backgroundColor: 'rgba(0, 0, 0, 1)',
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
