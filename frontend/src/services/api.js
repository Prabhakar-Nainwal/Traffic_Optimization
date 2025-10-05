// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API call failed:", error)
    throw error
  }
}

// Dashboard APIs
export const getDashboardStats = () => apiCall("/dashboard/stats")
export const getLiveVehicles = () => apiCall("/dashboard/live-vehicles")
export const getPollutionData = () => apiCall("/dashboard/pollution")

// Vehicle APIs
export const getVehicles = (filters) => {
  const params = new URLSearchParams(filters)
  return apiCall(`/vehicles?${params}`)
}
export const getVehicleById = (id) => apiCall(`/vehicles/${id}`)
export const addVehicle = (data) => apiCall("/vehicles", { method: "POST", body: JSON.stringify(data) })
export const updateVehicle = (id, data) => apiCall(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) })
export const deleteVehicle = (id) => apiCall(`/vehicles/${id}`, { method: "DELETE" })

// Parking Zone APIs
export const getParkingZones = () => apiCall("/zones")
export const getZoneById = (id) => apiCall(`/zones/${id}`)
export const addZone = (data) => apiCall("/zones", { method: "POST", body: JSON.stringify(data) })
export const updateZone = (id, data) => apiCall(`/zones/${id}`, { method: "PUT", body: JSON.stringify(data) })
export const deleteZone = (id) => apiCall(`/zones/${id}`, { method: "DELETE" })

// Logs APIs
export const getLogs = (filters) => {
  const params = new URLSearchParams(filters)
  return apiCall(`/logs?${params}`)
}
export const exportLogs = (format) => apiCall(`/logs/export?format=${format}`)

// Pollution APIs
export const getPollutionStats = () => apiCall("/pollution/stats")
export const getPollutionHistory = (period) => apiCall(`/pollution/history?period=${period}`)

export default {
  getDashboardStats,
  getLiveVehicles,
  getPollutionData,
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getParkingZones,
  getZoneById,
  addZone,
  updateZone,
  deleteZone,
  getLogs,
  exportLogs,
  getPollutionStats,
  getPollutionHistory,
}
