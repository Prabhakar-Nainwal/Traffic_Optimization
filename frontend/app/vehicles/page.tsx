"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

// Mock data
const vehicleData = [
  { plate: "ABC-1234", fuel: "Petrol", entry: "2024-01-15 08:30", exit: "2024-01-15 10:45", decision: "Allow" },
  { plate: "XYZ-5678", fuel: "Diesel", entry: "2024-01-15 09:15", exit: "2024-01-15 11:20", decision: "Warn" },
  { plate: "DEF-9012", fuel: "EV", entry: "2024-01-15 10:00", exit: "-", decision: "Allow" },
  { plate: "GHI-3456", fuel: "Diesel", entry: "2024-01-15 07:45", exit: "2024-01-15 09:30", decision: "Warn" },
  { plate: "JKL-7890", fuel: "Petrol", entry: "2024-01-15 11:00", exit: "-", decision: "Allow" },
  { plate: "MNO-2345", fuel: "EV", entry: "2024-01-15 08:00", exit: "2024-01-15 12:15", decision: "Allow" },
  { plate: "PQR-6789", fuel: "Diesel", entry: "2024-01-15 09:30", exit: "2024-01-15 10:00", decision: "Warn" },
  { plate: "STU-0123", fuel: "Petrol", entry: "2024-01-15 10:30", exit: "-", decision: "Allow" },
]

export default function VehiclesPage() {
  const [search, setSearch] = useState("")
  const [fuelFilter, setFuelFilter] = useState("all")
  const [decisionFilter, setDecisionFilter] = useState("all")

  const filteredVehicles = vehicleData.filter((vehicle) => {
    const matchesSearch = vehicle.plate.toLowerCase().includes(search.toLowerCase())
    const matchesFuel = fuelFilter === "all" || vehicle.fuel === fuelFilter
    const matchesDecision = decisionFilter === "all" || vehicle.decision === decisionFilter
    return matchesSearch && matchesFuel && matchesDecision
  })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vehicle Management</h1>
        <p className="text-muted-foreground">Track and manage all vehicle entries</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by plate number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={fuelFilter} onValueChange={setFuelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuels</SelectItem>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="EV">EV</SelectItem>
              </SelectContent>
            </Select>
            <Select value={decisionFilter} onValueChange={setDecisionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Decisions</SelectItem>
                <SelectItem value="Allow">Allow</SelectItem>
                <SelectItem value="Warn">Warn</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("")
                setFuelFilter("all")
                setDecisionFilter("all")
              }}
            >
              Clear
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Number Plate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Fuel Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Entry Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Exit Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Decision</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, i) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono">{vehicle.plate}</td>
                    <td className="px-4 py-3">{vehicle.fuel}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{vehicle.entry}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{vehicle.exit}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          vehicle.decision === "Allow"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        }`}
                      >
                        {vehicle.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredVehicles.length} of {vehicleData.length} vehicles
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
