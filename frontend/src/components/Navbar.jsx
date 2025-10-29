import React from 'react';
import { Home, Car, Settings, FileText } from 'lucide-react';

const Navbar = ({ activeScreen, setActiveScreen }) => {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700 flex" >
        <h1 className="text-2xl font-bold text-left">
          <span className="text-white">Vision</span>
          <span className="text-blue-400">Park</span>
        </h1>
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

        {/* <button class="Btn" style={{marginTop:'21rem', marginLeft:'2.5rem'}}>
          <div class="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
          <div class="text">Logout</div>
          </button> */}
        
      </nav>
    </div>
  );
};

export default Navbar;