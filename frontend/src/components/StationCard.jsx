import React from 'react'
import { Navigation, Clock, Users, Zap } from 'lucide-react'

export const StationCard = ({ station, onNavigate, isSelected }) => {
  const getLoadColor = (load) => {
    if (load >= 80) return 'from-red-600 to-red-500'
    if (load >= 50) return 'from-yellow-600 to-yellow-500'
    return 'from-green-600 to-green-500'
  }

  const getLoadBgColor = (load) => {
    if (load >= 80) return 'bg-red-500/20 border-red-500/30'
    if (load >= 50) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-green-500/20 border-green-500/30'
  }

  const load = station.load || 45

  return (
    <div
      className={`
        h-full bg-black/40 backdrop-blur-sm border rounded-xl p-3 transition-all duration-300 flex flex-col
        ${isSelected 
          ? 'border-[var(--primary)] ring-2 ring-[var(--primary)] shadow-lg shadow-[var(--primary)]/20' 
          : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]'
        }
      `}
    >
      {/* AI Recommendation Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight uppercase ${
          station.label === 'Best Choice' 
            ? 'bg-blue-500 text-white animate-pulse' 
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          <Zap size={10} />
          {station.label || 'AI Recommended'}
        </div>
        {station.label === 'Best Choice' && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
      </div>

      {/* Header: Name + Distance */}
      <div className="mb-2">
        <h3 className="font-bold text-sm text-white truncate">{station.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{station.address || 'Charging Station'}</p>
          <span className="text-xs font-semibold text-[var(--primary)]">{station.distance?.toFixed(1) || '2.5'} km</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex gap-2 mb-2 text-xs">
        <div className="flex items-center gap-1 px-2 py-1 bg-[rgba(0,212,255,0.1)] rounded">
          <Clock size={12} className="text-cyan-400" />
          <span className="font-semibold">{station.eta || '12'} min</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-[rgba(0,221,119,0.1)] rounded">
          <Users size={12} className="text-green-400" />
          <span className="font-semibold">{station.wait || '3'} min</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-[rgba(255,170,0,0.1)] rounded">
          <Zap size={12} className="text-yellow-400" />
          <span className="font-semibold">{station.slots || '5'} slots</span>
        </div>
      </div>

      {/* Load Indicator */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Station Load</span>
          <span className="text-xs font-bold text-[var(--primary)]">{load}%</span>
        </div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${getLoadBgColor(load)} border border-current`}>
          <div
            className={`h-full bg-gradient-to-r ${getLoadColor(load)} transition-all duration-500 rounded-full`}
            style={{ width: `${load}%` }}
          />
        </div>
      </div>

      {/* Navigate Button */}
      <button
        onClick={() => onNavigate(station)}
        className={`
          w-full py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all
          ${isSelected
            ? 'bg-[var(--primary)] text-black hover:bg-[rgba(0,212,255,0.9)]'
            : 'bg-black/40 border border-[var(--primary)]/50 text-[var(--primary)] hover:bg-black/60'
          }
        `}
      >
        <Navigation size={14} />
        Navigate
      </button>
    </div>
  )
}

export default StationCard
