import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { vehicleAPI } from '../services/api';

const LogsReports = () => {
  const [vehicles, setVehicles] = useState([
    { id: 1, plate: 'UP16-AB-1234', fuel: 'Petrol', entryTime: '10:30 AM', exitTime: '-', decision: 'Allow' },
    { id: 2, plate: 'DL08-CD-5678', fuel: 'Diesel', entryTime: '10:35 AM', exitTime: '-', decision: 'Warn' },
    { id: 3, plate: 'MH12-EF-9012', fuel: 'EV', entryTime: '10:40 AM', exitTime: '-', decision: 'Allow' },
    { id: 4, plate: 'KA03-GH-3456', fuel: 'Petrol', entryTime: '10:45 AM', exitTime: '11:30 AM', decision: 'Allow' }
  ]);

  const trendData = [
    { day: 'Mon', count: 120, pollution: 55 },
    { day: 'Tue', count: 145, pollution: 62 },
    { day: 'Wed', count: 132, pollution: 58 },
    { day: 'Thu', count: 158, pollution: 68 },
    { day: 'Fri', count: 170, pollution: 72 },
    { day: 'Sat', count: 95, pollution: 45 },
    { day: 'Sun', count: 85, pollution: 40 }
  ];

  const handleExportCSV = () => {
    console.log('Exporting to CSV...');
    // Implementation for CSV export
  };

  const handleExportPDF = () => {
    console.log('Exporting to PDF...');
    // Implementation for PDF export
  };

  useEffect(() => {
    // Fetch analytics data
    // fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Logs & Reports</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={18} className="mr-2" />
            Export CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Download size={18} className="mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Daily Vehicle Count</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Pollution Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pollution" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Logs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Historical Vehicle Logs</h2>
        </div>
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
              {vehicles.map(vehicle => (
                <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono">{vehicle.plate}</td>
                  <td className="p-4">{vehicle.fuel}</td>
                  <td className="p-4 text-gray-600">{vehicle.entryTime}</td>
                  <td className="p-4 text-gray-600">{vehicle.exitTime}</td>
                  <td className="p-4">{vehicle.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogsReports;