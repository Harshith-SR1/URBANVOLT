"""
Synthetic Data Generator for URBANVOLT
Simulates charging stations, vehicles, traffic, and real-time updates
"""
import random
import uuid
from datetime import datetime, timedelta
import math


class SyntheticDataGenerator:
    """Generate realistic synthetic data for the EV charging system"""
    
    def __init__(self, city_center_lat: float = 13.0827, city_center_lng: float = 80.2707):
        """
        Initialize with city center (Bangalore coordinates)
        """
        self.city_center_lat = city_center_lat
        self.city_center_lng = city_center_lng
        self.city_radius_km = 15  # 15 km radius
        
        # Station data cache
        self.stations = {}
        self.station_states = {}
    
    def generate_random_location(
        self,
        center_lat: float,
        center_lng: float,
        radius_km: float,
    ) -> tuple[float, float]:
        """
        Generate random location within radius using random bearing and distance
        """
        R = 6371  # Earth's radius in km
        
        # Random distance and bearing
        distance = random.uniform(0, radius_km)
        bearing = random.uniform(0, 2 * math.pi)
        
        # Convert to radians
        lat_rad = math.radians(center_lat)
        lng_rad = math.radians(center_lng)
        
        # Calculate new position
        lat_new = math.asin(
            math.sin(lat_rad) * math.cos(distance / R) +
            math.cos(lat_rad) * math.sin(distance / R) * math.cos(bearing)
        )
        
        lng_new = lng_rad + math.atan2(
            math.sin(bearing) * math.sin(distance / R) * math.cos(lat_rad),
            math.cos(distance / R) - math.sin(lat_rad) * math.sin(lat_new)
        )
        
        return math.degrees(lat_new), math.degrees(lng_new)
    
    def generate_charging_stations(self, count: int = 20) -> list[dict]:
        """Generate realistic charging stations"""
        station_types = [
            "FastCharge Hub", "EV Depot", "Charging Point",
            "Power Station", "Volt Station", "ChargeWay"
        ]
        
        stations = []
        for i in range(count):
            lat, lng = self.generate_random_location(
                self.city_center_lat,
                self.city_center_lng,
                self.city_radius_km,
            )
            
            station_id = str(uuid.uuid4())
            total_slots = random.choice([4, 6, 8, 10, 12, 16])
            fast_slots = random.randint(1, max(1, total_slots // 3))
            slow_slots = random.randint(1, max(1, total_slots // 2))
            swapping_slots = max(0, total_slots - fast_slots - slow_slots)
            
            station = {
                'id': station_id,
                'name': f"{random.choice(station_types)} {i+1}",
                'latitude': lat,
                'longitude': lng,
                'address': f"Charging Location {i+1}, Bangalore",
                'status': random.choice(['operational', 'operational', 'operational', 'maintenance']),
                'total_slots': total_slots,
                'total_fast_slots': fast_slots,
                'total_slow_slots': slow_slots,
                'total_swapping_slots': swapping_slots,
                'available_slots': random.randint(0, total_slots),
                'vehicles_in_queue': random.randint(0, 5),
                'current_load_percent': 0,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
            }
            
            stations.append(station)
            self.stations[station_id] = station
            self.station_states[station_id] = {
                'available_slots': station['available_slots'],
                'vehicles_in_queue': station['vehicles_in_queue'],
                'last_update': datetime.utcnow(),
            }
        
        return stations

    def generate_localized_stations(self, center_lat: float, center_lng: float, count: int = 5) -> list[dict]:
        """Generate stations specifically within the 3-5 km range for a user"""
        station_types = ["Localized Hub", "Smart Charger", "Urban Point"]
        new_stations = []
        
        for i in range(count):
            # Generate specifically in the 3-5km ring
            distance = random.uniform(3.1, 4.9)
            bearing = random.uniform(0, 2 * math.pi)
            
            R = 6371
            lat_rad = math.radians(center_lat)
            lng_rad = math.radians(center_lng)
            
            lat_new = math.asin(
                math.sin(lat_rad) * math.cos(distance / R) +
                math.cos(lat_rad) * math.sin(distance / R) * math.cos(bearing)
            )
            lng_new = lng_rad + math.atan2(
                math.sin(bearing) * math.sin(distance / R) * math.cos(lat_rad),
                math.cos(distance / R) - math.sin(lat_rad) * math.sin(lat_new)
            )
            
            lat, lng = math.degrees(lat_new), math.degrees(lng_new)
            station_id = f"local_{uuid.uuid4().hex[:8]}"
            
            station = {
                'id': station_id,
                'name': f"{random.choice(station_types)} {random.randint(100, 999)}",
                'latitude': lat,
                'longitude': lng,
                'address': f"Nearby Smart Point, Bengaluru",
                'status': 'operational',
                'total_slots': 10,
                'total_fast_slots': 4,
                'total_slow_slots': 6,
                'total_swapping_slots': 0,
                'available_slots': random.randint(3, 8),
                'vehicles_in_queue': random.randint(0, 2),
                'current_load_percent': 30,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
            }
            
            self.stations[station_id] = station
            self.station_states[station_id] = {
                'available_slots': station['available_slots'],
                'vehicles_in_queue': station['vehicles_in_queue'],
                'last_update': datetime.utcnow(),
            }
            new_stations.append(station)
            
        return new_stations
    
    def generate_user_location(self) -> tuple[float, float]:
        """Generate random user location within city"""
        return self.generate_random_location(
            self.city_center_lat,
            self.city_center_lng,
            self.city_radius_km,
        )
    
    def generate_traffic_conditions(self) -> dict:
        """
        Generate realistic traffic conditions
        Returns: {station_id: {'factor': traffic_multiplier, 'congestion': 'low'|'medium'|'high'}}
        """
        traffic_patterns = {}
        
        # Morning (6-10 AM) - heavy traffic
        # Evening (4-8 PM) - very heavy
        # Night (10 PM - 6 AM) - light
        
        hour = datetime.now().hour
        
        if 6 <= hour < 10:
            base_factor = 1.3
            congestion_levels = ['medium', 'medium', 'high']
        elif 16 <= hour < 20:
            base_factor = 1.5
            congestion_levels = ['high', 'high', 'very_high']
        elif 20 <= hour < 22:
            base_factor = 1.2
            congestion_levels = ['low', 'medium', 'medium']
        else:
            base_factor = 1.0
            congestion_levels = ['low', 'low', 'low']
        
        for station_id in self.stations.keys():
            variation = random.uniform(0.8, 1.2)
            traffic_patterns[station_id] = {
                'factor': base_factor * variation,
                'congestion': random.choice(congestion_levels),
            }
        
        return traffic_patterns
    
    def update_station_states(self):
        """Simulate real-time station state changes"""
        for station_id, station in self.stations.items():
            state = self.station_states[station_id]
            
            # Random changes to available slots
            if random.random() > 0.3:  # 70% chance of change
                state['available_slots'] = max(
                    0,
                    min(
                        station['total_slots'],
                        state['available_slots'] + random.randint(-2, 2)
                    )
                )
            
            # Queue simulation
            if random.random() > 0.4:
                state['vehicles_in_queue'] = max(
                    0,
                    min(10, state['vehicles_in_queue'] + random.randint(-1, 2))
                )
            
            # Update current load
            station['current_load_percent'] = (
                (station['total_slots'] - state['available_slots']) /
                station['total_slots'] * 100
            )
            
            # Random status change (5% chance of issue)
            if random.random() > 0.95:
                station['status'] = random.choice(['maintenance', 'overload'])
            elif station['status'] != 'operational':
                if random.random() > 0.7:
                    station['status'] = 'operational'
            
            state['last_update'] = datetime.utcnow()
    
    def get_current_stations(self) -> list[dict]:
        """Get all stations with current state"""
        self.update_station_states()
        
        updated_stations = []
        for station_id, station in self.stations.items():
            state = self.station_states[station_id]
            station['available_slots'] = state['available_slots']
            station['vehicles_in_queue'] = state['vehicles_in_queue']
            station['updated_at'] = datetime.utcnow().isoformat()
            updated_stations.append(station)
        
        return updated_stations
    
    def get_station_by_id(self, station_id: str) -> dict:
        """Get station with current state"""
        if station_id in self.stations:
            self.update_station_states()
            station = self.stations[station_id].copy()
            state = self.station_states[station_id]
            station['available_slots'] = state['available_slots']
            station['vehicles_in_queue'] = state['vehicles_in_queue']
            return station
        return None
    
    def simulate_charging_session(self, vehicle_type: str) -> float:
        """Simulate charging duration in minutes"""
        durations = {
            '2W': random.uniform(10, 20),      # 10-20 min
            '3W': random.uniform(20, 40),      # 20-40 min
            '4W': random.uniform(30, 60),      # 30-60 min
            'Commercial': random.uniform(60, 120),  # 1-2 hours
        }
        return durations.get(vehicle_type, 30)
    
    def get_analytics_snapshot(self) -> dict:
        """Get current system analytics"""
        total_vehicles = 0
        total_charges = 0
        total_energy = 0
        utilization = 0
        
        for station in self.stations.values():
            available = self.station_states[station['id']]['available_slots']
            total = station['total_slots']
            current_utilization = (total - available) / total * 100
            utilization += current_utilization
            total_charges += random.randint(10, 50)  # Simulated charges today
            total_energy += random.uniform(100, 500)  # kWh
        
        return {
            'total_stations': len(self.stations),
            'total_vehicles_served_today': total_charges,
            'avg_utilization': utilization / len(self.stations) if self.stations else 0,
            'total_energy_distributed': total_energy,
            'active_sessions': sum(
                self.station_states[sid]['vehicles_in_queue']
                for sid in self.stations.keys()
            ),
            'timestamp': datetime.utcnow().isoformat(),
        }


# Global instance
data_generator = SyntheticDataGenerator()
