"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, MapPin } from "lucide-react"
import StatusBadge from "../components/StatusBadge"
import ProgressBar from "../components/ProgressBar"
import "../assets/css/components.css"
import "../assets/css/pages.css"
import "../assets/css/table.css"

// Mock data - Replace with API calls
const mockZones = [
  { id: 1, name: "Zone A", location: "North Wing", total: 100, occupied: 65, available: 35, status: "Active" },
  { id: 2, name: "Zone B", location: "South Wing", total: 80, occupied: 72, available: 8, status: "Active" },
  { id: 3, name: "Zone C", location: "East Wing", total: 120, occupied: 45, available: 75, status: "Active" },
  { id: 4, name: "Zone D", location: "West Wing", total: 90, occupied: 85, available: 5, status: "Active" },
  { id: 5, name: "Zone E", location: "Central", total: 150, occupied: 120, available: 30, status: "Active" },
]

function ParkingZones() {
  const [zones] = useState(mockZones)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parking Zones</h1>
          <p className="page-subtitle">Manage parking zones and capacity</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} style={{ marginRight: "6px" }} />
          Add Zone
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid-3" style={{ marginBottom: "32px" }}>
        {zones.map((zone) => {
          const occupancy = (zone.occupied / zone.total) * 100
          return (
            <div key={zone.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{zone.name}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                    <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />
                    {zone.location}
                  </p>
                </div>
                <StatusBadge occupancy={occupancy} />
              </div>
              <div className="card-content">
                <div className="stat-row">
                  <span className="stat-label">Occupied</span>
                  <span className="stat-value">
                    {zone.occupied}/{zone.total}
                  </span>
                </div>
                <ProgressBar value={occupancy} />
                <div className="stat-row" style={{ marginTop: "12px" }}>
                  <span className="stat-label">Available:</span>
                  <span className="stat-value" style={{ color: "var(--accent-green)" }}>
                    {zone.available} spots
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Zones Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Zone Details</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Zone Name</th>
                <th>Location</th>
                <th>Total Capacity</th>
                <th>Occupied</th>
                <th>Available</th>
                <th>Occupancy</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => {
                const occupancy = (zone.occupied / zone.total) * 100
                return (
                  <tr key={zone.id}>
                    <td style={{ fontWeight: 600 }}>{zone.name}</td>
                    <td>{zone.location}</td>
                    <td>{zone.total}</td>
                    <td>{zone.occupied}</td>
                    <td style={{ color: "var(--accent-green)", fontWeight: 500 }}>{zone.available}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, maxWidth: "100px" }}>
                          <ProgressBar value={occupancy} />
                        </div>
                        <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                          {occupancy.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 500,
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          color: "var(--accent-green)",
                        }}
                      >
                        {zone.status}
                      </span>
                    </td>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ParkingZones
