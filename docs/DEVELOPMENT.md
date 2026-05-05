# URBANVOLT Project - Development Setup Guide

## Quick Links
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Frontend App: http://localhost:5173
- Admin Dashboard: http://localhost:5173/admin

## Architecture Overview

### Backend Architecture
```
FastAPI Server (Port 8000)
├── REST API Endpoints
├── WebSocket Server
├── Recommendation Engine
├── Data Simulator
└── Database Layer (PostgreSQL + Redis)
```

### Frontend Architecture
```
React SPA (Port 5173)
├── User App (Mobile-First)
├── Admin Dashboard
├── Map Integration
├── Real-time Updates (WebSocket)
└── State Management (Zustand)
```

## Component Details

### Recommendation Engine
**Location**: `backend/app/services/recommendation.py`

Key Features:
- Calculates Haversine distance
- Evaluates traffic conditions
- Computes wait times
- Applies load balancing penalties
- Generates top 3 recommendations

Algorithm Complexity: O(n) where n = number of stations

### Data Simulator
**Location**: `backend/app/services/data_simulator.py`

Generates:
- 20 realistic charging stations around Bangalore
- Dynamic queue and availability changes
- Traffic patterns (morning/evening peaks)
- Station status transitions
- Analytics snapshots

### API Routes
**Location**: `backend/app/main.py`

Endpoints:
- `GET /health` - System health check
- `GET /api/v1/stations` - All stations
- `GET /api/v1/stations/{id}` - Station details
- `GET /api/v1/stations/nearby` - Nearby stations
- `POST /api/v1/recommendations` - Get recommendations
- `WebSocket /ws/updates` - Real-time updates
- `GET /api/v1/alerts` - Active alerts
- `GET /api/v1/analytics/*` - Analytics data

### Frontend Components

#### User App
- **StationMap**: Interactive map with markers
- **RecommendationCard**: Station recommendation display
- **VehicleSelector**: Vehicle type selection
- **AlertsPanel**: Real-time alerts display
- **HomePage**: Main user interface

#### Admin Dashboard
- **StatCard**: Key metrics display
- **Charts**: Demand and utilization charts
- **StationTable**: Station performance table
- **AlertsPanel**: Integrated alerts

## Data Flow

### Recommendation Flow
```
User Vehicle Info
    ↓
Fetch All Stations
    ↓
Filter by Compatibility
    ↓
Calculate Metrics (distance, wait, traffic, load)
    ↓
Normalize & Apply Weights
    ↓
Sort by Score
    ↓
Return Top 3
```

### Real-time Update Flow
```
Simulation Loop (Every 2 seconds)
    ↓
Update Station States
    ↓
Broadcast via WebSocket
    ↓
Frontend Receives Update
    ↓
Update Map & Analytics
```

## Environment Variables

### Backend
```
DATABASE_URL: PostgreSQL connection string
REDIS_URL: Redis connection string
DEBUG: True/False for debug mode
ENABLE_SIMULATION: Enable synthetic data
SIMULATION_UPDATE_INTERVAL: Update frequency (seconds)
SECRET_KEY: JWT secret key
```

### Frontend
```
VITE_API_BASE_URL: Backend API endpoint
VITE_WS_URL: WebSocket endpoint
```

## Database Schema (Planned)

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Stations Table
```sql
CREATE TABLE stations (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  total_slots INT NOT NULL,
  total_fast_slots INT DEFAULT 0,
  total_slow_slots INT DEFAULT 0,
  total_swapping_slots INT DEFAULT 0,
  status VARCHAR DEFAULT 'operational',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Charging Sessions Table
```sql
CREATE TABLE charging_sessions (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  station_id VARCHAR NOT NULL,
  vehicle_type VARCHAR NOT NULL,
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  energy_consumed FLOAT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (station_id) REFERENCES stations(id)
);
```

## Testing

### Backend Testing
```bash
cd backend
pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Performance Optimization

### Backend
- Database query indexing on latitude/longitude
- Redis caching for frequently accessed data
- WebSocket connection pooling
- Async/await for non-blocking I/O

### Frontend
- Lazy loading of map tiles
- Component memoization with React.memo
- State management optimization
- Image optimization

## Monitoring & Debugging

### Backend Logs
- Available at runtime in console
- API errors with detailed messages
- WebSocket connection events
- Simulation updates

### Frontend Debug
- React DevTools browser extension
- Browser Network tab for API calls
- Console warnings for performance issues
- Redux DevTools for state tracking

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process using port
lsof -i :8000  # Backend
lsof -i :5173  # Frontend

# Kill process
kill -9 <PID>
```

### CORS Errors
- Check backend CORS configuration
- Verify frontend API_BASE_URL
- Ensure WebSocket URL is correct

### Map Not Loading
- Check Leaflet CSS import in HTML
- Verify OpenStreetMap tile server connectivity
- Check browser console for errors

### WebSocket Connection Failed
- Ensure backend WebSocket is running
- Check firewall settings
- Verify WS URL in frontend .env

## Next Steps for Production

1. Set up PostgreSQL database
2. Configure Redis caching
3. Implement user authentication
4. Add API rate limiting
5. Deploy to cloud (AWS/Azure/GCP)
6. Set up monitoring (Prometheus/Grafana)
7. Configure logging (ELK stack)
8. Add CI/CD pipeline
9. Implement backup strategy
10. Set up SSL/TLS certificates

## Resources

- [API Documentation](http://localhost:8000/docs)
- [Project README](../README.md)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/deployment/)
- [React Performance](https://react.dev/reference/react)
- [Leaflet Documentation](https://leafletjs.com/)
