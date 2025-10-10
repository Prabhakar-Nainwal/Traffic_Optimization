import React from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

const LiveFeed = ({ incomingVehicles }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
        <Activity className="mr-2" size={20} />
        Real-Time Vehicle Detections (ANPR)
      </h2>
      <div className="overflow-auto max-h-96">
        {incomingVehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity size={48} className="mx-auto mb-2 opacity-50" />
            <p>Waiting for vehicle detections...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">Number Plate</th>
                <th className="text-left p-3 font-semibold text-gray-700">Category</th>
                <th className="text-left p-3 font-semibold text-gray-700">Fuel</th>
                <th className="text-left p-3 font-semibold text-gray-700">Confidence</th>
                <th className="text-left p-3 font-semibold text-gray-700">Time</th>
                <th className="text-left p-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {incomingVehicles.map(vehicle => (
                <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono font-semibold">{vehicle.number_plate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      vehicle.vehicle_category === 'Commercial' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {vehicle.vehicle_category}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      vehicle.fuel_type === 'EV' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.fuel_type}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{vehicle.confidence}%</td>
                  <td className="p-3 text-gray-600 text-xs">{formatTime(vehicle.detected_time)}</td>
                  <td className="p-3">
                    {vehicle.decision === 'Ignore' ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600 flex items-center gap-1 w-fit">
                        🚫 Ignored
                      </span>
                    ) : vehicle.decision === 'Allow' ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                        <CheckCircle size={12} />
                        ✓ Allowed
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
                        <AlertCircle size={12} />
                        ⚠ Warned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;