// Standalone health check endpoint for Vercel with CORS support
const corsHandler = require('../src/corsHandler');

const healthCheck = (req, res) => {
  console.log('Health check requested from:', req.headers['x-forwarded-for'] || req.socket.remoteAddress);
  
  const healthData = { 
    status: 'healthy',
    message: 'Backend is running and healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    provider: 'vercel',
    uptime: process.uptime ? process.uptime() + ' seconds' : 'N/A'
  };

  console.log('Sending health data:', JSON.stringify(healthData, null, 2));
  res.status(200).json(healthData);
};

// Export with CORS handler wrapper
module.exports = corsHandler(healthCheck); 