"""
Main FastAPI application for URBANVOLT
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import json
from datetime import datetime

from app.config import settings
from app.db import Base, engine, SessionLocal
from app.api.auth_routes import router as auth_router
from app.services.auth_service import ensure_default_admin, require_roles
from app.services.recommendation import RecommendationEngine
from app.services.data_simulator import data_generator
from app.models.schemas import (
    VehicleRequest,
    RecommendationsResponse,
    ChargeRecommendation,
    RecommendationScore,
    ChargingStation,
    StationStatus,
    User,
    Alert,
)


# Global instances
recommendation_engine = RecommendationEngine()
connected_clients: set[WebSocket] = set()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown"""
    # Startup
    print("URBANVOLT Backend Starting...")

    # Initialize auth DB tables and bootstrap admin
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        ensure_default_admin(db)

    data_generator.generate_charging_stations(20)
    
    # Start background simulation if enabled
    if settings.ENABLE_SIMULATION:
        asyncio.create_task(simulation_loop())
    
    yield
    
    # Shutdown
    print("URBANVOLT Backend Shutting down...")


async def simulation_loop():
    """Continuously update simulation data"""
    while True:
        await asyncio.sleep(settings.SIMULATION_UPDATE_INTERVAL)
        data_generator.update_station_states()
        
        # Broadcast updates to connected clients
        if connected_clients:
            update_message = {
                'type': 'station_update',
                'data': data_generator.get_current_stations(),
                'timestamp': datetime.utcnow().isoformat(),
            }
            
            disconnected = set()
            for client in connected_clients:
                try:
                    await client.send_json(update_message)
                except:
                    disconnected.add(client)
            
            connected_clients.difference_update(disconnected)


# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart EV Charging Management System",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(auth_router)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Health & Status Endpoints
# =============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/v1/system/status")
async def system_status():
    """Get system status and analytics"""
    return {
        "status": "operational",
        "analytics": data_generator.get_analytics_snapshot(),
        "connected_clients": len(connected_clients),
    }


# =============================================================================
# Stations Endpoints
# =============================================================================

@app.get("/api/v1/stations")
async def get_all_stations():
    """Get all charging stations with current status"""
    stations = data_generator.get_current_stations()
    return {
        "total": len(stations),
        "stations": stations,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/v1/stations/{station_id}")
async def get_station(station_id: str):
    """Get specific station details"""
    station = data_generator.get_station_by_id(station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station


@app.get("/api/v1/stations/{station_id}/status")
async def get_station_status(station_id: str):
    """Get real-time station status"""
    station = data_generator.get_station_by_id(station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    return {
        "station_id": station_id,
        "name": station['name'],
        "available_slots": station['available_slots'],
        "total_slots": station['total_slots'],
        "vehicles_in_queue": station['vehicles_in_queue'],
        "load_percent": station['current_load_percent'],
        "status": station['status'],
        "estimated_wait_time": (
            station['vehicles_in_queue'] * 30 / max(station['available_slots'], 1)
        ),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/v1/stations/nearby")
async def get_nearby_stations(lat: float, lng: float, radius_km: float = 5.0):
    """Get nearby stations within radius"""
    import math
    
    def distance(lat1, lng1, lat2, lng2):
        """Calculate distance using Haversine"""
        R = 6371
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return R * c
    
    stations = data_generator.get_current_stations()
    nearby = [
        s for s in stations
        if distance(lat, lng, s['latitude'], s['longitude']) <= radius_km
    ]
    
    return {
        "count": len(nearby),
        "stations": nearby,
        "center": {"lat": lat, "lng": lng},
        "radius_km": radius_km,
    }


# =============================================================================
# Recommendations Endpoint
# =============================================================================

@app.post("/api/v1/recommendations")
@app.post("/api/recommendations")
async def get_recommendations(
    vehicle: VehicleRequest,
    _: object = Depends(require_roles('user')),
):
    """Get top 3 charging station recommendations"""
    
    # Get all stations
    stations = data_generator.get_current_stations()
    
    # Get traffic conditions
    traffic_conditions = data_generator.generate_traffic_conditions()
    
    # Get recommendations
    vehicle_dict = vehicle.model_dump()
    recommendations_list = recommendation_engine.recommend_stations(
        vehicle=vehicle_dict,
        stations=stations,
        traffic_conditions=traffic_conditions,
        user_id=vehicle.user_id,
    )

    # If no stations found in the 3-5km range, generate some and retry
    if not recommendations_list:
        data_generator.generate_localized_stations(vehicle.current_lat, vehicle.current_lng)
        stations = data_generator.get_current_stations()
        traffic_conditions = data_generator.generate_traffic_conditions()
        recommendations_list = recommendation_engine.recommend_stations(
            vehicle=vehicle_dict,
            stations=stations,
            traffic_conditions=traffic_conditions,
            user_id=vehicle.user_id,
        )
    
    # Build response
    recommendations = []
    for idx, (station_id, score, metrics) in enumerate(recommendations_list):
        station = data_generator.get_station_by_id(station_id)
        
        recommendation = ChargeRecommendation(
            station_id=station_id,
            name=station['name'],
            latitude=station['latitude'],
            longitude=station['longitude'],
            distance=metrics['distance'],
            eta_with_traffic=metrics['traffic_time'],
            wait_time=metrics['wait_time'],
            available_slots=metrics['available_slots'],
            charging_type=vehicle.charging_type,
            connector_type=vehicle.connector_type,
            score=RecommendationScore(
                score=score,
                distance=metrics['distance'],
                wait_time=metrics['wait_time'],
                traffic_time=metrics['traffic_time'],
                load=metrics['load'],
                rank=idx + 1,
            ),
            is_best_choice=(idx == 0),
            label="Best Choice" if idx == 0 else "Recommended",
        )
        recommendations.append(recommendation)
        
        # Track assignment for load balancing
        recommendation_engine.assign_user(vehicle.user_id, station_id)
    
    return RecommendationsResponse(
        user_id=vehicle.user_id,
        vehicle_id=vehicle.user_id,  # Simplified
        recommendations=recommendations,
        timestamp=datetime.utcnow(),
    )


# =============================================================================
# WebSocket - Real-time Updates
# =============================================================================

@app.websocket("/ws/updates")
async def websocket_updates(websocket: WebSocket):
    """WebSocket endpoint for real-time station updates"""
    await websocket.accept()
    connected_clients.add(websocket)
    
    try:
        while True:
            # Keep connection alive and wait for messages
            data = await asyncio.wait_for(websocket.receive_text(), timeout=60)
            message = json.loads(data)
            
            if message['type'] == 'get_stations':
                await websocket.send_json({
                    'type': 'stations',
                    'data': data_generator.get_current_stations(),
                })
            
            elif message['type'] == 'get_station':
                station = data_generator.get_station_by_id(message['station_id'])
                await websocket.send_json({
                    'type': 'station',
                    'data': station,
                })
            
            elif message['type'] == 'ping':
                await websocket.send_json({'type': 'pong'})
    
    except asyncio.TimeoutError:
        pass
    except WebSocketDisconnect:
        connected_clients.discard(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        connected_clients.discard(websocket)


# =============================================================================
# Analytics Endpoints
# =============================================================================

@app.get("/api/v1/analytics/system")
async def get_system_analytics():
    """Get system-wide analytics"""
    return data_generator.get_analytics_snapshot()


@app.get("/api/v1/analytics/stations")
async def get_stations_analytics():
    """Get analytics per station"""
    stations = data_generator.get_current_stations()
    analytics = []
    
    for station in stations:
        analytics.append({
            'station_id': station['id'],
            'name': station['name'],
            'total_slots': station['total_slots'],
            'available_slots': station['available_slots'],
            'utilization_percent': station['current_load_percent'],
            'vehicles_in_queue': station['vehicles_in_queue'],
        })
    
    return analytics


@app.get("/api/v1/analytics/peak-hours")
async def get_peak_hours():
    """Get peak hours analysis (simulated)"""
    return {
        "peak_hours": [7, 8, 17, 18, 19],
        "lowest_hours": [2, 3, 4, 5],
        "avg_wait_time_peak": 25.5,
        "avg_wait_time_off_peak": 8.3,
    }


# =============================================================================
# Alerts Endpoints
# =============================================================================

@app.get("/api/v1/alerts")
async def get_alerts():
    """Get active alerts"""
    stations = data_generator.get_current_stations()
    alerts = []
    
    for station in stations:
        if station['status'] == 'overload':
            alerts.append({
                'id': station['id'],
                'station_id': station['id'],
                'station_name': station['name'],
                'alert_type': 'overload',
                'severity': 'high',
                'message': f"{station['name']} is at maximum capacity",
                'timestamp': datetime.utcnow().isoformat(),
            })
        elif station['status'] == 'maintenance':
            alerts.append({
                'id': station['id'],
                'station_id': station['id'],
                'station_name': station['name'],
                'alert_type': 'offline',
                'severity': 'medium',
                'message': f"{station['name']} is under maintenance",
                'timestamp': datetime.utcnow().isoformat(),
            })
    
    return {
        "total_alerts": len(alerts),
        "alerts": alerts,
    }


# =============================================================================
# Admin Protected Endpoints
# =============================================================================

@app.get('/api/v1/admin/dashboard')
@app.get('/api/admin/dashboard')
async def get_admin_dashboard(_: object = Depends(require_roles('admin'))):
    analytics = data_generator.get_analytics_snapshot()
    stations = data_generator.get_current_stations()
    overloaded = len([s for s in stations if s['status'] == 'overload'])
    faulty = len([s for s in stations if s['status'] in ('maintenance', 'offline')])
    return {
        'total_stations': analytics['total_stations'],
        'active_vehicles': analytics['active_sessions'],
        'total_charging_sessions': analytics['total_vehicles_served_today'],
        'overloaded_stations': overloaded,
        'faulty_stations': faulty,
        'avg_utilization': analytics['avg_utilization'],
        'timestamp': datetime.utcnow().isoformat(),
    }


@app.get('/api/v1/admin/insights')
@app.get('/api/admin/insights')
async def get_admin_insights(_: object = Depends(require_roles('admin'))):
    """AI-Driven Administrative Insights (Part 2)"""
    stations = data_generator.get_current_stations()
    underutilized = []
    overloaded = []
    redistribution_suggestions = []
    
    for station in stations:
        load = station['current_load_percent'] / 100.0
        if load < 0.3:
            underutilized.append({
                "station_id": station['id'],
                "name": station['name'],
                "load_percent": station['current_load_percent']
            })
        elif load > 0.8:
            overloaded.append({
                "station_id": station['id'],
                "name": station['name'],
                "load_percent": station['current_load_percent']
            })

    # Load Redistribution logic (Part 2 Step 4)
    if overloaded and underutilized:
        for over in overloaded[:2]:
            near_under = underutilized[0] # Simplification for demo
            redistribution_suggestions.append({
                "from_station": over['name'],
                "to_station": near_under['name'],
                "action": f"Redirecting traffic from {over['name']} (High Load) to {near_under['name']} (Low Load)"
            })
    
    # Infrastructure & Demand Planning (Part 2 Steps 5 & 6)
    high_demand_zones = [
        {"area": "Central CBD", "requests_per_hour": 180, "trend": "Increasing"},
        {"area": "Outer Ring Road", "requests_per_hour": 240, "trend": "Critical Growth"}
    ]
    
    infrastructure_planning = []
    for zone in high_demand_zones:
        if zone["requests_per_hour"] > 200:
            infrastructure_planning.append({
                "zone": zone['area'],
                "recommendation": "Deploy 12-slot Ultra-Fast Charging Hub",
                "reason": "Recurring congestion detected in high-EV growth corridor"
            })
            
    # Grid Load Impact (Part 2 Step 7)
    grid_impact = {
        "peak_usage_window": "17:00 - 20:00",
        "current_grid_load_increase": "18.5%",
        "balancing_efficiency": "92%"
    }

    return {
        "underutilized_stations": underutilized,
        "overloaded_stations": overloaded,
        "redistribution_suggestions": redistribution_suggestions,
        "demand_zones": high_demand_zones,
        "infrastructure_planning": infrastructure_planning,
        "grid_impact": grid_impact,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get('/api/v1/admin/alerts')
@app.get('/api/admin/alerts')
async def get_admin_alerts(_: object = Depends(require_roles('admin'))):
    return await get_alerts()


# =============================================================================
# Root
# =============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to URBANVOLT",
        "version": "1.0.0",
        "docs": "/docs",
        "api": "/api/v1",
    }
