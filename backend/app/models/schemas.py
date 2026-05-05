"""
Data models for URBANVOLT system
"""
from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


# Enums
class VehicleType(str, Enum):
    TWO_WHEELER = "2W"
    THREE_WHEELER = "3W"
    FOUR_WHEELER = "4W"
    COMMERCIAL = "Commercial"


class ChargingType(str, Enum):
    FAST = "fast"
    SLOW = "slow"
    SWAPPING = "swapping"


class ConnectorType(str, Enum):
    TYPE1 = "Type1"
    TYPE2 = "Type2"
    CCS = "CCS"
    CHADEMO = "CHAdeMO"


class StationStatus(str, Enum):
    OPERATIONAL = "operational"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"
    OVERLOAD = "overload"


# Vehicle Models
class VehicleRequest(BaseModel):
    user_id: str
    vehicle_type: VehicleType
    charging_type: ChargingType
    connector_type: ConnectorType
    current_lat: float
    current_lng: float
    battery_percentage: Optional[float] = 50.0


class Vehicle(VehicleRequest):
    id: str
    created_at: datetime


# Charging Station Models
class ChargingSlot(BaseModel):
    slot_id: str
    connector_type: ConnectorType
    available: bool
    vehicle_assigned: Optional[str] = None
    charging_time_remaining: Optional[float] = None


class ChargingStationBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    address: str
    status: StationStatus = StationStatus.OPERATIONAL
    total_slots: int
    total_fast_slots: int
    total_slow_slots: int
    total_swapping_slots: int


class ChargingStationCreate(ChargingStationBase):
    pass


class ChargingStation(ChargingStationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    slots: list[ChargingSlot] = []


class StationStatus(BaseModel):
    station_id: str
    name: str
    latitude: float
    longitude: float
    available_slots: int
    total_slots: int
    vehicles_in_queue: int
    avg_wait_time: float
    estimated_charging_time: float
    current_load: float  # percentage
    status: str


# Recommendation Models
class RecommendationScore(BaseModel):
    score: float
    distance: float
    wait_time: float
    traffic_time: float
    load: float
    rank: int


class ChargeRecommendation(BaseModel):
    station_id: str
    name: str
    latitude: float
    longitude: float
    distance: float
    eta_with_traffic: float
    wait_time: float
    available_slots: int
    charging_type: ChargingType
    connector_type: ConnectorType
    score: RecommendationScore
    is_best_choice: bool = False
    label: str = "Recommended"


class RecommendationsResponse(BaseModel):
    user_id: str
    vehicle_id: str
    recommendations: list[ChargeRecommendation]
    timestamp: datetime


# Real-time Updates
class RealtimeStationUpdate(BaseModel):
    station_id: str
    available_slots: int
    vehicles_in_queue: int
    avg_wait_time: float
    current_load: float
    status: str
    timestamp: datetime


class UserLocationUpdate(BaseModel):
    user_id: str
    vehicle_id: str
    latitude: float
    longitude: float
    timestamp: datetime


# Analytics Models
class StationAnalytics(BaseModel):
    station_id: str
    name: str
    total_charges_today: int
    avg_utilization: float
    peak_hours: list[int]
    total_energy_distributed: float
    avg_charging_duration: float


class SystemAnalytics(BaseModel):
    total_stations: int
    total_vehicles_served: int
    avg_wait_time: float
    total_energy_distributed: float
    peak_demand_time: str
    stations: list[StationAnalytics]


# User Models
class UserBase(BaseModel):
    email: str
    full_name: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: str
    created_at: datetime
    role: str = "user"


class AdminUser(User):
    role: str = "admin"


# Alerts
class Alert(BaseModel):
    id: str
    station_id: str
    station_name: str
    alert_type: str  # "overload", "offline", "queue_high"
    severity: str  # "low", "medium", "high"
    message: str
    timestamp: datetime
    resolved: bool = False
