# URBANVOLT - API Quick Reference Guide

## Base URLs

```
Backend API: http://localhost:8000
API Prefix: /api/v1
WebSocket: ws://localhost:8000
Docs: http://localhost:8000/docs
```

---

## Health & Status

### Health Check
```bash
GET /health

Response: {
  "status": "healthy",
  "service": "URBANVOLT",
  "timestamp": "2024-05-04T10:30:00"
}
```

### System Status
```bash
GET /api/v1/system/status

Response: {
  "status": "operational",
  "analytics": {...},
  "connected_clients": 5
}
```

---

## Charging Stations

### Get All Stations
```bash
GET /api/v1/stations

Response: {
  "total": 20,
  "stations": [
    {
      "id": "station_123",
      "name": "FastCharge Hub 1",
      "latitude": 13.0827,
      "longitude": 80.2707,
      "available_slots": 3,
      "total_slots": 10,
      "vehicles_in_queue": 2,
      "current_load_percent": 70,
      "status": "operational"
    }
  ],
  "timestamp": "2024-05-04T10:30:00"
}
```

### Get Specific Station
```bash
GET /api/v1/stations/{station_id}

Response: {
  "id": "station_123",
  "name": "FastCharge Hub 1",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "address": "Charging Location 1, Bangalore",
  "status": "operational",
  "total_slots": 10,
  "available_slots": 3,
  "vehicles_in_queue": 2,
  ...
}
```

### Get Station Status
```bash
GET /api/v1/stations/{station_id}/status

Response: {
  "station_id": "station_123",
  "name": "FastCharge Hub 1",
  "available_slots": 3,
  "total_slots": 10,
  "vehicles_in_queue": 2,
  "load_percent": 70,
  "status": "operational",
  "estimated_wait_time": 25.5,
  "timestamp": "2024-05-04T10:30:00"
}
```

### Get Nearby Stations
```bash
GET /api/v1/stations/nearby?lat=13.0827&lng=80.2707&radius_km=5.0

Response: {
  "count": 4,
  "stations": [...],
  "center": {"lat": 13.0827, "lng": 80.2707},
  "radius_km": 5.0
}
```

---

## Recommendations

### Get Top 3 Recommendations
```bash
POST /api/v1/recommendations

Request: {
  "user_id": "user_123",
  "vehicle_type": "4W",
  "charging_type": "fast",
  "connector_type": "CCS",
  "current_lat": 13.0827,
  "current_lng": 80.2707,
  "battery_percentage": 30
}

Response: {
  "user_id": "user_123",
  "vehicle_id": "user_123",
  "recommendations": [
    {
      "station_id": "station_123",
      "name": "FastCharge Hub 1",
      "latitude": 13.0830,
      "longitude": 80.2710,
      "distance": 2.5,
      "eta_with_traffic": 8.5,
      "wait_time": 15.0,
      "available_slots": 3,
      "charging_type": "fast",
      "connector_type": "CCS",
      "score": {
        "score": 0.45,
        "distance": 0.05,
        "wait_time": 0.35,
        "traffic_time": 0.14,
        "load": 0.12,
        "rank": 1
      },
      "is_best_choice": true
    },
    {
      "station_id": "station_456",
      "name": "EV Depot 2",
      "distance": 5.2,
      "eta_with_traffic": 12.0,
      "wait_time": 10.0,
      "available_slots": 5,
      "score": {
        "score": 0.52,
        "rank": 2
      },
      "is_best_choice": false
    },
    {
      "station_id": "station_789",
      "name": "Charging Point 3",
      "distance": 8.1,
      "eta_with_traffic": 18.5,
      "wait_time": 5.0,
      "available_slots": 8,
      "score": {
        "score": 0.58,
        "rank": 3
      },
      "is_best_choice": false
    }
  ],
  "timestamp": "2024-05-04T10:30:00"
}
```

---

## Analytics

### System Analytics
```bash
GET /api/v1/analytics/system

Response: {
  "total_stations": 20,
  "total_vehicles_served_today": 150,
  "avg_utilization": 65.5,
  "total_energy_distributed": 5234.5,
  "active_sessions": 12,
  "timestamp": "2024-05-04T10:30:00"
}
```

### Station Analytics
```bash
GET /api/v1/analytics/stations

Response: [
  {
    "station_id": "station_123",
    "name": "FastCharge Hub 1",
    "total_slots": 10,
    "available_slots": 3,
    "utilization_percent": 70,
    "vehicles_in_queue": 2
  },
  {
    "station_id": "station_456",
    "name": "EV Depot 2",
    "total_slots": 8,
    "available_slots": 5,
    "utilization_percent": 37.5,
    "vehicles_in_queue": 1
  }
]
```

### Peak Hours Analysis
```bash
GET /api/v1/analytics/peak-hours

Response: {
  "peak_hours": [7, 8, 17, 18, 19],
  "lowest_hours": [2, 3, 4, 5],
  "avg_wait_time_peak": 25.5,
  "avg_wait_time_off_peak": 8.3
}
```

---

## Alerts

### Get Active Alerts
```bash
GET /api/v1/alerts

Response: {
  "total_alerts": 3,
  "alerts": [
    {
      "id": "alert_123",
      "station_id": "station_456",
      "station_name": "EV Depot 2",
      "alert_type": "overload",
      "severity": "high",
      "message": "EV Depot 2 is at maximum capacity",
      "timestamp": "2024-05-04T10:25:00"
    },
    {
      "id": "alert_124",
      "station_id": "station_789",
      "station_name": "Charging Point 3",
      "alert_type": "offline",
      "severity": "medium",
      "message": "Charging Point 3 is under maintenance",
      "timestamp": "2024-05-04T09:15:00"
    },
    {
      "id": "alert_125",
      "station_id": "station_101",
      "station_name": "Power Station 4",
      "alert_type": "queue_high",
      "severity": "low",
      "message": "High queue detected at Power Station 4",
      "timestamp": "2024-05-04T10:20:00"
    }
  ]
}
```

---

## WebSocket

### Connect
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/updates')

ws.onopen = () => console.log('Connected')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Update received:', data)
}
ws.onerror = (error) => console.error('Error:', error)
ws.onclose = () => console.log('Disconnected')
```

### Send Message
```javascript
// Get all stations
ws.send(JSON.stringify({
  type: 'get_stations'
}))

// Get specific station
ws.send(JSON.stringify({
  type: 'get_station',
  station_id: 'station_123'
}))

// Keep alive
ws.send(JSON.stringify({
  type: 'ping'
}))
```

### Receive Messages
```javascript
// Station updates
{
  "type": "station_update",
  "data": [
    {
      "id": "station_123",
      "available_slots": 3,
      "vehicles_in_queue": 2,
      "current_load_percent": 70,
      ...
    }
  ],
  "timestamp": "2024-05-04T10:30:00"
}

// Individual station
{
  "type": "station",
  "data": {
    "id": "station_123",
    "name": "FastCharge Hub 1",
    ...
  }
}

// Pong response
{
  "type": "pong"
}
```

---

## Error Responses

### 400 Bad Request
```bash
{
  "detail": "Invalid vehicle type"
}
```

### 404 Not Found
```bash
{
  "detail": "Station not found"
}
```

### 500 Server Error
```bash
{
  "detail": "Internal server error"
}
```

---

## Common Use Cases

### Use Case 1: Find Charging Station
```bash
1. POST /api/v1/recommendations
   - Send vehicle info and location
   
2. Receive top 3 recommendations
   - Best choice is first recommendation
   
3. Display on map
   - Use latitude/longitude for markers
   
4. Show real-time updates
   - Connect WebSocket for live status
```

### Use Case 2: Monitor Network
```bash
1. GET /api/v1/analytics/system
   - Get overall statistics
   
2. GET /api/v1/analytics/stations
   - Get per-station details
   
3. GET /api/v1/alerts
   - Check for critical issues
   
4. WebSocket connection
   - Receive real-time updates every 2 seconds
```

### Use Case 3: Real-time Dashboard
```bash
1. Connect WebSocket
2. Subscribe to all updates
3. Update map markers
4. Update analytics
5. Generate alerts
```

---

## Authentication (Future)

```bash
# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}

# Usage
GET /api/v1/recommendations
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## Rate Limiting (Future)

```
Rate Limit: 100 requests per minute per IP
Headers:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 99
  X-RateLimit-Reset: 1620043200
```

---

## Testing with cURL

```bash
# Health check
curl http://localhost:8000/health

# Get all stations
curl http://localhost:8000/api/v1/stations

# Get recommendations
curl -X POST http://localhost:8000/api/v1/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "vehicle_type": "4W",
    "charging_type": "fast",
    "connector_type": "CCS",
    "current_lat": 13.0827,
    "current_lng": 80.2707,
    "battery_percentage": 30
  }'

# Get nearby stations
curl "http://localhost:8000/api/v1/stations/nearby?lat=13.0827&lng=80.2707&radius_km=5"

# Get analytics
curl http://localhost:8000/api/v1/analytics/system

# Get alerts
curl http://localhost:8000/api/v1/alerts
```

---

## Testing with Postman

1. Import collection:
   - Copy API endpoints into Postman
   - Set base URL: http://localhost:8000
   - Create environment variables

2. Test endpoints:
   - Health check
   - Stations list
   - Single station
   - Nearby stations
   - Recommendations
   - Analytics
   - Alerts

3. WebSocket testing:
   - Use Postman WebSocket feature
   - Connect to ws://localhost:8000/ws/updates
   - Send test messages
   - Monitor responses

---

## Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable | Validation error |
| 500 | Server Error | Internal error |

---

## Pagination (Future)

```bash
GET /api/v1/stations?skip=0&limit=10

Response:
{
  "total": 20,
  "skip": 0,
  "limit": 10,
  "stations": [...]
}
```

---

## Filtering (Future)

```bash
GET /api/v1/stations?status=operational&min_slots=5

GET /api/v1/analytics/stations?utilization_min=50&utilization_max=80
```

---

## Sorting (Future)

```bash
GET /api/v1/stations?sort_by=utilization&sort_order=desc

GET /api/v1/alerts?sort_by=severity&sort_order=desc
```

---

**Note**: Some endpoints like authentication, pagination, filtering, and sorting are ready for implementation. The current version focuses on core functionality.
