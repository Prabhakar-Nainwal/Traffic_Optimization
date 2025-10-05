"use client"

import { useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import StatusBadge from "../components/StatusBadge"
import ProgressBar from "../components/ProgressBar"
import "../assets/css/components.css"
import "../assets/css/pages.css"

// Mock data - Replace with API calls
const mockZones = [
  { id: 1, name: "Zone A", total: 100, occupied: 65, location: "North Wing" },
  { id: 2, name: "Zone B", total: 80, occupied: 72, location: "South Wing" },
  { id: 3, name: "Zone C", total: 120, occupied: 45, location: "East Wing" },
  { id: 4, name: "Zone D", total: 90, occupied: 85, location: "West Wing" },
]

function Zones() {
  const [zones, setZones] = useState(mockZones)
  const [showModal, setShowModal] = useState(false)
  const [editingZone, setEditingZone] = useState(null)
  const [formData, setFormData] = useState({ name: "", total: "", location: "" })

  const handleAdd = () => {
    setEditingZone(null)
    setFormData({ name: "", total: "", location: "" })
    setShowModal(true)
  }

  const handleEdit = (zone) => {
    setEditingZone(zone)
    setFormData({ name: zone.name, total: zone.total, location: zone.location })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this zone?")) {
      setZones(zones.filter((z) => z.id !== id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingZone) {
      // Update existing zone
      setZones(
        zones.map((z) =>
          z.id === editingZone.id
            ? { ...z, name: formData.name, total: Number.parseInt(formData.total), location: formData.location }
            : z,
        ),
      )
    } else {
      // Add new zone
      const newZone = {
        id: Math.max(...zones.map((z) => z.id)) + 1,
        name: formData.name,
        total: Number.parseInt(formData.total),
        occupied: 0,
        location: formData.location,
      }
      setZones([...zones, newZone])
    }
    setShowModal(false)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Parking Zone Management</h1>
        <p className="page-subtitle">Manage parking zones and capacity</p>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} style={{ marginRight: "6px" }} />
          Add Zone
        </button>
      </div>

      <div className="grid-4">
        {zones.map((zone) => {
          const occupancy = (zone.occupied / zone.total) * 100
          const available = zone.total - zone.occupied

          return (
            <div key={zone.id} className="card">
              <div className="card-header">
                <h3 className="card-title">{zone.name}</h3>
                <StatusBadge occupancy={occupancy} />
              </div>
              <div className="card-content">
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  📍 {zone.location}
                </p>
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
                    {available}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                  <button className="btn btn-secondary" onClick={() => handleEdit(zone)} style={{ flex: 1 }}>
                    <Edit size={14} style={{ marginRight: "4px" }} />
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(zone.id)} style={{ flex: 1 }}>
                    <Trash2 size={14} style={{ marginRight: "4px" }} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingZone ? "Edit Zone" : "Add New Zone"}</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Zone Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Capacity</label>
                <input
                  type="number"
                  className="input"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {editingZone ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Zones
