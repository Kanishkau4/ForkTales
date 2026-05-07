from uuid import uuid4
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, Cookie, Response, BackgroundTasks
from sqlalchemy.orm import Session

from db.database import get_db, SessionLocal
from models.story import Story, Node
from models.job import StoryJob
from schemas.story import (
    CompleteStoryNodeResponse, 
    CompleteStoryResponse, 
    CreateStoryRequest
)
from schemas.job import JobStatusResponse, StoryJobRequest
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

@router.post("/create", response_model=JobStatusResponse)
def create_story(
    request: CreateStoryRequest,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None,
    session_id: str = Depends(get_session_id),
    response: Response = None
):
    response.set_cookie(key="session_id", value=session_id, httponly=True)

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
        job_id = job_id,
        session_id = session_id,
        theme = request.theme
    )

    return job

def generate_story_task(job_id: str, session_id: str, theme: str):
    db = SessionLocal()

    try:
        job = db.query(StoryJob).filter(StoryJob.job_id == job_id).first()
        if not job:
            return
        
        try:
            job.status = "running"
            db.commit()
            db.refresh(job)
        
            story_id = StoryGenerator.generate_story(db, session_id, theme)

            job.story_id = story_id
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            db.commit()
            db.refresh(job)

        except Exception as e:
            job.status = "failed"
            job.error = str(e)
            db.commit()
            db.refresh(job)
    finally:
        db.close()

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
        session_id=story.session_id,
        created_at=story.created_at,
        updated_at=story.updated_at,
        root_node=node_dicts[str(root_node.id)],
        all_nodes=node_dicts
    )
