import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { startImageGeneration, getGenerationStatus } from '../../services/api';

/**
 * AI 摄影页面（首页）
 * - 大按钮触发 AI 指导拍照（此处为占位逻辑）
 * - 下方展示历史图片（缩略图列表）
 */
export default function AICameraScreen({ navigation }) {
  // --- State Hooks ---
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedImageUrls, setGeneratedImageUrls] = useState([]);

  // 模拟历史图片数据（uri 为空表示占位）
  const history = [
    { id: '1', uri: null },
    { id: '2', uri: null },
  ];

  const renderThumb = ({ item }) => (
    <View style={styles.thumb}>
      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderText}>PNG</Text>
      </View>
    </View>
  );

  /**
   * 轮询任务状态直到完成或失败
   * @param {string} taskId - 要查询的任务ID
   * @returns {Promise<object>} - 成功时返回最终的任务结果
   */
  const pollForResult = (taskId) => {
    const POLLING_INTERVAL = 3000;
    return new Promise((resolve, reject) => {
      setStatusMessage('任务已启动，正在处理中...');
      const intervalId = setInterval(async () => {
        try {
          const response = await getGenerationStatus(taskId);
          setStatusMessage(`当前状态: ${response.status}`);

          if (response.status === 'completed') {
            clearInterval(intervalId);
            resolve(response.result);
          } else if (response.status === 'failed') {
            clearInterval(intervalId);
            reject(new Error(response.error || '任务处理失败'));
          }
        } catch (error) {
          clearInterval(intervalId);
          reject(error);
        }
      }, POLLING_INTERVAL);
    });
  };

  // --- 原有的导航逻辑（已注释） ---
  const onAICamPress = () => {
    navigation.navigate('BackgroundCamera');
  };

  // const onAICamPress = async () => {
  //   setLoading(true);
  //   setStatusMessage('正在准备测试图片...');

  //   try {
  //     // 1. 直接使用测试图片
  //     // 注意：RN打包机制要求 require 的路径是静态字符串
  //     const testImage = require('../../test/OIP.jpg');
  //     const imageAsset = Image.resolveAssetSource(testImage);

  //     const backgroundImage = {
  //       uri: imageAsset.uri,
  //       name: 'OIP.jpg',
  //       type: 'image/jpeg',
  //     };

  //     // 2. 上传图片并启动任务
  //     setStatusMessage('正在上传图片...');
  //     const startResponse = await startImageGeneration(backgroundImage);
  //     const { task_id } = startResponse;

  //     if (!task_id) {
  //       throw new Error('服务器未能成功启动任务。');
  //     }

  //     // 3. 轮询结果
  //     const finalResult = await pollForResult(task_id);

  //     // 4. 跳转到结果页
  //     setStatusMessage('图片生成成功！正在跳转...');
  //     if (Array.isArray(finalResult) && finalResult.length > 0 && typeof finalResult[0] === 'object' && finalResult[0] && finalResult[0].URL) {
  //       const generatedImageUrl = finalResult[0].URL;
  //       navigation.navigate('ImgGenerate', {
  //         templateImage: backgroundImage,
  //         generatedImageUrl: generatedImageUrl,
  //       });
  //     } else {
  //       // 更新错误信息，使其更具体
  //       throw new Error('服务器返回的结果格式不正确。期望一个对象数组，例如: [{URL: "..."}, ...]');
  //     }

  //   } catch (error) {
  //     const errorMessage = error.response?.data?.error || error.message || '发生未知错误';
  //     Alert.alert('操作失败', errorMessage);
  //     setStatusMessage(`错误: ${errorMessage}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>好看的旅行照，从会摆开始</Text>

        {/* AI 指导按钮 */}
        <TouchableOpacity
          style={[styles.aiButton, loading && styles.disabledButton]}
          onPress={onAICamPress}
          disabled={loading}
        >
          <Text style={styles.aiButtonText}>AI 指导拍照</Text>
        </TouchableOpacity>

        {/* 加载和状态显示区域 */}
        {loading && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        {/* 结果显示区域 */}
        {generatedImageUrls.length > 0 && !loading && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>生成结果:</Text>
            {generatedImageUrls.map((url, index) => (
              <Image key={index} source={{ uri: url }} style={styles.resultImage} />
            ))}
          </View>
        )}

        <Text style={styles.historyTitle}>History</Text>
        <FlatList
          data={history}
          keyExtractor={(i) => i.id}
          renderItem={renderThumb}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.historyList}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, flex: 1 },
  title: { fontSize: 16, marginTop: 30, marginBottom: 30, textAlign: 'center' },
  aiButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 24,
  },
  aiButtonText: { fontSize: 18, color: '#333' },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#dcdcdc',
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  resultContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10, // 为多张图片添加间距
  },
  historyTitle: { fontWeight: '600', marginBottom: 8 },
  historyList: { flexGrow: 0, marginBottom: 40 }, // 修正 FlatList 高度问题并增加底部间距
  thumb: {
    width: 64,
    height: 64,
    marginRight: 12,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  placeholderBox: {
    width: '90%',
    height: '90%',
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  placeholderText: {
    color: '#bbb',
    fontSize: 12,
  },
});