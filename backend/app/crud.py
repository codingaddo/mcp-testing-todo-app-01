from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Todo
from .schemas import TodoCreate, TodoUpdate


async def list_todos(db: AsyncSession) -> Sequence[Todo]:
    result = await db.execute(select(Todo).order_by(Todo.id))
    return result.scalars().all()


async def get_todo(db: AsyncSession, todo_id: int) -> Todo | None:
    return await db.get(Todo, todo_id)


async def create_todo(db: AsyncSession, todo_in: TodoCreate) -> Todo:
    todo = Todo(
        title=todo_in.title,
        description=todo_in.description,
        completed=bool(todo_in.completed),
    )
    db.add(todo)
    await db.commit()
    await db.refresh(todo)
    return todo


async def update_todo(db: AsyncSession, todo: Todo, todo_in: TodoUpdate) -> Todo:
    if todo_in.title is not None:
        todo.title = todo_in.title
    if todo_in.description is not None:
        todo.description = todo_in.description
    if todo_in.completed is not None:
        todo.completed = todo_in.completed

    await db.commit()
    await db.refresh(todo)
    return todo


async def delete_todo(db: AsyncSession, todo: Todo) -> None:
    await db.delete(todo)
    await db.commit()


async def toggle_todo_completion(db: AsyncSession, todo: Todo) -> Todo:
    todo.completed = not todo.completed
    await db.commit()
    await db.refresh(todo)
    return todo
