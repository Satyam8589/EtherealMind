// Serverless function to handle post statistics
const mockStats = {
  totalPosts: 5,
  totalViews: 1247,
  popularCategories: [
    { name: "Meditation", count: 18 },
    { name: "Dreams", count: 12 },
    { name: "Healing", count: 8 }
  ],
  lastPostDate: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
};

// Set CORS headers
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return stats data
    res.status(200).json({
      status: 'success',
      message: 'Stats retrieved successfully',
      data: mockStats,
      timestamp: new Date().toISOString(),
      origin: req.headers['host'] || 'unknown'
    });
  } else {
    res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }
}; 