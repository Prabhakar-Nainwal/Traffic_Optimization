import React from 'react';
import { Home, Car, Settings, FileText } from 'lucide-react';

const Navbar = ({ activeScreen, setActiveScreen }) => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Traffic Optimizer</h1>
        <p className="text-xs text-gray-400 mt-1">ANPR Management System</p>
      </div>
      
      <nav className="flex-1 p-4">
        <button
          onClick={() => setActiveScreen('dashboard')}
          className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition ${
            activeScreen === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
        >
          <Home size={20} className="mr-3" />
          Dashboard
        </button>
        
        <button
          onClick={() => setActiveScreen('vehicles')}
          className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition ${
            activeScreen === 'vehicles' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
        >
          <Car size={20} className="mr-3" />
          Vehicle Logs
        </button>
        
        <button
          onClick={() => setActiveScreen('zones')}
          className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition ${
            activeScreen === 'zones' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
        >
          <Settings size={20} className="mr-3" />
          Parking Zones
        </button>
        
        <button
          onClick={() => setActiveScreen('logs')}
          className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition ${
            activeScreen === 'logs' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
        >
          <FileText size={20} className="mr-3" />
          Logs & Reports
        </button>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <p>System Status: <span className="text-green-400">Online</span></p>
          <p className="mt-1">ANPR: <span className="text-green-400">Active</span></p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;