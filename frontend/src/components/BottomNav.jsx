import React from 'react'
import { Home, MapPin, Clock, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BottomNav = ({ active = 'home' }) => {
  const navigate = useNavigate()
  const items = [
    { key: 'home', label: 'Home', icon: Home, path: '/user' },
    { key: 'stations', label: 'Stations', icon: MapPin, path: '/user/radar' },
    { key: 'history', label: 'History', icon: Clock, path: '/user' },
    { key: 'profile', label: 'Profile', icon: User, path: '/user' },
  ]

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[92%] max-w-lg glass-card p-2 flex items-center justify-between">
      {items.map((it) => {
        const Icon = it.icon
        const activeClass = it.key === active ? 'text-[var(--primary)]' : 'text-gray-400'
        return (
          <button
            key={it.key}
            className={`flex flex-col items-center gap-1 flex-1 ${activeClass}`}
            onClick={() => navigate(it.path)}
          >
            <Icon size={18} />
            <span className="text-xs">{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default BottomNav
