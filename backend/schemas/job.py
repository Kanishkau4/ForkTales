from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class StoryJobRequest(BaseModel):
    theme: str

class JobStatusResponse(BaseModel):
    job_id: str
    theme: Optional[str] = None
    status: str
    story_id: Optional[int] = None
    error: Optional[str] = None
    result: Optional[dict] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StoryJobCreate(StoryJobRequest):
    pass
