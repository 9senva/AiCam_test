import bcrypt, os
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, UploadFile
from app.models.user import User
from app.schemas.request import RegisterRequest, LoginRequest, ChangePasswordRequest

async def upload_avatar(avatar: UploadFile) -> str:
    os.makedirs("uploads", exist_ok=True)
    file_location = f"uploads/{avatar.filename}"
    with open(file_location, "wb+") as f:
        f.write(await avatar.read())
    return file_location

async def register_user(request: RegisterRequest, db: AsyncSession):
    # 查重
    exist = await db.scalar(select(User).filter(User.username == request.username))
    if exist:
        raise HTTPException(400, "Username already exists")
    if request.email:
        exist = await db.scalar(select(User).filter(User.email == request.email))
        if exist:
            raise HTTPException(400, "Email already exists")
    if request.phoneNumber:
        exist = await db.scalar(select(User).filter(User.phoneNumber == request.phoneNumber))
        if exist:
            raise HTTPException(400, "Phone number already exists")

    avatar_url = ""
    if request.avatar:
        avatar_url = await upload_avatar(request.avatar)

    hashed = bcrypt.hashpw(request.password.encode(), bcrypt.gensalt()).decode()
    new_user = User(
        username=request.username,
        password=hashed,
        nickName=request.nickName,
        email=request.email,
        phoneNumber=request.phoneNumber,
        sex=request.sex,
        birthday=request.birthday,
        avatarFileUrl=avatar_url,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"message": "User registered successfully", "user": new_user}

async def login_user(request: LoginRequest, db: AsyncSession):
    user = await db.scalar(select(User).filter(User.phoneNumber == request.phoneNumber))
    if not user:
        raise HTTPException(400, "User not found")
    if not bcrypt.checkpw(request.password.encode(), user.password.encode()):
        raise HTTPException(400, "Incorrect password")
    return {"message": "Login successful", "user": user}

async def change_password(request: ChangePasswordRequest, db: AsyncSession):
    user = await db.scalar(select(User).filter(User.phoneNumber == request.phoneNumber))
    if not user:
        raise HTTPException(400, "User not found")
    if not bcrypt.checkpw(request.oldPassword.encode(), user.password.encode()):
        raise HTTPException(400, "Incorrect old password")
    new_hash = bcrypt.hashpw(request.newPassword.encode(), bcrypt.gensalt()).decode()
    user.password = new_hash
    await db.commit()
    await db.refresh(user)
    return {"message": "Password changed successfully"}