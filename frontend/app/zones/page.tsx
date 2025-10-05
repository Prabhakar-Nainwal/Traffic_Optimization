"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"

export default function ZonesPage() {
  const [zones, setZones] = useState([
    { id: 1, name: "Zone A", total: 100, occupied: 65 },
    { id: 2, name: "Zone B", total: 80, occupied: 72 },
    { id: 3, name: "Zone C", total: 120, occupied: 45 },
    { id: 4, name: "Zone D", total: 90, occupied: 85 },
  ])

  const [isOpen, setIsOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<any>(null)
  const [formData, setFormData] = useState({ name: "", total: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingZone) {
      setZones(
        zones.map((z) => (z.id === editingZone.id ? { ...z, name: formData.name, total: Number(formData.total) } : z)),
      )
    } else {
      setZones([...zones, { id: Date.now(), name: formData.name, total: Number(formData.total), occupied: 0 }])
    }
    setIsOpen(false)
    setFormData({ name: "", total: "" })
    setEditingZone(null)
  }

  const handleEdit = (zone: any) => {
    setEditingZone(zone)
    setFormData({ name: zone.name, total: zone.total.toString() })
    setIsOpen(true)
  }

  const handleDelete = (id: number) => {
    setZones(zones.filter((z) => z.id !== id))
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parking Zone Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage parking zones</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingZone(null)
                setFormData({ name: "", total: "" })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingZone ? "Edit Zone" : "Add New Zone"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Zone Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Zone E"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total Capacity</Label>
                <Input
                  id="total"
                  type="number"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  placeholder="e.g., 100"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingZone ? "Update Zone" : "Create Zone"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => {
          const occupancy = (zone.occupied / zone.total) * 100
          return (
            <Card key={zone.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{zone.name}</CardTitle>
                    <StatusBadge occupancy={occupancy} />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(zone)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(zone.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Capacity</span>
                  <span className="font-medium">{zone.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupied</span>
                  <span className="font-medium">{zone.occupied}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium text-green-500">{zone.total - zone.occupied}</span>
                </div>
                <div className="pt-2 text-sm">
                  <span className="text-muted-foreground">Occupancy: </span>
                  <span className="font-medium">{occupancy.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
