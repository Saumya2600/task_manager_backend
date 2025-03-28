// /backend/api/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://task-manager-front-orcin.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Debug route at the root
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// MongoDB Connection String (from .env)
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in the environment variables');
}

// MongoDB Connection with Enhanced Options
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Connection Error:', err));
} else {
  console.log('MongoDB already connected');
}

// Routes
console.log('Registering routes...');
app.use('/api/auth', require('../routes/auth'));
app.use('/api/tasks', require('../routes/tasks'));

// Log all registered routes for debugging
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`Route: ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    console.log(`Router: ${middleware.regexp}`);
  }
});

// Export as a serverless function
module.exports.handler = serverless(app);