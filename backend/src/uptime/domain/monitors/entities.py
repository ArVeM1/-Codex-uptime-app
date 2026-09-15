"""Entities representing monitored endpoints."""

from dataclasses import dataclass
from typing import Literal

IntervalUnit = Literal["seconds", "minutes", "hours"]
MAX_INTERVAL_SECONDS = 31_536_000
_UNIT_TO_SECONDS: dict[IntervalUnit, int] = {"seconds": 1, "minutes": 60, "hours": 3600}


@dataclass(frozen=True)
class Monitor:
    """A configured endpoint whose availability is checked."""

    url: str
    interval_value: int
    interval_unit: IntervalUnit

    @property
    def interval_seconds(self) -> int:
        return self.interval_value * _UNIT_TO_SECONDS[self.interval_unit]

    def __post_init__(self) -> None:
        if self.interval_value < 1:
            raise ValueError("Interval must be positive")
        if self.interval_seconds > MAX_INTERVAL_SECONDS:
            raise ValueError("Interval is too long")
