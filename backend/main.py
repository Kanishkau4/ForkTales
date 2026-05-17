from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# pyrefly: ignore [missing-import]
from core.config import settings
# pyrefly: ignore [missing-import]
from routers import story, job, user
# pyrefly: ignore [missing-import]
from db.database import create_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    try:
        print("Starting up: Creating tables...")
        create_tables()
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")
    yield
    # Shutdown: Clean up if needed

app = FastAPI(
    title="ForkTales: Choose Your Own Adventure Stories",
    description="A platform for creating and playing choose your own adventure stories.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(story.router, prefix=settings.API_PREFIX)
app.include_router(job.router, prefix=settings.API_PREFIX)
app.include_router(user.router, prefix=settings.API_PREFIX)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ForkTales Backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)