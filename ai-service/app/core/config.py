from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # ========= Supabase Configurations =========
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")

    # Optional: Service role (jika kamu mau akses rows tanpa RLS)
    #SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY")

    # ========= OpenAI Configurations =========
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

    # Default model for your AI agents
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()