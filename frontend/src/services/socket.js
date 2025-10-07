import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Initialize socket connection
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Connection event handlers
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error);
});

// Subscribe to new vehicle entries
export const subscribeToVehicles = (callback) => {
  socket.on('newVehicle', (vehicle) => {
    console.log('🚗 New vehicle detected:', vehicle);
    callback(vehicle);
  });

  // Return unsubscribe function
  return () => {
    socket.off('newVehicle');
  };
};

// Subscribe to vehicle exits
export const subscribeToVehicleExits = (callback) => {
  socket.on('vehicleExit', (vehicle) => {
    console.log('🚗 Vehicle exited:', vehicle);
    callback(vehicle);
  });

  return () => {
    socket.off('vehicleExit');
  };
};

// Subscribe to zone updates
export const subscribeToZones = (callback) => {
  socket.on('zoneUpdated', (zone) => {
    console.log('🅿️ Zone updated:', zone);
    callback(zone);
  });

  return () => {
    socket.off('zoneUpdated');
  };
};

// Subscribe to zone creation
export const subscribeToZoneCreation = (callback) => {
  socket.on('zoneCreated', (zone) => {
    console.log('🅿️ Zone created:', zone);
    callback(zone);
  });

  return () => {
    socket.off('zoneCreated');
  };
};

// Subscribe to zone deletion
export const subscribeToZoneDeletion = (callback) => {
  socket.on('zoneDeleted', (data) => {
    console.log('🅿️ Zone deleted:', data);
    callback(data);
  });

  return () => {
    socket.off('zoneDeleted');
  };
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Reconnect socket
export const reconnectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export default socket;