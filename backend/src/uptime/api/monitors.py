"""Monitor configuration endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from uptime.api.dependencies import CurrentUserId, SessionDep
from uptime.api.schemas import MonitorCreateRequest, MonitorResponse
from uptime.infrastructure.models import MonitorModel, User

router = APIRouter(prefix="/api/v1/monitors", tags=["monitors"])


@router.get("", response_model=list[MonitorResponse])
@router.get("/", response_model=list[MonitorResponse], include_in_schema=False)
def list_monitors(user_id: CurrentUserId, session: SessionDep) -> list[MonitorModel]:
    return list(session.scalars(select(MonitorModel).where(MonitorModel.user_id == user_id).order_by(MonitorModel.created_at, MonitorModel.id)).all())


@router.post("", response_model=MonitorResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=MonitorResponse, include_in_schema=False)
def create_monitor(payload: MonitorCreateRequest, user_id: CurrentUserId, session: SessionDep) -> MonitorModel:
    if session.get(User, user_id) is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown user")
    monitor = MonitorModel(
        user_id=user_id,
        url=str(payload.url),
        interval_value=payload.interval_value,
        interval_unit=payload.interval_unit,
    )
    session.add(monitor)
    session.commit()
    session.refresh(monitor)
    return monitor
