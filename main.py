from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from sqlalchemy import Table, Column, Integer, String, Boolean, TIMESTAMP, CHAR, TEXT
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.sql import func
import bcrypt
from datetime import datetime
import asyncio
from contextlib import asynccontextmanager
import os
from volcenginesdkarkruntime import AsyncArk
import tempfile
from volcenginesdkarkruntime import Ark
from fastapi.responses import JSONResponse
import base64
from volcenginesdkarkruntime import Ark


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动逻辑
    print("Starting up...")
    await init_models()
    print("Database models have been initialized.")
    yield
    # 关闭逻辑
    print("Shutting down...")
    await engine.dispose()
    print("Database connection pool has been disposed.")
app = FastAPI(lifespan=lifespan)

# 数据库配置
DATABASE_URL = "mysql+aiomysql://root:111111@localhost/cam"
engine = create_async_engine(DATABASE_URL, future=True)
AsyncSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

Base = declarative_base()

# 创建一个分析图片的接口
@app.post("/analyze-image", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...),
    text: str = Form(...)
):
    tmp_dir = tempfile.gettempdir()
    local_path = os.path.join(tmp_dir, file.filename)
    try:
        with open(local_path, "wb") as buffer:
            buffer.write(await file.read())

        response = await client.responses.create(
            model="doubao-seed-1-6-flash-250828",
            input=[
                {"role": "user", "content": [
                    {
                        "type": "input_image",
                        "image_url": f"file://{local_path}"
                    },
                    {
                        "type": "input_text",
                        "text": text
                    }
                ]}
            ]
        )

        analysis_result = response.output[1].content[0].text
        print(analysis_result)
        return AnalysisResponse(analysis=analysis_result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(local_path):
            os.remove(local_path)

@app.post("/generate-image")
async def generate_image_from_upload(background_image: UploadFile = File(...)):
    # 获取图片格式
    person_image = r"image.jpg"
    person_image_format = person_image.split('.')[-1].lower()
    background_image_format = background_image.filename.split('.')[-1].lower()

    with open(person_image, "rb") as person_image_file:
        image_person_base64 = base64.b64encode(person_image_file.read()).decode('utf-8')
    image_background_base64 = base64.b64encode(await background_image.read()).decode('utf-8')

    # 格式化为 data:image/<图片格式>;base64,<Base64编码>
    image_person_base64 = f"data:image/{person_image_format};base64,{image_person_base64}"
    image_background_base64 = f"data:image/{background_image_format};base64,{image_background_base64}"

    imagesResponse = await client.images.generate(
        model="doubao-seedream-4-5-251128",
        prompt="人物摆出最适合当前背景的动作",
        image=[image_person_base64, image_background_base64],  # 传递base64编码的字符串
        size="2K",
        sequential_image_generation="auto",
        response_format="url",
        watermark=False
    )

    # 遍历所有图片数据
    results = []
    for image in imagesResponse.data:
        # 输出当前图片的url和size
        print(image.url, image.size)
        results.append({"URL": image.url, "Size": image.size})

    return results


# 启动应用
# uvicorn main:app --reload
