import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ParkingCard = ({ zone }) => {
  const getOccupancyColor = (percentage, threshold) => {
    if (percentage < 70) return {
      bg: 'bg-green-500',
      text: 'text-green-600',
      light: 'bg-green-50',
      border: 'border-green-200'
    };
    if (percentage < threshold) return {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      light: 'bg-yellow-50',
      border: 'border-yellow-200'
    };
    return {
      bg: 'bg-red-500',
      text: 'text-red-600',
      light: 'bg-red-50',
      border: 'border-red-200'
    };
  };

  const percentage = zone.occupancyPercentage || 0;
  const threshold = zone.thresholdPercentage || 90;
  const available = zone.availableSlots || 0;
  const isFull = percentage >= threshold;
  
  const colors = getOccupancyColor(percentage, threshold);

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-md border-2 ${colors.border} hover:shadow-lg transition-shadow duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{zone.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{zone.location}</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${colors.text}`}>{percentage}%</div>
          <div className="text-xs text-gray-500">occupancy</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">Current Status</span>
          <span className="font-bold text-gray-700">{zone.occupiedSlots}/{zone.totalSlots}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 ${colors.bg} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Total Slots</div>
          <div className="text-lg font-bold text-gray-800">{zone.totalSlots}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Occupied</div>
          <div className="text-lg font-bold text-gray-800">{zone.occupiedSlots}</div>
        </div>
        <div className={`p-3 rounded-lg ${available > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-xs text-gray-500 mb-1">Available</div>
          <div className={`text-lg font-bold ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {available > 0 ? available : 'FULL'}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Threshold</div>
          <div className="text-lg font-bold text-orange-600">{threshold}%</div>
        </div>
      </div>

      {/* Warning Badge */}
      {isFull && (
        <div className="flex items-center justify-center gap-2 p-2 bg-red-100 text-red-800 rounded-lg text-sm font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>Near Capacity - Warning Active</span>
        </div>
      )}
    </div>
  );
};

export default ParkingCard;