import pytest
from httpx import AsyncClient

from app.main import app
from app.dependencies import init_db


@pytest.fixture(scope="module", autouse=True)
async def setup_db():
    await init_db()
    yield


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_create_and_list_todos(tmp_path, monkeypatch):
    # Use a temporary SQLite database for isolation
    from app import config

    test_db_url = f"sqlite+aiosqlite:///{tmp_path}/test.db"

    class TestSettings(config.Settings):
        database_url: str = test_db_url

    monkeypatch.setattr(config, "get_settings", lambda: TestSettings())

    # Recreate app with test settings
    from importlib import reload
    from app import dependencies, main as app_main

    reload(dependencies)
    reload(app_main)

    test_app = app_main.create_app()

    async with AsyncClient(app=test_app, base_url="http://test") as ac:
        # Ensure DB is initialized
        await init_db()

        # Initially empty
        resp = await ac.get("/todos")
        assert resp.status_code == 200
        assert resp.json() == []

        # Create todo
        payload = {"title": "Test todo", "description": "Test description"}
        resp = await ac.post("/todos", json=payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == payload["title"]
        assert data["description"] == payload["description"]
        assert data["completed"] is False

        # List should now contain one item
        resp = await ac.get("/todos")
        assert resp.status_code == 200
        todos = resp.json()
        assert len(todos) == 1


@pytest.mark.asyncio
async def test_get_update_toggle_delete_todo(tmp_path, monkeypatch):
    from app import config

    test_db_url = f"sqlite+aiosqlite:///{tmp_path}/test2.db"

    class TestSettings(config.Settings):
        database_url: str = test_db_url

    monkeypatch.setattr(config, "get_settings", lambda: TestSettings())

    from importlib import reload
    from app import dependencies, main as app_main

    reload(dependencies)
    reload(app_main)

    test_app = app_main.create_app()

    async with AsyncClient(app=test_app, base_url="http://test") as ac:
        await init_db()

        # Create todo
        payload = {"title": "Another todo", "description": "More testing"}
        resp = await ac.post("/todos", json=payload)
        assert resp.status_code == 201
        todo = resp.json()
        todo_id = todo["id"]

        # Get todo
        resp = await ac.get(f"/todos/{todo_id}")
        assert resp.status_code == 200
        fetched = resp.json()
        assert fetched["id"] == todo_id

        # Update todo
        update_payload = {"title": "Updated title", "completed": True}
        resp = await ac.put(f"/todos/{todo_id}", json=update_payload)
        assert resp.status_code == 200
        updated = resp.json()
        assert updated["title"] == "Updated title"
        assert updated["completed"] is True

        # Toggle completion
        resp = await ac.post(f"/todos/{todo_id}/toggle")
        assert resp.status_code == 200
        toggled = resp.json()
        assert toggled["completed"] is False

        # Delete todo
        resp = await ac.delete(f"/todos/{todo_id}")
        assert resp.status_code == 204

        # Ensure it is gone
        resp = await ac.get(f"/todos/{todo_id}")
        assert resp.status_code == 404
