import uvicorn
import asyncio
from sqlalchemy.exc import OperationalError
from app.database.connection import engine, init_models

async def check_and_init_db():
    """
    检查数据库连接并按需初始化数据表。
    """
    try:
        # 尝试建立连接
        async with engine.connect() as conn:
            print("✅ 数据库连接成功 (Database connection successful)")
        
        # 初始化数据库 (如果表不存在则创建)
        print("⏳ 正在初始化数据库...")
        await init_models()
        print("✅ 数据库初始化完成 (Database initialization complete)")
        return True  # 表示成功
        
    except OperationalError as e:
        print("❌ 数据库连接失败 (Database connection failed)")
        print(f"   - 错误详情: {e.orig}")
        print("\n请进行以下检查:")
        print("1. 确保您的 MySQL 服务正在运行。")
        print(f"2. 确认应用可以访问数据库地址: {engine.url.host}:{engine.url.port or 3306}")
        print(f"3. 检查用户名 '{engine.url.username}' 和密码是否正确。")
        print(f"4. 确保数据库 '{engine.url.database}' 已经创建。")
        print("\n应用无法启动，请在解决数据库问题后重试。")
        return False  # 表示失败
        
    except Exception as e:
        print(f"❌ 启动过程中发生未知错误: {e}")
        return False  # 表示失败

if __name__ == "__main__":
    print("🚀 开始启动后端服务...")
    
    # 运行数据库检查和初始化
    db_ready = asyncio.run(check_and_init_db())
    
    if db_ready:
        print("▶️ 数据库准备就绪，正在启动 FastAPI 应用...")
        # 使用 uvicorn 启动 FastAPI 应用
        # reload=True 表示代码修改后自动重启，适合开发环境
        uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
    else:
        print("🛑 后端服务启动失败，请检查数据库配置。")
