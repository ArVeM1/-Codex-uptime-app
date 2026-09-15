"""Pydantic schemas exposed by the authentication API."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl


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


IntervalUnit = Literal["seconds", "minutes", "hours"]


class MonitorCreateRequest(BaseModel):
    url: HttpUrl
    interval_value: int = Field(ge=1, le=31_536_000)
    interval_unit: IntervalUnit


class MonitorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    url: str
    interval_value: int
    interval_unit: IntervalUnit
