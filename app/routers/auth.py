from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.schemas.request import RegisterRequest, LoginRequest, ChangePasswordRequest
from app.services.user_service import register_user, login_user, change_password

router = APIRouter()

@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await register_user(req, db)

@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await login_user(req, db)

@router.post("/change-password")
async def change_password(req: ChangePasswordRequest, db: AsyncSession = Depends(get_db)):
    return await change_password(req, db)