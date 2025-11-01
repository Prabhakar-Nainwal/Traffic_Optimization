import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import VehicleManagement from './pages/VehicleManagement';
import ZoneManagement from './pages/ZoneManagement';
import LogsReports from './pages/LogsReports';
import TrafficAnalytics from './pages/TrafficAnalytics';


function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-100">
      <Navbar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      
      <div className="flex-1 overflow-auto p-8">
        {activeScreen === 'dashboard' && <Dashboard />}
        {activeScreen === 'vehicles' && <VehicleManagement />}
        {activeScreen === 'zones' && <ZoneManagement />}
        {activeScreen === 'logs' && <LogsReports />}
        {activeScreen === 'TrafficAnalytics' && <TrafficAnalytics />}
      </div>
    </div>
  );
}

export default App;