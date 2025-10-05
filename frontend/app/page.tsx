import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/status-badge"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

// Mock data
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

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Real-time parking and vehicle monitoring</p>
      </div>

      {/* Parking Zones */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Parking Zones</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {parkingZones.map((zone) => {
            const occupancy = (zone.occupied / zone.total) * 100
            return (
              <Card key={zone.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{zone.name}</CardTitle>
                  <StatusBadge occupancy={occupancy} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Occupied</span>
                      <span className="font-medium">
                        {zone.occupied}/{zone.total}
                      </span>
                    </div>
                    <Progress value={occupancy} className="h-2" />
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Available: </span>
                    <span className="font-medium text-green-500">{zone.available}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live Vehicle Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Live Vehicle Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVehicles.map((vehicle, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="font-mono font-medium">{vehicle.plate}</p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.fuel} • {vehicle.time}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      vehicle.decision === "Allow"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {vehicle.decision}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pollution Meter */}
        <Card>
          <CardHeader>
            <CardTitle>Pollution Meter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Fuel Type Distribution</p>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={fuelData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                      {fuelData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {fuelData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Pollution Index (Today)</p>
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
              <p className="text-sm text-yellow-500 mt-2">⚠ Current level: 90 (Warning threshold exceeded)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
