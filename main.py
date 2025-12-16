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

# 定义用户模型
class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(100), nullable=False, default="123456")
    nickName = Column(String(30))
    email = Column(String(50), unique=True)
    phoneNumber = Column(String(11), unique=True)
    sex = Column(CHAR(1), default='0')
    birthday = Column(TIMESTAMP, nullable=True)
    avatarFileUrl = Column(String(100), nullable=False, default='')
    role = Column(String(20), default='user')
    accountStatus = Column(Boolean, default=True)
    coin = Column(Integer, default=0)
    count = Column(Integer, default=0)
    delFlag = Column(Boolean, default=False)
    createTime = Column(TIMESTAMP, default=func.current_timestamp())
    remark = Column(TEXT)

# 定义添加币请求模型
class AddCoinsRequest(BaseModel):
    phoneNumber: str
    coinsToAdd: int

# 创建表
async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# 获取数据库会话
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as db:
        yield db

# 注册请求模型
class RegisterRequest(BaseModel):
    username: str
    password: str
    nickName: str = None
    email: str = None
    phoneNumber: str = None
    sex: str = None
    birthday: datetime = None  # 修改为 datetime 类型
    avatar: UploadFile = File(None)


# 假设的上传头像函数
async def upload_avatar(avatar: UploadFile) -> str:
    file_location = f"uploads/{avatar.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(await avatar.read())
    return file_location

client = AsyncArk(
    base_url='https://ark.cn-beijing.volces.com/api/v3',
    api_key=os.getenv('ARK_API_KEY1')
)

class ImagePaths(BaseModel):
    person_image_path: str
    background_image_path: str

# 定义分析图片响应模型
class AnalysisResponse(BaseModel):
    analysis: str

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

@app.post("/register")
async def register_user(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        # 检查用户名是否已存在
        result = await db.execute(select(User).filter(User.username == request.username))
        existing_user = result.scalars().first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        # 检查邮箱是否已存在
        if request.email:
            result = await db.execute(select(User).filter(User.email == request.email))
            existing_email = result.scalars().first()
            if existing_email:
                raise HTTPException(status_code=400, detail="Email already exists")

        # 检查手机号码是否已存在
        if request.phoneNumber:
            result = await db.execute(select(User).filter(User.phoneNumber == request.phoneNumber))
            existing_phone = result.scalars().first()
            if existing_phone:
                raise HTTPException(status_code=400, detail="Phone number already exists")

        # 处理头像上传
        avatar_url = ""
        if request.avatar:
            avatar_url = await upload_avatar(request.avatar)

        # 创建新用户并使用 bcrypt 加密密码
        hashed_password = bcrypt.hashpw(request.password.encode(), bcrypt.gensalt()).decode()
        new_user = User(
            username=request.username,
            password=hashed_password,
            nickName=request.nickName,
            email=request.email,
            phoneNumber=request.phoneNumber,
            sex=request.sex,
            birthday=request.birthday,  # 直接传入 datetime 类型
            avatarFileUrl=avatar_url,
        )

        # 添加到数据库
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return {"message": "User registered successfully", "user": new_user}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# 修改密码请求模型
class ChangePasswordRequest(BaseModel):
    phoneNumber: str
    oldPassword: str
    newPassword: str

# 修改密码接口
@app.post("/change-password")
async def change_password(request: ChangePasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        # 查询用户是否存在
        result = await db.execute(select(User).filter(User.phoneNumber == request.phoneNumber))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")

        # 验证旧密码是否正确
        if not bcrypt.checkpw(request.oldPassword.encode(), user.password.encode()):
            raise HTTPException(status_code=400, detail="Incorrect old password")

        # 更新新密码
        new_hashed_password = bcrypt.hashpw(request.newPassword.encode(), bcrypt.gensalt()).decode()
        user.password = new_hashed_password
        await db.commit()
        await db.refresh(user)

        return {"message": "Password changed successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# 登录请求模型
class LoginRequest(BaseModel):
    phoneNumber: str
    password: str

# 登录接口
@app.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        # 查询用户是否存在
        result = await db.execute(select(User).filter(User.phoneNumber == request.phoneNumber))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")

        # 验证密码是否正确
        if not bcrypt.checkpw(request.password.encode(), user.password.encode()):
            raise HTTPException(status_code=400, detail="Incorrect password")

        return {"message": "Login successful", "user": user}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/share-coins/")
async def share_coins(request: AddCoinsRequest, db: AsyncSession = Depends(get_db)):
    try:
        # 查询用户是否存在
        result = await db.execute(select(User).filter(User.phoneNumber == request.phoneNumber))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")

        # 更新用户的币数量
        user.coin += request.coinsToAdd
        await db.commit()
        await db.refresh(user)

        return {"message": "Coins added for sharing successfully", "user": user}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/recharge-coins/")
async def recharge_coins(request: AddCoinsRequest, db: AsyncSession = Depends(get_db)):
    try:
        # 查询用户是否存在
        result = await db.execute(select(User).filter(User.phoneNumber == request.phoneNumber))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")

        # 更新用户的币数量
        user.coin += request.coinsToAdd
        await db.commit()
        await db.refresh(user)

        return {"message": "Coins recharged successfully", "user": user}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

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
