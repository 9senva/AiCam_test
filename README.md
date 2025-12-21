# AICamera Server 项目代码文档

本文档对 `AICamera_server` 项目中的各个代码文件进行介绍，帮助开发者快速理解项目结构和功能。

## 项目简介

AICamera Server 是一个基于 FastAPI 的后端服务，主要功能包括用户管理（注册、登录）、AI 图像分析与生成、以及姿势关键点检测（基于 MediaPipe）。项目使用 MySQL 作为数据库，SQLAlchemy 作为 ORM 框架。

## 快速开始

### 1. 环境准备

确保你已经安装了 Python 3.8+ 和 MySQL 数据库。

### 2. 安装依赖

在项目根目录下运行以下命令安装所需依赖：

```bash
python -m pip install -r requirements.txt
```

### 3. 配置数据库

1.  创建一个名为 `cam` 的 MySQL 数据库。
2.  默认数据库配置在 `app/database/connection.py` 中：
    ```python
    DATABASE_URL = "mysql+aiomysql://root:111111@localhost/cam"
    ```
    请根据你的实际数据库用户名 (`root`)、密码 (`111111`) 和地址进行修改。
3.  项目启动时会自动创建所需的数据表 (`init_models`)。

### 4. 配置环境变量

项目使用环境变量来管理 API 密钥。请确保设置了以下环境变量（可以在系统环境变量中设置，或使用 `.env` 文件加载工具）：

- `ARK_API_KEY1`: 火山引擎 Ark 服务的 API Key (用于 AI 功能)。

### 5. 启动服务

使用 `uvicorn` 启动 FastAPI 服务：

```bash
uvicorn app.main:app --reload
```

启动成功后，访问 API 文档：
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## 项目结构

```
AICamera_server/
├── app/                        # 核心应用代码
│   ├── database/               # 数据库连接与配置
│   ├── models/                 # 数据库模型定义 (ORM)
│   ├── routers/                # API 路由定义
│   ├── schemas/                # Pydantic 数据验证模型
│   ├── services/               # 业务逻辑层
│   └── main.py                 # FastAPI 应用入口
├── pipe.py                     # MediaPipe 姿势检测独立脚本
├── test_main.http              # HTTP 接口测试文件
└── ...
```

## 文件详细介绍

### 根目录

#### `pipe.py`
这是一个独立的 Python 脚本，用于演示和测试 MediaPipe 的姿势关键点检测功能。
- **功能**：
    - 自动下载 MediaPipe Pose Landmarker 模型 (`pose_landmarker_heavy.task`)。
    - 读取本地图像 (`image.jpg`)。
    - 使用 MediaPipe 检测图像中的人体姿势关键点。
    - 将检测到的关键点绘制在图像上并保存为 `output_pose.jpg`。
    - 如果有分割掩码，也会保存为 `output_mask.jpg`。

#### `test_main.http`
这是一个 HTTP 请求文件，通常用于在 IDE (如 PyCharm 或 VS Code) 中直接发送 HTTP 请求来测试 API 接口。

### App 目录 (`app/`)

#### `app/main.py`
FastAPI 应用的入口文件。
- **功能**：
    - 初始化 FastAPI 应用实例。
    - 定义应用的生命周期 (`lifespan`)，在启动时初始化数据库模型，在关闭时断开数据库连接。
    - 注册各个模块的路由 (`auth`, `coin`, `ai`)。

### 数据库 (`app/database/`)

#### `app/database/connection.py`
负责数据库连接和会话管理。
- **功能**：
    - 配置数据库 URL (`mysql+aiomysql://...`)。
    - 创建异步数据库引擎 (`engine`)。
    - 定义异步会话工厂 (`AsyncSessionLocal`)。
    - 提供 `get_db` 依赖注入函数，用于在 API 请求中获取数据库会话。
    - 提供 `init_models` 函数用于创建数据库表。

#### `db/cam.sql`
数据库初始化 SQL 脚本。
- **功能**：
    - 包含创建数据库表结构的 SQL 语句，可能用于手动初始化数据库或参考。

### 数据模型 (`app/models/`)

#### `app/models/user.py`
定义用户表的 SQLAlchemy 模型。
- **功能**：
    - 映射数据库中的 `user` 表。
    - 包含字段：`id`, `username`, `password`, `nickName`, `email`, `phoneNumber`, `coin`, `avatarFileUrl` 等。

### 路由 (`app/routers/`)

#### `app/routers/ai.py`
定义与 AI 功能相关的 API 接口。所有接口均以 `/api/v1/ai` 为前缀。
- **接口**：
    - `POST /analyze-image`: 上传图片和文本，调用 AI 服务进行分析。
    - `POST /generate-image`: (同步) 上传背景图，生成包含人物的图像。**注意：此接口为耗时操作，建议使用下面的异步接口。**
    - `POST /pose-segment`: 上传图片，返回姿势关键点数据。
    - `POST /async-generate/start`: (异步) 启动一个图像生成任务。此接口会立即返回一个 `task_id`，用于后续查询。
    - `GET /async-generate/status/{task_id}`: (异步) 查询图像生成任务的状态。客户端可使用 `task_id` 轮询此接口，直到任务状态变为 `completed` 或 `failed`。

#### `app/routers/auth.py`
定义用户认证相关的 API 接口。
- **接口**：
    - `POST /api/register`: 用户注册。
    - `POST /api/login`: 用户登录。
    - `POST /api/change-password`: 修改密码。

#### `app/routers/coin.py`
定义积分/金币相关的 API 接口。
- **接口**：
    - `POST /api/share-coins`: 分享获取金币。
    - `POST /api/recharge-coins`: 充值金币。

### 数据验证 (`app/schemas/`)

#### `app/schemas/pose.py`
定义姿势检测相关的数据模型。
- **类**：
    - `Landmark`: 定义关键点的 x, y, z 坐标。
    - `SegmentedPose`: 定义分段的姿势数据（头部、上身、下身）。

#### `app/schemas/request.py`
定义 API 请求和响应的数据模型 (Pydantic models)。
- **类**：
    - `RegisterRequest`: 注册请求参数。
    - `LoginRequest`: 登录请求参数。
    - `ChangePasswordRequest`: 修改密码请求参数。
    - `AddCoinsRequest`: 增加金币请求参数。
    - `AnalysisResponse`: AI 分析结果响应。

### 业务服务 (`app/services/`)

#### `app/services/ai_service.py`
封装 AI 相关的业务逻辑（主要是同步操作）。
- **功能**：
    - 使用火山引擎 (`volcenginesdkarkruntime`) 调用豆包大模型 (`doubao-*`)。
    - `analyze_image`: 处理图像分析请求。
    - `generate_image`: 处理同步的图像生成请求。

#### `app/services/ai_images_create.py`
封装异步的、解耦的 AI 图像生成业务逻辑。
- **功能**：
    - `create_generation_task`: 创建一个后台任务并返回任务 ID。
    - `run_ai_generation_in_background`: 在后台实际执行 AI 图像生成。
    - `get_generation_task_status`: 根据任务 ID 查询任务状态和结果。

#### `app/services/coin_service.py`
封装金币相关的业务逻辑。
- **功能**：
    - `share_coins`: 处理分享获币逻辑，更新用户金币数量。
    - `recharge_coins`: 处理充值逻辑，更新用户金币数量。

#### `app/services/mp_service.py`
封装 MediaPipe 相关的业务逻辑。
- **功能**：
    - 自动下载模型文件。
    - 初始化 MediaPipe Pose Landmarker。
    - `run_pose`: 接收图像字节流，进行姿势检测，并返回结构化的关键点数据。

#### `app/services/user_service.py`
封装用户管理相关的业务逻辑。
- **功能**：
    - `register_user`: 处理用户注册，包含查重、密码哈希 (`bcrypt`)、头像上传等。
    - `login_user`: 处理用户登录，验证密码。
    - `change_password`: 处理密码修改。
    - `upload_avatar`: 处理头像文件上传到本地。
