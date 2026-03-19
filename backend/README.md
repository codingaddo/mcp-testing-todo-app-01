# Backend - FastAPI Todo API

This directory contains the FastAPI-based backend for the MCP Testing Todo App.

## Tech stack
- Python 3.11+
- FastAPI
- Uvicorn
- SQLAlchemy (async) with SQLite
- Pydantic v2
- HTTPX + pytest for tests
- uv as the package/dependency manager

## Running locally

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

## Running tests

```bash
cd backend
uv run pytest
```
