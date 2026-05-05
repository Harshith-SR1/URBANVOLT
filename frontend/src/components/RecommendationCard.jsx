import React from 'react'
import { MapPin, Clock, Zap, Users } from 'lucide-react'

export const RecommendationCard = ({ recommendation, onSelect, onNavigate, isBestChoice }) => {
  const getLoadColor = (load) => {
    if (load >= 80) return 'text-red-500'
    if (load >= 50) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getLoadBgColor = (load) => {
    if (load >= 80) return 'bg-red-500/20'
    if (load >= 50) return 'bg-yellow-500/20'
    return 'bg-green-500/20'
  }

  return (
    <div
      onClick={onSelect}
      className={`
        recommendation-plate cursor-pointer transition-all duration-300 hover:shadow-xl glass-card
        ${isBestChoice ? 'ring-2 ring-[var(--primary)]' : ''}
      `}
    >
      {/* Best Choice Badge */}
      {isBestChoice && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
            <span className="text-xs font-bold neon-badge uppercase tracking-wider">Best Choice</span>
          </div>
          <span className="text-2xl">⭐</span>
        </div>
      )}

      {/* Station Name & Rank */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-white">{recommendation.name}</h3>
          <p className="text-xs text-gray-400">#{recommendation.score.rank}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-[var(--primary)]">{recommendation.distance.toFixed(1)} km</div>
          <p className="text-xs text-gray-400">Distance</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* ETA */}
        <div className="bg-[rgba(255,255,255,0.02)] rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={14} className="text-cyan-400" />
            <span className="text-xs text-gray-400">ETA</span>
          </div>
          <p className="font-bold text-sm">{recommendation.eta_with_traffic.toFixed(0)}m</p>
        </div>

        {/* Wait Time */}
        <div className="bg-[rgba(255,255,255,0.02)] rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Users size={14} className="text-blue-400" />
            <span className="text-xs text-gray-400">Wait</span>
          </div>
          <p className="font-bold text-sm">{recommendation.wait_time.toFixed(0)}m</p>
        </div>

        {/* Available Slots */}
        <div className="bg-[rgba(255,255,255,0.02)] rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Zap size={14} className="text-yellow-400" />
            <span className="text-xs text-gray-400">Slots</span>
          </div>
          <p className="font-bold text-sm">{recommendation.available_slots}</p>
        </div>
      </div>

      {/* Station Load */}
        <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Station Load</span>
          <span className={`text-xs font-bold ${getLoadColor(recommendation.score.load)}`}>
            {recommendation.score.load.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getLoadBgColor(
              recommendation.score.load,
            )}`}
            style={{ width: `${recommendation.score.load}%` }}
          ></div>
        </div>
      </div>

      {/* Charging Type & Score */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs px-2 py-1 bg-[rgba(0,212,255,0.08)] text-[var(--primary)] rounded-full font-semibold">
            {recommendation.charging_type}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Score</p>
          <p className="font-bold text-cyan-400">{recommendation.score.score.toFixed(2)}</p>
        </div>
      </div>

      {/* Select Button */}
      <button
        className="btn-primary w-full mt-3 text-sm"
        onClick={(event) => {
          event.stopPropagation()
          if (onNavigate) onNavigate(recommendation)
        }}
      >
        Navigate
      </button>
    </div>
  )
}

export default RecommendationCard
