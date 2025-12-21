from contextlib import asynccontextmanager
from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()  # 加载 .env 文件

from app.database.connection import init_models, engine
from app.routers import auth, coin, ai

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    await init_models()
    print("Database models have been initialized.")
    yield
    print("Shutting down...")
    await engine.dispose()
    print("Database connection pool has been disposed.")

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(coin.router, prefix="/api", tags=["coin"])
app.include_router(ai.router, prefix="/api", tags=["ai"])