from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from uptime.config import Settings
from uptime.infrastructure.database import Base
from uptime.infrastructure import models  # noqa: F401
from uptime.main import create_app


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    settings = Settings(
        database_url="sqlite://",
        jwt_secret="test-secret-with-at-least-thirty-two-bytes",
        access_token_ttl_minutes=15,
        refresh_token_ttl_days=30,
        cookie_secure=False,
        cookie_samesite="lax",
    )
    with TestClient(create_app(settings=settings, session_factory=factory)) as test_client:
        yield test_client
    Base.metadata.drop_all(engine)
    engine.dispose()
