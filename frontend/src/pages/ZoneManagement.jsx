import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { zoneAPI } from '../services/api';

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentZone, setCurrentZone] = useState({ name: '', totalSlots: '', location: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch all zones from the API
  const fetchAllZones = async () => {
    try {
      setLoading(true);
      const response = await zoneAPI.getAll();
      if (response.success) {
        setZones(response.data);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllZones();
  }, []);

  const handleOpenModal = (zone = null) => {
    if (zone) {
      setIsEditing(true);
      setCurrentZone({ id: zone.id, name: zone.name, totalSlots: zone.totalSlots, location: zone.location });
    } else {
      setIsEditing(false);
      setCurrentZone({ name: '', totalSlots: '', location: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentZone({ name: '', totalSlots: '', location: '' });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await zoneAPI.update(currentZone.id, currentZone);
      } else {
        await zoneAPI.create(currentZone);
      }
      await fetchAllZones(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error("Error saving zone:", error);
    }
  };

  const handleDeleteZone = async (id) => {
    if (window.confirm("Are you sure you want to delete this zone?")) {
      try {
        await zoneAPI.delete(id);
        await fetchAllZones(); // Refresh the list
      } catch (error) {
        console.error("Error deleting zone:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Parking Zone Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} className="mr-2" />
          Add Zone
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading zones...</p>
        ) : zones.length > 0 ? (
          zones.map(zone => (
            <div key={zone.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{zone.name}</h3>
                  <p className="text-sm text-gray-500">{zone.location}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(zone)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeleteZone(zone.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
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
                  <span className="font-semibold text-green-600">{zone.availableSlots} slots</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No parking zones found. Add one to get started.</p>
        )}
      </div>

      {/* Add/Edit Zone Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit' : 'Add New'} Parking Zone</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone Name</label>
                <input
                  type="text"
                  value={currentZone.name}
                  onChange={(e) => setCurrentZone({ ...currentZone, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Zone D"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Capacity</label>
                <input
                  type="number"
                  value={currentZone.totalSlots}
                  onChange={(e) => setCurrentZone({ ...currentZone, totalSlots: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={currentZone.location}
                  onChange={(e) => setCurrentZone({ ...currentZone, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., West Wing"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {isEditing ? 'Save Changes' : 'Add Zone'}
              </button>
              <button onClick={handleCloseModal} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
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