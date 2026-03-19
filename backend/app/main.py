from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from . import crud
from .config import get_settings
from .dependencies import get_db, init_db
from .schemas import TodoCreate, TodoRead, TodoUpdate


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(title=settings.app_name, debug=settings.debug)

    @app.on_event("startup")
    async def on_startup() -> None:  # pragma: no cover - framework hook
        await init_db()

    @app.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/todos", response_model=list[TodoRead], tags=["todos"])
    async def list_todos(db: AsyncSession = Depends(get_db)):
        todos = await crud.list_todos(db)
        return todos

    @app.post(
        "/todos",
        response_model=TodoRead,
        status_code=status.HTTP_201_CREATED,
        tags=["todos"],
    )
    async def create_todo(todo_in: TodoCreate, db: AsyncSession = Depends(get_db)):
        todo = await crud.create_todo(db, todo_in)
        return todo

    @app.get("/todos/{todo_id}", response_model=TodoRead, tags=["todos"])
    async def get_todo(todo_id: int, db: AsyncSession = Depends(get_db)):
        todo = await crud.get_todo(db, todo_id)
        if not todo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
        return todo

    @app.put("/todos/{todo_id}", response_model=TodoRead, tags=["todos"])
    async def update_todo(todo_id: int, todo_in: TodoUpdate, db: AsyncSession = Depends(get_db)):
        todo = await crud.get_todo(db, todo_id)
        if not todo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
        updated = await crud.update_todo(db, todo, todo_in)
        return updated

    @app.delete(
        "/todos/{todo_id}",
        status_code=status.HTTP_204_NO_CONTENT,
        tags=["todos"],
    )
    async def delete_todo(todo_id: int, db: AsyncSession = Depends(get_db)):
        todo = await crud.get_todo(db, todo_id)
        if not todo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
        await crud.delete_todo(db, todo)
        return None

    @app.post("/todos/{todo_id}/toggle", response_model=TodoRead, tags=["todos"])
    async def toggle_todo(todo_id: int, db: AsyncSession = Depends(get_db)):
        todo = await crud.get_todo(db, todo_id)
        if not todo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
        toggled = await crud.toggle_todo_completion(db, todo)
        return toggled

    return app


app = create_app()
