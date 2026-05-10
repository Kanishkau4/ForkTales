from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

class StoryOptionSchema(BaseModel):
    text: str
    node_id: Optional[Union[int, str]] = None

class StoryNodeSchema(BaseModel):
    content: str
    is_root: bool = Field(default=False)
    is_ending: bool = Field(default=False)
    is_winning_ending: bool = Field(default=False)

class CompleteStoryNodeResponse(StoryNodeSchema):
    id: int
    options: List[StoryOptionSchema] = Field(default_factory=list)

    class Config:
        from_attributes = True

class StorySchema(BaseModel):
    title: str
    theme: Optional[str] = None
    session_id: Optional[str] = None

    class Config:
        from_attributes = True

class CreateStoryRequest(BaseModel):
    theme: str
    difficulty: str = "medium"  # easy | medium | hard

class CompleteStoryResponse(StorySchema):
    id: int
    root_node: CompleteStoryNodeResponse
    created_at: datetime
    updated_at: datetime
    all_nodes: Dict[str, CompleteStoryNodeResponse]
    theme: str
    
    class Config:
        from_attributes = True

class RecentStoryResponse(BaseModel):
    """Lightweight story card for the homepage showcase."""
    id: int
    title: str
    theme: str
    created_at: datetime

    class Config:
        from_attributes = True
