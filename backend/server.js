const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const vehicleRoutes = require('./routes/vehicleRoutes');
const zoneRoutes = require('./routes/zoneRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = require('./config/db');
connectDB();


// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/zones', zoneRoutes);

// WebSocket for real-time updates
io.on('connection', (socket) => {
  console.log('🔌 New client connected');
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});