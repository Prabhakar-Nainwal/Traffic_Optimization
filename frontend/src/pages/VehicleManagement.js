"use client"

import { useState } from "react"
import { Search, Plus, Edit2, Trash2 } from "lucide-react"
import "../assets/css/components.css"
import "../assets/css/pages.css"
import "../assets/css/table.css"

// Mock data - Replace with API calls
const mockVehicles = [
  { id: 1, plate: "ABC-1234", owner: "John Doe", fuel: "Petrol", status: "Active", lastSeen: "2024-01-15 14:30" },
  { id: 2, plate: "XYZ-5678", owner: "Jane Smith", fuel: "Diesel", status: "Flagged", lastSeen: "2024-01-15 14:28" },
  { id: 3, plate: "DEF-9012", owner: "Bob Johnson", fuel: "EV", status: "Active", lastSeen: "2024-01-15 14:25" },
  { id: 4, plate: "GHI-3456", owner: "Alice Brown", fuel: "Diesel", status: "Flagged", lastSeen: "2024-01-15 14:20" },
  { id: 5, plate: "JKL-7890", owner: "Charlie Wilson", fuel: "Petrol", status: "Active", lastSeen: "2024-01-15 14:15" },
]

function VehicleManagement() {
  const [vehicles] = useState(mockVehicles)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Management</h1>
          <p className="page-subtitle">Manage registered vehicles and ANPR data</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} style={{ marginRight: "6px" }} />
          Add Vehicle
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div style={{ padding: "20px" }}>
          <div className="search-bar">
            <Search size={18} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Search by plate number or owner..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Owner</th>
              <th>Fuel Type</th>
              <th>Status</th>
              <th>Last Seen</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{vehicle.plate}</td>
                <td>{vehicle.owner}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor:
                        vehicle.fuel === "EV"
                          ? "rgba(16, 185, 129, 0.1)"
                          : vehicle.fuel === "Diesel"
                            ? "rgba(245, 158, 11, 0.1)"
                            : "rgba(59, 130, 246, 0.1)",
                      color:
                        vehicle.fuel === "EV"
                          ? "var(--accent-green)"
                          : vehicle.fuel === "Diesel"
                            ? "var(--accent-yellow)"
                            : "var(--accent-blue)",
                    }}
                  >
                    {vehicle.fuel}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor:
                        vehicle.status === "Active" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: vehicle.status === "Active" ? "var(--accent-green)" : "var(--accent-red)",
                    }}
                  >
                    {vehicle.status}
                  </span>
                </td>
                <td style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{vehicle.lastSeen}</td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="icon-btn" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn" title="Delete" style={{ color: "var(--accent-red)" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredVehicles.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          No vehicles found matching your search.
        </div>
      )}
    </div>
  )
}

export default VehicleManagement
