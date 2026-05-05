from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.db import Base


class UserAuth(Base):
    __tablename__ = 'users'

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=True)

    vehicle_types = Column(Text, nullable=False)  # CSV of enum values
    charging_type = Column(String(32), nullable=False)
    connector_type = Column(String(32), nullable=False)
    battery_capacity = Column(Float, nullable=False, default=0)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class AdminAuth(Base):
    __tablename__ = 'admins'

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default='operator')
    access_level = Column(String(32), nullable=False, default='limited')
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
