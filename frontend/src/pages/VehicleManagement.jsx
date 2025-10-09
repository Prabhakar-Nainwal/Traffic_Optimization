import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { vehicleAPI } from '../services/api';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFuel, setFilterFuel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (filterFuel !== 'all') filters.fuelType = filterFuel;
      if (filterCategory !== 'all') filters.vehicleCategory = filterCategory;
      if (searchTerm) filters.search = searchTerm;
      
      const response = await vehicleAPI.getAll(filters);
      if (response.success) {
        setVehicles(response.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExitVehicle = async (id) => {
    try {
      await vehicleAPI.updateExit(id);
      await fetchVehicles();
    } catch (error) {
      console.error('Error updating exit:', error);
      alert('Failed to record exit');
    }
  };

  const exportToCSV = () => {
    const headers = ['Number Plate', 'Category', 'Fuel Type', 'Confidence', 'Entry Time', 'Exit Time', 'Zone'];
    const rows = vehicles.map(v => [
      v.number_plate,
      v.vehicle_category,
      v.fuel_type,
      v.confidence,
      new Date(v.entry_time).toLocaleString(),
      v.exit_time ? new Date(v.exit_time).toLocaleString() : 'Still Inside',
      v.zone_name || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    fetchVehicles();
  }, [filterFuel, filterCategory]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVehicles();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Vehicle Management</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download size={18} className="mr-2" />
          Export CSV
        </button>
      </div>
      
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
              <option value="EV">EV (Electric)</option>
              <option value="ICE">ICE (Combustion)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Private">Private</option>
              <option value="Commercial">Commercial</option>
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
                <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                <th className="text-left p-4 font-semibold text-gray-700">Fuel Type</th>
                <th className="text-left p-4 font-semibold text-gray-700">Confidence</th>
                <th className="text-left p-4 font-semibold text-gray-700">Entry Time</th>
                <th className="text-left p-4 font-semibold text-gray-700">Exit Time</th>
                <th className="text-left p-4 font-semibold text-gray-700">Zone</th>
                <th className="text-left p-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map(vehicle => (
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono font-semibold">{vehicle.number_plate}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        vehicle.vehicle_category === 'Commercial' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {vehicle.vehicle_category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        vehicle.fuel_type === 'EV' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.fuel_type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{vehicle.confidence}%</td>
                    <td className="p-4 text-gray-600">{formatTime(vehicle.entry_time)}</td>
                    <td className="p-4 text-gray-600">
                      {vehicle.exit_time ? formatTime(vehicle.exit_time) : (
                        <span className="text-green-600 font-semibold">Still Inside</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{vehicle.zone_name || 'N/A'}</td>
                    <td className="p-4">
                      {!vehicle.exit_time && (
                        <button
                          onClick={() => handleExitVehicle(vehicle.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                        >
                          Record Exit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;