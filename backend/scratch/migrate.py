import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in environment")
    exit(1)

engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        print("Checking for missing columns...")
        
        # Add cover_image to stories
        try:
            conn.execute(text("ALTER TABLE stories ADD COLUMN cover_image VARCHAR"))
            print("Added cover_image to stories")
        except Exception as e:
            print(f"cover_image already exists or error")
            
        # Add user_id to stories
        try:
            conn.execute(text("ALTER TABLE stories ADD COLUMN user_id VARCHAR"))
            print("Added user_id to stories")
        except Exception as e:
            print(f"user_id already exists or error")
            
        # Add background_image to story_nodes
        try:
            conn.execute(text("ALTER TABLE story_nodes ADD COLUMN background_image VARCHAR"))
            print("Added background_image to story_nodes")
        except Exception as e:
            print(f"background_image already exists or error")
            
        conn.commit()
        print("Migration complete!")

if __name__ == "__main__":
    migrate()
