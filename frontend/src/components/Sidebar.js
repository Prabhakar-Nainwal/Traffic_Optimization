import { NavLink } from "react-router-dom"
import { LayoutDashboard, Car, MapPin, FileText } from "lucide-react"
import "../assets/css/sidebar.css"

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">ParkVision</h1>
        <p className="sidebar-subtitle">ANPR System</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/vehicles" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
          <Car size={20} />
          <span>Vehicles</span>
        </NavLink>

        <NavLink to="/zones" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
          <MapPin size={20} />
          <span>Parking Zones</span>
        </NavLink>

        <NavLink to="/logs" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
          <FileText size={20} />
          <span>Logs & Reports</span>
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
