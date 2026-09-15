"""Registration, login, refresh and logout endpoints."""

from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from uptime.api.dependencies import SessionDep
from uptime.api.schemas import AccessTokenResponse, LoginRequest, RegistrationRequest, UserResponse
from uptime.application.security import TokenService, hash_password, normalize_email, verify_password
from uptime.infrastructure.models import RefreshSession, User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
REFRESH_COOKIE_NAME = "refresh_token"


def user_response(user: User) -> UserResponse:
    return UserResponse(id=user.id, email=user.email, name=user.name, avatar_url=f"/api/v1/profile/avatar/{user.id}?v={user.avatar_filename}" if user.avatar_filename else None)


def set_refresh_cookie(response: Response, request: Request, token: str) -> None:
    settings = request.app.state.settings
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        max_age=settings.refresh_token_ttl_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/api/v1/auth",
    )


def clear_refresh_cookie(response: Response, request: Request) -> None:
    settings = request.app.state.settings
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/v1/auth",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )


def create_session_and_tokens(user: User, session: SessionDep, request: Request) -> tuple[str, str]:
    tokens = TokenService(request.app.state.settings)
    refresh_token, token_id, expires_at = tokens.issue_refresh_token(user.id)
    session.add(RefreshSession(id=token_id, user_id=user.id, expires_at=expires_at))
    session.commit()
    return tokens.issue_access_token(user.id), refresh_token


@router.post("/register", response_model=AccessTokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegistrationRequest, response: Response, request: Request, session: SessionDep) -> AccessTokenResponse:
    user = User(email=normalize_email(str(payload.email)), name=payload.name.strip(), password_hash=hash_password(payload.password))
    session.add(user)
    try:
        session.flush()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered") from exc
    access_token, refresh_token = create_session_and_tokens(user, session, request)
    set_refresh_cookie(response, request, refresh_token)
    return AccessTokenResponse(access_token=access_token, user=user_response(user))


@router.post("/login", response_model=AccessTokenResponse)
def login(payload: LoginRequest, response: Response, request: Request, session: SessionDep) -> AccessTokenResponse:
    user = session.scalar(select(User).where(User.email == normalize_email(str(payload.email))))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    access_token, refresh_token = create_session_and_tokens(user, session, request)
    set_refresh_cookie(response, request, refresh_token)
    return AccessTokenResponse(access_token=access_token, user=user_response(user))


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(response: Response, request: Request, session: SessionDep) -> AccessTokenResponse:
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
    try:
        payload = TokenService(request.app.state.settings).decode(refresh_token, "refresh")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    stored_session = session.get(RefreshSession, payload["jti"])
    if stored_session is None or stored_session.revoked_at is not None or stored_session.user_id != payload["sub"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has been revoked")
    user = session.get(User, stored_session.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown user")

    stored_session.revoked_at = datetime.now(UTC)
    token_service = TokenService(request.app.state.settings)
    new_refresh_token, token_id, expires_at = token_service.issue_refresh_token(user.id)
    session.add(RefreshSession(id=token_id, user_id=user.id, expires_at=expires_at))
    session.commit()
    set_refresh_cookie(response, request, new_refresh_token)
    return AccessTokenResponse(access_token=token_service.issue_access_token(user.id), user=user_response(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, request: Request, session: SessionDep) -> Response:
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if refresh_token:
        try:
            payload = TokenService(request.app.state.settings).decode(refresh_token, "refresh")
            stored_session = session.get(RefreshSession, payload["jti"])
            if stored_session is not None and stored_session.revoked_at is None:
                stored_session.revoked_at = datetime.now(UTC)
                session.commit()
        except ValueError:
            pass
    clear_refresh_cookie(response, request)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response
