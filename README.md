# URBANVOLT - Smart EV Charging Management System

A full-stack AI-powered smart EV charging management system designed for BESCOM under the theme: **AI for EV Charging Optimization & Infrastructure Planning**.

## 🎯 Features

### Core System Functionality
- **Smart Recommendation Engine**: Top 3 optimal charging stations based on:
  - Real-time GPS distance
  - Expected waiting time (queue + charging duration)
  - Traffic conditions (travel time)
  - Station load (number of active vehicles)

- **Intelligent Scoring Formula**:
  ```
  Score = w1(distance) + w2(wait_time) + w3(traffic) + w4(load)
  ```

- **Dynamic Load Balancing**:
  - Prevents multiple users from being directed to the same station
  - Ensures fair distribution across stations
  - Adaptive scoring based on user assignments

### Vehicle Differentiation Logic
- Vehicle Types: 2W / 3W / 4W / Commercial
- Charging Types: fast / slow / swapping
- Connector Types: Type1 / Type2 / CCS / CHAdeMO
- Automatic filtering based on vehicle compatibility

### Wait Time Calculation
```
Wait Time = (vehicles_in_queue × avg_charging_time) / active_slots
```

### Real-time Features
- Live station availability updates
- Real-time user movement tracking
- Adaptive recommendations as user moves
- Automatic fault detection and exclusion

## 🏗️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Leaflet.js** - OpenStreetMap integration
- **Zustand** - State management
- **Recharts** - Analytics charts
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Primary database (via Supabase)
- **Redis** - Real-time caching
- **WebSockets** - Real-time updates
- **Pydantic** - Data validation

### Maps
- **OpenStreetMap** - Free map data
- **Leaflet.js** - Map rendering library
- **No paid APIs** - Fully open-source solution

## 📂 Project Structure

```
URBANVOLT/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── schemas.py      # Pydantic models
│   │   ├── services/
│   │   │   ├── recommendation.py   # Scoring engine
│   │   │   └── data_simulator.py   # Synthetic data
│   │   ├── api/                # API routes
│   │   ├── config.py           # Configuration
│   │   └── main.py             # FastAPI app
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment template
│   └── run.sh                   # Backend startup script
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API & WebSocket services
│   │   ├── contexts/            # Zustand stores
│   │   ├── App.jsx              # Main app
│   │   └── main.jsx             # Entry point
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
└── docs/
    └── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ & npm
- Python 3.9+
- PostgreSQL (optional - can use Supabase free tier)
- Redis (optional - local development)

### Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# Run backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Running Both (Parallel)

```bash
# Terminal 1 - Backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔌 API Endpoints

### Stations
- `GET /api/v1/stations` - Get all stations
- `GET /api/v1/stations/{id}` - Get specific station
- `GET /api/v1/stations/{id}/status` - Get real-time status
- `GET /api/v1/stations/nearby?lat=X&lng=Y` - Get nearby stations

### Recommendations
- `POST /api/v1/recommendations` - Get top 3 recommendations
  ```json
  {
    "user_id": "user_123",
    "vehicle_type": "4W",
    "charging_type": "fast",
    "connector_type": "CCS",
    "current_lat": 13.0827,
    "current_lng": 80.2707,
    "battery_percentage": 30
  }
  ```

### Analytics
- `GET /api/v1/analytics/system` - System-wide analytics
- `GET /api/v1/analytics/stations` - Per-station analytics
- `GET /api/v1/analytics/peak-hours` - Peak hour analysis

### Real-time
- `WebSocket /ws/updates` - Real-time station updates

### Alerts
- `GET /api/v1/alerts` - Active alerts

## 🎨 UI Components

### User App (Mobile-First)
1. **Home Screen**
   - Full-screen interactive map
   - Color-coded station markers (green: available, yellow: medium load, red: high load)
   - Bottom sheet with Top 3 recommendations
   - Vehicle selector
   - Real-time location tracking

2. **Recommendation Cards**
   - Station name & distance
   - ETA with traffic
   - Wait time estimate
   - Available slots
   - Station load percentage
   - "Best Choice" badge for top recommendation
   - Quick navigation button

3. **Navigation Mode**
   - Route displayed on map
   - Live ETA and traffic overlay
   - Floating station info panel

### Admin Dashboard (Desktop + Mobile)
1. **Desktop View**
   - Sidebar navigation
   - Key metrics cards
   - 24-hour demand trend chart
   - Station utilization bar chart
   - Real-time alerts panel
   - Station performance table

2. **Mobile View**
   - Simplified stacked layout
   - Summary cards
   - Alerts feed
   - Mini analytics

## 🧮 Scoring Algorithm Details

### Normalization Process
Each factor is normalized to 0-1 range based on maximum thresholds:
- Distance: max 50 km
- Wait Time: max 120 minutes
- Traffic: max 60 minutes
- Load: max 100%

### Load Balancing Penalty
When multiple users are assigned to the same station, a dynamic penalty is applied:
```
load_penalty = (users_assigned / 100) × 0.3  # Max 30% penalty
```

### Weight Distribution
- Distance: 25% (closest is better for user convenience)
- Wait Time: 35% (most important for user experience)
- Traffic: 20% (travel time impact)
- Load: 20% (fair distribution across network)

## 🔄 Real-time Features

### WebSocket Updates
- Automatic station state updates every 2 seconds
- Live user position tracking
- Dynamic recommendation recalculation
- Real-time alerts for overload/offline stations

### Synthetic Data Simulator
- Generates realistic 20 charging stations around Bangalore
- Simulates:
  - Real-time queue changes
  - Vehicle arrivals/departures
  - Station failures and maintenance
  - Traffic patterns (morning rush: heavy, evening: very heavy)

## 📊 Data Models

### Vehicle
```python
{
  "user_id": "user_123",
  "vehicle_type": "4W",  # 2W, 3W, 4W, Commercial
  "charging_type": "fast",  # fast, slow, swapping
  "connector_type": "CCS",  # Type1, Type2, CCS, CHAdeMO
  "current_lat": 13.0827,
  "current_lng": 80.2707,
  "battery_percentage": 30
}
```

### Charging Station
```python
{
  "id": "station_123",
  "name": "FastCharge Hub 1",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "total_slots": 10,
  "available_slots": 3,
  "vehicles_in_queue": 2,
  "current_load_percent": 70,
  "status": "operational",  # operational, maintenance, overload, offline
  "total_fast_slots": 4,
  "total_slow_slots": 4,
  "total_swapping_slots": 2
}
```

### Recommendation
```python
{
  "station_id": "station_123",
  "name": "FastCharge Hub 1",
  "distance": 2.5,  # km
  "eta_with_traffic": 8.5,  # minutes
  "wait_time": 15.0,  # minutes
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
}
```

## 🚧 Advanced Features

### Traffic Integration
- Simulated traffic patterns based on time of day
- Traffic factor multiplier (1.0 = normal, 1.5 = heavy)
- Dynamic ETA calculation

### Station Filtering
- Compatibility-based filtering
- Status-based exclusion (offline/maintenance)
- Load-based sorting

### Analytics & Monitoring
- Real-time system status
- Per-station performance metrics
- Peak hour identification
- Total energy distribution tracking

## 🔧 Configuration

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/urbanvolt
REDIS_URL=redis://localhost:6379/0
DEBUG=True
ENABLE_SIMULATION=True
SIMULATION_UPDATE_INTERVAL=2
SECRET_KEY=your-secret-key
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000
```

## 📱 Responsive Design

### Mobile (< 768px)
- Full-screen map with bottom sheet
- Stacked card layout
- Touch-optimized buttons
- Simplified navigation

### Tablet (768px - 1024px)
- Map + sidebar layout
- Grid-based card layout
- Adjusted spacing

### Desktop (> 1024px)
- Sidebar + main content layout
- Multi-column charts
- Detailed analytics
- Full feature access

## 🎯 Use Cases

1. **For End Users**
   - Find optimal charging station near current location
   - Minimize charging time and waiting
   - Plan routes with traffic considerations
   - Track charging history

2. **For Administrators**
   - Monitor network utilization in real-time
   - Identify peak demand periods
   - Detect station failures
   - Plan infrastructure expansion

3. **For City Planning**
   - Analyze demand patterns
   - Optimize station placement
   - Predict future capacity needs
   - Support sustainable EV adoption

## 🚀 Deployment

### Docker Deployment
```bash
# Build backend image
docker build -t urbanvolt-backend:1.0 ./backend

# Build frontend image
docker build -t urbanvolt-frontend:1.0 ./frontend

# Run with docker-compose
docker-compose up -d
```

### Production Considerations
- Use PostgreSQL instead of SQLite
- Enable Redis for caching
- Implement rate limiting
- Add authentication (JWT)
- Use environment variables
- Enable HTTPS
- Implement monitoring (Prometheus, Grafana)

## 📈 Performance Metrics

- **Recommendation Time**: < 100ms
- **WebSocket Latency**: < 50ms
- **Station Update Frequency**: 2 seconds
- **Map Render**: < 200ms
- **Database Queries**: Optimized with indexes

## 🔐 Security

- Input validation with Pydantic
- CORS enabled for cross-origin requests
- Password hashing ready (passlib + bcrypt)
- JWT token support
- Environment variable security

## 📝 Future Enhancements

1. **ML Model Integration**
   - Demand prediction using time-series analysis
   - Queue time forecasting
   - Optimal pricing strategies

2. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Offline mode

3. **Payment Integration**
   - In-app payment processing
   - Subscription plans
   - Loyalty rewards

4. **Advanced Analytics**
   - Heatmap visualization
   - Usage pattern analysis
   - Anomaly detection

5. **IoT Integration**
   - Direct station sensor integration
   - Real-time fault alerts
   - Predictive maintenance

## 📄 License

This project is designed for BESCOM for the AI for EV Charging Optimization hackathon.

## 👥 Support

For issues and questions:
1. Check existing documentation
2. Review API documentation at `/docs`
3. Check console logs for error details
4. Verify backend is running and accessible

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Leaflet.js Guide](https://leafletjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**URBANVOLT** - Making EV charging smarter, faster, and more efficient! 🚗⚡
