from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app.models.auth_models import AdminAuth, UserAuth
from app.models.auth_schemas import (
    AdminAuthResponse,
    AdminLoginRequest,
    OtpSendResponse,
    PrincipalResponse,
    TokenResponse,
    UserAuthResponse,
    UserEmailLoginRequest,
    UserOtpSendRequest,
    UserOtpVerifyRequest,
    UserRegisterRequest,
)
from app.services.auth_service import (
    build_principal_from_admin,
    build_principal_from_user,
    create_access_token,
    create_otp,
    ensure_default_admin,
    get_current_principal,
    hash_password,
    require_roles,
    verify_otp,
    verify_password,
)

router = APIRouter(prefix='/api/v1/auth', tags=['auth'])


@router.post('/user/register', response_model=PrincipalResponse)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(UserAuth).filter(UserAuth.phone == payload.phone_number).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Phone number already registered')

    if payload.email:
        email_exists = db.query(UserAuth).filter(UserAuth.email == payload.email).first()
        if email_exists:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Email already registered')

    user = UserAuth(
        id=f'user_{uuid.uuid4().hex[:10]}',
        name=payload.name,
        phone=payload.phone_number,
        email=payload.email,
        password_hash=hash_password(payload.password) if payload.password else None,
        vehicle_types=','.join([item.value for item in payload.vehicle_types]),
        charging_type=payload.charging_type.value,
        connector_type=payload.connector_type.value,
        battery_capacity=payload.battery_capacity,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    principal = build_principal_from_user(user)
    return PrincipalResponse(
        id=principal.id,
        role=principal.role,
        name=principal.name,
        email=principal.email,
        phone_number=principal.phone_number,
        vehicle_types=principal.vehicle_types or [],
    )


@router.post('/user/send-otp', response_model=OtpSendResponse)
def send_user_otp(payload: UserOtpSendRequest, db: Session = Depends(get_db)):
    user = db.query(UserAuth).filter(UserAuth.phone == payload.phone_number).first()
    if not user:
        # Auto-register for demo purposes
        user = UserAuth(
            id=f'user_{uuid.uuid4().hex[:10]}',
            name=f'Guest {payload.phone_number[-4:]}',
            phone=payload.phone_number,
            vehicle_types='4W',
            charging_type='CCS2',
            connector_type='Fast',
            battery_capacity=60.0
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    otp_code, expires_in = create_otp(payload.phone_number)
    return OtpSendResponse(
        message='OTP sent successfully',
        expires_in_seconds=expires_in,
        otp_code=otp_code if settings.DEBUG else None,
    )


@router.post('/user/verify-otp', response_model=UserAuthResponse)
def verify_user_otp(payload: UserOtpVerifyRequest, db: Session = Depends(get_db)):
    if not verify_otp(payload.phone_number, payload.otp_code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired OTP')

    user = db.query(UserAuth).filter(UserAuth.phone == payload.phone_number).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

    token, expires_in = create_access_token(user.id, role='user')
    principal = build_principal_from_user(user)

    return UserAuthResponse(
        token=TokenResponse(access_token=token, role='user', expires_in=expires_in),
        user=PrincipalResponse(
            id=principal.id,
            role=principal.role,
            name=principal.name,
            email=principal.email,
            phone_number=principal.phone_number,
            vehicle_types=principal.vehicle_types or [],
        ),
    )


@router.post('/user/login-email', response_model=UserAuthResponse)
def login_user_email(payload: UserEmailLoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserAuth).filter(UserAuth.email == payload.email).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')

    token, expires_in = create_access_token(user.id, role='user')
    principal = build_principal_from_user(user)
    return UserAuthResponse(
        token=TokenResponse(access_token=token, role='user', expires_in=expires_in),
        user=PrincipalResponse(
            id=principal.id,
            role=principal.role,
            name=principal.name,
            email=principal.email,
            phone_number=principal.phone_number,
            vehicle_types=principal.vehicle_types or [],
        ),
    )


@router.post('/admin/login', response_model=AdminAuthResponse)
def admin_login(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    ensure_default_admin(db)

    admin = db.query(AdminAuth).filter(AdminAuth.email == payload.email).first()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid admin credentials')

    token, expires_in = create_access_token(admin.id, role='admin')
    principal = build_principal_from_admin(admin)

    return AdminAuthResponse(
        token=TokenResponse(access_token=token, role='admin', expires_in=expires_in),
        admin=PrincipalResponse(
            id=principal.id,
            role=principal.role,
            name=principal.name,
            email=principal.email,
            vehicle_types=[],
        ),
    )


@router.get('/me', response_model=PrincipalResponse)
def auth_me(principal=Depends(get_current_principal)):
    return PrincipalResponse(
        id=principal.id,
        role=principal.role,
        name=principal.name,
        email=principal.email,
        phone_number=principal.phone_number,
        vehicle_types=principal.vehicle_types or [],
    )


@router.get('/admin/seed')
def ensure_admin_seed(_: object = Depends(require_roles('admin')), db: Session = Depends(get_db)):
    ensure_default_admin(db)
    return {'status': 'ok', 'timestamp': datetime.utcnow().isoformat()}
