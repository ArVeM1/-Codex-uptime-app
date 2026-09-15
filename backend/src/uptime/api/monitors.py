"""Monitor configuration endpoints."""

from fastapi import APIRouter, HTTPException, Query, status

from uptime.api.dependencies import CurrentUserId, SessionDep
from uptime.api.schemas import MonitorCreateRequest, MonitorResponse
from uptime.application.monitors import MonitorService, UnknownUserError
from uptime.infrastructure.models import MonitorModel

router = APIRouter(prefix="/api/v1/monitors", tags=["monitors"])


@router.get("", response_model=list[MonitorResponse])
@router.get("/", response_model=list[MonitorResponse], include_in_schema=False)
def list_monitors(
    user_id: CurrentUserId,
    session: SessionDep,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[MonitorModel]:
    return MonitorService(session).list_for_user(user_id, limit, offset)


@router.post("", response_model=MonitorResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=MonitorResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_monitor(payload: MonitorCreateRequest, user_id: CurrentUserId, session: SessionDep) -> MonitorModel:
    try:
        return MonitorService(session).create(user_id, str(payload.url), payload.interval_value, payload.interval_unit)
    except UnknownUserError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown user") from exc
