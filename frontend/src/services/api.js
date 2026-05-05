import axios from 'axios'

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

// Auto-fix: Ensure the URL ends with /api/v1
if (API_BASE_URL && !API_BASE_URL.includes('/api/v1')) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api/v1'
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('urbanvolt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // no-op
  }
  return config
})

export const apiService = {
  // Auth
  registerUser: (payload) => apiClient.post('/auth/user/register', payload),
  sendUserOtp: (payload) => apiClient.post('/auth/user/send-otp', payload),
  verifyUserOtp: (payload) => apiClient.post('/auth/user/verify-otp', payload),
  loginUserEmail: (payload) => apiClient.post('/auth/user/login-email', payload),
  loginAdmin: (payload) => apiClient.post('/auth/admin/login', payload),
  getAuthMe: () => apiClient.get('/auth/me'),

  // Stations
  getAllStations: () => apiClient.get('/stations'),
  getStation: (stationId) => apiClient.get(`/stations/${stationId}`),
  getStationStatus: (stationId) => apiClient.get(`/stations/${stationId}/status`),
  getNearbyStations: (lat, lng, radiusKm = 5) =>
    apiClient.get('/stations/nearby', { params: { lat, lng, radius_km: radiusKm } }),

  // Recommendations
  getRecommendations: (vehicleData) => apiClient.post('/recommendations', vehicleData),

  // Analytics
  getSystemAnalytics: () => apiClient.get('/analytics/system'),
  getStationsAnalytics: () => apiClient.get('/analytics/stations'),
  getPeakHours: () => apiClient.get('/analytics/peak-hours'),

  // Alerts
  getAlerts: () => apiClient.get('/alerts'),
  getAdminAlerts: () => apiClient.get('/admin/alerts'),

  // Admin
  getAdminDashboard: () => apiClient.get('/admin/dashboard'),

  // System
  getSystemStatus: () => apiClient.get('/system/status'),
}

export default apiClient
