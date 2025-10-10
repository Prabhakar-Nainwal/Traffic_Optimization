import React from 'react';

const ParkingCard = ({ zone }) => {
  const getOccupancyColor = (percentage, threshold) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < threshold) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const percentage = zone.occupancyPercentage;
  const threshold = zone.thresholdPercentage;

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-md border-l-4"
      style={{ borderLeftColor: percentage < 70 ? '#10b981' : percentage < threshold ? '#f59e0b' : '#ef4444' }}
    >
      <div className='flex items-center gap-3'>
        <h3 className="text-lg font-bold text-gray-800">{zone.name}</h3>
        <p className="text-sm font-medium text-gray-500">{zone.location}</p>
        </div>

      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Slots:</span>
          <span className="font-semibold">{zone.totalSlots}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Occupied:</span>
          <span className="font-semibold">{zone.occupiedSlots}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Available:</span>
          <span className="font-semibold text-green-600">{zone.availableSlots}</span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Occupancy</span>
            <span className="font-bold">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getOccupancyColor(percentage, threshold)}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingCard;