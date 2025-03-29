/**
 * EtherealMind Backend Server
 * Simple Express server that serves static files and API endpoints
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    origin: req.headers['host'] || 'unknown'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    origin: req.headers['host'] || 'unknown'
  });
});

// Posts endpoint
app.get('/api/saved-posts', (req, res) => {
  try {
    // Try to load mock data from file if available
    const mockDataPath = path.join(__dirname, '../api/saved-posts.js');
    
    if (fs.existsSync(mockDataPath)) {
      // If file exists, extract the mockPosts data
      const content = fs.readFileSync(mockDataPath, 'utf8');
      const mockPostsMatch = content.match(/const\s+mockPosts\s*=\s*(\[[\s\S]*?\]);/);
      
      if (mockPostsMatch && mockPostsMatch[1]) {
        try {
          // Use eval for simplicity (in production, a JSON file would be better)
          // eslint-disable-next-line no-eval
          const mockPosts = eval(mockPostsMatch[1]);
          
          return res.status(200).json({
            status: 'success',
            message: 'Posts retrieved successfully',
            data: mockPosts,
            timestamp: new Date().toISOString(),
            origin: req.headers['host'] || 'unknown'
          });
        } catch (evalError) {
          console.error('Error evaluating mock posts:', evalError);
        }
      }
    }
    
    // Fallback to empty array if file doesn't exist or can't be parsed
    res.status(200).json({
      status: 'success',
      message: 'No posts found',
      data: [],
      timestamp: new Date().toISOString(),
      origin: req.headers['host'] || 'unknown'
    });
  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve posts',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  try {
    // Try to load categories from file if available
    const categoriesPath = path.join(__dirname, '../api/categories.js');
    
    if (fs.existsSync(categoriesPath)) {
      // If file exists, extract the categories data
      const content = fs.readFileSync(categoriesPath, 'utf8');
      const categoriesMatch = content.match(/const\s+categories\s*=\s*(\[[\s\S]*?\]);/);
      
      if (categoriesMatch && categoriesMatch[1]) {
        try {
          // Use eval for simplicity (in production, a JSON file would be better)
          // eslint-disable-next-line no-eval
          const categories = eval(categoriesMatch[1]);
          
          return res.status(200).json({
            status: 'success',
            message: 'Categories retrieved successfully',
            data: categories,
            timestamp: new Date().toISOString(),
            origin: req.headers['host'] || 'unknown'
          });
        } catch (evalError) {
          console.error('Error evaluating categories:', evalError);
        }
      }
    }
    
    // Fallback to empty array if file doesn't exist or can't be parsed
    res.status(200).json({
      status: 'success',
      message: 'No categories found',
      data: [],
      timestamp: new Date().toISOString(),
      origin: req.headers['host'] || 'unknown'
    });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve categories',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Catch all route - serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Only start the server if directly run (not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for serverless use
module.exports = app; 