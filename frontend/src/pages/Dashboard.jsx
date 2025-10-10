import React, { useState, useEffect } from 'react';
import { subscribeToIncomingVehicles, subscribeToZones } from '../services/socket';
import { vehicleAPI, zoneAPI } from '../services/api';

// Import the new components
import ParkingCard from '../components/ParkingCard';
import LiveFeed from '../components/LiveFeed';
import PollutionMeter from '../components/PollutionMeter';

const Dashboard = () => {
  const [zones, setZones] = useState([]);
  const [incomingVehicles, setIncomingVehicles] = useState([]);
  const [pollutionIndex, setPollutionIndex] = useState(0);
  const [fuelDistribution, setFuelDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data fetching and WebSocket logic remains here in the parent component
  useEffect(() => {
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

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchZones(), fetchAnalytics()]);
      setLoading(false);
    };
    
    loadData();

    const unsubscribeIncoming = subscribeToIncomingVehicles((newVehicle) => {
      setIncomingVehicles(prev => {
        const exists = prev.some(v => v.id === newVehicle.id);
        if (exists) return prev;
        const vehicleWithTimestamp = { ...newVehicle, displayTime: new Date().getTime() };
        return [vehicleWithTimestamp, ...prev];
      });
      fetchAnalytics();
      fetchZones();
    });

    const unsubscribeZones = subscribeToZones((updatedZone) => {
      setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
    });

    const cleanupInterval = setInterval(() => {
      const now = new Date().getTime();
      setIncomingVehicles(prev =>
        prev.filter(v => {
          const displayTime = v.displayTime || new Date(v.detected_time).getTime();
          const age = now - displayTime;
          return age < 20000;
        })
      );
    }, 100);

    return () => {
      unsubscribeIncoming();
      unsubscribeZones();
      clearInterval(cleanupInterval);
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

      {/* Real-time Incoming Vehicles Table & Pollution Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LiveFeed incomingVehicles={incomingVehicles} />
        <PollutionMeter pollutionIndex={pollutionIndex} fuelDistribution={fuelDistribution} />
      </div>
    </div>
  );
};

export default Dashboard;