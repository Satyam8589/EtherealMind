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

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../data/uploads')));

// Health check endpoint with detailed status
app.get('/health', (req, res) => {
  const healthData = {
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    origin: req.headers['host'] || 'unknown',
    cors: {
      origin: req.headers.origin || 'unknown',
      allowed: corsOptions.origin.includes(req.headers.origin || '')
    }
  };
  
  console.log('Health check requested:', healthData);
  res.status(200).json(healthData);
});

// API health check with more details
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'success',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    origin: req.headers['host'] || 'unknown',
    cors: {
      origin: req.headers.origin || 'unknown',
      allowed: corsOptions.origin.includes(req.headers.origin || '')
    }
  };
  
  console.log('API health check requested:', healthData);
  res.status(200).json(healthData);
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

// Add a new post endpoint with image support
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
    
    // Add the post to the database (now handles image upload internally)
    const newPost = db.addPost(postData);
    
    // Return the full URL for the image if it exists
    if (newPost.imageUrl) {
      newPost.imageUrl = `${req.protocol}://${req.get('host')}/${newPost.imageUrl}`;
    }
    
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

// Get saved posts for a user
app.get('/api/saved-posts/:userId', async (req, res) => {
  try {
    const db = require('./db');
    const userId = req.params.userId;
    
    console.log(`GET /api/saved-posts/${userId} requested`);
    
    // Get saved posts from database
    const savedPosts = db.getSavedPosts(userId);
    
    // If no saved posts found, return empty array
    if (!savedPosts || savedPosts.length === 0) {
      console.log(`No saved posts found for user ${userId}`);
      return res.status(200).json({
        status: 'success',
        message: 'No saved posts found',
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`Found ${savedPosts.length} saved posts for user ${userId}`);
    
    // Transform the saved posts to include the full post data 
    // and mark them as saved
    const savedPostsWithData = savedPosts.map(saved => {
      // If we already have fullPost data, use it directly
      if (saved.fullPost) {
        return {
          ...saved,
          post: {
            ...saved.fullPost,
            isSaved: true
          }
        };
      }
      
      // Otherwise try to get the post from all posts (legacy support)
      const allPosts = db.getPosts();
      const fullPost = allPosts.find(post => String(post.id) === String(saved.postId));
      
      return {
        ...saved,
        post: fullPost ? { 
          ...fullPost, 
          isSaved: true 
        } : {
          id: saved.postId,
          title: saved.title || 'Unknown Title',
          content: saved.preview || 'No content available',
          category: saved.category || 'Uncategorized',
          isSaved: true
        }
      };
    });
    
    console.log(`Returning ${savedPostsWithData.length} saved posts with full data`);
    
    res.status(200).json({
      status: 'success',
      message: 'Saved posts retrieved successfully',
      data: savedPostsWithData,
      count: savedPostsWithData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving saved posts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve saved posts',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Save a post for a user
app.post('/api/saved-posts/:userId', async (req, res) => {
  try {
    const db = require('./db');
    const userId = req.params.userId;
    const post = req.body;
    
    console.log(`POST /api/saved-posts/${userId} requested with data:`, post);
    
    if (!post || !post.id) {
      console.log('Invalid post data: post ID is required');
      return res.status(400).json({
        status: 'error',
        message: 'Invalid post data: post ID is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate required fields
    if (!post.title) {
      console.log('Invalid post data: title is required');
      return res.status(400).json({
        status: 'error',
        message: 'Invalid post data: title is required',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`Saving post ${post.id} for user ${userId}`);
    const success = db.savePostForUser(userId, post);
    
    if (success) {
      // Get updated saved posts
      const savedPosts = db.getSavedPosts(userId);
      
      // Return the newly saved post with full details
      const savedPost = savedPosts.find(sp => String(sp.postId) === String(post.id));
      
      console.log(`Post ${post.id} successfully saved for user ${userId}`);
      
      res.status(201).json({
        status: 'success',
        message: 'Post saved successfully',
        data: savedPost,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`Post ${post.id} is already saved for user ${userId}`);
      
      res.status(200).json({
        status: 'warning',
        message: 'Post is already saved',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save post',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Remove a saved post for a user
app.delete('/api/saved-posts/:userId/:postId', (req, res) => {
  try {
    const db = require('./db');
    const userId = req.params.userId;
    const postId = req.params.postId;
    
    console.log(`DELETE /api/saved-posts/${userId}/${postId} requested`);
    
    const success = db.removeSavedPost(userId, postId);
    
    if (success) {
      console.log(`Post ${postId} successfully removed for user ${userId}`);
      
      res.status(200).json({
        status: 'success',
        message: 'Post removed from saved items',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`Post ${postId} not found in saved posts for user ${userId}`);
      
      res.status(404).json({
        status: 'error',
        message: 'Saved post not found',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error removing saved post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove saved post',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Upload image endpoint
app.post('/api/upload-image', (req, res) => {
  try {
    const db = require('./db');
    const imageData = req.body.image;
    
    if (!imageData || !imageData.startsWith('data:image')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid image data',
        timestamp: new Date().toISOString()
      });
    }
    
    const imagePath = db.saveImage(imageData);
    const imageUrl = `${req.protocol}://${req.get('host')}/${imagePath}`;
    
    res.status(201).json({
      status: 'success',
      message: 'Image uploaded successfully',
      data: { imageUrl },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload image',
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
    console.log('CORS enabled for:', corsOptions.origin);
  });
}

// Export for serverless use
module.exports = app; 