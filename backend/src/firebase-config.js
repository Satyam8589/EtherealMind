const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

// Load Firebase configuration from environment variables
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'etherealmind-dev',
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://etherealmind-dev.firebaseio.com'
};

// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';
let serviceAccount;
let initError = null;

// Create a safer way to access environment variables
const getEnvVar = (name, defaultValue = '') => {
  const value = process.env[name];
  return value !== undefined ? value : defaultValue;
};

try {
  // Try to load service account credentials
  if (getEnvVar('GOOGLE_APPLICATION_CREDENTIALS')) {
    // If the path to credentials file is provided as an environment variable
    console.log('Using service account from GOOGLE_APPLICATION_CREDENTIALS');
    // Don't require the file directly as it might not exist in all environments
    // It will be picked up automatically by the Firebase SDK
  } else if (getEnvVar('FIREBASE_SERVICE_ACCOUNT_JSON')) {
    // If the credentials are provided as a JSON string in environment variables
    console.log('Using service account from FIREBASE_SERVICE_ACCOUNT_JSON');
    try {
      serviceAccount = JSON.parse(getEnvVar('FIREBASE_SERVICE_ACCOUNT_JSON'));
    } catch (parseError) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', parseError.message);
      initError = {
        type: 'credentials_parsing',
        message: parseError.message,
        stack: isProduction ? null : parseError.stack
      };
    }
  } else {
    console.log('No explicit credentials found, using application default credentials');
  }
} catch (error) {
  console.error('Error loading Firebase credentials:', error);
  console.log('Falling back to application default credentials');
  initError = {
    type: 'credentials_loading',
    message: error.message,
    stack: isProduction ? null : error.stack
  };
}

// Initialize Firebase Admin
let firebaseApp, db, usersCollection, savedPostsCollection, fieldValue;

try {
  // Initialize the Firebase Admin app
  if (serviceAccount) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      ...firebaseConfig
    });
  } else {
    try {
      // Use application default credentials
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        ...firebaseConfig
      });
    } catch (credError) {
      console.error('Error initializing Firebase with application default credentials:', credError.message);
      throw credError; // Re-throw to be caught by the outer try/catch
    }
  }

  // Initialize Firestore
  db = getFirestore();
  
  // Connect to Firebase emulator in development if configured
  const useEmulator = getEnvVar('USE_FIREBASE_EMULATOR') === 'true';
  if (!isProduction && useEmulator) {
    const emulatorHost = getEnvVar('FIRESTORE_EMULATOR_HOST', 'localhost:8080');
    db.settings({
      host: emulatorHost,
      ssl: false
    });
    console.log(`Connected to Firebase emulator at ${emulatorHost}`);
  }

  // Define collections
  usersCollection = db.collection('users');
  savedPostsCollection = db.collection('savedPosts');
  
  // Get Firestore FieldValue for timestamps and other operations
  const { FieldValue } = admin.firestore;
  fieldValue = FieldValue;

  console.log('Firebase initialized successfully');
  
  // Export Firebase components
  module.exports = {
    admin,
    db,
    usersCollection,
    savedPostsCollection,
    FieldValue: fieldValue,
    firebaseApp,
    error: initError,
    config: {
      projectId: firebaseConfig.projectId,
      usingEmulator: !isProduction && useEmulator,
      emulatorHost: !isProduction && useEmulator 
        ? getEnvVar('FIRESTORE_EMULATOR_HOST', 'localhost:8080')
        : null
    }
  };
} catch (error) {
  console.error('Firebase initialization error:', error);
  initError = {
    type: 'initialization',
    message: error.message,
    stack: isProduction ? null : error.stack
  };
  
  module.exports = {
    admin: null,
    db: null,
    usersCollection: null,
    savedPostsCollection: null,
    FieldValue: null,
    firebaseApp: null,
    error: initError,
    config: {
      projectId: firebaseConfig.projectId,
      usingEmulator: false,
      emulatorHost: null
    }
  };
} 