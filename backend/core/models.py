from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class StoryOptionLLM(BaseModel):
    text: str = Field(description="The text of the option shown to the user")
    nextNode: Dict[str, Any] = Field(description="The next node of the story")

class StoryNodeLLM(BaseModel):
    content: str = Field(description="The content of the node")
    isEnding: bool = Field(description="Whether the node is an ending")
    isWinningEnding: bool = Field(description="Whether the node is a winning ending")
    options: List[StoryOptionLLM] = Field(description="The options for the node")

class StoryLLMResponse(BaseModel):
    title: str = Field(description="The title of the story")
    rootNode: StoryNodeLLM = Field(description="The root node of the story")