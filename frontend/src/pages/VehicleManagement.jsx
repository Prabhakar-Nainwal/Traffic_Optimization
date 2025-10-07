import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { vehicleAPI } from '../services/api';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFuel, setFilterFuel] = useState('all');
  const [filterDecision, setFilterDecision] = useState('all');

  useEffect(() => {
    // Fetch all vehicles from the API, passing current filters
    const fetchAllVehicles = async () => {
      try {
        setLoading(true);
        const params = {
          search: searchTerm,
          fuelType: filterFuel === 'all' ? '' : filterFuel,
          decision: filterDecision === 'all' ? '' : filterDecision,
        };
        const response = await vehicleAPI.getAll(params);
        if (response.success) {
          setVehicles(response.data);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllVehicles();
  }, [searchTerm, filterFuel, filterDecision]); // Re-fetch when any filter changes

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Vehicle Management</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Plate</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Enter number plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
            <select
              value={filterFuel}
              onChange={(e) => setFilterFuel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="EV">EV</option>
              <option value="CNG">CNG</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Decisions</option>
              <option value="Allow">Allow</option>
              <option value="Warn">Warn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Number Plate</th>
                <th className="text-left p-4 font-semibold text-gray-700">Fuel Type</th>
                <th className="text-left p-4 font-semibold text-gray-700">Entry Time</th>
                <th className="text-left p-4 font-semibold text-gray-700">Exit Time</th>
                <th className="text-left p-4 font-semibold text-gray-700">Decision</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-500">Loading vehicles...</td>
                </tr>
              ) : vehicles.length > 0 ? (
                vehicles.map(vehicle => (
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono font-semibold">{vehicle.numberPlate}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        vehicle.fuelType === 'EV' ? 'bg-green-100 text-green-800' :
                        vehicle.fuelType === 'Diesel' ? 'bg-red-100 text-red-800' :
                        vehicle.fuelType === 'CNG' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {vehicle.fuelType}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(vehicle.entryTime).toLocaleString()}</td>
                    <td className="p-4 text-gray-600">{vehicle.exitTime ? new Date(vehicle.exitTime).toLocaleString() : '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        vehicle.decision === 'Allow' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vehicle.decision}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-500">No vehicles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;