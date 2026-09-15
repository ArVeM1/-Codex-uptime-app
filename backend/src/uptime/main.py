"""FastAPI application entrypoint."""

from fastapi import FastAPI
from pathlib import Path
from sqlalchemy.orm import Session, sessionmaker

from uptime.api.auth import router as auth_router
from uptime.api.profile import router as profile_router
from uptime.api.monitors import router as monitors_router
from uptime.config import Settings
from uptime.infrastructure.database import create_session_factory


def create_app(settings: Settings | None = None, session_factory: sessionmaker[Session] | None = None) -> FastAPI:
    app = FastAPI(title="Uptime API")
    app.state.settings = settings or Settings.from_environment()
    app.state.session_factory = session_factory or create_session_factory(app.state.settings.database_url)
    Path(app.state.settings.avatar_upload_dir).mkdir(parents=True, exist_ok=True)

    @app.get("/health", tags=["health"])
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(auth_router)
    app.include_router(profile_router)
    app.include_router(monitors_router)
    return app


app = create_app()
