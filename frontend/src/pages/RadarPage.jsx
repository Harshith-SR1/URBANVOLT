import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Radar, Radio, Zap } from 'lucide-react'
import { useStationStore, useUserStore } from '../contexts/store'
import { wsService } from '../services/websocket'
import BottomNav from '../components/BottomNav'

const RadarPage = () => {
  const navigate = useNavigate()
  const { stations } = useStationStore()
  const { userLocation } = useUserStore()
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((prev) => (prev + 1) % 4)
    }, 900)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    wsService.connect().catch(() => {})
    return () => wsService.disconnect()
  }, [])

  const nearby = useMemo(() => {
    return stations
      .map((s) => {
        const dLat = s.latitude - userLocation.lat
        const dLng = s.longitude - userLocation.lng
        const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111
        return { ...s, distanceKm }
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6)
  }, [stations, userLocation])

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] text-white p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/user')} className="glass-card px-3 py-2 text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Radar size={18} className="text-[var(--primary)]" /> Live Radar
        </h1>
      </div>

      <div className="glass-card p-4 mb-4">
        <div className="relative h-64 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.12),rgba(11,15,26,0.95))]">
          {[0, 1, 2, 3].map((ring) => (
            <div
              key={ring}
              className={`absolute rounded-full border border-[rgba(0,212,255,0.25)] ${pulse === ring ? 'opacity-100' : 'opacity-40'}`}
              style={{
                width: `${50 + ring * 55}px`,
                height: `${50 + ring * 55}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'opacity 300ms ease',
              }}
            />
          ))}

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="pulsing-dot" />
          </div>

          {nearby.map((station, idx) => {
            const angle = (idx / Math.max(nearby.length, 1)) * Math.PI * 2
            const radius = 40 + idx * 18
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            const statusColor =
              station.current_load_percent >= 80 ? 'var(--accent-red)' : station.current_load_percent >= 50 ? 'var(--accent-orange)' : 'var(--accent-green)'

            return (
              <div
                key={station.id}
                className="absolute rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: statusColor,
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  boxShadow: `0 0 12px ${statusColor}`,
                }}
              />
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Radio size={14} className="text-[var(--primary)]" /> Nearby Stations
        </h2>
        {nearby.map((station) => (
          <button
            key={station.id}
            className="glass-card p-3 w-full text-left"
            onClick={() => navigate(`/user/station/${station.id}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{station.name}</p>
                <p className="text-xs text-gray-400">{station.distanceKm.toFixed(2)} km away</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Load</p>
                <p className="font-bold text-[var(--accent-orange)]">{station.current_load_percent.toFixed(0)}%</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
              <Zap size={12} className="text-[var(--accent-green)]" />
              {station.available_slots}/{station.total_slots} slots available
            </div>
          </button>
        ))}
      </div>

      <BottomNav active="stations" />
    </div>
  )
}

export default RadarPage
