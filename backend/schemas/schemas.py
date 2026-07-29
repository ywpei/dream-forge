"""Pydantic 请求/响应模型。
包含所有 API 接口的请求体校验和响应序列化。
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ─── 梦境相关 ───

class DreamCreate(BaseModel):
    """创建梦境的请求体。"""
    title: str = ""
    content: str = Field(..., min_length=1, description="梦境原文")
    emotion_tags: List[str] = Field(default_factory=list, description="用户选择的情绪标签")
    date: str = ""


class DreamResponse(BaseModel):
    """梦境响应（不含关联数据）。"""
    id: int
    title: str
    content: str
    emotion_tags: str
    ai_emotion: str
    date: str
    is_private: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DreamListItem(BaseModel):
    """梦境列表项（含关联故事摘要）。"""
    id: int
    title: str
    content: str
    emotion_tags: str
    date: str
    created_at: str
    story_title: Optional[str] = None
    story_style: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── 解读相关 ───

class InterpretRequest(BaseModel):
    """AI 解读请求。"""
    content: str = Field(..., min_length=1)
    emotion_tags: List[str] = Field(default_factory=list)


class InterpretResponse(BaseModel):
    """AI 解读响应。"""
    psychology: str
    literature: str
    ai_emotion: str


# ─── 故事生成相关 ───

class GenerateRequest(BaseModel):
    """AI 故事生成请求。"""
    style: str = Field(..., pattern="^(healing|fantasy|mystery|scifi)$")
    length: str = Field(..., pattern="^(short|full|outline)$")


class GenerateResponse(BaseModel):
    """AI 故事生成响应。"""
    title: str
    content: str
    slogan: str
    atmosphere_color: str


# ─── 故事库相关 ───

class StoryResponse(BaseModel):
    """故事响应。"""
    id: int
    dream_id: int
    style: str
    length: str
    title: str
    content: str
    slogan: str
    atmosphere_color: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ContinueRequest(BaseModel):
    """故事续写请求。"""
    style: str = ""
    content: str = ""


class RewriteRequest(BaseModel):
    """故事重写请求。"""
    style: str = Field(..., pattern="^(healing|fantasy|mystery|scifi)$")
    target_content: str = ""
