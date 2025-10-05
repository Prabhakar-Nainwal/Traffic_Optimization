import "../assets/css/components.css"

function StatusBadge({ occupancy }) {
  let status = "available"
  let text = "Available"

  if (occupancy >= 90) {
    status = "full"
    text = "Full"
  } else if (occupancy >= 70) {
    status = "filling"
    text = "Filling Up"
  }

  return <span className={`status-badge status-${status}`}>{text}</span>
}

export default StatusBadge
