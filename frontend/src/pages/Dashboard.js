import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import StatusBadge from "../components/StatusBadge"
import ProgressBar from "../components/ProgressBar"
import "../assets/css/components.css"
import "../assets/css/pages.css"

// Mock data - Replace with API calls
const parkingZones = [
  { id: 1, name: "Zone A", total: 100, occupied: 65, available: 35 },
  { id: 2, name: "Zone B", total: 80, occupied: 72, available: 8 },
  { id: 3, name: "Zone C", total: 120, occupied: 45, available: 75 },
  { id: 4, name: "Zone D", total: 90, occupied: 85, available: 5 },
]

const recentVehicles = [
  { plate: "ABC-1234", fuel: "Petrol", time: "10:45 AM", decision: "Allow" },
  { plate: "XYZ-5678", fuel: "Diesel", time: "10:42 AM", decision: "Warn" },
  { plate: "DEF-9012", fuel: "EV", time: "10:40 AM", decision: "Allow" },
  { plate: "GHI-3456", fuel: "Diesel", time: "10:38 AM", decision: "Warn" },
  { plate: "JKL-7890", fuel: "Petrol", time: "10:35 AM", decision: "Allow" },
]

const fuelData = [
  { name: "Petrol", value: 45, color: "#3b82f6" },
  { name: "Diesel", value: 30, color: "#f59e0b" },
  { name: "EV", value: 25, color: "#10b981" },
]

const pollutionData = [
  { hour: "6AM", level: 45 },
  { hour: "8AM", level: 72 },
  { hour: "10AM", level: 85 },
  { hour: "12PM", level: 78 },
  { hour: "2PM", level: 65 },
  { hour: "4PM", level: 90 },
]

function Dashboard() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time parking and vehicle monitoring</p>
      </div>

      {/* Parking Zones */}
      <section>
        <h2 className="section-title">Parking Zones</h2>
        <div className="grid-4">
          {parkingZones.map((zone) => {
            const occupancy = (zone.occupied / zone.total) * 100
            return (
              <div key={zone.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{zone.name}</h3>
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
                      {zone.available}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid-2">
        {/* Live Vehicle Feed */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Live Vehicle Feed</h3>
          </div>
          <div className="vehicle-feed">
            {recentVehicles.map((vehicle, i) => (
              <div key={i} className="vehicle-item">
                <div>
                  <p className="vehicle-plate">{vehicle.plate}</p>
                  <p className="vehicle-info">
                    {vehicle.fuel} • {vehicle.time}
                  </p>
                </div>
                <span className={`decision-badge decision-${vehicle.decision.toLowerCase()}`}>{vehicle.decision}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pollution Meter */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pollution Meter</h3>
          </div>
          <div className="card-content">
            <div className="pollution-section">
              <p className="section-label">Fuel Type Distribution</p>
              <div className="fuel-chart">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={fuelData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                      {fuelData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="fuel-legend">
                  {fuelData.map((item) => (
                    <div key={item.name} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: item.color }} />
                      <span>
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pollution-section">
              <p className="section-label">Pollution Index (Today)</p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={pollutionData}>
                  <XAxis dataKey="hour" stroke="#666" style={{ fontSize: 12 }} />
                  <YAxis stroke="#666" style={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="level" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="warning-text">⚠ Current level: 90 (Warning threshold exceeded)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
