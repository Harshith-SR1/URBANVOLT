import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock3, Navigation, Zap, MapPin, AlertCircle } from 'lucide-react'
import { MapContainer, Marker, Polyline, TileLayer, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useStationStore, useUserStore } from '../contexts/store'

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#00d4ff;border:3px solid #fff;box-shadow:0 0 12px rgba(0,212,255,.8)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const stationIcon = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#00dd77;border:3px solid #fff;box-shadow:0 0 12px rgba(0,221,119,.8)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const NavigationPage = () => {
  const navigate = useNavigate()
  const { stationId } = useParams()
  const { stations, selectedStation } = useStationStore()
  const { userLocation } = useUserStore()

  const [routeData, setRouteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const station = useMemo(() => {
    return (
      stations.find((s) => s.id === stationId) ||
      (selectedStation && (selectedStation.id === stationId || selectedStation.station_id === stationId)
        ? selectedStation
        : null)
    )
  }, [stations, selectedStation, stationId])

  // Fetch route from OSRM API
  useEffect(() => {
    const fetchRoute = async () => {
      if (!station) {
        setLoading(false)
        return
      }

      try {
        const startLng = userLocation.lng
        const startLat = userLocation.lat
        const endLng = station.longitude
        const endLat = station.latitude

        // OSRM API call
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
        )

        if (!response.ok) throw new Error('Failed to fetch route')
        const data = await response.json()

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0]
          // Convert GeoJSON coordinates to Leaflet format
          const routeCoords = route.geometry.coordinates.map((coord) => [coord[1], coord[0]])
          setRouteData({
            coordinates: routeCoords,
            distance: route.distance / 1000, // Convert to km
            duration: Math.ceil(route.duration / 60), // Convert to minutes
          })
        }
      } catch (err) {
        console.error('Route fetch error:', err)
        setError('Could not load route. Using straight line.')
        // Fallback to straight line
        setRouteData({
          coordinates: [
            [userLocation.lat, userLocation.lng],
            [station.latitude, station.longitude],
          ],
          distance: Math.sqrt(
            Math.pow(station.latitude - userLocation.lat, 2) +
              Math.pow(station.longitude - userLocation.lng, 2)
          ) * 111,
          duration: 10,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoute()
  }, [station, userLocation])

  const origin = [userLocation.lat, userLocation.lng]
  const destination = [station?.latitude ?? userLocation.lat + 0.01, station?.longitude ?? userLocation.lng + 0.01]
  const routeCoordinates = routeData?.coordinates || [origin, destination]
  const distanceKm = routeData?.distance || 0
  const etaMin = routeData?.duration || 10
  const waitMin = Math.max(0, Math.round((station?.vehicles_in_queue || 0) * 6))

  return (
    <div className="h-screen bg-[var(--dark-bg)] text-white relative">
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--primary)] border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-gray-300">Loading route...</p>
          </div>
        </div>
      )}

      <MapContainer center={origin} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Route Line - Road-based from OSRM */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <>
            <Polyline
              positions={routeCoordinates}
              color="#ff9500"
              weight={12}
              opacity={0.2}
              className="route-shadow"
            />
            <Polyline
              positions={routeCoordinates}
              color="#00d4ff"
              weight={4}
              opacity={0.9}
              dashArray="8 8"
              className="route-main"
            />
          </>
        )}

        {/* Markers */}
        <Marker position={origin} icon={userIcon}>
          <Popup>Your Location</Popup>
        </Marker>
        <Marker position={destination} icon={stationIcon}>
          <Popup>{station?.name || 'Charging Station'}</Popup>
        </Marker>
      </MapContainer>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <button
          onClick={() => navigate('/user')}
          className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-black/80 transition-all border border-[rgba(255,255,255,0.1)]"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Bottom Info Card */}
      <div className="absolute bottom-6 left-4 right-4 bg-black/70 backdrop-blur-sm border border-[rgba(255,255,255,0.1)] rounded-xl p-4 shadow-2xl">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Navigating to</p>
        <h2 className="text-lg font-bold mb-4">{station?.name || 'Recommended Station'}</h2>

        {error && (
          <div className="mb-3 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg flex gap-2 text-xs text-yellow-200">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] rounded-lg p-3 text-center">
            <Clock3 className="mx-auto mb-1 text-[var(--primary)]" size={18} />
            <p className="text-xs text-gray-400 mb-1">ETA</p>
            <p className="font-bold text-lg">{etaMin} min</p>
          </div>
          <div className="bg-[rgba(0,221,119,0.1)] border border-[rgba(0,221,119,0.2)] rounded-lg p-3 text-center">
            <Navigation className="mx-auto mb-1 text-green-400" size={18} />
            <p className="text-xs text-gray-400 mb-1">Distance</p>
            <p className="font-bold text-lg">{distanceKm.toFixed(1)} km</p>
          </div>
          <div className="bg-[rgba(255,170,0,0.1)] border border-[rgba(255,170,0,0.2)] rounded-lg p-3 text-center">
            <Zap className="mx-auto mb-1 text-yellow-400" size={18} />
            <p className="text-xs text-gray-400 mb-1">Wait</p>
            <p className="font-bold text-lg">{waitMin} min</p>
          </div>
        </div>

        <button
          className="w-full mt-4 py-3 bg-[var(--primary)] text-black font-semibold rounded-lg hover:bg-[rgba(0,212,255,0.9)] transition-all"
          onClick={() => window.open(`https://maps.google.com/?saddr=${userLocation.lat},${userLocation.lng}&daddr=${station?.latitude},${station?.longitude}`)}
        >
          📍 Open in Google Maps
        </button>
      </div>
    </div>
  )
}

export default NavigationPage
