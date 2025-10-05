"use client"

import { useState } from "react"
import "../assets/css/components.css"
import "../assets/css/pages.css"

// Mock data - Replace with API calls
const mockVehicles = [
  {
    id: 1,
    plate: "ABC-1234",
    fuel: "Petrol",
    entry: "2024-01-15 09:30",
    exit: "2024-01-15 11:45",
    zone: "Zone A",
    decision: "Allow",
  },
  {
    id: 2,
    plate: "XYZ-5678",
    fuel: "Diesel",
    entry: "2024-01-15 10:15",
    exit: "2024-01-15 12:30",
    zone: "Zone B",
    decision: "Warn",
  },
  {
    id: 3,
    plate: "DEF-9012",
    fuel: "EV",
    entry: "2024-01-15 08:00",
    exit: "2024-01-15 17:00",
    zone: "Zone C",
    decision: "Allow",
  },
  { id: 4, plate: "GHI-3456", fuel: "Diesel", entry: "2024-01-15 11:20", exit: "-", zone: "Zone D", decision: "Warn" },
  {
    id: 5,
    plate: "JKL-7890",
    fuel: "Petrol",
    entry: "2024-01-15 07:45",
    exit: "2024-01-15 16:30",
    zone: "Zone A",
    decision: "Allow",
  },
]

function Vehicles() {
  const [vehicles, setVehicles] = useState(mockVehicles)
  const [searchPlate, setSearchPlate] = useState("")
  const [filterFuel, setFilterFuel] = useState("all")
  const [filterZone, setFilterZone] = useState("all")

  // Filter logic
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesPlate = vehicle.plate.toLowerCase().includes(searchPlate.toLowerCase())
    const matchesFuel = filterFuel === "all" || vehicle.fuel === filterFuel
    const matchesZone = filterZone === "all" || vehicle.zone === filterZone
    return matchesPlate && matchesFuel && matchesZone
  })

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Vehicle Management</h1>
        <p className="page-subtitle">Track and manage all vehicles</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label className="filter-label">Search Plate</label>
          <input
            type="text"
            className="input"
            placeholder="Enter plate number..."
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value)}
            style={{ width: "200px" }}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Fuel Type</label>
          <select
            className="select"
            value={filterFuel}
            onChange={(e) => setFilterFuel(e.target.value)}
            style={{ width: "150px" }}
          >
            <option value="all">All Types</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="EV">EV</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Zone</label>
          <select
            className="select"
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            style={{ width: "150px" }}
          >
            <option value="all">All Zones</option>
            <option value="Zone A">Zone A</option>
            <option value="Zone B">Zone B</option>
            <option value="Zone C">Zone C</option>
            <option value="Zone D">Zone D</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Fuel Type</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Zone</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{vehicle.plate}</td>
                <td>{vehicle.fuel}</td>
                <td>{vehicle.entry}</td>
                <td>{vehicle.exit}</td>
                <td>{vehicle.zone}</td>
                <td>
                  <span className={`decision-badge decision-${vehicle.decision.toLowerCase()}`}>
                    {vehicle.decision}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredVehicles.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "20px" }}>
          No vehicles found matching your filters
        </p>
      )}
    </div>
  )
}

export default Vehicles
