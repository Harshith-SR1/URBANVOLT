import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { apiService } from '../services/api'
import { useAnalyticsStore, useAuthStore } from '../contexts/store'

export const AlertsPanel = () => {
  const { alerts, setAlerts } = useAnalyticsStore()
  const { role } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = role === 'admin' ? await apiService.getAdminAlerts() : await apiService.getAlerts()
        setAlerts(response.data.alerts || [])
      } catch (error) {
        console.error('Error fetching alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5000)
    return () => clearInterval(interval)
  }, [setAlerts, role])

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'overload':
        return <AlertCircle size={18} className="text-red-500" />
      case 'offline':
        return <AlertTriangle size={18} className="text-yellow-500" />
      case 'queue_high':
        return <Info size={18} className="text-blue-500" />
      default:
        return <CheckCircle size={18} className="text-green-500" />
    }
  }

  const getAlertBgColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 border-red-500/50'
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50'
      case 'low':
        return 'bg-blue-500/20 border-blue-500/50'
      default:
        return 'bg-gray-500/20 border-gray-500/50'
    }
  }

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="card text-center py-6">
        <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
        <p className="text-gray-400">All stations operational</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`card border ${getAlertBgColor(alert.severity)} p-3`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getAlertIcon(alert.alert_type)}
            </div>
            <div className="flex-grow min-w-0">
              <p className="font-semibold text-sm">{alert.station_name}</p>
              <p className="text-xs text-gray-300 mt-1">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase
                ${alert.severity === 'high' ? 'bg-red-500/30 text-red-300' : ''}
                ${alert.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-300' : ''}
                ${alert.severity === 'low' ? 'bg-blue-500/30 text-blue-300' : ''}
              `}>
                {alert.severity}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AlertsPanel
