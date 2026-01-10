# AICamera API 文档 - 图像分析

本文档详细说明了 `analyze-image` 接口的使用方法、请求格式和响应数据结构。

---

## 图像分析 (`/analyze-image`)

这是一个多模态分析接口，能够接收一张图片和一个相关问题，并返回 AI 对此的文本分析或回答。

### 接口详情

-   **功能**: 根据用户提供的图片和文本，进行智能分析并返回文本结果。
-   **路径**: `/api/v1/ai/analyze-image`
-   **请求方法**: `POST`
-   **请求类型**: 同步请求 (Synchronous)

---

### 请求 (Request)

#### 请求头 (Headers)

| Key           | Value                 | 描述                               |
| :------------ | :-------------------- | :--------------------------------- |
| `Content-Type`| `multipart/form-data` | 必须使用此格式来上传文件和表单数据。 |

#### 请求体 (Body)

请求体必须为 `multipart/form-data` 格式，并包含以下字段：

| 字段名 | 类型   | 是否必须 | 描述                     |
| :----- | :----- | :------- | :----------------------- |
| `file` | File   | 是       | 用户上传的图片文件。     |

#### 请求示例

使用 `cURL` 的请求示例如下：

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/ai/analyze-image" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@/path/to/your/image.jpg"
```

---

### 响应 (Response)

#### 成功响应 (`200 OK`)

当请求成功处理后，服务器会返回 `200 OK` 状态码和包含分析结果的 JSON 对象。

-   **Content-Type**: `application/json`

##### 响应体 (Body) 结构

| 字段名  | 类型   | 描述             |
| :------ | :----- | :--------------- |
| `head`  | String | 头部姿态指导文本 |
| `upper` | String | 上身姿态指导文本 |
| `lower` | String | 下身姿态指导文本 |

##### 成功响应示例

```json
{
  "head": "头部向左微转",
  "upper": "挺胸抬头，手臂自然下垂",
  "lower": "双腿交叉站立"
}
```

#### 失败响应

如果处理过程中发生错误（例如，AI 模型服务不可用、文件读取失败等），服务器将返回一个标准的 HTTP 错误状态码。

-   **`500 Internal Server Error`**: 表示服务器内部在处理请求时发生了未知错误。响应体通常会包含错误的详细信息（在生产环境中可能会被隐藏）。

##### 失败响应示例 (`500`)

```json
{
  "detail": "Error details from the server."
}
```
