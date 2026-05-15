from uuid import uuid4
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, Cookie, Response, BackgroundTasks
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from db.database import get_db, SessionLocal
# pyrefly: ignore [missing-import]
from models.story import Story, Node
# pyrefly: ignore [missing-import]
from models.profile import Profile
# pyrefly: ignore [missing-import]
from models.job import StoryJob
# pyrefly: ignore [missing-import]
from schemas.story import (
    CompleteStoryNodeResponse, 
    CompleteStoryResponse, 
    CreateStoryRequest,
    RecentStoryResponse
)
# pyrefly: ignore [missing-import]
from schemas.job import JobStatusResponse, StoryJobRequest
# pyrefly: ignore [missing-import]
from core.story_generator import StoryGenerator

router = APIRouter(
    prefix="/story",
    tags=["Story"]
)

async def get_session_id(request: Request) -> str:
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = str(uuid4())
    return session_id

# pyrefly: ignore [missing-import]
from util.email import send_story_notification

@router.post("/create", response_model=JobStatusResponse)
def create_story(
    request: CreateStoryRequest,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None,
    session_id: str = Depends(get_session_id),
    response: Response = None
):
    response.set_cookie(key="session_id", value=session_id, httponly=True)

    if not request.user_id:
        raise HTTPException(status_code=401, detail="You must be logged in to create a story.")

    # Mana check logic
    today = datetime.utcnow().date()
    profile = db.query(Profile).filter(Profile.user_id == request.user_id).first()
    
    if not profile:
        profile = Profile(user_id=request.user_id, mana_points=5, last_refill_date=today)
        db.add(profile)
    else:
        # Refill if not today
        if profile.last_refill_date != today:
            profile.mana_points = 5
            profile.last_refill_date = today

    if profile.mana_points <= 0:
        raise HTTPException(
            status_code=403, 
            detail="Out of Mana! ⚡ Please come back tomorrow to forge new adventures."
        )

    # Deduct mana
    profile.mana_points -= 1
    db.commit()
    db.refresh(profile)

    job_id = str(uuid4())
    
    job = StoryJob(
        job_id=job_id,
        session_id=session_id,
        theme=request.theme,
        status="pending"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(
        generate_story_task,
        job_id=job_id,
        session_id=session_id,
        user_id=request.user_id,
        user_email=request.user_email,
        theme=request.theme,
        difficulty=request.difficulty,
        language=request.language
    )

    return job

def generate_story_task(job_id: str, session_id: str, user_id: str, user_email: str, theme: str, difficulty: str = "easy", language: str = "english"):
    db = SessionLocal()

    try:
        job = db.query(StoryJob).filter(StoryJob.job_id == job_id).first()
        if not job:
            return
        
        try:
            job.status = "running"
            db.commit()
            db.refresh(job)
        
            story_id = StoryGenerator.generate_story(db, session_id, user_id, theme, difficulty, language)

            # Update job status
            job.story_id = story_id
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            db.commit()
            db.refresh(job)

            # Send notification email if user provided one
            if user_email:
                story = db.query(Story).filter(Story.id == story_id).first()
                if story:
                    send_story_notification(user_email, story.title, story.id)

        except Exception as e:
            import traceback
            job.status = "failed"
            job.error = f"{str(e)}\n{traceback.format_exc()}"
            db.commit()
            db.refresh(job)
    finally:
        db.close()

@router.get("/recent", response_model=list[RecentStoryResponse])
def get_recent_stories(
    limit: int = 8,
    db: Session = Depends(get_db),
):
    """Return the most recently created stories that are published for the community library."""
    stories = (
        db.query(Story)
        .filter(Story.is_published == True)
        .order_by(Story.created_at.desc())
        .limit(limit)
        .all()
    )
    return stories

@router.patch("/{story_id}/publish")
def toggle_publish(
    story_id: int,
    db: Session = Depends(get_db)
):
    """Toggle the published status of a story."""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    story.is_published = not story.is_published
    db.commit()
    db.refresh(story)
    return {"status": "success", "is_published": story.is_published}

@router.get("/user/{user_id}", response_model=list[RecentStoryResponse])
def get_user_stories(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Return all stories created by a specific user."""
    stories = (
        db.query(Story)
        .filter(Story.user_id == user_id)
        .order_by(Story.created_at.desc())
        .all()
    )
    return stories

@router.get("/{story_id}/complete", response_model=CompleteStoryResponse)
def complete_story(
    story_id: int,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id)
):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    return build_complete_story_tree(db, story)


def build_complete_story_tree(db: Session, story: Story) -> CompleteStoryResponse:
    
    nodes = db.query(Node).filter(Node.story_id == story.id).all()
    
    node_dicts = {}

    for node in nodes:
        node_response = CompleteStoryNodeResponse(
            id=node.id,
            content=node.content,
            background_image=node.background_image,
            is_ending=node.is_ending,
            is_winning_ending=node.is_winning_ending,
            options=node.options
        )

        node_dicts[str(node.id)] = node_response

    root_node = next((node for node in nodes if node.is_root), None)
    if not root_node:
        raise HTTPException(status_code=404, detail="Story Root node not found")
    
    return CompleteStoryResponse(
        id=story.id,
        title=story.title,
        cover_image=story.cover_image,
        session_id=story.session_id,
        created_at=story.created_at,
        updated_at=story.updated_at,
        root_node=node_dicts[str(root_node.id)],
        all_nodes=node_dicts,
        theme=story.theme
    )
