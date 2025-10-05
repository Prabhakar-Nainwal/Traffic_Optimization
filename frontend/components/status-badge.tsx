import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  occupancy: number
}

export function StatusBadge({ occupancy }: StatusBadgeProps) {
  const getStatus = () => {
    if (occupancy < 70) return { label: "Normal", color: "bg-green-500" }
    if (occupancy < 90) return { label: "Warning", color: "bg-yellow-500" }
    return { label: "Critical", color: "bg-red-500" }
  }

  const status = getStatus()

  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2 w-2 rounded-full", status.color)} />
      <span className="text-sm text-muted-foreground">{status.label}</span>
    </div>
  )
}
