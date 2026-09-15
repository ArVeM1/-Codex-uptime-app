"""Profile endpoints for the authenticated user."""

from pathlib import Path
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse

from uptime.api.auth import user_response
from uptime.api.dependencies import SessionDep, get_current_user_id
from uptime.api.schemas import ProfileUpdateRequest, UserResponse
from uptime.infrastructure.models import User

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])
CurrentUserId = Annotated[str, Depends(get_current_user_id)]
ALLOWED_AVATAR_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024


def get_user(user_id: str, session: SessionDep) -> User:
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("", response_model=UserResponse)
@router.get("/", response_model=UserResponse, include_in_schema=False)
def get_profile(user_id: CurrentUserId, session: SessionDep) -> UserResponse:
    return user_response(get_user(user_id, session))


@router.patch("", response_model=UserResponse)
@router.patch("/", response_model=UserResponse, include_in_schema=False)
def update_profile(payload: ProfileUpdateRequest, user_id: CurrentUserId, session: SessionDep) -> UserResponse:
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Name must not be empty")
    user = get_user(user_id, session)
    user.name = name
    session.commit()
    session.refresh(user)
    return user_response(user)


@router.post("/avatar", response_model=UserResponse)
@router.post("/avatar/", response_model=UserResponse, include_in_schema=False)
def upload_avatar(
    request: Request,
    user_id: CurrentUserId,
    session: SessionDep,
    file: UploadFile = File(...),
) -> UserResponse:
    extension = ALLOWED_AVATAR_TYPES.get(file.content_type or "")
    if extension is None:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Avatar must be a JPEG, PNG, or WebP image")

    user = get_user(user_id, session)
    upload_dir = Path(request.app.state.settings.avatar_upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{user.id}-{uuid4().hex}{extension}"
    target = upload_dir / filename
    temporary = upload_dir / f".{user.id}.upload"
    size = 0
    try:
        with temporary.open("wb") as destination:
            while chunk := file.file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_AVATAR_SIZE:
                    raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Avatar must be 5 MB or smaller")
                destination.write(chunk)
        temporary.replace(target)
    finally:
        temporary.unlink(missing_ok=True)

    for old_file in upload_dir.glob(f"{user.id}-*"):
        if old_file != target:
            old_file.unlink(missing_ok=True)
    user.avatar_filename = filename
    user.avatar_content_type = file.content_type
    session.commit()
    session.refresh(user)
    return user_response(user)


@router.get("/avatar/{user_id}", include_in_schema=False)
def get_avatar(user_id: str, request: Request, session: SessionDep) -> FileResponse:
    user = get_user(user_id, session)
    if not user.avatar_filename:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avatar not found")
    path = Path(request.app.state.settings.avatar_upload_dir) / user.avatar_filename
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avatar not found")
    return FileResponse(path, media_type=user.avatar_content_type or "application/octet-stream")
