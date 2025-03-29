const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import Firebase configuration
let firebaseComponents = {};
try {
  firebaseComponents = require('./firebase-config');
  console.log('Firebase components loaded');
} catch (error) {
  console.error('Failed to load Firebase components:', error.message);
}

// Create Express app
const app = express();

// Get CORS settings from environment or use default
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(',');
console.log(`Configuring CORS to accept requests from: ${corsOrigins.join(', ')}`);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS policy. Allowed origins: ${corsOrigins.join(', ')}`);
      // In development, allow all origins for easier debugging
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(morgan('dev'));

// In-memory fallback for when Firebase is not available
const inMemoryDB = {
  users: [],
  savedPosts: []
};

// Make Firebase and fallback DB available for routes
app.locals.firebase = firebaseComponents;
app.locals.inMemoryDB = inMemoryDB;
app.locals.useFirebase = !!firebaseComponents.db;

// Import routes
const savedPostsRoutes = require('./routes/savedPosts');

// Routes
app.use('/api/saved-posts', savedPostsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EtherealMind API' });
});

// Health check route
app.get('/health', (req, res) => {
  const firebaseStatus = {
    connected: !!firebaseComponents.db,
    error: firebaseComponents.error || null,
    emulator: process.env.USE_FIREBASE_EMULATOR === 'true' 
      ? { enabled: true, host: process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080' } 
      : { enabled: false }
  };

  const memoryDbStats = {
    users: inMemoryDB.users.length,
    savedPosts: inMemoryDB.savedPosts.length
  };

  res.json({ 
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    firebaseConnected: firebaseStatus.connected,
    usingInMemory: !firebaseStatus.connected,
    storageMode: firebaseStatus.connected ? 'firebase' : 'in-memory',
    firebase: firebaseStatus,
    memoryDb: memoryDbStats,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime() + ' seconds'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Initialize server
const startServer = async () => {
  try {
    if (firebaseComponents.db) {
      console.log('Firebase initialized successfully, using Firestore database');
    } else {
      console.log('Running with in-memory database (Firebase not available)');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
      console.log(`Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer(); 