"""
该文件负责处理异步的图像生成任务。

它将原本同步的、耗时较长的 AI 图像生成过程解耦为三个部分：
1. 任务提交：立即接受请求，返回一个任务ID。
2. 状态轮询：允许前端使用任务ID查询处理进度。
3. 结果获取：当任务完成后，通过状态轮询接口返回结果。

这避免了长连接和请求超时，提升了用户体验。
"""

import uuid
import base64
from typing import Dict, Any
from fastapi import UploadFile, HTTPException

# 导入火山方舟客户端
# 注意：在大型应用中，建议将 client 作为单例在应用启动时统一初始化，并通过依赖注入使用。
# 这里为了模块独立，我们暂时在此处初始化。
from volcenginesdkarkruntime import AsyncArk
import os
from dotenv import load_dotenv

load_dotenv()

client = AsyncArk(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    api_key=os.getenv("ARK_API_KEY1"),
)

# 使用内存中的字典来存储任务状态。
# 这是一个简化的实现，适用于单实例部署。
# 在生产环境或多实例部署中，应使用更健壮的持久化存储，如 Redis, Celery, 或数据库。
tasks: Dict[str, Dict[str, Any]] = {}


async def run_ai_generation_in_background(task_id: str, background_image_data: bytes, bg_filename: str):
    """
    在后台执行实际的 AI 图像生成。
    这个函数会被 FastAPI 的 BackgroundTasks 调用。
    它会在任务完成或失败时，更新 `tasks` 字典中的状态。
    """
    try:
        # --- 这是从 ai_service.py 移植过来的核心生成逻辑 ---
        person_image = "image.jpg"  # 硬编码的前景人物图
        person_fmt = person_image.split('.')[-1].lower()
        bg_fmt = bg_filename.split('.')[-1].lower()

        # 编码前景图
        with open(person_image, "rb") as f:
            person_b64 = base64.b64encode(f.read()).decode()
        # 编码背景图
        bg_b64 = base64.b64encode(background_image_data).decode()

        # 准备 Data URL
        person_data = f"data:image/{person_fmt};base64,{person_b64}"
        bg_data = f"data:image/{bg_fmt};base64,{bg_b64}"

        # 调用火山方舟 API
        images_resp = await client.images.generate(
            model="doubao-seedream-4-5-251128",
            prompt="人物摆出最适合当前背景的动作",
            image=[person_data, bg_data],
            size="2K",
            sequential_image_generation="auto",
            response_format="url",
            watermark=False,
        )
        
        results = [{"URL": img.url} for img in images_resp.data]
        # --- 核心逻辑结束 ---

        # 任务成功：更新状态为 'completed' 并存储结果
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["result"] = results

    except Exception as e:
        # 任务失败：更新状态为 'failed' 并存储错误信息
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["result"] = str(e)


def create_generation_task() -> str:
    """
    第一步：创建并初始化一个图像生成任务。
    
    生成一个唯一的 task_id，并在任务字典中初始化它的状态。
    立即返回 task_id，以便客户端可以开始轮询。
    """
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing", "result": None}
    return task_id


def get_generation_task_status(task_id: str) -> Dict[str, Any]:
    """
    第二步和第三步：获取任务状态与结果。
    
    供前端轮询调用，以检查任务是否已完成。
    如果任务已完成 (completed)，结果会包含在返回的 `task` 对象中。
    """
    task = tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with ID '{task_id}' not found.")
    
    return task
