import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subscribeToIncomingVehicles, subscribeToZones } from '../services/socket';
import { vehicleAPI, zoneAPI, incomingVehicleAPI } from '../services/api';

const Dashboard = () => {
  const [zones, setZones] = useState([]);
  const [incomingVehicles, setIncomingVehicles] = useState([]);
  const [pollutionIndex, setPollutionIndex] = useState(0);
  const [fuelDistribution, setFuelDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchZones = async () => {
    try {
      const response = await zoneAPI.getAll();
      if (response.success) {
        setZones(response.data);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchIncomingVehicles = async () => {
    try {
      // Don't fetch on initial load - let WebSocket populate it
      setIncomingVehicles([]);
    } catch (error) {
      console.error('Error fetching incoming vehicles:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await vehicleAPI.getAnalytics();
      if (response.success) {
        const { fuelDistribution, pollutionIndex } = response.data;
        
        if (fuelDistribution && fuelDistribution.length > 0) {
          const chartData = fuelDistribution.map(item => ({
            name: item.fuel_type,
            value: item.count,
            color: item.fuel_type === 'EV' ? '#10b981' : '#ef4444'
          }));
          setFuelDistribution(chartData);
        }
        
        setPollutionIndex(pollutionIndex || 0);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchZones(), fetchAnalytics()]);
      setLoading(false);
    };
    
    loadData();

    // Subscribe to incoming vehicles from ANPR (real-time)
    const unsubscribeIncoming = subscribeToIncomingVehicles((newVehicle) => {
      console.log('New vehicle received:', newVehicle);
      
      // Add to incoming vehicles list immediately
      setIncomingVehicles(prev => {
        // Check if vehicle already exists
        const exists = prev.some(v => v.id === newVehicle.id);
        if (exists) return prev;
        
        // Add new vehicle to the beginning with timestamp
        const vehicleWithTimestamp = {
          ...newVehicle,
          displayTime: new Date().getTime()
        };
        return [vehicleWithTimestamp, ...prev];
      });
      
      // Refresh analytics and zones
      fetchAnalytics();
      fetchZones();
    });

    const unsubscribeZones = subscribeToZones((updatedZone) => {
      setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
    });

    // Auto-cleanup: Remove vehicles older than 15 seconds
    const cleanupInterval = setInterval(() => {
      const now = new Date().getTime();
      setIncomingVehicles(prev => 
        prev.filter(v => {
          const displayTime = v.displayTime || new Date(v.detected_time).getTime();
          const age = now - displayTime;
          return age < 15000; // Keep only vehicles from last 15 seconds
        })
      );
    }, 100); // Check every 100ms for smooth and accurate removal

    return () => {
      unsubscribeIncoming();
      unsubscribeZones();
      clearInterval(cleanupInterval);
    };
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getOccupancyColor = (percentage, threshold) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < threshold) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Parking Zones */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Parking Zone Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zones.map(zone => {
            const percentage = zone.occupancyPercentage;
            const threshold = zone.thresholdPercentage;
            return (
              <div 
                key={zone.id} 
                className="bg-white p-6 rounded-lg shadow-md border-l-4" 
                style={{ borderLeftColor: percentage < 70 ? '#10b981' : percentage < threshold ? '#f59e0b' : '#ef4444' }}
              >
                <h3 className="text-lg font-bold text-gray-800">{zone.name}</h3>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Threshold:</span>
                    <span className="font-semibold">{threshold}%</span>
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
          })}
        </div>
      </div>

      {/* Real-time Incoming Vehicles Table & Pollution Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Vehicle Table */}
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

        {/* Pollution Meter */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Pollution Meter</h2>
          <div className="space-y-4">
            {/* Numerical Index */}
            <div className="text-center pb-4 border-b">
              <div className="text-sm text-gray-500 mb-2">Pollution Index</div>
              <div 
                className="text-6xl font-bold mb-2" 
                style={{ color: pollutionIndex > 70 ? '#ef4444' : pollutionIndex > 40 ? '#f59e0b' : '#10b981' }}
              >
                {pollutionIndex}
              </div>
              <div className="text-xs text-gray-600">out of 100</div>
              <div className={`mt-3 inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                pollutionIndex > 70 ? 'bg-red-100 text-red-800' : 
                pollutionIndex > 40 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {pollutionIndex > 70 ? 'High Pollution' : pollutionIndex > 40 ? 'Moderate' : 'Low Pollution'}
              </div>
            </div>
            
            {/* Pie Chart - Fuel Distribution */}
            <div>
              <div className="text-sm text-gray-500 text-center mb-2">Fuel Type Distribution</div>
              {fuelDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie 
                      data={fuelDistribution} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={60} 
                      dataKey="value" 
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {fuelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No data available
                </div>
              )}
              
              {/* Legend */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600">EV (Electric)</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {fuelDistribution.find(f => f.name === 'EV')?.value || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-gray-600">ICE (Combustion)</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    {fuelDistribution.find(f => f.name === 'ICE')?.value || 0}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t text-xs text-gray-500 text-center">
                💡 Index = (ICE / Total) × 100
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;