import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.database import SessionLocal, create_tables
from core.story_generator import StoryGenerator

def test():
    create_tables()
    db = SessionLocal()
    try:
        print("Testing story generation...")
        story_id = StoryGenerator.generate_story(db, "test_session", "Space Adventure")
        print(f"Success! Story ID: {story_id}")
    except Exception as e:
        print(f"Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test()
