require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const socketIo = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000', // Allow local development
  'https://task-manager-front-orcin.vercel.app/', // Replace with your frontend's Vercel URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
    credentials: true, // Allow cookies and credentials
  })
);

// Middleware
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