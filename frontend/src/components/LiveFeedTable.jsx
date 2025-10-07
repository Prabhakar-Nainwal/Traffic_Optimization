import React from 'react';
import { Activity } from 'lucide-react';

const LiveFeedTable = ({ vehicles }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
        <Activity className="mr-2" size={20} />
        Live Vehicle Feed
      </h2>
      <div className="overflow-auto max-h-80">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-2 font-semibold text-gray-700">Plate</th>
              <th className="text-left p-2 font-semibold text-gray-700">Fuel</th>
              <th className="text-left p-2 font-semibold text-gray-700">Time</th>
              <th className="text-left p-2 font-semibold text-gray-700">Decision</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.slice(0, 5).map(vehicle => (
              <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-mono">{vehicle.plate}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    vehicle.fuel === 'EV' ? 'bg-green-100 text-green-800' :
                    vehicle.fuel === 'Diesel' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {vehicle.fuel}
                  </span>
                </td>
                <td className="p-2 text-gray-600">{vehicle.entryTime}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    vehicle.decision === 'Allow' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vehicle.decision}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveFeedTable;