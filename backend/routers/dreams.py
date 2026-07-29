"""梦境路由：CRUD + AI 解读 + AI 故事生成。
所有接口统一前缀 /api/dreams。
"""

import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import Dream, Interpretation, Story, get_db
from schemas.schemas import (
    DreamCreate, DreamResponse, DreamListItem,
    InterpretRequest, InterpretResponse,
    GenerateRequest, GenerateResponse,
)
from services.ai_service import (
    recognize_emotion, interpret_psychology, interpret_literature, generate_story,
)

router = APIRouter(prefix="/dreams", tags=["dreams"])


@router.post("/", response_model=DreamResponse, status_code=201)
def create_dream(data: DreamCreate, db: Session = Depends(get_db)):
    """创建新的梦境记录。"""
    dream = Dream(
        title=data.title,
        content=data.content,
        emotion_tags=json.dumps(data.emotion_tags, ensure_ascii=False),
        date=data.date or datetime.utcnow().strftime("%Y-%m-%d"),
    )
    db.add(dream)
    db.commit()
    db.refresh(dream)

    # AI 情绪识别（失败不影响梦境创建，静默处理）
    try:
        ai_emotion = recognize_emotion(data.content, data.emotion_tags)
        if ai_emotion:
            dream.ai_emotion = ai_emotion
            db.commit()
            db.refresh(dream)
    except Exception:
        pass  # AI 不可用时静默跳过，不阻塞用户

    return dream


@router.get("/", response_model=list[DreamListItem])
def list_dreams(db: Session = Depends(get_db)):
    """获取梦境列表（含关联故事摘要），按创建时间倒序。"""
    dreams = db.query(Dream).order_by(Dream.created_at.desc()).all()
    result = []
    for d in dreams:
        story = db.query(Story).filter(Story.dream_id == d.id).first()
        result.append(DreamListItem(
            id=d.id,
            title=d.title,
            content=d.content[:100],
            emotion_tags=d.emotion_tags,
            date=d.date,
            created_at=d.created_at.isoformat() if d.created_at else "",
            story_title=story.title if story else None,
            story_style=story.style if story else None,
        ))
    return result


@router.get("/{dream_id}", response_model=dict)
def get_dream(dream_id: int, db: Session = Depends(get_db)):
    """获取梦境详情（含完整解读和故事列表）。"""
    dream = db.query(Dream).filter(Dream.id == dream_id).first()
    if not dream:
        raise HTTPException(status_code=404, detail="梦境不存在")

    interpretation = db.query(Interpretation).filter(Interpretation.dream_id == dream_id).first()
    stories = db.query(Story).filter(Story.dream_id == dream_id).order_by(Story.created_at.desc()).all()

    return {
        "dream": {
            "id": dream.id,
            "title": dream.title,
            "content": dream.content,
            "emotion_tags": json.loads(dream.emotion_tags) if dream.emotion_tags else [],
            "ai_emotion": dream.ai_emotion,
            "date": dream.date,
            "is_private": dream.is_private,
            "created_at": dream.created_at.isoformat() if dream.created_at else "",
        },
        "interpretation": {
            "psychology": interpretation.psychology if interpretation else "",
            "literature": interpretation.literature if interpretation else "",
        } if interpretation else None,
        "stories": [
            {
                "id": s.id,
                "title": s.title,
                "style": s.style,
                "length": s.length,
                "content": s.content,
                "slogan": s.slogan,
                "atmosphere_color": s.atmosphere_color,
                "created_at": s.created_at.isoformat() if s.created_at else "",
            }
            for s in stories
        ],
    }


@router.delete("/{dream_id}", status_code=204)
def delete_dream(dream_id: int, db: Session = Depends(get_db)):
    """删除梦境及其关联的解读和故事。"""
    dream = db.query(Dream).filter(Dream.id == dream_id).first()
    if not dream:
        raise HTTPException(status_code=404, detail="梦境不存在")
    db.delete(dream)
    db.commit()


@router.post("/{dream_id}/interpret", response_model=InterpretResponse)
def interpret_dream(dream_id: int, data: InterpretRequest, db: Session = Depends(get_db)):
    """AI 双线解读：心理学线 + 文学隐喻线。"""
    dream = db.query(Dream).filter(Dream.id == dream_id).first()
    if not dream:
        raise HTTPException(status_code=404, detail="梦境不存在")

    # AI 解读（失败时返回友好提示，不报 500）
    emotions_str = "、".join(data.emotion_tags) if data.emotion_tags else "未选择"
    try:
        psychology = interpret_psychology(data.content, emotions_str)
    except Exception:
        psychology = "**【非专业心理提示】** 心理学分析暂时不可用。建议你静下心来回顾最近的生活变化。"
    try:
        literature = interpret_literature(data.content)
    except Exception:
        literature = "文学解读暂时不可用。每个梦境都像一部微电影，不妨试着把梦中的画面写成一个短故事。"

    # 保存解读到数据库
    interpretation = db.query(Interpretation).filter(Interpretation.dream_id == dream_id).first()
    if interpretation:
        interpretation.psychology = psychology
        interpretation.literature = literature
    else:
        interpretation = Interpretation(
            dream_id=dream_id,
            psychology=psychology,
            literature=literature,
        )
        db.add(interpretation)
    db.commit()

    return InterpretResponse(
        psychology=psychology,
        literature=literature,
        ai_emotion=dream.ai_emotion or "",
    )


@router.post("/{dream_id}/generate", response_model=GenerateResponse)
def generate_story_for_dream(dream_id: int, data: GenerateRequest, db: Session = Depends(get_db)):
    """AI 生成风格化故事。"""
    dream = db.query(Dream).filter(Dream.id == dream_id).first()
    if not dream:
        raise HTTPException(status_code=404, detail="梦境不存在")

    interpretation = db.query(Interpretation).filter(Interpretation.dream_id == dream_id).first()
    psychology = interpretation.psychology if interpretation else ""
    literature = interpretation.literature if interpretation else ""

    # AI 生成（失败时返回友好提示，不报 500）
    try:
        result = generate_story(
            content=dream.content,
            psychology=psychology,
            literature=literature,
            style=data.style,
            length=data.length,
        )
    except Exception:
        result = {
            "title": "故事生成暂不可用",
            "content": f"请检查 OpenAI API Key 配置是否正确。\n\n当前模型：{__import__('os').getenv('OPENAI_MODEL', 'gpt-4o-mini')}\nAPI 地址：{__import__('os').getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1')}",
            "slogan": "等待配置完成",
            "atmosphere_color": "#818cf8",
        }

    # 保存故事
    story = Story(
        dream_id=dream_id,
        style=data.style,
        length=data.length,
        title=result["title"],
        content=result["content"],
        slogan=result["slogan"],
        atmosphere_color=result["atmosphere_color"],
    )
    db.add(story)
    db.commit()

    return GenerateResponse(
        title=result["title"],
        content=result["content"],
        slogan=result["slogan"],
        atmosphere_color=result["atmosphere_color"],
    )