"""
Recommendation Engine Service
Implements the core algorithm for selecting optimal charging stations
"""
import math
from app.models.schemas import (
    ChargingStation,
    VehicleRequest,
    ChargeRecommendation,
    RecommendationScore,
    ConnectorType,
    ChargingType,
)
from datetime import datetime


class RecommendationEngine:
    """
    Scoring Formula:
    Score = w1(distance) + w2(wait_time) + w3(traffic) + w4(load)
    
    Lower score = Better recommendation
    """
    
    def __init__(self):
        self.w_distance = 0.4
        self.w_wait_time = 0.3
        self.w_load = 0.2
        self.w_traffic = 0.1
        
        # Track user assignments for load balancing
        self.user_assignments: dict[str, str] = {}
        
        # Normalization constants
        self.max_distance_km = 50.0
        self.max_wait_time_min = 120.0
        self.max_traffic_time_min = 60.0
        self.max_load_percent = 100.0
    
    def calculate_distance(
        self,
        user_lat: float,
        user_lng: float,
        station_lat: float,
        station_lng: float,
    ) -> float:
        """
        Calculate distance using Haversine formula (in km)
        """
        R = 6371  # Earth's radius in km
        
        lat1 = math.radians(user_lat)
        lat2 = math.radians(station_lat)
        delta_lat = math.radians(station_lat - user_lat)
        delta_lng = math.radians(station_lng - user_lng)
        
        a = (
            math.sin(delta_lat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lng / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def calculate_eta_with_traffic(
        self, distance_km: float, traffic_factor: float = 1.0
    ) -> float:
        """
        Calculate ETA considering traffic
        Assumes average speed of 30 km/h in urban areas
        traffic_factor: 1.0 = normal, 1.5 = heavy traffic
        """
        avg_speed = 30  # km/h
        base_time = (distance_km / avg_speed) * 60  # Convert to minutes
        return base_time * traffic_factor
    
    def calculate_wait_time(
        self, vehicles_in_queue: int, active_slots: int, avg_charging_time: float
    ) -> float:
        """
        Wait Time = (vehicles_in_queue × avg_charging_time) / active_slots
        """
        if active_slots == 0:
            return float('inf')
        return (vehicles_in_queue * avg_charging_time) / active_slots
    
    def is_compatible(
        self,
        vehicle_connector: ConnectorType,
        vehicle_charging: ChargingType,
        station_connectors: list[ConnectorType],
        station_charging_types: list[ChargingType],
    ) -> bool:
        """
        Check if vehicle is compatible with station
        """
        connector_compatible = vehicle_connector in station_connectors
        charging_compatible = vehicle_charging in station_charging_types
        return connector_compatible and charging_compatible
    
    def normalize_value(self, value: float, max_value: float) -> float:
        """
        Normalize value to 0-1 range
        """
        if value > max_value:
            return 1.0
        if value < 0:
            return 0.0
        return value / max_value
    
    def calculate_score(
        self,
        distance_km: float,
        wait_time_min: float,
        traffic_time_min: float,
        load_percent: float,
        users_assigned_to_station: int,
    ) -> float:
        """
        Calculate composite score for a charging station
        Load balancing: Increase score based on number of users already assigned
        """
        # Normalize components
        norm_distance = self.normalize_value(distance_km, self.max_distance_km)
        norm_wait = self.normalize_value(wait_time_min, self.max_wait_time_min)
        norm_traffic = self.normalize_value(traffic_time_min, self.max_traffic_time_min)
        norm_load = self.normalize_value(load_percent, self.max_load_percent)
        
        # Apply load balancing penalty
        # Users assigned to a station increase its score (make it less attractive)
        score_penalty = users_assigned_to_station * 0.5
        
        # Calculate weighted score (lower is better)
        score = (
            self.w_distance * norm_distance
            + self.w_wait_time * norm_wait
            + self.w_traffic * norm_traffic
            + self.w_load * norm_load
        ) + score_penalty
        
        return score
    
    def get_station_connectors(self, station: dict) -> list[ConnectorType]:
        """Extract available connector types from station"""
        connectors = []
        if station.get('total_fast_slots', 0) > 0:
            connectors.append(ConnectorType.TYPE2)
            connectors.append(ConnectorType.CCS)
        if station.get('total_slow_slots', 0) > 0:
            connectors.append(ConnectorType.TYPE1)
            connectors.append(ConnectorType.TYPE2)
        if station.get('total_swapping_slots', 0) > 0:
            connectors.append(ConnectorType.CHADEMO)
        return connectors if connectors else list(ConnectorType)
    
    def get_station_charging_types(self, station: dict) -> list[ChargingType]:
        """Extract available charging types from station"""
        types = []
        if station.get('total_fast_slots', 0) > 0:
            types.append(ChargingType.FAST)
        if station.get('total_slow_slots', 0) > 0:
            types.append(ChargingType.SLOW)
        if station.get('total_swapping_slots', 0) > 0:
            types.append(ChargingType.SWAPPING)
        return types if types else [ChargingType.SLOW]
    
    def recommend_stations(
        self,
        vehicle: dict,
        stations: list[dict],
        traffic_conditions: dict,
        user_id: str,
    ) -> list[tuple[str, float, dict]]:
        """
        Get top 3 recommended stations sorted by score
        
        Returns:
            List of tuples: (station_id, score, station_data)
        """
        candidates = []
        
        for station in stations:
            # Check compatibility
            connectors = self.get_station_connectors(station)
            charging_types = self.get_station_charging_types(station)
            
            if not self.is_compatible(
                vehicle['connector_type'],
                vehicle['charging_type'],
                connectors,
                charging_types,
            ):
                continue
            
            # Check if station is operational
            if station.get('status') != 'operational':
                continue
            
            # Calculate metrics
            distance = self.calculate_distance(
                vehicle['current_lat'],
                vehicle['current_lng'],
                station['latitude'],
                station['longitude'],
            )
            
            traffic_factor = traffic_conditions.get(station['id'], {}).get('factor', 1.0)
            eta_with_traffic = self.calculate_eta_with_traffic(distance, traffic_factor)
            
            available_slots = station.get('available_slots', 0)
            vehicles_in_queue = station.get('vehicles_in_queue', 0)
            avg_charging_time = 30  # minutes (configurable)
            
            wait_time = self.calculate_wait_time(
                vehicles_in_queue, available_slots, avg_charging_time
            )
            
            current_load = (
                (station.get('total_slots', 1) - available_slots) /
                station.get('total_slots', 1) * 100
            )
            
            # Count users already assigned to this station
            users_assigned = sum(
                1 for v in self.user_assignments.values() if v == station['id']
            )
            
            # Filter by distance (3-5 km only as requested)
            if distance < 3.0 or distance > 5.0:
                continue

            # Calculate score
            score = self.calculate_score(
                distance,
                wait_time,
                eta_with_traffic,
                current_load,
                users_assigned,
            )
            
            if available_slots > 0 and wait_time != float('inf'):
                candidates.append((
                    station['id'],
                    score,
                    {
                        'distance': distance,
                        'wait_time': wait_time,
                        'traffic_time': eta_with_traffic,
                        'load': current_load,
                        'available_slots': available_slots,
                    },
                ))
        
        # Sort by score (lower is better) and return top 3
        candidates.sort(key=lambda x: x[1])
        return candidates[:3]
    
    def assign_user(self, user_id: str, station_id: str):
        """Track user assignment for load balancing"""
        self.user_assignments[user_id] = station_id
    
    def unassign_user(self, user_id: str):
        """Remove user assignment"""
        if user_id in self.user_assignments:
            del self.user_assignments[user_id]
