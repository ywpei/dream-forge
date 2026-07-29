"""Vercel Serverless Function 入口。"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import init_db
from routers.dreams import router as dreams_router
from routers.stories import router as stories_router
init_db()
app = FastAPI(title="DreamForge API", version="0.1.0")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "https://dream-forge.vercel.app")
app.add_middleware(CORSMiddleware, allow_origins=[o.strip() for o in CORS_ORIGINS.split(",")], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(dreams_router, prefix="/api")
app.include_router(stories_router, prefix="/api")
@app.get("/api/health")
def health():
    return {"status": "ok", "message": "DreamForge API is running"}
from vercel import asgi_handler
handler = asgi_handler(app)