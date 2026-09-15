"""Runtime configuration loaded from environment variables."""

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    database_url: str
    jwt_secret: str
    access_token_ttl_minutes: int
    refresh_token_ttl_days: int
    cookie_secure: bool
    cookie_samesite: str
    avatar_upload_dir: str = "./uploads/avatars"

    @classmethod
    def from_environment(cls) -> "Settings":
        return cls(
            database_url=os.getenv("DATABASE_URL", "sqlite:///./uptime.db"),
            jwt_secret=os.getenv("JWT_SECRET", "development-secret-change-me"),
            access_token_ttl_minutes=int(os.getenv("ACCESS_TOKEN_TTL_MINUTES", "15")),
            refresh_token_ttl_days=int(os.getenv("REFRESH_TOKEN_TTL_DAYS", "30")),
            cookie_secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
            cookie_samesite=os.getenv("COOKIE_SAMESITE", "lax"),
            avatar_upload_dir=os.getenv("AVATAR_UPLOAD_DIR", "./uploads/avatars"),
        )
