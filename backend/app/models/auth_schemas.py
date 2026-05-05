from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.schemas import VehicleType, ChargingType, ConnectorType


class UserRegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone_number: str = Field(min_length=8, max_length=20)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=6)
    vehicle_types: list[VehicleType] = Field(min_length=1)
    charging_type: ChargingType
    connector_type: ConnectorType
    battery_capacity: float = Field(gt=0)


class UserOtpSendRequest(BaseModel):
    phone_number: str = Field(min_length=8, max_length=20)


class UserOtpVerifyRequest(BaseModel):
    phone_number: str = Field(min_length=8, max_length=20)
    otp_code: str = Field(min_length=4, max_length=8)


class UserEmailLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str
    otp_code: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    role: str
    expires_in: int


class PrincipalResponse(BaseModel):
    id: str
    role: str
    name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    vehicle_types: list[str] = []


class UserAuthResponse(BaseModel):
    token: TokenResponse
    user: PrincipalResponse


class AdminAuthResponse(BaseModel):
    token: TokenResponse
    admin: PrincipalResponse


class OtpSendResponse(BaseModel):
    message: str
    expires_in_seconds: int
    otp_code: Optional[str] = None


class AuthError(BaseModel):
    detail: str
    timestamp: datetime
