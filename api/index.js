require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http'); // Add this

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000', // Allow local development
  'https://task-manager-front-orcin.vercel.app', // Allow frontend hosted on Vercel
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

// MongoDB Connection String (from .env)
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection with Enhanced Options
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes (Adjust paths to point to /backend/routes)
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/tasks', require('../backend/routes/tasks'));

// Export the app as a serverless function
module.exports = serverless(app);