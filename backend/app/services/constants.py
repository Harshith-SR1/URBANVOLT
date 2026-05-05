"""
Station simulation constants and utilities
"""

# City coordinates (Bangalore)
CITY_CENTER_LAT = 13.0827
CITY_CENTER_LNG = 80.2707
CITY_RADIUS_KM = 15

# Charging times in minutes
CHARGING_TIMES = {
    '2W': (10, 20),        # 10-20 minutes
    '3W': (20, 40),        # 20-40 minutes
    '4W': (30, 60),        # 30-60 minutes
    'Commercial': (60, 120),  # 1-2 hours
}

# Traffic patterns
TRAFFIC_PATTERNS = {
    'morning_peak': {        # 6-10 AM
        'hours': (6, 10),
        'factor': 1.3,
        'congestion': 'medium',
    },
    'evening_peak': {        # 4-8 PM
        'hours': (16, 20),
        'factor': 1.5,
        'congestion': 'very_high',
    },
    'evening_moderate': {    # 8-10 PM
        'hours': (20, 22),
        'factor': 1.2,
        'congestion': 'medium',
    },
    'night_light': {         # 10 PM - 6 AM
        'hours': (22, 6),
        'factor': 1.0,
        'congestion': 'low',
    },
}

# Station types
STATION_TYPES = [
    'FastCharge Hub',
    'EV Depot',
    'Charging Point',
    'Power Station',
    'Volt Station',
    'ChargeWay',
]

# Scoring weights
SCORING_WEIGHTS = {
    'distance': 0.25,
    'wait_time': 0.35,
    'traffic': 0.20,
    'load': 0.20,
}

# Normalization constants
NORMALIZATION_MAX = {
    'distance_km': 50.0,
    'wait_time_min': 120.0,
    'traffic_time_min': 60.0,
    'load_percent': 100.0,
}

# Station capacity ranges
STATION_CAPACITY = {
    'small': (4, 6),
    'medium': (8, 10),
    'large': (12, 16),
}

# Default average speed (km/h)
URBAN_AVG_SPEED = 30
