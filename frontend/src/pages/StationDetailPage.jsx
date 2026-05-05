import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Navigation, PlugZap, Users, Timer, IndianRupee } from 'lucide-react'
import { useStationStore } from '../contexts/store'
import { apiService } from '../services/api'
import BottomNav from '../components/BottomNav'

const bannerImage =
  'https://images.unsplash.com/photo-1593941707882-a5bba53b3b85?auto=format&fit=crop&w=1200&q=80'

const StationDetailPage = () => {
  const navigate = useNavigate()
  const { stationId } = useParams()
  const { stations, selectedStation, setSelectedStation } = useStationStore()
  const [stationFromApi, setStationFromApi] = useState(null)

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const response = await apiService.getStation(stationId)
        setStationFromApi(response.data)
      } catch (_error) {
        setStationFromApi(null)
      }
    }

    if (!stations.find((s) => s.id === stationId) && selectedStation?.station_id !== stationId) {
      fetchStation()
    }
  }, [stationId, stations, selectedStation])

  const station = useMemo(() => {
    const fromStore = stations.find((s) => s.id === stationId)
    if (fromStore) return fromStore
    if (selectedStation && selectedStation.station_id === stationId) {
      return {
        id: selectedStation.station_id,
        name: selectedStation.name,
        latitude: selectedStation.latitude,
        longitude: selectedStation.longitude,
        available_slots: selectedStation.available_slots,
        vehicles_in_queue: Math.max(0, Math.round(selectedStation.wait_time / 5)),
        wait_time: selectedStation.wait_time,
        charging_type: selectedStation.charging_type,
        connector_type: selectedStation.connector_type,
        current_load_percent: selectedStation.score?.load ?? 60,
        total_slots: Math.max(selectedStation.available_slots + 4, 8),
        status: 'operational',
      }
    }
    return stationFromApi
  }, [stations, stationId, selectedStation, stationFromApi])

  useEffect(() => {
    if (station) setSelectedStation(station)
  }, [station, setSelectedStation])

  if (!station) {
    return (
      <div className="min-h-screen bg-[var(--dark-bg)] text-white p-6">
        <button onClick={() => navigate('/user')} className="btn-secondary mb-6">Back</button>
        <p className="text-gray-400">Station not found.</p>
      </div>
    )
  }

  const estimatedWait = station.wait_time ?? ((station.vehicles_in_queue || 0) * 30) / Math.max(station.available_slots || 1, 1)
  const pricePerUnit = station.charging_type === 'fast' ? 18 : 12

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] text-white pb-24">
      <div className="relative h-52 overflow-hidden">
        <img src={bannerImage} alt={station.name} className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--dark-bg)] via-[rgba(11,15,26,0.6)] to-transparent" />
        <button
          onClick={() => navigate('/user')}
          className="absolute top-4 left-4 glass-card px-3 py-2 text-sm flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold">{station.name}</h1>
          <p className="text-sm text-gray-300">Live station status and pricing</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="glass-card p-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400">Available Slots</p>
            <p className="text-xl font-bold text-[var(--accent-green)]">{station.available_slots}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Queue Length</p>
            <p className="text-xl font-bold">{station.vehicles_in_queue || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Estimated Wait</p>
            <p className="text-xl font-bold">{Math.max(0, estimatedWait).toFixed(0)} min</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Station Load</p>
            <p className="text-xl font-bold text-[var(--accent-orange)]">{(station.current_load_percent || 0).toFixed(0)}%</p>
          </div>
        </div>

        <div className="glass-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-300">Charging & Compatibility</h2>
          <div className="flex items-center gap-2 text-sm">
            <PlugZap size={16} className="text-[var(--primary)]" />
            <span>Type: {station.charging_type || 'fast'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users size={16} className="text-[var(--accent-green)]" />
            <span>Connector: {station.connector_type || 'CCS'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Timer size={16} className="text-[var(--accent-orange)]" />
            <span>Status: {station.status || 'operational'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee size={16} className="text-[var(--accent-green)]" />
            <span>Pricing: Rs. {pricePerUnit}/kWh</span>
          </div>
        </div>

        <button
          className="btn-primary w-full flex items-center justify-center gap-2"
          onClick={() => navigate(`/user/navigation/${station.id || station.station_id}`)}
        >
          <Navigation size={16} /> Navigate
        </button>
      </div>

      <BottomNav active="stations" />
    </div>
  )
}

export default StationDetailPage
