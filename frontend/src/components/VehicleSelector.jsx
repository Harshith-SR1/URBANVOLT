import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'

export const VehicleSelector = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  const vehicles = [
    { id: 1, name: '2-Wheeler', type: '2W', charging: 'slow', connector: 'Type1' },
    { id: 2, name: '3-Wheeler', type: '3W', charging: 'slow', connector: 'Type2' },
    { id: 3, name: '4-Wheeler', type: '4W', charging: 'fast', connector: 'CCS' },
    { id: 4, name: 'Commercial', type: 'Commercial', charging: 'fast', connector: 'CHAdeMO' },
  ]

  const handleSelect = (vehicle) => {
    setSelectedVehicle(vehicle)
    onSelect(vehicle)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary w-full flex items-center justify-between"
      >
        <span>{selectedVehicle ? selectedVehicle.name : 'Select Vehicle'}</span>
        <Plus size={18} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => handleSelect(vehicle)}
              className="w-full text-left px-4 py-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <div className="font-semibold text-white">{vehicle.name}</div>
              <div className="text-xs text-gray-400">
                {vehicle.charging} · {vehicle.connector}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default VehicleSelector
