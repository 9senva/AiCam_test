import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "mysql+aiomysql://root:111111@localhost/cam"
engine = create_async_engine(DATABASE_URL, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, autoflush=False, autocommit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)