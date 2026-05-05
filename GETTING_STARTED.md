# URBANVOLT - Getting Started Guide

Welcome to **URBANVOLT**, your Smart EV Charging Management System! This guide will help you get started quickly.

## 🚀 Quick Start (5 minutes)

### Option 1: Windows Users
```bash
# Open PowerShell or Command Prompt in the URBANVOLT folder
run.bat

# Select option 1 for Full Setup
# Then follow prompts
```

### Option 2: Mac/Linux Users
```bash
# Open Terminal in the URBANVOLT folder
bash run.sh

# Select option 1 for Full Setup
# Then follow prompts
```

### Option 3: Docker (Recommended)
```bash
# Build images
bash build.sh  # or build.bat on Windows

# Run everything
docker-compose up -d

# Access:
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Docs: http://localhost:8000/docs
```

---

## 📋 Manual Setup

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# OR Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn app.main:app --reload

# Access API docs: http://localhost:8000/docs
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Access app: http://localhost:5173
```

---

## ✨ Features to Explore

### 1. User App (Mobile-First)
- **URL**: http://localhost:5173
- **Features**:
  - Full-screen interactive map
  - Vehicle selector (2W, 3W, 4W, Commercial)
  - "Find Optimal Stations" button
  - Top 3 recommendations with real metrics
  - Click to navigate and see route on map
  - Real-time alerts panel

### 2. Admin Dashboard
- **Toggle** at top-right to "Admin Mode"
- **Features**:
  - Key metrics (stations, vehicles, energy, utilization)
  - 24-hour demand trend chart
  - Station utilization bar chart
  - Real-time alerts panel
  - Station performance table
  - All updates every 2 seconds

### 3. API Documentation
- **URL**: http://localhost:8000/docs
- **Interactive** Swagger UI
- Test endpoints directly
- See request/response examples

### 4. Real-time Updates
- Every 2 seconds:
  - Station availability changes
  - Queue lengths update
  - Load percentages recalculate
  - Alerts generate/resolve

---

## 🧪 Try This Demo Flow

### Step 1: Check Backend Health
```bash
curl http://localhost:8000/health
```
Expected: `{"status": "healthy", ...}`

### Step 2: View All Stations
```bash
curl http://localhost:8000/api/v1/stations
```
Expected: 20 charging stations with current status

### Step 3: Get Recommendations
```bash
curl -X POST http://localhost:8000/api/v1/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "demo_user",
    "vehicle_type": "4W",
    "charging_type": "fast",
    "connector_type": "CCS",
    "current_lat": 13.0827,
    "current_lng": 80.2707,
    "battery_percentage": 30
  }'
```
Expected: Top 3 stations with scores

### Step 4: Open Frontend
- Open http://localhost:5173 in browser
- Select a vehicle type
- Click "Find Optimal Stations"
- See recommendations with real metrics
- Click a station to navigate on map

### Step 5: Check Dashboard
- Toggle to "Admin Mode"
- See live analytics updating
- Charts showing demand patterns
- Table showing all stations
- Alerts panel for issues

---

## 📚 Key Files to Understand

### Backend
- **`app/main.py`** - FastAPI server with all routes
- **`app/services/recommendation.py`** - Smart recommendation algorithm
- **`app/services/data_simulator.py`** - Synthetic data generation
- **`app/models/schemas.py`** - Data models

### Frontend
- **`src/App.jsx`** - Main app with mode switcher
- **`src/pages/HomePage.jsx`** - User app
- **`src/pages/AdminDashboard.jsx`** - Admin dashboard
- **`src/components/StationMap.jsx`** - Interactive map
- **`src/contexts/store.js`** - State management

---

## 🔧 Common Tasks

### View Backend Logs
```bash
# The logs appear in the terminal where you ran uvicorn
# Look for:
# - Recommendation calculations
# - WebSocket connections
# - Simulation updates
```

### Restart Backend
```bash
# Press Ctrl+C to stop
# Then run again:
python -m uvicorn app.main:app --reload

# --reload enables auto-restart on file changes
```

### Restart Frontend
```bash
# Press Ctrl+C to stop
# Then run again:
npm run dev
```

### Clear Cache
```bash
# Browser
# Press Ctrl+Shift+Delete (Ctrl+Cmd+Delete on Mac)
# Clear cache and cookies

# Or
# Press F12, right-click refresh button, hard refresh
```

### Check if Ports are Available
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Mac/Linux
lsof -i :8000
lsof -i :5173

# If busy, either:
# 1. Kill the process
# 2. Change port in config files
```

---

## 🎮 Interactive Features

### Try These Actions:

1. **Select Different Vehicles**
   - 2-Wheeler (fast charge, small capacity)
   - 3-Wheeler (medium)
   - 4-Wheeler (large capacity)
   - Commercial (very large)

2. **Watch Real-time Updates**
   - Station availability changes
   - Queue lengths vary
   - Load percentages fluctuate
   - Status can go offline/maintenance

3. **Check Different Modes**
   - User Mode: See recommendations
   - Admin Mode: See analytics

4. **Monitor Alerts**
   - High severity: Station overloaded
   - Medium severity: Station under maintenance
   - Low severity: Long queue

5. **View Analytics**
   - Peak demand hours (4-8 PM)
   - Off-peak hours (2-5 AM)
   - Total energy distribution
   - Station utilization

---

## 📊 Understanding the Scoring

The algorithm picks the best 3 stations using:

**Score = 0.25×distance + 0.35×wait_time + 0.20×traffic + 0.20×load**

Lower score = Better recommendation

**Example:**
- Station A (2 km away, 15 min queue, light traffic, 70% load)
- Station B (5 km away, 5 min queue, heavy traffic, 40% load)
- **Station A usually wins** (closer + shorter wait outweighs higher load)

---

## 🗺️ Map Features

- **Green markers** = Available (< 50% load)
- **Yellow markers** = Medium load (50-80%)
- **Red markers** = High load (> 80%)
- **Gray markers** = Offline/Maintenance
- **Blue pulsing dot** = Your location
- **Blue dotted line** = Route to selected station

---

## 📱 Mobile Tips

### Testing on Mobile
1. Forward port or deploy backend publicly
2. Update `.env` with public URLs:
   ```
   VITE_API_BASE_URL=https://your-backend-url/api/v1
   VITE_WS_URL=wss://your-backend-url
   ```
3. Access frontend on mobile browser
4. Adjust viewport if needed

### Mobile Layout
- Bottom sheet recommendations
- Full-screen map
- Touch-optimized buttons
- Swipe to dismiss panels

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Error: Port 8000 already in use
lsof -i :8000
kill -9 <PID>

# Then restart
python -m uvicorn app.main:app --reload
```

### Frontend Won't Start
```bash
# Error: npm command not found
# Install Node.js from nodejs.org

# Error: node_modules issues
rm -rf node_modules
npm install
npm run dev
```

### Map Not Loading
```bash
# Check browser console (F12)
# Verify OpenStreetMap is accessible
# Clear browser cache (Ctrl+Shift+Delete)
```

### WebSocket Connection Failed
```bash
# Ensure backend is running on port 8000
# Check firewall settings
# Try reconnecting (page refresh)
```

### No Recommendations Found
```bash
# Make sure vehicle is selected
# Check vehicle compatibility with stations
# Try different vehicle type
```

---

## 🔗 Important URLs

| Purpose | URL |
|---------|-----|
| User App | http://localhost:5173 |
| Admin Dashboard | http://localhost:5173 (toggle at top-right) |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| API Schema | http://localhost:8000/openapi.json |
| Health Check | http://localhost:8000/health |

---

## 📖 Documentation Links

- **README.md** - Full project documentation
- **API_REFERENCE.md** - Complete API guide
- **DEVELOPMENT.md** - Developer guide
- **PROJECT_SUMMARY.md** - Feature summary
- **CHECKLIST.md** - Implementation checklist

---

## 🚀 Next Steps

1. **Explore the UI**
   - Try different vehicles
   - Check recommendations
   - Toggle admin mode
   - Watch real-time updates

2. **Test the API**
   - Use API docs at `/docs`
   - Try different endpoints
   - Test recommendations
   - Monitor analytics

3. **Review Code**
   - Backend algorithm: `app/services/recommendation.py`
   - Frontend components: `src/components/`
   - Data simulator: `app/services/data_simulator.py`

4. **Customize**
   - Adjust weights in recommendation.py
   - Change simulation speed
   - Modify UI colors/theme
   - Add new features

---

## 💡 Pro Tips

### For Demos
1. Open both User and Admin dashboards (side-by-side)
2. Get recommendations in user app
3. Watch analytics update in admin dashboard
4. Show real-time alert generation
5. Explain scoring algorithm

### For Development
1. Keep both backend and frontend running
2. Use auto-reload features
3. Check browser console (F12) for errors
4. Monitor backend terminal for logs
5. Use API docs for testing

### For Testing
1. Use different vehicle types
2. Try different locations (change lat/lng)
3. Watch for load balancing in action
4. Monitor queue changes
5. Test error cases

---

## 📞 Getting Help

### If Something Breaks
1. Check the browser console (F12)
2. Check the backend terminal
3. Verify both services are running
4. Check port availability
5. Review troubleshooting section above

### Review Documentation
- README.md - Overview
- API_REFERENCE.md - API details
- DEVELOPMENT.md - Architecture
- Code comments - Implementation details

### Common Issues
- Port in use → Kill process or change port
- Dependencies missing → Run pip/npm install
- Map not loading → Clear cache
- No recommendations → Check vehicle compatibility

---

## 🎉 You're Ready!

Everything is set up and ready to go. Start exploring URBANVOLT:

1. ✅ Backend running on http://localhost:8000
2. ✅ Frontend running on http://localhost:5173
3. ✅ 20 realistic charging stations
4. ✅ Real-time updates every 2 seconds
5. ✅ Smart recommendation algorithm
6. ✅ Beautiful responsive UI

**Happy charging! ⚡🚗**

---

## 📋 Quick Commands Reference

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up -d
docker-compose down

# Clean up
bash cleanup.sh  # or cleanup.bat on Windows
```

---

*Built with ❤️ for BESCOM's EV Charging Optimization hackathon*
