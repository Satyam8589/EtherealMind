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

// Posts endpoint - use the database module
app.get('/api/saved-posts', (req, res) => {
  try {
    // Import the database module
    const db = require('./db');
    
    // Get posts from the database
    const posts = db.getPosts();
    
    // Update view stats
    db.updateStats({ totalViews: db.getStats().totalViews + 1 });
    
    res.status(200).json({
      status: 'success',
      message: 'Posts retrieved successfully',
      data: posts,
      count: posts.length,
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

// Add a new post endpoint
app.post('/api/saved-posts', (req, res) => {
  try {
    const db = require('./db');
    
    // Get post data from request body
    const postData = req.body;
    
    // Validate post data
    if (!postData || !postData.title || !postData.content) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid post data. Title and content are required.',
        timestamp: new Date().toISOString()
      });
    }
    
    // Add the post to the database
    const newPost = db.addPost(postData);
    
    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: newPost,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create post',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  try {
    const db = require('./db');
    
    // Get stats from the database
    const stats = db.getStats();
    
    res.status(200).json({
      status: 'success',
      message: 'Stats retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve stats',
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