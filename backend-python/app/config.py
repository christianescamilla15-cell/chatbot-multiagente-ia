"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration sourced from env / .env file."""

    ANTHROPIC_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    DATABASE_URL: str = ""
    REDIS_URL: str = "redis://redis:6379"
    TWILIO_SID: str = ""
    TWILIO_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"
    ALLOWED_ORIGINS: str = "http://localhost:3001,https://chatbot-multiagente-ia.vercel.app"
    PORT: int = 8000
    MAX_MESSAGE_LENGTH: int = 2000
    RATE_LIMIT_PER_MINUTE: int = 30

    @property
    def origins_list(self) -> list[str]:
        """Parse comma-separated origins into a list."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @property
    def is_demo_mode(self) -> bool:
        """True when no valid Anthropic key is configured."""
        return not self.ANTHROPIC_API_KEY or self.ANTHROPIC_API_KEY.startswith("sk-ant-YOUR")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
