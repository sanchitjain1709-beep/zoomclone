from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Zoom Clone API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # SQLite Database URL with aiosqlite async driver (safely ignore Postgres URLs injected by cloud hosts)
    DATABASE_URL: str = (
        "sqlite+aiosqlite:///./zoom_clone.db"
        if not os.getenv("DATABASE_URL") or "postgres" in os.getenv("DATABASE_URL", "").lower()
        else (
            os.getenv("DATABASE_URL").replace("sqlite:///", "sqlite+aiosqlite:///")
            if os.getenv("DATABASE_URL", "").startswith("sqlite:///") and not os.getenv("DATABASE_URL", "").startswith("sqlite+aiosqlite:///")
            else os.getenv("DATABASE_URL")
        )
    )
    
    # SQLite WAL mode settings
    ENABLE_WAL_MODE: bool = True
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Default User Data (from real Zoom screenshots)
    DEFAULT_USER_NAME: str = "Sanchit Jain"
    DEFAULT_USER_EMAIL: str = "sanchit.jain@zoom.clone"
    DEFAULT_USER_PLAN: str = "Workplace Basic"
    DEFAULT_USER_PMI: str = "948 007 6202"
    DEFAULT_USER_AVATAR: str = "S"

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
