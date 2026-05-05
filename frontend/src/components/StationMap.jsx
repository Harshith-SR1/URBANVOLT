import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { useStationStore, useUserStore } from '../contexts/store'

// Custom marker icons
const createMarker = (color) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

const userMarker = L.divIcon({
  html: `
    <div style="position:relative; width: 48px; height: 48px; display:flex; align-items:center; justify-content:center;">
      <div style=\"position:absolute; width:120px; height:120px; left:50%; top:50%; transform:translate(-50%,-50%); border-radius:9999px; background: radial-gradient(circle, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.04) 40%, transparent 60%); animation: radar 2.5s ease-out infinite;\"></div>
      <div style=\"width: 40px; height: 40px; background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%); border-radius: 50%; border: 3px solid rgba(255,255,255,0.9); display:flex; align-items:center; justify-content:center; box-shadow: 0 0 20px rgba(0, 212, 255, 0.9);\">
        <div style=\"width: 14px; height: 14px; background: radial-gradient(circle at 30% 30%, #ffffff 0%, rgba(0,212,255,0.9) 40%); border-radius:50%; box-shadow: 0 0 12px rgba(0,212,255,0.8); animation: pulsing 2s infinite;\"></div>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

export const StationMap = ({ onStationSelect, selectedStation, showRoute }) => {
  const { stations } = useStationStore()
  const { userLocation } = useUserStore()
  const [mapCenter, setMapCenter] = useState([userLocation.lat, userLocation.lng])

  useEffect(() => {
    setMapCenter([userLocation.lat, userLocation.lng])
  }, [userLocation])

  const getMarkerColor = (station) => {
    if (station.status === 'maintenance') return '#999999'
    if (station.current_load_percent >= 80) return '#ff3366'
    if (station.current_load_percent >= 50) return '#ffaa00'
    return '#00dd77'
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
          maxZoom={19}
        />

        {/* User Location */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userMarker}>
          <Popup>Your Location</Popup>
        </Marker>

        {/* Charging Stations */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={createMarker(getMarkerColor(station))}
            eventHandlers={{
              click: () => onStationSelect(station),
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{station.name}</div>
                <div>Available: {station.available_slots}/{station.total_slots}</div>
                <div>Queue: {station.vehicles_in_queue}</div>
                <div>Status: {station.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Line */}
        {showRoute && selectedStation && (
          <Polyline
            positions={[
              [userLocation.lat, userLocation.lng],
              [selectedStation.latitude, selectedStation.longitude],
            ]}
            color="#00d4ff"
            weight={3}
            opacity={0.7}
            dashArray="5, 5"
          />
        )}
      </MapContainer>
    </div>
  )
}

export default StationMap
