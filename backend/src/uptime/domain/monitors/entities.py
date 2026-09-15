"""Entities representing monitored endpoints."""

from dataclasses import dataclass
from typing import Literal

IntervalUnit = Literal["seconds", "minutes", "hours"]


@dataclass(frozen=True)
class Monitor:
    """A configured endpoint whose availability is checked."""

    url: str
    interval_value: int
    interval_unit: IntervalUnit
