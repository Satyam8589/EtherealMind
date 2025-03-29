const express = require('express');
const router = express.Router();
const {
  getSavedPosts,
  savePost,
  unsavePost,
  checkIfPostSaved
} = require('../controllers/savedPostsController');

// Middleware to log requests
const logRequests = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Prevent sending headers if they've already been sent
  if (res.headersSent) {
    console.error('Error occurred after headers sent:', err);
    return next(err);
  }
  
  // Handle circular JSON references
  let errorMessage = err.message || 'Internal server error';
  let errorCode = err.code || 'INTERNAL_ERROR';
  
  // Check for circular structure errors specifically
  if (err.message && err.message.includes('circular structure to JSON')) {
    errorMessage = 'Cannot serialize response data';
    errorCode = 'CIRCULAR_STRUCTURE';
  }
  
  console.error('API Error:', errorMessage);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: errorMessage,
      code: errorCode
    }
  });
};

// Apply middleware
router.use(logRequests);

// Get all saved posts for a user
router.get('/:userId', (req, res, next) => {
  // The controller already handles sending the response
  getSavedPosts(req, res).catch(next);
});

// Save a post for a user
router.post('/:userId', (req, res, next) => {
  // The controller already handles sending the response
  savePost(req, res).catch(next);
});

// Unsave a post for a user
router.delete('/:userId/:postId', (req, res, next) => {
  // The controller already handles sending the response
  unsavePost(req, res).catch(next);
});

// Check if a post is saved by a user
router.get('/:userId/:postId', (req, res, next) => {
  // The controller already handles sending the response
  checkIfPostSaved(req, res).catch(next);
});

// Apply error handling middleware
router.use(errorHandler);

module.exports = router; 