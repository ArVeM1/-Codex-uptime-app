"""Password and JWT primitives used by authentication use cases."""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
from jwt import InvalidTokenError
from pwdlib import PasswordHash

from uptime.config import Settings

password_hash = PasswordHash.recommended()


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


class TokenService:
    algorithm = "HS256"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def issue_access_token(self, user_id: str) -> str:
        return self._encode(user_id, "access", timedelta(minutes=self.settings.access_token_ttl_minutes))[0]

    def issue_refresh_token(self, user_id: str) -> tuple[str, str, datetime]:
        return self._encode(user_id, "refresh", timedelta(days=self.settings.refresh_token_ttl_days))

    def decode(self, token: str, expected_type: str) -> dict[str, str]:
        try:
            payload = jwt.decode(token, self.settings.jwt_secret, algorithms=[self.algorithm])
        except InvalidTokenError as exc:
            raise ValueError("Invalid or expired token") from exc
        if payload.get("type") != expected_type or not payload.get("sub") or not payload.get("jti"):
            raise ValueError("Unexpected token type")
        return payload

    def _encode(self, user_id: str, token_type: str, lifetime: timedelta) -> tuple[str, str, datetime]:
        now = datetime.now(UTC)
        expires_at = now + lifetime
        token_id = str(uuid4())
        payload = {"sub": user_id, "jti": token_id, "type": token_type, "iat": now, "exp": expires_at}
        return jwt.encode(payload, self.settings.jwt_secret, algorithm=self.algorithm), token_id, expires_at
