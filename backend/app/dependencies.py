from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .config import get_settings
from .models import Base


_settings = get_settings()
_engine = create_async_engine(_settings.database_url, echo=_settings.debug, future=True)
AsyncSessionLocal = async_sessionmaker(_engine, expire_on_commit=False, class_=AsyncSession)


async def init_db() -> None:
    """Create database tables.

    This should be called on application startup.
    """

    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async database session."""

    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
