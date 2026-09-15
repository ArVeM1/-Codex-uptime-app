"""Application services for monitor configurations."""

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from uptime.domain.monitors.entities import IntervalUnit, Monitor
from uptime.infrastructure.models import MonitorModel, User


class UnknownUserError(ValueError):
    """Raised when an access token refers to a deleted user."""


class MonitorService:
    """Coordinate monitor use cases without exposing persistence to API routes."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def list_for_user(self, user_id: str, limit: int, offset: int) -> list[MonitorModel]:
        query: Select[tuple[MonitorModel]] = (
            select(MonitorModel)
            .where(MonitorModel.user_id == user_id)
            .order_by(MonitorModel.created_at, MonitorModel.id)
            .limit(limit)
            .offset(offset)
        )
        return list(self.session.scalars(query).all())

    def create(self, user_id: str, url: str, interval_value: int, interval_unit: IntervalUnit) -> MonitorModel:
        if self.session.get(User, user_id) is None:
            raise UnknownUserError
        monitor = Monitor(url=url, interval_value=interval_value, interval_unit=interval_unit)
        model = MonitorModel(
            user_id=user_id,
            url=monitor.url,
            interval_value=monitor.interval_value,
            interval_unit=monitor.interval_unit,
        )
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return model
