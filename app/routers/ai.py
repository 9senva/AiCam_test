# app/routers/ai.py
from fastapi import APIRouter, File, Form, UploadFile, BackgroundTasks
from fastapi.responses import StreamingResponse
import os
import cv2
import io
from app.services.ai_service import analyze_image as ai_analyze, generate_image as ai_generate
from app.schemas.request import AnalysisResponse
from app.services.mp_service import run_pose
from app.schemas.pose import SegmentedPose
# 导入新的异步图像生成服务
from app.services import ai_images_generate
from app.services.dashed_service import process_image


router = APIRouter(
    prefix="/api/v1/ai",  # 为所有路由添加统一前缀
    tags=["AI"],          # 在 API 文档中分组
)

# --- 原有的同步 API 端点 ---

@router.post("/analyze-image", response_model=AnalysisResponse)
async def analyze_image_endpoint(file: UploadFile = File(...), text: str = Form(...)):
    return await ai_analyze(file, text)

@router.post("/generate-image")
async def generate_image_endpoint(background_image: UploadFile = File(...)):
    # 耗时操作，在生产环境中建议使用下面的异步接口
    return await ai_generate(background_image)

@router.post("/pose-segment", response_model=SegmentedPose)
async def pose_segment(file: UploadFile = File(...)):
    content = await file.read()
    return await run_pose(content)

# --- 异步图像生成 API 端点 ---

@router.post("/async-generate/start", summary="启动异步图像生成任务")
async def start_async_generation(
    background_tasks: BackgroundTasks,
    background_image: UploadFile = File(...)
):
    """
    第一步：启动一个异步图像生成任务。
    
    这个接口会立即返回一个 task_id，并安排一个后台任务去执行实际的 AI 计算。
    """
    # 1. 创建一个新任务并获取 task_id
    task_id = ai_images_generate.create_generation_task()
    
    # 2. 读取上传的图片数据，以便传递给后台任务
    image_data = await background_image.read()
    
    # 3. 将真正的耗时任务添加到后台任务队列
    background_tasks.add_task(
        ai_images_generate.run_ai_generation_in_background, 
        task_id, 
        image_data, 
        background_image.filename
    )
    
    # 4. 立即返回 task_id，前端可以开始轮询
    return {"task_id": task_id}


@router.get("/async-generate/status/{task_id}", summary="查询异步任务状态")
async def get_async_generation_status(task_id: str):
    """
    第二步和第三步：查询异步任务的状态和结果。
    
    前端可以使用 /start 接口返回的 task_id 来轮询这个端点，
    直到 status 变为 'completed' 或 'failed'。
    """
    return ai_images_generate.get_generation_task_status(task_id)


@router.post("/process-image")
async def process_image_route(image: UploadFile = File(...)):
    os.makedirs("temp", exist_ok=True)
    image_path = "temp/" + image.filename
    with open(image_path, "wb") as buffer:
        buffer.write(await image.read())

    processed_image = process_image(image_path)

    # 将处理后的图像转换为字节流
    _, buffer = cv2.imencode('.jpg', processed_image)
    image_bytes = io.BytesIO(buffer.tobytes())

    return StreamingResponse(image_bytes, media_type="image/jpeg")

