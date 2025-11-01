import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import { zoneAPI } from '../services/api.js';

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [newZone, setNewZone] = useState({ 
    name: '', 
    totalSlots: '', 
    location: '', 
    thresholdPercentage: '90' 
  });
  const [loading, setLoading] = useState(true);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await zoneAPI.getAll();
      if (response.success) {
        setZones(response.data);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddZone = async () => {
    if (newZone.name && newZone.totalSlots) {
      try {
        const response = await zoneAPI.create({
          name: newZone.name,
          totalSlots: parseInt(newZone.totalSlots),
          location: newZone.location,
          thresholdPercentage: parseInt(newZone.thresholdPercentage)
        });
        
        if (response.success) {
          await fetchZones();
          setNewZone({ name: '', totalSlots: '', location: '', thresholdPercentage: '90' });
          setShowAddModal(false);
        }
      } catch (error) {
        console.error('Error adding zone:', error);
        alert('Failed to add zone. Please check if the name already exists.');
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleUpdateZone = async () => {
    if (editingZone && editingZone.name && editingZone.totalSlots) {
      try {
        const response = await zoneAPI.update(editingZone.id, {
          name: editingZone.name,
          totalSlots: parseInt(editingZone.totalSlots),
          location: editingZone.location,
          thresholdPercentage: parseInt(editingZone.thresholdPercentage)
        });
        
        if (response.success) {
          await fetchZones();
          setEditingZone(null);
        }
      } catch (error) {
        console.error('Error updating zone:', error);
        alert('Failed to update zone');
      }
    }
  };

  const handleDeleteZone = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking zone?')) {
      try {
        const response = await zoneAPI.delete(id);
        if (response.success) {
          await fetchZones();
        }
      } catch (error) {
        console.error('Error deleting zone:', error);
        alert('Failed to delete zone');
      }
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size={48} className="text-blue-600 animate-spin"/>
        <div className="text-xl text-gray-600">Loading zones...</div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Parking Zone Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} className="mr-2" />
          Add Zone
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No parking zones found. Create one to get started!
          </div>
        ) : (
          zones.map(zone => {
            const isFull = zone.occupancyPercentage >= zone.thresholdPercentage;
            const availabilityText = isFull ? 'Full' : `${zone.availableSlots} slots`;
            const availabilityColor = isFull ? 'text-red-600' : 'text-green-600';

            return (
              <div key={zone.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{zone.name}</h3>
                    <p className="text-sm text-gray-500">{zone.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingZone(zone)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Capacity:</span>
                    <span className="font-semibold">{zone.totalSlots} slots</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Occupancy:</span>
                    <span className="font-semibold">{zone.occupiedSlots} / {zone.totalSlots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className={`font-semibold ${availabilityColor}`}>{availabilityText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupancy:</span>
                    <span className="font-semibold">{zone.occupancyPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Threshold:</span>
                    <span className="font-semibold text-orange-600">{zone.thresholdPercentage}%</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add New Parking Zone</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone Name *</label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Zone D"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Capacity *</label>
                <input
                  type="number"
                  value={newZone.totalSlots}
                  onChange={(e) => setNewZone({ ...newZone, totalSlots: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newZone.location}
                  onChange={(e) => setNewZone({ ...newZone, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., West Wing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Threshold % *</label>
                <input
                  type="number"
                  value={newZone.thresholdPercentage}
                  onChange={(e) => setNewZone({ ...newZone, thresholdPercentage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 90"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddZone}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Zone
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Edit Parking Zone</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone Name *</label>
                <input
                  type="text"
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Capacity *</label>
                <input
                  type="number"
                  value={editingZone.totalSlots}
                  onChange={(e) => setEditingZone({ ...editingZone, totalSlots: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editingZone.location}
                  onChange={(e) => setEditingZone({ ...editingZone, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Threshold % *</label>
                <input
                  type="number"
                  value={editingZone.thresholdPercentage}
                  onChange={(e) => setEditingZone({ ...editingZone, thresholdPercentage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateZone}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Zone
              </button>
              <button
                onClick={() => setEditingZone(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneManagement;

