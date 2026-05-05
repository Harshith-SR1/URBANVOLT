/**
 * Utility functions for URBANVOLT
 */

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRad = (deg) => (deg * Math.PI) / 180

export const getLoadColor = (load) => {
  if (load >= 80) return '#ff3366'
  if (load >= 50) return '#ffaa00'
  return '#00dd77'
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'operational':
      return '#00dd77'
    case 'maintenance':
      return '#ffaa00'
    case 'offline':
      return '#ff3366'
    case 'overload':
      return '#ff3366'
    default:
      return '#999999'
  }
}

export const formatTime = (minutes) => {
  if (minutes < 1) return '< 1 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}h ${mins}m`
}

export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export const formatEnergy = (kWh) => {
  if (kWh < 1000) return `${Math.round(kWh)} kWh`
  return `${(kWh / 1000).toFixed(1)} MWh`
}

export const getVehicleIcon = (vehicleType) => {
  const icons = {
    '2W': '🏍️',
    '3W': '🛺',
    '4W': '🚗',
    'Commercial': '🚚',
  }
  return icons[vehicleType] || '🚗'
}

export const getChargingTypeIcon = (type) => {
  const icons = {
    'fast': '⚡⚡',
    'slow': '⚡',
    'swapping': '🔄',
  }
  return icons[type] || '⚡'
}

export const formatTimestamp = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const calculateETA = (distanceKm, trafficFactor = 1.0) => {
  const avgSpeed = 30 // km/h in urban areas
  const baseTime = (distanceKm / avgSpeed) * 60 // minutes
  return Math.round(baseTime * trafficFactor)
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
