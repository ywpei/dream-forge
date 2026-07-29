"""DreamForge — AI 梦境故事工坊 后端入口。
启动方式（开发）：
    cd backend
    .venv\Scripts\activate
    uvicorn main:app --reload

启动后访问 http://localhost:8000/docs 查看交互式 API 文档。
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import init_db
from routers.dreams import router as dreams_router
from routers.stories import router as stories_router

# 初始化数据库（建表）
init_db()

app = FastAPI(
    title="DreamForge — AI 梦境故事工坊",
    description="API 文档：梦境录入 → 双线解读 → 风格化故事生成 → 故事库管理",
    version="0.1.0",
)

# CORS 中间件：允许前端的开发和生产域名
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(dreams_router, prefix="/api")
app.include_router(stories_router, prefix="/api")


@app.get("/health")
def health():
    """健康检查接口。"""
    return {"status": "ok", "message": "DreamForge API is running"}