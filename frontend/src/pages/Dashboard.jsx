import React, { useState, useEffect } from 'react';
import ParkingCard from '../components/ParkingCard';
import LiveFeedTable from '../components/LiveFeedTable';
import PollutionMeter from '../components/PollutionMeter';
import { subscribeToVehicles, subscribeToZones } from '../services/socket';
import { vehicleAPI, zoneAPI } from '../services/api';

const Dashboard = () => {
  const [zones, setZones] = useState([
    { id: 1, name: 'Zone A', total: 100, occupied: 65 },
    { id: 2, name: 'Zone B', total: 80, occupied: 72 },
    { id: 3, name: 'Zone C', total: 120, occupied: 45 }
  ]);
  
  const [vehicles, setVehicles] = useState([
    { id: 1, plate: 'UP16-AB-1234', fuel: 'Petrol', entryTime: '10:30 AM', decision: 'Allow' },
    { id: 2, plate: 'DL08-CD-5678', fuel: 'Diesel', entryTime: '10:35 AM', decision: 'Warn' },
    { id: 3, plate: 'MH12-EF-9012', fuel: 'EV', entryTime: '10:40 AM', decision: 'Allow' },
    { id: 4, plate: 'KA03-GH-3456', fuel: 'Petrol', entryTime: '10:45 AM', decision: 'Allow' }
  ]);

  const fuelDistribution = [
    { name: 'Petrol', value: 45, color: '#3b82f6' },
    { name: 'Diesel', value: 30, color: '#ef4444' },
    { name: 'EV', value: 25, color: '#10b981' }
  ];

  const pollutionIndex = 68;

  useEffect(() => {
    // Subscribe to real-time updates
    subscribeToVehicles((newVehicle) => {
      setVehicles(prev => [newVehicle, ...prev]);
    });

    subscribeToZones((updatedZone) => {
      setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
    });

    // Fetch initial data
    // fetchZones();
    // fetchRecentVehicles();
  }, []);

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