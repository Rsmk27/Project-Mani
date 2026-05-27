from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Telegram settings
    TELEGRAM_BOT_TOKEN: str
    TELEGRAM_SECRET_TOKEN: str = "super_secret_token"  # For webhook verification
    WEBHOOK_URL: str

    # Backend settings
    BACKEND_API_URL: str
    BACKEND_API_KEY: Optional[str] = None

    # App settings
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
