"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

// Mock data
const logData = [
  { id: 1, plate: "ABC-1234", fuel: "Petrol", date: "2024-01-15", time: "08:30", decision: "Allow", zone: "Zone A" },
  { id: 2, plate: "XYZ-5678", fuel: "Diesel", date: "2024-01-15", time: "09:15", decision: "Warn", zone: "Zone B" },
  { id: 3, plate: "DEF-9012", fuel: "EV", date: "2024-01-15", time: "10:00", decision: "Allow", zone: "Zone C" },
  { id: 4, plate: "GHI-3456", fuel: "Diesel", date: "2024-01-14", time: "07:45", decision: "Warn", zone: "Zone A" },
  { id: 5, plate: "JKL-7890", fuel: "Petrol", date: "2024-01-14", time: "11:00", decision: "Allow", zone: "Zone D" },
  { id: 6, plate: "MNO-2345", fuel: "EV", date: "2024-01-14", time: "08:00", decision: "Allow", zone: "Zone B" },
  { id: 7, plate: "PQR-6789", fuel: "Diesel", date: "2024-01-13", time: "09:30", decision: "Warn", zone: "Zone C" },
  { id: 8, plate: "STU-0123", fuel: "Petrol", date: "2024-01-13", time: "10:30", decision: "Allow", zone: "Zone A" },
]

const dailyVehicles = [
  { date: "Jan 10", count: 145 },
  { date: "Jan 11", count: 168 },
  { date: "Jan 12", count: 152 },
  { date: "Jan 13", count: 178 },
  { date: "Jan 14", count: 165 },
  { date: "Jan 15", count: 189 },
]

const pollutionTrend = [
  { date: "Jan 10", level: 65 },
  { date: "Jan 11", level: 72 },
  { date: "Jan 12", level: 68 },
  { date: "Jan 13", level: 85 },
  { date: "Jan 14", level: 78 },
  { date: "Jan 15", level: 90 },
]

export default function LogsPage() {
  const [search, setSearch] = useState("")

  const filteredLogs = logData.filter(
    (log) => log.plate.toLowerCase().includes(search.toLowerCase()) || log.date.includes(search),
  )

  const exportCSV = () => {
    const csv = [
      ["ID", "Plate", "Fuel", "Date", "Time", "Decision", "Zone"],
      ...filteredLogs.map((log) => [log.id, log.plate, log.fuel, log.date, log.time, log.decision, log.zone]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "vehicle-logs.csv"
    a.click()
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs & Reports</h1>
        <p className="text-muted-foreground">Historical data and analytics</p>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Vehicle Count</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyVehicles}>
                <XAxis dataKey="date" stroke="#666" style={{ fontSize: 12 }} />
                <YAxis stroke="#666" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pollution Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={pollutionTrend}>
                <XAxis dataKey="date" stroke="#666" style={{ fontSize: 12 }} />
                <YAxis stroke="#666" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line type="monotone" dataKey="level" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by plate or date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Plate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Fuel</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Zone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Decision</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono">{log.plate}</td>
                    <td className="px-4 py-3">{log.fuel}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{log.date}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{log.time}</td>
                    <td className="px-4 py-3">{log.zone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          log.decision === "Allow"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        }`}
                      >
                        {log.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {logData.length} logs
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
