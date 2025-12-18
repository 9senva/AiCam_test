from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.schemas.request import AddCoinsRequest
from app.services.coin_service import share_coins, recharge_coins

router = APIRouter()

@router.post("/share-coins")
async def share_coins(req: AddCoinsRequest, db: AsyncSession = Depends(get_db)):
    return await share_coins(req, db)

@router.post("/recharge-coins")
async def recharge_coins(req: AddCoinsRequest, db: AsyncSession = Depends(get_db)):
    return await recharge_coins(req, db)