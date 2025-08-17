from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama2"  # Change this to your preferred model
    OLLAMA_MAX_TOKENS: int = 1000
    OLLAMA_TEMPERATURE: float = 0.7
    
    # Audio Configuration
    ELEVENLABS_API_KEY: Optional[str] = None
    USE_LOCAL_TTS: bool = True  # Use Web Speech API if True
    
    # Avatar Configuration
    AVATAR_IMAGE_PATH: str = "assets/avatar.jpeg"
    AVATAR_NAME: str = "Wealth Manager"
    
    # Knowledge Base
    KNOWLEDGE_BASE_PATH: str = "knowledge_base"
    
    class Config:
        env_file = ".env"

settings = Settings() 