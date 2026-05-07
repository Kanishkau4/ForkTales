from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Any

class Settings(BaseSettings):
    DATABASE_URL: str
    API_PREFIX: str
    DEBUG: bool
    ALLOWED_ORIGINS: Any
    OPENAI_API_KEY: str
    GROQ_API_KEY: str
    
    @field_validator("ALLOWED_ORIGINS", mode='before')
    @classmethod
    def _parse_allowed_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        env_delimiter=","
    )
    
settings = Settings()   