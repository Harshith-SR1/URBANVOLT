# URBANVOLT - Quick Reference Card

## 🚀 START

### Windows
```bash
run.bat
# Select: 1 (Full Setup)
```

### Mac/Linux
```bash
bash run.sh
# Select: 1 (Full Setup)
```

### Docker
```bash
bash build.sh
docker-compose up -d
```

---

## 🌐 URLS

| What | URL |
|------|-----|
| App | http://localhost:5173 |
| API | http://localhost:8000 |
| Docs | http://localhost:8000/docs |
| Health | http://localhost:8000/health |

---

## 🔧 MANUAL COMMANDS

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
cd backend
pytest tests/
```

---

## 📡 API QUICK CALLS

### Get Stations
```bash
curl http://localhost:8000/api/v1/stations
```

### Get Recommendations
```bash
curl -X POST http://localhost:8000/api/v1/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user1",
    "vehicle_type": "4W",
    "charging_type": "fast",
    "connector_type": "CCS",
    "current_lat": 13.0827,
    "current_lng": 80.2707,
    "battery_percentage": 30
  }'
```

### Get Analytics
```bash
curl http://localhost:8000/api/v1/analytics/system
```

### Get Alerts
```bash
curl http://localhost:8000/api/v1/alerts
```

---

## 🎮 APP FEATURES

### User Mode
1. Select vehicle
2. Click "Find Optimal Stations"
3. See top 3
4. Click to navigate

### Admin Mode
1. Toggle at top-right
2. View analytics
3. See charts
4. Monitor alerts

---

## 📚 DOCUMENTATION

| Doc | Purpose |
|-----|---------|
| INDEX.md | This guide |
| GETTING_STARTED.md | Setup help |
| README.md | Full docs |
| API_REFERENCE.md | API guide |
| DEVELOPMENT.md | Dev guide |

---

## 🐳 DOCKER COMMANDS

```bash
# Build
bash build.sh
docker build -t urbanvolt-backend ./backend
docker build -t urbanvolt-frontend ./frontend

# Run
docker-compose up -d
docker-compose down

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Cleanup
bash cleanup.sh
docker system prune -a
```

---

## ✨ KEY FEATURES

- ✅ Smart recommendations
- ✅ Real-time updates
- ✅ Interactive map
- ✅ Admin analytics
- ✅ Load balancing
- ✅ Vehicle filtering

---

## 🎯 ALGORITHM

```
Score = 0.25×dist + 0.35×wait + 0.20×traffic + 0.20×load

Lower = Better
```

---

## 📊 SYSTEM

- 20 stations
- 4 vehicle types
- Real-time updates every 2s
- < 100ms response
- 15+ API endpoints

---

## ❓ COMMON ISSUES

| Issue | Fix |
|-------|-----|
| Port in use | Kill process or change port |
| npm not found | Install Node.js |
| venv activation fails | Use correct command for OS |
| Map not showing | Clear browser cache |
| WebSocket error | Ensure backend running |
| API 502 | Check backend is up |

---

## 🔗 KEY FILES

- `backend/app/services/recommendation.py` ⭐
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/AdminDashboard.jsx`
- `backend/app/main.py`
- `docker-compose.yml`

---

## 📞 HELP

- [GETTING_STARTED.md](GETTING_STARTED.md) - Setup
- [API_REFERENCE.md](API_REFERENCE.md) - API
- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Dev
- [README.md](README.md) - Full

---

## ✅ CHECKLIST

- [ ] Services running
- [ ] Frontend loads at localhost:5173
- [ ] User app works
- [ ] Admin dashboard loads
- [ ] API docs accessible
- [ ] Recommendations returned
- [ ] Map showing stations

---

**URBANVOLT**: Smart EV Charging ⚡🚗

Print this page for quick reference!
