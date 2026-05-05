# ⚡ URBANVOLT - Premium EV Charging Network

URBANVOLT is an AI-driven, high-end EV charging management platform designed for the modern electric ecosystem. This document provides everything you need to run, test, and deploy the system.

---

## 🔑 Demo Login Credentials

### **1. Admin Access**
*   **Email:** `admin@urbanvolt.ai`
*   **Password:** `Admin@123`
*   **Role:** Full access to analytics, load redistribution, and infrastructure planning.

### **2. User Access**
*   **Phone Number:** Any 10-digit number (e.g., `9876543210`)
*   **OTP:** `123456` (Debug Bypass Enabled)
*   **Role:** Find stations, view road-based navigation, and manage charging.

---

## 🛠️ Technical Requirements

### **Backend**
*   Python 3.10+
*   FastAPI (Web Framework)
*   SQLite (Database)
*   Passlib (Password Hashing)

### **Frontend**
*   Node.js 18+
*   React 18 + Vite
*   Tailwind CSS (Styling)
*   Lucide React (Icons)
*   Leaflet & OSRM (Mapping & Routing)

---

## 🚀 Local Setup Instructions

### **1. Backend Setup**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### **2. Frontend Setup**
```powershell
cd frontend
npm install
npm run dev
```
*Access the app at: [http://localhost:5173](http://localhost:5173)*

---

## 🧠 AI Features Implemented

### **User Side**
*   **Smart Scoring:** `(0.4 × Dist) + (0.3 × Wait) + (0.2 × Load) + (0.1 × Traffic)`.
*   **Crowd Balancing:** Multi-agent logic prevents hub congestion.
*   **Localized Fallback:** Auto-generates stations within 3-5km of user's actual GPS location.

### **Admin Side**
*   **Load Analysis:** Detects overloaded (>80%) and underutilized (<30%) hubs.
*   **Redistribution:** AI suggests traffic redirection to balance the grid.
*   **Infrastructure Planning:** Predicts expansion zones based on EV growth corridors.

---

## 🌐 Deployment Guide

### **Frontend (Vercel)**
1.  Import repo to Vercel.
2.  Root Directory: `frontend`.
3.  Add Env Var: `VITE_API_URL` = [Your Backend URL].

### **Backend (Render)**
1.  New Web Service > Docker.
2.  Root Directory: `backend`.
3.  Add Disk: 1GB at `/app/data` (for `urbanvolt.db`).

---

*Built with ❤️ for the URBANVOLT Hackathon Demo.*
