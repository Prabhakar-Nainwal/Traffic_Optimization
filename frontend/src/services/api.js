import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Vehicle API endpoints (permanent logs)
export const vehicleAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await apiClient.get('/vehicles', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  getAnalytics: async () => {
    try {
      const response = await apiClient.get('/vehicles/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

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
  getAll: async () => {
    try {
      const response = await apiClient.get('/zones');
      return response.data;
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/zones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching zone:', error);
      throw error;
    }
  },

  create: async (zoneData) => {
    try {
      const response = await apiClient.post('/zones', zoneData);
      return response.data;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  },

  update: async (id, zoneData) => {
    try {
      const response = await apiClient.put(`/zones/${id}`, zoneData);
      return response.data;
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  },

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

// Incoming Vehicle API endpoints
export const incomingVehicleAPI = {
  getUnprocessed: async (limit = 50) => {
    try {
      const response = await apiClient.get('/incoming/unprocessed', { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching incoming vehicles:', error);
      throw error;
    }
  },

  process: async (id) => {
    try {
      const response = await apiClient.post(`/incoming/${id}/process`);
      return response.data;
    } catch (error) {
      console.error('Error processing vehicle:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/incoming/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },
};

export default apiClient;