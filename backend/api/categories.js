// Serverless function to handle categories
const categories = [
  {
    id: "meditation",
    name: "Meditation",
    description: "Explore meditation techniques, mindfulness practices, and their benefits for mental wellbeing.",
    icon: "🧘"
  },
  {
    id: "dreams",
    name: "Dreams",
    description: "Discover the fascinating world of dreams, lucid dreaming, and dream interpretation.",
    icon: "💭"
  },
  {
    id: "healing",
    name: "Healing",
    description: "Learn about natural healing methods, holistic approaches to wellness, and alternative therapies.",
    icon: "🌿"
  },
  {
    id: "spirituality",
    name: "Spirituality",
    description: "Explore spiritual practices, philosophies, and paths to inner peace and enlightenment.",
    icon: "✨"
  },
  {
    id: "psychology",
    name: "Psychology",
    description: "Understand the mind, behavior, and psychological principles that shape our thoughts and actions.",
    icon: "🧠"
  }
];

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
    // Return categories data
    res.status(200).json({
      status: 'success',
      message: 'Categories retrieved successfully',
      data: categories,
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