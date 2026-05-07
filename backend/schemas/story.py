from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class StoryOptionSchema(BaseModel):
    text: str
    node_id: Optional[str] = None

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
    session_id: Optional[str] = None

    class Config:
        from_attributes = True

class CreateStoryRequest(StorySchema):
    theme: str

class CompleteStoryResponse(StorySchema):
    id: int
    root_node: CompleteStoryNodeResponse
    created_at: datetime
    updated_at: datetime
    all_nodes: Dict[str, CompleteStoryNodeResponse]
    
    class Config:
        from_attributes = True

