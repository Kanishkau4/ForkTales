# pyrefly: ignore [missing-import]
from core.models import StoryNodeLLM, StoryLLMResponse
from sqlalchemy.orm import Session

# pyrefly: ignore [missing-import]
from core.config import settings
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
try:
    # pyrefly: ignore [missing-import]
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

# pyrefly: ignore [missing-import]
from core.prompts import get_story_prompt, get_sinhala_story_prompt
# pyrefly: ignore [missing-import]
from models.story import Story, Node
from fastapi import HTTPException

from dotenv import load_dotenv
import json
import re
from urllib.parse import quote
import random
import requests

load_dotenv()

class StoryGenerator:
    
    @classmethod
    def _get_llm(cls, language: str = "english"):
        if language == "sinhala":
            if ChatGoogleGenerativeAI is None:
                raise RuntimeError("langchain-google-genai is not installed. Run: uv add langchain-google-genai")
            if not settings.GEMINI_API_KEY:
                raise RuntimeError("GEMINI_API_KEY is not set in .env")
            return ChatGoogleGenerativeAI(
                model="gemini-3-flash-preview",
                google_api_key=settings.GEMINI_API_KEY,
            )
        return ChatGroq(
            model="llama-3.3-70b-versatile",
        )

    @classmethod
    def generate_story(cls, db: Session, session_id: str, user_id: str, theme: str = "fantasy", difficulty: str = "easy", language: str = "english") -> int:
        llm = cls._get_llm(language)
        story_parser = PydanticOutputParser(pydantic_object=StoryLLMResponse)
        
        # Get difficulty + language-aware prompt
        if language == "sinhala":
            story_prompt = get_sinhala_story_prompt(difficulty)
        else:
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

        model_name = "Gemini" if language == "sinhala" else "Groq"
        print(f"1. Sending request to {model_name}...")
        raw_response = llm.invoke(prompt.invoke({"theme": theme}))
        print(f"2. Response received from {model_name}!")

        response_text = raw_response
        if hasattr(raw_response, "content"):
            response_text = raw_response.content
            
        # Handle cases where content might be a list (some Gemini versions)
        if isinstance(response_text, list):
            text_parts = []
            for part in response_text:
                if isinstance(part, str):
                    text_parts.append(part)
                elif isinstance(part, dict) and "text" in part:
                    text_parts.append(part["text"])
                elif hasattr(part, "text"): # for some object types
                    text_parts.append(part.text)
            response_text = "".join(text_parts)

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

        # Generate visual assets using the English image_prompt
        safe_img_prompt = quote(story_structure.image_prompt)
        seed = random.randint(1, 999999)
        
        bg_url = f"https://image.pollinations.ai/prompt/16-bit+pixel+art+epic+wide+background+scene+of+{safe_img_prompt}?width=1920&height=1080&nologo=true&seed={seed}"
        cover_url = f"https://image.pollinations.ai/prompt/16-bit+pixel+art+beautiful+cover+art+poster+of+{safe_img_prompt}?width=1024&height=1024&nologo=true&seed={seed}"

        story_db = Story(
            session_id=session_id,
            user_id=user_id,
            title=story_structure.title,
            theme=theme,
            cover_image=cover_url
        )
        db.add(story_db)
        db.commit()
        db.refresh(story_db)

        root_node_data = story_structure.rootNode

        if isinstance(root_node_data, dict):
            root_node_data = StoryNodeLLM.model_validate(root_node_data)

        # Save the story nodes recursively, passing the common background image
        cls._save_nodes_recursively(db, root_node_data, story_db, bg_url, is_root=True)

        # Warm up the images: Ping Pollinations to trigger generation
        # This helps ensure the image is ready when the frontend tries to load it
        print("3. Warming up Pollinations images...")
        try:
            requests.get(cover_url, timeout=10)
            requests.get(bg_url, timeout=10)
            print("4. Image warm-up triggered!")
        except Exception as e:
            print(f"Warning: Image warm-up failed: {e}")

        db.commit()

        return story_db.id
        
    @classmethod
    def _save_nodes_recursively(cls, db: Session, parent_node: StoryNodeLLM, story_db: Story, bg_url: str, is_root: bool = False) -> Node:
        node = Node(
            story_id=story_db.id,
            content=parent_node.content,
            background_image=bg_url,
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
                
                child_node = cls._save_nodes_recursively(db, next_node_data, story_db, bg_url, False)

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