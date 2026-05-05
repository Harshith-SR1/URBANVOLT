import { create } from 'zustand'

const tokenFromStorage = () => {
  try {
    return localStorage.getItem('urbanvolt_token') || ''
  } catch {
    return ''
  }
}

const roleFromStorage = () => {
  try {
    return localStorage.getItem('urbanvolt_role') || ''
  } catch {
    return ''
  }
}

const profileFromStorage = () => {
  try {
    const raw = localStorage.getItem('urbanvolt_profile')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useStationStore = create((set) => ({
  stations: [],
  selectedStation: null,
  loading: false,
  error: null,

  setStations: (stations) => set({ stations }),
  setSelectedStation: (station) => set({ selectedStation: station }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  updateStationStatus: (stationId, updates) => set((state) => ({
    stations: state.stations.map(station =>
      station.id === stationId ? { ...station, ...updates } : station
    ),
  })),
}))

export const useUserStore = create((set) => ({
  user: null,
  vehicle: null,
  recommendations: [],
  userLocation: { lat: 13.0827, lng: 80.2707 },
  
  setUser: (user) => set({ user }),
  setVehicle: (vehicle) => set({ vehicle }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setUserLocation: (location) => set({ userLocation: location }),
}))

export const useUIStore = create((set) => ({
  theme: 'dark',
  sidebarOpen: false,
  mapFullScreen: false,
  activeTab: 'home',
  
  setTheme: (theme) => set({ theme }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMapFullScreen: (fullScreen) => set({ mapFullScreen: fullScreen }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}))

export const useAnalyticsStore = create((set) => ({
  systemAnalytics: null,
  stationsAnalytics: [],
  alerts: [],
  
  setSystemAnalytics: (analytics) => set({ systemAnalytics: analytics }),
  setStationsAnalytics: (analytics) => set({ stationsAnalytics: analytics }),
  setAlerts: (alerts) => set({ alerts }),
}))

export const useAuthStore = create((set) => ({
  token: tokenFromStorage(),
  role: roleFromStorage(),
  profile: profileFromStorage(),
  activeVehicleType: null,

  setAuth: ({ token, role, profile }) => {
    try {
      // Defensive: ensure values are strings or JSON-serializable
      localStorage.setItem('urbanvolt_token', token || '')
      localStorage.setItem('urbanvolt_role', role || '')
      localStorage.setItem('urbanvolt_profile', JSON.stringify(profile || {}))
    } catch {
      // no-op
    }

    const vehicleTypes = (profile && Array.isArray(profile.vehicle_types)) ? profile.vehicle_types : []
    set({
      token: token || '',
      role: role || '',
      profile: profile || null,
      activeVehicleType: vehicleTypes.length ? vehicleTypes[0] : null,
    })
  },

  setActiveVehicleType: (vehicleType) => set({ activeVehicleType: vehicleType }),

  logout: () => {
    try {
      localStorage.removeItem('urbanvolt_token')
      localStorage.removeItem('urbanvolt_role')
      localStorage.removeItem('urbanvolt_profile')
    } catch {
      // no-op
    }
    set({ token: '', role: '', profile: null, activeVehicleType: null })
  },
}))
