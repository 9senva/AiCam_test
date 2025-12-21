# AICamera Server API 文档 (React Native)

本文档旨在为 React Native (RN) 开发者提供调用 AICamera Server 后端 API 的详细指南。

## 1. 基本信息

- **后端服务地址**: `http://127.0.0.1:8000` (在开发中，请确保 RN 应用可以访问到此地址，可能需要使用您电脑的局域网IP)
- **API V1 根路径**: `/api/v1/ai`
- **数据格式**: 所有请求和响应均为 `JSON` 格式，文件上传使用 `multipart/form-data`。

---

## 2. API 概览

| 方法   | 路径                                       | 类型   | 功能                               |
| :----- | :----------------------------------------- | :----- | :--------------------------------- |
| `POST` | `/analyze-image`                           | 同步   | 上传图片和文本进行分析             |
| `POST` | `/pose-segment`                            | 同步   | 上传图片进行姿态识别               |
| `POST` | `/async-generate/start`                    | 异步   | **启动**一个耗时的图像生成任务     |
| `GET`  | `/async-generate/status/{task_id}`         | 异步   | **查询**指定任务的状态和结果       |
| `POST` | `/generate-image`                          | 同步   | (不推荐) 耗时的图像生成，建议废弃 |

---

## 3. API 使用详解 (React Native)

在 React Native 中调用这些 API 的核心是 `fetch` 和 `FormData`。以下示例将使用 React Hooks (`useState`, `useEffect`) 和 `react-native-image-picker` (或类似的库) 来处理文件上传和状态管理。

### 3.1 同步接口调用

同步接口适用于可以快速响应的请求。

#### 适用接口
- `/analyze-image`
- `/pose-segment`

#### 前端调用示例 (`/analyze-image`)

此接口需要一个图片文件 (`file`) 和一个问题描述 (`text`)。

**React Native 组件示例:**
```jsx
import React, { useState } from 'react';
import { View, Text, Button, TextInput, Image, StyleSheet, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const AnalyzeImageScreen = () => {
    const [image, setImage] = useState(null);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleSelectImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else {
                setImage(response.assets[0]);
            }
        });
    };

    const handleAnalyzeImage = async () => {
        if (!image) {
            Alert.alert('提示', '请先选择一张图片');
            return;
        }

        setLoading(true);
        setResult('');

        const formData = new FormData();
        formData.append('file', {
            uri: image.uri,
            type: image.type,
            name: image.fileName || 'photo.jpg',
        });
        formData.append('text', question);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/ai/analyze-image', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || '分析失败');
            }

            setResult(data.analysis);
        } catch (error) {
            Alert.alert('错误', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="选择图片" onPress={handleSelectImage} />
            {image && <Image source={{ uri: image.uri }} style={styles.image} />}
            <TextInput
                style={styles.input}
                placeholder="请输入你的问题..."
                value={question}
                onChangeText={setQuestion}
            />
            <Button title={loading ? "分析中..." : "开始分析"} onPress={handleAnalyzeImage} disabled={loading} />
            {result && <Text style={styles.result}>分析结果: {result}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', padding: 20 },
    image: { width: 200, height: 200, marginVertical: 20 },
    input: { borderWidth: 1, borderColor: 'gray', width: '100%', padding: 10, marginVertical: 10 },
    result: { marginTop: 20, fontSize: 16 },
});

export default AnalyzeImageScreen;
```

---

### 3.2 异步任务接口调用

异步接口用于处理耗时操作，核心流程为 **“启动任务”** -> **“轮询状态”**。

#### 适用接口
- `POST /async-generate/start`
- `GET /async-generate/status/{task_id}`

#### 数据格式说明

**1. `POST /async-generate/start`**

-   **请求 (Request)**:
    -   `Content-Type`: `multipart/form-data`
    -   `Body`:
        -   `background_image` (File): 用户上传的背景图片文件。

-   **成功响应 (Response - `200 OK`)**:
    -   `task_id` (string): 唯一任务ID。
    ```json
    {
      "task_id": "a-unique-task-identifier-string"
    }
    ```

**2. `GET /async-generate/status/{task_id}`**

-   **请求 (Request)**:
    -   `URL Path`: 包含要查询的 `task_id`。

-   **成功响应 (Response - `200 OK`)**:
    -   `status` (string): 任务的当前状态。可能是 `"processing"`, `"completed"`, 或 `"failed"`。
    -   `result` (array | string | null): 任务的结果。
        -   当 `status` 为 `"completed"` 时，这是一个对象数组。
        -   当 `status` 为 `"failed"` 时，这是一个错误信息字符串。
        -   当 `status` 为 `"processing"` 时，这是 `null`。

    -   **任务处理中**:
        ```json
        {
          "status": "processing",
          "result": null
        }
        ```
    -   **任务完成**:
        ```json
        {
          "status": "completed",
          "result": [
            { 
              "URL": "http://path/to/your/generated/image.png" 
            }
          ]
        }
        ```
        -   `result[].URL` (string): 生成的图片URL。

    -   **任务失败**:
        ```json
        {
          "status": "failed",
          "result": "A string describing the error that occurred."
        }
        ```

-   **错误响应 (Response - `404 Not Found`)**:
    -   当提供的 `task_id` 不存在时触发。
    -   `detail` (string): 错误详情。
    ```json
    {
        "detail": "Task with ID 'some-invalid-id' not found."
    }
    ```

#### 前端调用示例

**React Native 组件示例:**
```jsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const AsyncGenerateScreen = () => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [taskStatus, setTaskStatus] = useState('');
    const [taskId, setTaskId] = useState(null);
    const [resultImage, setResultImage] = useState(null);

    // 使用 useRef 来避免在 setTimeout 的闭包中拿到旧的 state
    const taskIdRef = useRef(taskId);
    useEffect(() => {
        taskIdRef.current = taskId;
    }, [taskId]);

    // 轮询函数
    const pollTaskStatus = async () => {
        if (!taskIdRef.current) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/ai/async-generate/status/${taskIdRef.current}`);
            const data = await response.json();

            if (!response.ok) throw new Error('查询状态失败');

            switch (data.status) {
                case 'completed':
                    setTaskStatus('任务完成！');
                    setResultImage(data.result[0].URL); // 假设返回结果是数组
                    setTaskId(null); // 停止轮询
                    setLoading(false);
                    break;
                case 'failed':
                    setTaskStatus(`任务失败: ${data.result}`);
                    setTaskId(null); // 停止轮询
                    setLoading(false);
                    break;
                default: // 'processing'
                    setTaskStatus(`任务处理中... (状态: ${data.status})`);
                    setTimeout(pollTaskStatus, 2000); // 2秒后再次查询
                    break;
            }
        } catch (error) {
            setTaskStatus('轮询出错: ' + error.message);
            setLoading(false);
        }
    };

    // 当 taskId 变化时，开始轮询
    useEffect(() => {
        if (taskId) {
            pollTaskStatus();
        }
    }, [taskId]);

    const handleSelectImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.assets) setImage(response.assets[0]);
        });
    };

    const handleAsyncGenerate = async () => {
        if (!image) {
            Alert.alert('提示', '请先选择一张背景图片');
            return;
        }

        setLoading(true);
        setTaskStatus('正在启动任务...');
        setResultImage(null);

        const formData = new FormData();
        formData.append('background_image', {
            uri: image.uri,
            type: image.type,
            name: image.fileName || 'background.jpg',
        });

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/ai/async-generate/start', {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || '启动任务失败');
            
            setTaskStatus(`任务已启动，ID: ${data.task_id}`);
            setTaskId(data.task_id); // 触发 useEffect 开始轮询

        } catch (error) {
            Alert.alert('错误', error.message);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="选择背景图片" onPress={handleSelectImage} />
            {image && <Image source={{ uri: image.uri }} style={styles.image} />}
            
            <Button title={loading ? "处理中..." : "开始异步生成"} onPress={handleAsyncGenerate} disabled={loading} />

            {taskStatus && <Text style={styles.status}>{taskStatus}</Text>}
            {resultImage && <Image source={{ uri: resultImage }} style={styles.resultImage} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', padding: 20 },
    image: { width: 200, height: 200, marginVertical: 20 },
    status: { marginVertical: 10, fontSize: 16, color: 'blue' },
    resultImage: { width: 300, height: 300, marginTop: 20, borderWidth: 1, borderColor: 'green' },
});

export default AsyncGenerateScreen;
```