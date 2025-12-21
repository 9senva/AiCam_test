import os, tempfile, base64
from fastapi import UploadFile, HTTPException
from volcenginesdkarkruntime import AsyncArk
from app.schemas.request import AnalysisResponse
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量，确保 API Key 等敏感信息可用
load_dotenv()

# 初始化火山方舟大模型平台的异步客户端
# 使用环境变量中的 ARK_API_KEY1 作为认证凭证
client = AsyncArk(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    api_key=os.getenv("ARK_API_KEY1"),
)

async def analyze_image(file: UploadFile, text: str) -> AnalysisResponse:
    """
    图像分析功能。
    接收用户上传的一张图片和一个问题，调用多模态模型进行分析，并返回文本结果。

    :param file: 用户上传的图片文件。
    :param text: 用户提出的问题或指令。
    :return: 包含分析结果的 AnalysisResponse 对象。
    """
    # 获取系统临时目录
    tmp_dir = tempfile.gettempdir()
    # 创建一个临时的本地文件路径，用于保存上传的图片
    local_path = os.path.join(tmp_dir, file.filename)
    try:
        # 将上传的图片内容写入临时文件
        with open(local_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # 调用火山方舟的多模态模型 (doubao-seed-1-6-flash-250828)
        resp = await client.responses.create(
            model="doubao-seed-1-6-flash-250828",
            input=[{
                "role": "user",
                "content": [
                    # 输入内容1：本地图片文件
                    {"type": "input_image", "image_url": f"file://{local_path}"},
                    # 输入内容2：用户的提问文本
                    {"type": "input_text", "text": text},
                ]
            }]
        )
        # 提取模型返回的文本内容
        result = resp.output[1].content[0].text
        # 将结果封装到 Pydantic 模型中返回
        return AnalysisResponse(analysis=result)
    except Exception as e:
        # 如果发生任何错误，则抛出 HTTP 500 异常
        raise HTTPException(500, str(e))
    finally:
        # 无论成功还是失败，最后都尝试删除临时文件，避免占用磁盘空间
        if os.path.exists(local_path):
            os.remove(local_path)

async def generate_image(background_image: UploadFile):
    """
    智能图像生成/融合功能。
    将一张固定的前景人物图与用户上传的背景图进行融合，
    并让 AI 模型智能调整人物姿势以适应背景。

    :param background_image: 用户上传的背景图片。
    :return: 包含生成的新图片 URL 的字典列表。
    """
    # 注意：这里硬编码了前景人物图片的文件名，需要确保 "image.jpg" 文件存在于项目根目录
    person_image = "image.jpg"
    
    # 获取人物图和背景图的文件格式
    person_fmt = person_image.split('.')[-1].lower()
    bg_fmt = background_image.filename.split('.')[-1].lower()

    # 将人物图和背景图读取为二进制，并编码为 Base64 字符串
    with open(person_image, "rb") as f:
        person_b64 = base64.b64encode(f.read()).decode()
    bg_b64 = base64.b64encode(await background_image.read()).decode()

    # 构造成 Data URL 格式，用于 API 请求
    person_data = f"data:image/{person_fmt};base64,{person_b64}"
    bg_data = f"data:image/{bg_fmt};base64,{bg_b64}"

    # 调用火山方舟的图像生成模型 (doubao-seedream-4-5-251128)
    images_resp = await client.images.generate(
        model="doubao-seedream-4-5-251128",
        # 关键指令：让 AI 根据背景调整人物动作
        prompt="人物摆出最适合当前背景的动作",
        # 输入图像：[人物图, 背景图]
        image=[person_data, bg_data],
        size="2K",  # 指定生成图片的尺寸
        sequential_image_generation="auto",
        response_format="url",  # 要求返回图片的 URL
        watermark=False,  # 不添加水印
    )
    
    # 解析模型返回的结果，提取新图片的 URL
    # 注意：此处的 images_resp.data 结构取决于 SDK 返回，可能需要调整
    results = [{"URL": img.url} for img in images_resp.data]
    return [{resultsimg.size} for img in images_resp.data]
