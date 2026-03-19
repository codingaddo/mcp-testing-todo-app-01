from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration settings.

    Values can be overridden via environment variables.
    """

    app_name: str = "MCP Testing Todo API"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./todo.db"

    class Config:
        env_prefix = "TODO_APP_"
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings instance."""

    return Settings()
