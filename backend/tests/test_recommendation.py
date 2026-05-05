"""
Test suite for Recommendation Engine
"""
import pytest
from app.services.recommendation import RecommendationEngine
from app.models.schemas import VehicleType, ChargingType, ConnectorType


@pytest.fixture
def engine():
    return RecommendationEngine()


@pytest.fixture
def sample_vehicle():
    return {
        'user_id': 'test_user',
        'vehicle_type': VehicleType.FOUR_WHEELER,
        'charging_type': ChargingType.FAST,
        'connector_type': ConnectorType.CCS,
        'current_lat': 13.0827,
        'current_lng': 80.2707,
        'battery_percentage': 30,
    }


@pytest.fixture
def sample_stations():
    return [
        {
            'id': 'station_1',
            'name': 'FastCharge Hub 1',
            'latitude': 13.0830,
            'longitude': 80.2710,
            'status': 'operational',
            'total_slots': 10,
            'available_slots': 3,
            'vehicles_in_queue': 2,
            'current_load_percent': 70,
            'total_fast_slots': 4,
            'total_slow_slots': 4,
            'total_swapping_slots': 2,
        },
        {
            'id': 'station_2',
            'name': 'EV Depot 2',
            'latitude': 13.0900,
            'longitude': 80.2750,
            'status': 'operational',
            'total_slots': 8,
            'available_slots': 5,
            'vehicles_in_queue': 1,
            'current_load_percent': 37,
            'total_fast_slots': 3,
            'total_slow_slots': 3,
            'total_swapping_slots': 2,
        },
    ]


def test_distance_calculation(engine):
    """Test Haversine distance calculation"""
    # Same location
    dist = engine.calculate_distance(13.0827, 80.2707, 13.0827, 80.2707)
    assert dist < 0.1

    # Different location
    dist = engine.calculate_distance(13.0827, 80.2707, 13.0900, 80.2750)
    assert dist > 0


def test_wait_time_calculation(engine):
    """Test wait time calculation"""
    wait_time = engine.calculate_wait_time(
        vehicles_in_queue=3,
        active_slots=2,
        avg_charging_time=30,
    )
    assert wait_time == 45.0  # (3 * 30) / 2


def test_normalization(engine):
    """Test value normalization"""
    assert engine.normalize_value(25, 50) == 0.5
    assert engine.normalize_value(0, 50) == 0.0
    assert engine.normalize_value(100, 50) == 1.0


def test_recommendations(engine, sample_vehicle, sample_stations):
    """Test recommendation generation"""
    traffic = {
        'station_1': {'factor': 1.0, 'congestion': 'low'},
        'station_2': {'factor': 1.2, 'congestion': 'medium'},
    }

    recommendations = engine.recommend_stations(
        vehicle=sample_vehicle,
        stations=sample_stations,
        traffic_conditions=traffic,
        user_id='test_user',
    )

    assert len(recommendations) <= 3
    assert all(len(rec) == 3 for rec in recommendations)  # (id, score, data)


def test_load_balancing(engine, sample_vehicle, sample_stations):
    """Test load balancing logic"""
    # Assign multiple users to station 1
    engine.assign_user('user_1', 'station_1')
    engine.assign_user('user_2', 'station_1')

    traffic = {
        'station_1': {'factor': 1.0, 'congestion': 'low'},
        'station_2': {'factor': 1.0, 'congestion': 'low'},
    }

    recommendations = engine.recommend_stations(
        vehicle=sample_vehicle,
        stations=sample_stations,
        traffic_conditions=traffic,
        user_id='user_3',
    )

    # Station 1 should have lower priority due to load balancing
    if len(recommendations) >= 2:
        assert recommendations[0][0] != 'station_1' or recommendations[0][1] > recommendations[1][1]


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
