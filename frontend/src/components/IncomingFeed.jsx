import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { incomingVehicleAPI } from '../services/api';
import { subscribeToIncomingVehicles, subscribeToProcessedVehicles } from '../services/socket';

const IncomingFeed = () => {
  const [incoming, setIncoming] = useState([]);

  useEffect(() => {
    // Fetch any vehicles that are already pending when the component loads
    const fetchInitialData = async () => {
      const response = await incomingVehicleAPI.getUnprocessed();
      if (response.success) {
        setIncoming(response.data);
      }
    };
    fetchInitialData();

    // Listen for new vehicles detected by the ANPR system
    const unsubscribeNew = subscribeToIncomingVehicles((newVehicle) => {
      setIncoming(prev => [newVehicle, ...prev]);
    });

    // Listen for when a vehicle is processed, so we can remove it from this list
    const unsubscribeRemove = subscribeToProcessedVehicles(({ id }) => {
      setIncoming(prev => prev.filter(v => v.id !== id));
    });

    // Clean up listeners when the component is unmounted
    return () => {
      unsubscribeNew();
      unsubscribeRemove();
    };
  }, []);

  const handleProcess = async (id) => {
    try {
      // This calls the backend to move the vehicle to the permanent log
      await incomingVehicleAPI.process(id);
    } catch (error) {
      console.error('Failed to process vehicle:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Incoming Vehicle Feed (Pending Approval)</h2>
      <div className="space-y-3 max-h-80 overflow-auto">
        {incoming.length > 0 ? (
          incoming.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-mono font-semibold">{vehicle.number_plate}</span>
              <p>({vehicle.fuel_type} - {vehicle.decision})</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleProcess(vehicle.id)}
                  className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                >
                  <Check size={18} />
                </button>
                 <button
                   onClick={() => setIncoming(prev => prev.filter(v => v.id !== vehicle.id))} // Simple reject by removing from UI
                   className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                 >
                   <X size={18} />
                 </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No new vehicles awaiting approval.</p>
        )}
      </div>
    </div>
  );
};

export default IncomingFeed;