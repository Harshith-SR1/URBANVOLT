import React, { useState, useEffect } from 'react'
import { MapPin, RefreshCw, Zap, ChevronDown, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StationMap from '../components/StationMap'
import StationCard from '../components/StationCard'
import BottomNav from '../components/BottomNav'
import { useStationStore, useUserStore } from '../contexts/store'
import { useAuthStore } from '../contexts/store'
import { apiService } from '../services/api'

export const HomePage = () => {
  const navigate = useNavigate()
  const { stations, setStations, selectedStation, setSelectedStation } = useStationStore()
  const { setRecommendations, userLocation, setUserLocation } = useUserStore()
  const { profile, activeVehicleType, setActiveVehicleType, logout } = useAuthStore()
  const [selectedVehicle, setSelectedVehicle] = useState(activeVehicleType || null)
  const [recommendations, setLocalRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [panelExpanded, setPanelExpanded] = useState(false)

  // Fetch stations on load
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await apiService.getAllStations()
        setStations(response.data.stations)
      } catch (error) {
        console.error('Error fetching stations:', error)
      }
    }

    fetchStations()
    const interval = setInterval(fetchStations, 5000)
    return () => clearInterval(interval)
  }, [setStations])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      )
    }
  }, [setUserLocation])

  const handleGetRecommendations = async () => {
    const vehicleCatalog = {
      '2W': { type: '2W', charging: 'slow', connector: 'Type1' },
      '3W': { type: '3W', charging: 'slow', connector: 'Type2' },
      '4W': { type: '4W', charging: 'fast', connector: 'CCS' },
      Commercial: { type: 'Commercial', charging: 'fast', connector: 'CHAdeMO' },
    }

    const activeVehicle = activeVehicleType ? vehicleCatalog[activeVehicleType] : selectedVehicle

    if (!activeVehicle) {
      alert('Please select a vehicle')
      return
    }

    setLoading(true)
    try {
      const vehicleData = {
        user_id: profile?.id || 'user_' + Date.now(),
        vehicle_type: activeVehicle.type,
        charging_type: activeVehicle.charging,
        connector_type: activeVehicle.connector,
        current_lat: userLocation.lat,
        current_lng: userLocation.lng,
        battery_percentage: 30,
      }

      const response = await apiService.getRecommendations(vehicleData)
      setLocalRecommendations(response.data.recommendations)
      setRecommendations(response.data.recommendations)+      setPanelExpanded(true)    } catch (error) {
      console.error('Error getting recommendations:', error)
      alert('Failed to get recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--dark-bg)]">
      {/* Header with Logout Button */}
      <div className="relative h-12 bg-[var(--dark-bg)] border-b border-[rgba(255,255,255,0.05)] flex items-center px-4">
        <h1 className="text-lg font-bold text-white">EV Charging Finder</h1>
        <button
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="absolute top-3 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50 hover:bg-gray-700 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Map Section - Takes remaining space minus panel */}
      <div className="flex-1 relative overflow-hidden">
        <StationMap
          onStationSelect={setSelectedStation}
          selectedStation={recommendations.length > 0 ? recommendations[0] : null}
          showRoute={recommendations.length > 0}
        />
      </div>

      {/* Bottom Sheet Panel */}
      <div
        className={`bg-[var(--dark-bg)] border-t border-[rgba(255,255,255,0.05)] rounded-t-2xl transition-all duration-300 ease-out shadow-2xl z-40 overflow-hidden`}
        style={{
          height: panelExpanded ? 'calc(75vh)' : '140px',
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3 cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
          onClick={() => setPanelExpanded(!panelExpanded)}
        >
          <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
        </div>

        {/* Collapsed View - Always Visible */}
        <div className="px-4 pb-3 space-y-3">
          {/* Vehicle Selector */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">SELECT VEHICLE</p>
            <div className="flex gap-2 flex-wrap">
              {['2W', '3W', '4W', 'Commercial'].map((vType) => (
                <button
                  key={vType}
                  onClick={() => setActiveVehicleType(vType)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeVehicleType === vType
                      ? 'bg-[var(--primary)] text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {vType}
                </button>
              ))}
            </div>
          </div>

          {/* Find Stations Button */}
          <button
            onClick={handleGetRecommendations}
            disabled={!activeVehicleType || loading}
            className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all bg-[var(--primary)] text-black hover:bg-[rgba(0,212,255,0.9)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Finding...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>Find Stations</span>
              </>
            )}
          </button>
        </div>

        {/* Expanded Content */}
        {panelExpanded && (
          <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: 'calc(75vh - 140px)' }}>
            {/* Recommendations Grid */}
            {recommendations.length > 0 ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">Top 3 Nearby</h3>
                  <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-1 rounded-full">
                    {recommendations.length} stations
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {recommendations.slice(0, 3).map((rec, idx) => (
                    <StationCard
                      key={rec.station_id}
                      station={{
                        id: rec.station_id,
                        name: rec.name || `Charging Station ${idx + 1}`,
                        address: rec.address || 'Nearby Location',
                        distance: rec.distance || 0,
                        eta: Math.round(rec.eta_with_traffic || 15),
                        wait: Math.round(rec.wait_time || 5),
                        slots: rec.available_slots || 3,
                        load: rec.current_load || 45,
                      }}
                      isSelected={selectedStation?.station_id === rec.station_id}
                      onNavigate={(station) => {
                        setSelectedStation(rec)
                        navigate(`/user/navigation/${rec.station_id}`)
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MapPin size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No stations found</p>
                <p className="text-xs mt-1">Tap "Find Stations" to discover nearby chargers</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating AI Logic Info - For Hackathon Demo */}
      <div className="fixed bottom-24 right-4 z-[60]">
        <div className="group relative">
          <button className="bg-blue-500 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all border-2 border-white/20">
            <Zap size={20} className="fill-white" />
          </button>
          <div className="absolute bottom-full right-0 mb-4 w-72 bg-black/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all">
            <h4 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
              <Zap size={14} /> AI Recommendation Engine
            </h4>
            <div className="space-y-2 text-[10px] text-gray-300 leading-relaxed">
              <p>• <b>Smart Selection:</b> Top-3 stations optimized for distance, wait time, and traffic.</p>
              <p>• <b>Crowd Balancing:</b> Multi-agent logic prevents everyone from going to the same hub.</p>
              <p>• <b>Adaptive:</b> Real-time updates based on incoming vehicles & completion rates.</p>
              <p className="pt-2 text-blue-300 font-medium">Scoring: 0.4(Dist) + 0.3(Wait) + 0.2(Load) + 0.1(Traffic)</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default HomePage
