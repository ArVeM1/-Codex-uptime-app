"""Pydantic schemas exposed by the authentication API."""

import ipaddress

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl, field_validator, model_validator

from uptime.domain.monitors.entities import MAX_INTERVAL_SECONDS, IntervalUnit


class RegistrationRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    avatar_url: str | None = None


class ProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MonitorCreateRequest(BaseModel):
    url: HttpUrl
    interval_value: int = Field(ge=1, le=31_536_000)
    interval_unit: IntervalUnit

    @field_validator("url")
    @classmethod
    def validate_public_http_url(cls, value: HttpUrl) -> HttpUrl:
        host = (value.host or "").lower().rstrip(".")
        if value.scheme not in {"http", "https"} or value.username is not None or value.password is not None:
            raise ValueError("URL must be a public HTTP(S) URL without credentials")
        if host == "localhost" or host.endswith(".localhost") or host.endswith(".local"):
            raise ValueError("Local URLs are not allowed")
        try:
            address = ipaddress.ip_address(host)
        except ValueError:
            address = None
        if address is not None and (address.is_private or address.is_loopback or address.is_link_local or address.is_multicast or address.is_reserved or address.is_unspecified):
            raise ValueError("Private or local addresses are not allowed")
        return value

    @model_validator(mode="after")
    def validate_total_interval(self) -> "MonitorCreateRequest":
        multiplier = {"seconds": 1, "minutes": 60, "hours": 3600}[self.interval_unit]
        if self.interval_value * multiplier > MAX_INTERVAL_SECONDS:
            raise ValueError("Interval must not exceed one year")
        return self


class MonitorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    url: str
    interval_value: int
    interval_unit: IntervalUnit
