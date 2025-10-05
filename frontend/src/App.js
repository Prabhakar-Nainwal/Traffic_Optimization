import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import VehicleManagement from "./pages/VehicleManagement"
import ParkingZones from "./pages/ParkingZones"
import Logs from "./pages/Logs"
import "./assets/css/layout.css"

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehicleManagement />} />
            <Route path="/zones" element={<ParkingZones />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
