import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error);
});

// Subscribe to incoming vehicles
export const subscribeToIncomingVehicles = (callback) => {
  socket.on('newIncomingVehicle', (vehicle) => {
    console.log('🚨 New incoming vehicle from ANPR:', vehicle);
    callback(vehicle);
  });

  return () => {
    socket.off('newIncomingVehicle');
  };
};

// Subscribe to processed vehicles
export const subscribeToProcessedVehicles = (callback) => {
  socket.on('vehicleProcessed', (data) => {
    console.log('✅ Vehicle processed:', data);
    callback(data);
  });

  return () => {
    socket.off('vehicleProcessed');
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

export default socket;