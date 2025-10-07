import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Vehicle API endpoints
export const vehicleAPI = {
  // Get all vehicles with optional filters
  getAll: async (filters = {}) => {
    try {
      const response = await apiClient.get('/vehicles', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  // Get recent vehicles for live feed
  getRecent: async (limit = 10) => {
    try {
      const response = await apiClient.get('/vehicles/recent', { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent vehicles:', error);
      throw error;
    }
  },

  // Get analytics data
  getAnalytics: async () => {
    try {
      const response = await apiClient.get('/vehicles/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Add new vehicle entry
  add: async (vehicleData) => {
    try {
      const response = await apiClient.post('/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  },

  // Update vehicle exit
  updateExit: async (id) => {
    try {
      const response = await apiClient.put(`/vehicles/${id}/exit`);
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle exit:', error);
      throw error;
    }
  },
};

// Zone API endpoints
export const zoneAPI = {
  // Get all parking zones
  getAll: async () => {
    try {
      const response = await apiClient.get('/zones');
      return response.data;
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  },

  // Get single zone by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/zones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching zone:', error);
      throw error;
    }
  },

  // Create new parking zone
  create: async (zoneData) => {
    try {
      const response = await apiClient.post('/zones', zoneData);
      return response.data;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  },

  // Update existing zone
  update: async (id, zoneData) => {
    try {
      const response = await apiClient.put(`/zones/${id}`, zoneData);
      return response.data;
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  },

  // Delete zone (soft delete)
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/zones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  },
};

export default apiClient;

