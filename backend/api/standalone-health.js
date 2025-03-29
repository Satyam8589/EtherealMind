// Standalone health check with no dependencies
module.exports = (req, res) => {
  // Set CORS headers directly
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple health check response
  const data = {
    status: 'healthy',
    message: 'Standalone health endpoint is operational',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'unknown',
    serverless: true
  };
  
  // Send JSON response
  res.status(200).json(data);
}; 