# pyrefly: ignore [missing-import]
from core.models import StoryNodeLLM, StoryLLMResponse
from sqlalchemy.orm import Session

# pyrefly: ignore [missing-import]
from core.config import settings
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

# pyrefly: ignore [missing-import]
from core.prompts import get_story_prompt
# pyrefly: ignore [missing-import]
from models.story import Story, Node
from fastapi import HTTPException

from dotenv import load_dotenv
import json
import re

load_dotenv()

class StoryGenerator:
    
    @classmethod
    def _get_llm(cls):
        return ChatGroq(
            model="llama-3.3-70b-versatile",
        )

    @classmethod
    def generate_story(cls, db: Session, session_id: str, theme: str = "fantasy", difficulty: str = "medium") -> int:
        llm = cls._get_llm()
        story_parser = PydanticOutputParser(pydantic_object=StoryLLMResponse)
        
        # Get difficulty-aware prompt
        story_prompt = get_story_prompt(difficulty)

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    story_prompt
                ),
                (
                    "user",
                    "Theme: {theme}\nFormat instructions: {format_instructions}\n\nRemember: output ONLY valid JSON, no comments, no extra text."
                )
            ]
        ).partial(format_instructions=story_parser.get_format_instructions())

        raw_response = llm.invoke(prompt.invoke({"theme": theme}))

        response_text = raw_response
        if hasattr(raw_response, "content"):
            response_text = raw_response.content

        # Step 1: Extract JSON block (find outermost { ... })
        start_index = response_text.find("{")
        end_index = response_text.rfind("}")
        
        if start_index == -1 or end_index == -1:
            raise ValueError(f"LLM did not return valid JSON. Response: {response_text[:500]}")
            
        response_text = response_text[start_index : end_index + 1]

        # Step 2: Strip JS-style comments that break JSON parsing
        response_text = re.sub(r'//[^\n\r]*', '', response_text)
        response_text = re.sub(r'/\*.*?\*/', '', response_text, flags=re.DOTALL)
        # Remove trailing commas before } or ]
        response_text = re.sub(r',\s*([}\]])', r'\1', response_text)
        
        print(f"DEBUG: Cleaned LLM Response (first 200 chars): {response_text[:200]}...")

        try:
            story_structure = story_parser.parse(response_text)
        except Exception as e:
            print(f"ERROR: Pydantic parsing failed: {e}")
            # print(f"DEBUG: Full response text for debugging: {response_text}")
            raise ValueError(f"Failed to parse story structure. Check logs.")

        story_db = Story(
            session_id=session_id,
            title=story_structure.title,
            theme=theme
        )
        db.add(story_db)
        db.commit()
        db.refresh(story_db)

        root_node_data = story_structure.rootNode

        if isinstance(root_node_data, dict):
            root_node_data = StoryNodeLLM.model_validate(root_node_data)

        # Save the story nodes recursively
        cls._save_nodes_recursively(db, root_node_data, story_db, is_root=True)

        db.commit()

        return story_db.id
        
    @classmethod
    def _save_nodes_recursively(cls, db: Session, parent_node: StoryNodeLLM, story_db: Story, is_root: bool = False) -> Node:
        node = Node(
            story_id=story_db.id,
            content=parent_node.content,
            is_root=is_root,
            is_ending=parent_node.isEnding,
            is_winning_ending=parent_node.isWinningEnding,
            options=[]
        )

        db.add(node)
        db.commit()
        db.refresh(node)
        db.flush()

        if not node.is_ending and parent_node.options:
            options_list = []

            for option_data in parent_node.options:
                next_node_data = option_data.nextNode

                if isinstance(next_node_data, dict):
                    next_node_data = StoryNodeLLM.model_validate(next_node_data)
                
                child_node = cls._save_nodes_recursively(db, next_node_data, story_db, False)

                options_list.append(
                    {
                        "text": option_data.text,
                        "node_id": str(child_node.id)
                    }
                )
            
            node.options = options_list
            db.add(node)
            db.commit()
        
        db.flush()
        return node