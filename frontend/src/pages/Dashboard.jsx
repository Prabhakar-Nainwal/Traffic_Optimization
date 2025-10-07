import React, { useState, useEffect } from 'react';
import ParkingCard from '../components/ParkingCard';
import LiveFeedTable from '../components/LiveFeedTable';
import PollutionMeter from '../components/PollutionMeter';
import { subscribeToVehicles, subscribeToZones } from '../services/socket';
import { vehicleAPI, zoneAPI } from '../services/api';

const Dashboard = () => {
  const [zones, setZones] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [fuelDistribution, setFuelDistribution] = useState([
    { name: 'Petrol', value: 45, color: '#3b82f6' },
    { name: 'Diesel', value: 30, color: '#ef4444' },
    { name: 'EV', value: 25, color: '#10b981' }
  ]);
  const [pollutionIndex, setPollutionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch parking zones
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

  // Fetch recent vehicles
  const fetchRecentVehicles = async () => {
    try {
      const response = await vehicleAPI.getRecent(10);
      if (response.success) {
        setVehicles(response.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await vehicleAPI.getAnalytics();
      if (response.success) {
        const { fuelDistribution, pollutionIndex } = response.data;
        
        // Transform fuel distribution for chart
        if (fuelDistribution && fuelDistribution.length > 0) {
          const colors = { Petrol: '#3b82f6', Diesel: '#ef4444', EV: '#10b981', CNG: '#f59e0b' };
          const chartData = fuelDistribution.map(item => ({
            name: item.fuel_type,
            value: item.count,
            color: colors[item.fuel_type] || '#6b7280'
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
    // Fetch initial data
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchZones(), fetchRecentVehicles(), fetchAnalytics()]);
      setLoading(false);
    };
    
    loadData();

    // Subscribe to real-time updates
    const unsubscribeVehicles = subscribeToVehicles((newVehicle) => {
      setVehicles(prev => [newVehicle, ...prev.slice(0, 9)]);
      fetchAnalytics(); // Update pollution index
    });

    const unsubscribeZones = subscribeToZones((updatedZone) => {
      setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeVehicles();
      unsubscribeZones();
    };
  }, []);

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
          {zones.map(zone => (
            <ParkingCard key={zone.id} zone={zone} />
          ))}
        </div>
      </div>

      {/* Live Vehicle Feed & Pollution Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveFeedTable vehicles={vehicles} />
        <PollutionMeter pollutionIndex={pollutionIndex} fuelDistribution={fuelDistribution} />
      </div>
    </div>
  );
};

export default Dashboard;
