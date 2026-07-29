"""SQLite 数据库模型定义。
本模块使用 SQLAlchemy ORM 定义三张核心表：
- dreams: 梦境记录（含情绪标签、AI 识别情绪、私密标记）
- interpretations: 双线解读结果（心理学线 + 文学隐喻线）
- stories: 生成的故事（绑定风格、篇幅、氛围信息）
"""

import os
import json
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, Text, String, Boolean,
    DateTime, ForeignKey, JSON, text
)
from sqlalchemy.orm import declarative_base, relationship, Session

# 数据库文件路径：项目根目录下的 db.sqlite3
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "db.sqlite3")
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False, connect_args={"check_same_thread": False})

Base = declarative_base()


class Dream(Base):
    """梦境记录表。"""
    __tablename__ = "dreams"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), default="")                     # 梦境标题（可选）
    content = Column(Text, nullable=False)                      # 梦境原文
    emotion_tags = Column(Text, default="[]")                   # 用户选择的情绪标签，JSON 数组
    ai_emotion = Column(Text, default="")                       # AI 二次识别的情绪
    date = Column(String(10), default="")                       # 梦境日期 YYYY-MM-DD
    is_private = Column(Boolean, default=False)                 # 私密模式标记
    created_at = Column(DateTime, default=datetime.utcnow)      # 创建时间

    # 关联关系
    interpretation = relationship("Interpretation", back_populates="dream", uselist=False, cascade="all, delete-orphan")
    stories = relationship("Story", back_populates="dream", cascade="all, delete-orphan")


class Interpretation(Base):
    """双线解读结果表。"""
    __tablename__ = "interpretations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dream_id = Column(Integer, ForeignKey("dreams.id"), nullable=False)
    psychology = Column(Text, default="")                       # 心理学线分析
    literature = Column(Text, default="")                       # 文学隐喻线解读
    created_at = Column(DateTime, default=datetime.utcnow)

    dream = relationship("Dream", back_populates="interpretation")


class Story(Base):
    """生成的故事表。"""
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dream_id = Column(Integer, ForeignKey("dreams.id"), nullable=False)
    style = Column(String(20), default="fantasy")               # 风格：治愈/奇幻/悬疑/科幻
    length = Column(String(20), default="short")                # 篇幅：short/full/outline
    title = Column(String(200), default="")                     # 故事标题
    content = Column(Text, nullable=False)                      # 完整故事文本
    slogan = Column(String(100), default="")                    # 氛围 Slogan
    atmosphere_color = Column(String(7), default="#818cf8")     # 氛围配色 hex
    created_at = Column(DateTime, default=datetime.utcnow)

    dream = relationship("Dream", back_populates="stories")


def init_db():
    """初始化数据库：创建所有表（如果不存在）。"""
    Base.metadata.create_all(engine)


def get_db() -> Session:
    """获取数据库会话（简单上下文方式）。"""
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()
