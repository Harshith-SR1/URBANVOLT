# 💻 URBANVOLT - Source Code Guide

This document provides a high-level overview of the source code architecture for URBANVOLT.

---

## 📂 Project Structure

```text
URBANVOLT/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # Auth and System Routes
│   │   ├── models/         # Pydantic Schemas & DB Models
│   │   └── services/       # AI Engines & Data Simulation
│   └── main.py             # App Entry & API Implementation
├── frontend/               # React + Vite Application
│   ├── src/
│   │   ├── components/     # Reusable UI (StationCard, Header, etc.)
│   │   ├── pages/          # Core Views (Admin, Home, Login)
│   │   ├── contexts/       # Global State (Auth, UI)
│   │   └── services/       # API integration
```

---

## 🧠 Core AI Implementation

### **1. Recommendation Engine**
*   **File:** `backend/app/services/recommendation.py`
*   **Logic:** Implements the weighted scoring formula and the multi-agent penalty weight (0.5) for load balancing.

### **2. Data Simulation & Localized Generation**
*   **File:** `backend/app/services/data_simulator.py`
*   **Logic:** Generates real-time station states and implements the `generate_localized_stations` method which spawns hubs around the user's actual GPS coordinates.

### **3. Admin Intelligence**
*   **File:** `backend/app/main.py` (Route: `/api/v1/admin/insights`)
*   **Logic:** Aggregates station data to suggest traffic redistribution and identifies infrastructure growth corridors.

---

## 🎨 UI Architecture

### **1. Premium Dashboard**
*   **File:** `frontend/src/pages/AdminDashboard.jsx`
*   **Tech:** Uses Glassmorphism, Recharts for analytics, and a custom sidebar with logout logic.

### **2. User Journey**
*   **File:** `frontend/src/pages/HomePage.jsx`
*   **Tech:** Real-time station discovery with "Best Choice" AI labels and interactive floating AI explainers.

### **3. Smart Navigation**
*   **File:** `frontend/src/pages/NavigationPage.jsx`
*   **Tech:** Road-based routing using Leaflet and OSRM API with live traffic ETA simulation.

---

## 📡 API Integration
*   **File:** `frontend/src/services/api.js`
*   **Base URL:** Configurable via environment variables for easy production deployment.

---

*This codebase is designed for scalability and high-performance real-time updates.*
