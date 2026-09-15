import pytest

from uptime.application.security import TokenService, hash_password, normalize_email, verify_password
from uptime.config import Settings


@pytest.fixture
def settings() -> Settings:
    return Settings("sqlite://", "test-secret-with-at-least-thirty-two-bytes", 15, 30, False, "lax")


def test_password_is_hashed_and_verifiable() -> None:
    hashed = hash_password("correct-horse-battery-staple")
    assert hashed != "correct-horse-battery-staple"
    assert verify_password("correct-horse-battery-staple", hashed)
    assert not verify_password("wrong-password", hashed)


def test_normalize_email() -> None:
    assert normalize_email(" User@Example.COM ") == "user@example.com"


def test_access_token_cannot_be_used_as_refresh_token(settings: Settings) -> None:
    service = TokenService(settings)
    access_token = service.issue_access_token("user-id")
    assert service.decode(access_token, "access")["sub"] == "user-id"
    with pytest.raises(ValueError):
        service.decode(access_token, "refresh")
