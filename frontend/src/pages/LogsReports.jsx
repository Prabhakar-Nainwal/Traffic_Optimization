import React, { useState, useEffect } from 'react';
import { Download, Loader } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { vehicleAPI } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LogsReports = () => {
  const [vehicles, setVehicles] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, analyticsRes] = await Promise.all([
        vehicleAPI.getAll({}),
        vehicleAPI.getAnalytics()
      ]);
      
      if (vehiclesRes.success) {
        setVehicles(vehiclesRes.data);
      }
      
      if (analyticsRes.success && analyticsRes.data.dailyCount) {
        const formattedData = analyticsRes.data.dailyCount.map(item => ({
          day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          count: item.count,
          pollution: Math.round(item.avg_pollution)
        }));
        setTrendData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Number Plate', 'Category', 'Fuel Type', 'Confidence', 'Entry Time', 'Exit Time', 'Zone', 'Pollution Score'];
    const rows = vehicles.map(v => [
      v.number_plate,
      v.vehicle_category,
      v.fuel_type,
      v.confidence,
      new Date(v.entry_time).toLocaleString(),
      v.exit_time ? new Date(v.exit_time).toLocaleString() : 'Still Inside',
      v.zone_name || 'N/A',
      v.pollution_score
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Traffic Optimization - Vehicle Logs Report', 14, 22);
    
    // Date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Total Vehicles: ${vehicles.length}`, 14, 40);
    const evCount = vehicles.filter(v => v.fuel_type === 'EV').length;
    const iceCount = vehicles.filter(v => v.fuel_type === 'ICE').length;
    doc.text(`EV: ${evCount} | ICE: ${iceCount}`, 14, 47);
    
    // Table
    const tableData = vehicles.slice(0, 50).map(v => [
      v.number_plate,
      v.vehicle_category,
      v.fuel_type,
      `${v.confidence}%`,
      new Date(v.entry_time).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      v.exit_time ? new Date(v.exit_time).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : 'Inside',
      v.zone_name || 'N/A'
    ]);
    
    autoTable(doc, {
      head: [['Plate', 'Category', 'Fuel', 'Conf.', 'Entry', 'Exit', 'Zone']],
      body: tableData,
      startY: 55,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    if (vehicles.length > 50) {
      const finalY = doc.lastAutoTable.finalY;
      doc.text(`Showing first 50 of ${vehicles.length} vehicles`, 14, finalY + 10);
    }
    
    doc.save(`traffic_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size={48} className="text-blue-600 animate-spin" />
        <div className="text-xl text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-10 space-y-6">
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
      {trendData.length > 0 && (
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
      )}

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
                <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                <th className="text-left p-4 font-semibold text-gray-700">Fuel Type</th>
                <th className="text-left p-4 font-semibold text-gray-700">Entry Time</th>
                <th className="text-left p-4 font-semibold text-gray-700">Exit Time</th>
                <th className="text-left p-4 font-semibold text-gray-700">Zone</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No vehicle logs found
                  </td>
                </tr>
              ) : (
                vehicles.slice(0, 6).map(vehicle => ( // Display only the first 6 rows
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono">{vehicle.number_plate}</td>
                    <td className="p-4">{vehicle.vehicle_category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        vehicle.fuel_type === 'EV' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.fuel_type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(vehicle.entry_time).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-gray-600">
                      {vehicle.exit_time 
                        ? new Date(vehicle.exit_time).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'
                      }
                    </td>
                    <td className="p-4 text-gray-600">{vehicle.zone_name || 'N/A'}</td>
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

export default LogsReports;