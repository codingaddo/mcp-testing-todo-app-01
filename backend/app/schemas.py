from datetime import datetime

from pydantic import BaseModel, Field


class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)


class TodoCreate(TodoBase):
    completed: bool | None = False


class TodoUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    completed: bool | None = None


class TodoRead(TodoBase):
    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
