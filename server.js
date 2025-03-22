require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// MongoDB Connection String (from .env)
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection with Enhanced Options
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Start Server
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Socket.io Setup
const io = socketIo(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});