import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app.models.auth_models import AdminAuth, UserAuth

# Use a pure-Python passlib scheme in development to avoid bcrypt binary issues
# `sha256_crypt` does not require the external bcrypt C-extension and starts reliably.
pwd_context = CryptContext(schemes=['sha256_crypt', 'bcrypt'], deprecated='auto')
security = HTTPBearer()


@dataclass
class Principal:
    id: str
    role: str
    name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    vehicle_types: list[str] = None
    access_level: Optional[str] = None


_otp_store: dict[str, tuple[str, datetime]] = {}


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject_id: str, role: str, expires_delta: Optional[timedelta] = None) -> tuple[str, int]:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {'id': subject_id, 'role': role, 'exp': expire}
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, int((expire - datetime.utcnow()).total_seconds())


def decode_token(token: str) -> dict[str, Any]:
    # In DEBUG mode, allow demo token
    if settings.DEBUG and token == 'mock-test-token-for-demo-purposes':
        return {'id': 'user_demo_123', 'role': 'user', 'exp': datetime.utcnow() + timedelta(hours=24)}
    
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired token') from exc


def create_otp(phone_number: str) -> tuple[str, int]:
    otp_code = ''.join(secrets.choice('0123456789') for _ in range(6))
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    _otp_store[phone_number] = (otp_code, expires_at)
    return otp_code, settings.OTP_EXPIRE_MINUTES * 60


def verify_otp(phone_number: str, otp_code: str) -> bool:
    # Debug bypass
    if settings.DEBUG and otp_code == '123456':
        return True

    value = _otp_store.get(phone_number)
    if not value:
        return False

    expected, expires_at = value
    if datetime.utcnow() > expires_at:
        _otp_store.pop(phone_number, None)
        return False

    if secrets.compare_digest(expected, otp_code):
        _otp_store.pop(phone_number, None)
        return True
    return False


def build_principal_from_user(user: UserAuth) -> Principal:
    vehicle_types = [item for item in user.vehicle_types.split(',') if item]
    return Principal(
        id=user.id,
        role='user',
        name=user.name,
        email=user.email,
        phone_number=user.phone,
        vehicle_types=vehicle_types,
    )


def build_principal_from_admin(admin: AdminAuth) -> Principal:
    return Principal(
        id=admin.id,
        role='admin',
        name=admin.name,
        email=admin.email,
        vehicle_types=[],
        access_level=admin.access_level,
    )


def get_current_principal(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Principal:
    payload = decode_token(credentials.credentials)
    subject_id = payload.get('id')
    role = payload.get('role')

    if not subject_id or not role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Malformed token payload')

    # Handle demo user in DEBUG mode
    if settings.DEBUG and subject_id == 'user_demo_123' and role == 'user':
        return Principal(
            id='user_demo_123',
            role='user',
            name='Demo User',
            email='user@urbanvolt.ai',
            phone_number='9876543210',
            vehicle_types=['2W', '3W', '4W', 'Commercial'],
        )

    if role == 'user':
        user = db.query(UserAuth).filter(UserAuth.id == subject_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
        return build_principal_from_user(user)

    if role == 'admin':
        admin = db.query(AdminAuth).filter(AdminAuth.id == subject_id).first()
        if not admin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Admin not found')
        return build_principal_from_admin(admin)

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Unsupported role')


def require_roles(*roles: str):
    def dependency(principal: Principal = Depends(get_current_principal)) -> Principal:
        if principal.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Insufficient permissions')
        return principal

    return dependency


def ensure_default_admin(db: Session) -> None:
    admin = db.query(AdminAuth).filter(AdminAuth.email == settings.ADMIN_DEFAULT_EMAIL).first()
    
    if not admin:
        admin = AdminAuth(
            id='admin_default',
            name='BESCOM Super Admin',
            email=settings.ADMIN_DEFAULT_EMAIL,
            role='super_admin',
            access_level='full',
        )
        db.add(admin)
    
    # Always update password to ensure it matches current hashing scheme and settings
    admin.password_hash = hash_password(settings.ADMIN_DEFAULT_PASSWORD)
    db.commit()
