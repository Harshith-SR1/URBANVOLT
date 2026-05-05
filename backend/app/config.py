"""
Backend configuration
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "URBANVOLT"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "sqlite:///./urbanvolt.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OTP_EXPIRE_MINUTES: int = 5

    # Bootstrap admin
    ADMIN_DEFAULT_EMAIL: str = "admin@urbanvolt.ai"
    ADMIN_DEFAULT_PASSWORD: str = "Admin@123"
    
    # API
    API_V1_STR: str = "/api/v1"
    
    # Simulation
    ENABLE_SIMULATION: bool = True
    SIMULATION_UPDATE_INTERVAL: int = 2
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
