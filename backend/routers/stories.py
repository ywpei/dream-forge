"""故事库路由：CRUD + 续写 + 重写。
所有接口统一前缀 /api/stories。
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import Story, get_db
from schemas.schemas import (
    StoryResponse, ContinueRequest, RewriteRequest,
)
from services.ai_service import continue_story, rewrite_story

router = APIRouter(prefix="/stories", tags=["stories"])


@router.get("/", response_model=list[StoryResponse])
def list_stories(db: Session = Depends(get_db)):
    """获取所有故事，按创建时间倒序。"""
    stories = db.query(Story).order_by(Story.created_at.desc()).all()
    return [
        StoryResponse(
            id=s.id,
            dream_id=s.dream_id,
            style=s.style,
            length=s.length,
            title=s.title,
            content=s.content,
            slogan=s.slogan,
            atmosphere_color=s.atmosphere_color,
            created_at=s.created_at.isoformat() if s.created_at else "",
        )
        for s in stories
    ]


@router.get("/{story_id}", response_model=StoryResponse)
def get_story(story_id: int, db: Session = Depends(get_db)):
    """获取单篇故事详情。"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="故事不存在")
    return StoryResponse(
        id=story.id,
        dream_id=story.dream_id,
        style=story.style,
        length=story.length,
        title=story.title,
        content=story.content,
        slogan=story.slogan,
        atmosphere_color=story.atmosphere_color,
        created_at=story.created_at.isoformat() if story.created_at else "",
    )


@router.delete("/{story_id}", status_code=204)
def delete_story(story_id: int, db: Session = Depends(get_db)):
    """删除故事。"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="故事不存在")
    db.delete(story)
    db.commit()


@router.post("/{story_id}/continue")
def continue_story_endpoint(story_id: int, data: ContinueRequest, db: Session = Depends(get_db)):
    """续写故事。传入原故事内容即可，风格从已有故事继承。"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="故事不存在")

    style = data.style or story.style
    prev_content = data.content or story.content
    result = continue_story(content=prev_content, style=style)

    return {
        "original_story_id": story_id,
        "continued_content": result,
        "style": style,
    }


@router.post("/{story_id}/rewrite")
def rewrite_story_endpoint(story_id: int, data: RewriteRequest, db: Session = Depends(get_db)):
    """换风格重写故事（支持局部重写：传入 target_content 仅改写该段落）。"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="故事不存在")

    target = data.target_content if data.target_content else story.content
    result = rewrite_story(content=target, style=data.style)

    return {
        "original_story_id": story_id,
        "rewritten_content": result,
        "style": data.style,
        "is_partial": bool(data.target_content),
    }
