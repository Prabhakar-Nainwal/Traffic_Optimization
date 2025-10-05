import "../assets/css/components.css"

function ProgressBar({ value }) {
  let colorClass = "green"

  if (value >= 90) {
    colorClass = "red"
  } else if (value >= 70) {
    colorClass = "yellow"
  }

  return (
    <div className="progress-container">
      <div className={`progress-bar ${colorClass}`} style={{ width: `${value}%` }} />
    </div>
  )
}

export default ProgressBar
