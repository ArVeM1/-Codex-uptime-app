"""Pydantic schemas exposed by the authentication API."""

from pydantic import BaseModel, EmailStr, Field


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
