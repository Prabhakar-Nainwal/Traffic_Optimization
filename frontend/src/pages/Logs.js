"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import "../assets/css/components.css"
import "../assets/css/pages.css"

// Mock data - Replace with API calls
const mockLogs = [
  { id: 1, timestamp: "2024-01-15 14:30:22", plate: "ABC-1234", action: "Entry", zone: "Zone A", fuel: "Petrol" },
  { id: 2, timestamp: "2024-01-15 14:28:15", plate: "XYZ-5678", action: "Exit", zone: "Zone B", fuel: "Diesel" },
  { id: 3, timestamp: "2024-01-15 14:25:40", plate: "DEF-9012", action: "Entry", zone: "Zone C", fuel: "EV" },
  { id: 4, timestamp: "2024-01-15 14:20:10", plate: "GHI-3456", action: "Entry", zone: "Zone D", fuel: "Diesel" },
  { id: 5, timestamp: "2024-01-15 14:15:33", plate: "JKL-7890", action: "Exit", zone: "Zone A", fuel: "Petrol" },
]

const trafficData = [
  { time: "6AM", vehicles: 12 },
  { time: "8AM", vehicles: 45 },
  { time: "10AM", vehicles: 78 },
  { time: "12PM", vehicles: 65 },
  { time: "2PM", vehicles: 82 },
  { time: "4PM", vehicles: 95 },
  { time: "6PM", vehicles: 70 },
]

function Logs() {
  const [logs] = useState(mockLogs)
  const [dateFrom, setDateFrom] = useState("2024-01-15")
  const [dateTo, setDateTo] = useState("2024-01-15")

  const exportToCSV = () => {
    const headers = ["Timestamp", "Plate", "Action", "Zone", "Fuel Type"]
    const rows = logs.map((log) => [log.timestamp, log.plate, log.action, log.zone, log.fuel])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `parkvision-logs-${dateFrom}-to-${dateTo}.csv`
    a.click()
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Logs & Reports</h1>
        <p className="page-subtitle">Historical data and analytics</p>
      </div>

      {/* Traffic Chart */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h3 className="card-title">Traffic Flow (Today)</h3>
        </div>
        <div style={{ padding: "20px" }}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trafficData}>
              <XAxis dataKey="time" stroke="#666" style={{ fontSize: 12 }} />
              <YAxis stroke="#666" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333" }}
                labelStyle={{ color: "#fff" }}
              />
              <Line type="monotone" dataKey="vehicles" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Export */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div className="filters">
          <div className="filter-group">
            <label className="filter-label">From Date</label>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ width: "160px" }}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">To Date</label>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ width: "160px" }}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={exportToCSV}>
          <Download size={16} style={{ marginRight: "6px" }} />
          Export CSV
        </button>
      </div>

      {/* Logs Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Plate Number</th>
              <th>Action</th>
              <th>Zone</th>
              <th>Fuel Type</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{log.plate}</td>
                <td>
                  <span
                    style={{
                      color: log.action === "Entry" ? "var(--accent-green)" : "var(--accent-yellow)",
                      fontWeight: 500,
                    }}
                  >
                    {log.action}
                  </span>
                </td>
                <td>{log.zone}</td>
                <td>{log.fuel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Logs
