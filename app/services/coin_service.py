from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.user import User
from app.schemas.request import AddCoinsRequest

async def share_coins(req: AddCoinsRequest, db: AsyncSession):
    user = await db.scalar(select(User).filter(User.phoneNumber == req.phoneNumber))
    if not user:
        raise HTTPException(400, "User not found")
    user.coin += req.coinsToAdd
    await db.commit()
    await db.refresh(user)
    return {"message": "Coins added for sharing successfully", "user": user}

async def recharge_coins(req: AddCoinsRequest, db: AsyncSession):
    user = await db.scalar(select(User).filter(User.phoneNumber == req.phoneNumber))
    if not user:
        raise HTTPException(400, "User not found")
    user.coin += req.coinsToAdd
    await db.commit()
    await db.refresh(user)
    return {"message": "Coins recharged successfully", "user": user}