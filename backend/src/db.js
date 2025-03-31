/**
 * Simple in-memory database with file persistence
 */
const fs = require('fs');
const path = require('path');

// Database file paths
const DB_DIR = path.join(__dirname, '../data');
const POSTS_FILE = path.join(DB_DIR, 'posts.json');
const STATS_FILE = path.join(DB_DIR, 'stats.json');
const UPLOADS_DIR = path.join(DB_DIR, 'uploads');

// Initialize database
function initDB() {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
      console.log('Created data directory:', DB_DIR);
    }

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      console.log('Created uploads directory:', UPLOADS_DIR);
    }

    // Initialize posts file if it doesn't exist
    if (!fs.existsSync(POSTS_FILE)) {
      try {
        // Get sample posts from the API file
        const apiPostsPath = path.join(__dirname, '../api/saved-posts.js');
        let initialPosts = [];
        
        if (fs.existsSync(apiPostsPath)) {
          const content = fs.readFileSync(apiPostsPath, 'utf8');
          const mockPostsMatch = content.match(/const\s+mockPosts\s*=\s*(\[[\s\S]*?\]);/);
          
          if (mockPostsMatch && mockPostsMatch[1]) {
            // Use eval to parse the posts array (simple solution for this context)
            // eslint-disable-next-line no-eval
            initialPosts = eval(mockPostsMatch[1]);
          }
        }
        
        fs.writeFileSync(POSTS_FILE, JSON.stringify(initialPosts, null, 2));
        console.log('Initialized posts database with sample data');
      } catch (err) {
        console.error('Failed to initialize posts file:', err);
        // Create empty posts file
        fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2));
      }
    }

    // Initialize stats file if it doesn't exist
    if (!fs.existsSync(STATS_FILE)) {
      try {
        const initialStats = {
          totalPosts: 0,
          totalViews: 0,
          lastUpdated: new Date().toISOString()
        };
        fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2));
        console.log('Initialized stats database');
      } catch (err) {
        console.error('Failed to initialize stats file:', err);
      }
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Get all posts
function getPosts() {
  try {
    const data = fs.readFileSync(POSTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading posts file:', err);
    return [];
  }
}

// Get stats
function getStats() {
  try {
    const data = fs.readFileSync(STATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading stats file:', err);
    return { totalPosts: 0, totalViews: 0, lastUpdated: new Date().toISOString() };
  }
}

// Save an uploaded image
function saveImage(imageData, fileName) {
  try {
    // Remove the data:image/[type];base64, prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename if not provided
    const finalFileName = fileName || `image_${Date.now()}.jpg`;
    const imagePath = path.join(UPLOADS_DIR, finalFileName);
    
    // Save the image
    fs.writeFileSync(imagePath, buffer);
    
    // Return the relative path for storage in the database
    return `uploads/${finalFileName}`;
  } catch (err) {
    console.error('Error saving image:', err);
    throw err;
  }
}

// Add a new post with image support
function addPost(post) {
  try {
    // Get current posts
    const posts = getPosts();
    
    let imageUrl = post.imageUrl;
    
    // If there's a base64 image, save it
    if (post.image && post.image.startsWith('data:image')) {
      imageUrl = saveImage(post.image);
    }
    
    // Generate an ID if not provided
    const newPost = {
      ...post,
      id: post.id || `post_${Date.now()}`,
      createdAt: post.createdAt || new Date().toISOString(),
      imageUrl: imageUrl // Add the image URL
    };
    
    // Add to beginning of array
    posts.unshift(newPost);
    
    // Save to file
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    
    // Update stats
    updateStats({ totalPosts: posts.length });
    
    return newPost;
  } catch (err) {
    console.error('Error adding post:', err);
    throw err;
  }
}

// Update stats
function updateStats(newStats) {
  try {
    const stats = getStats();
    const updatedStats = {
      ...stats,
      ...newStats,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(STATS_FILE, JSON.stringify(updatedStats, null, 2));
    return updatedStats;
  } catch (err) {
    console.error('Error updating stats:', err);
    return null;
  }
}

// Delete a post and its image
function deletePost(postId) {
  try {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    
    if (post && post.imageUrl && post.imageUrl.startsWith('uploads/')) {
      // Delete the image file if it exists
      const imagePath = path.join(DB_DIR, post.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const filteredPosts = posts.filter(post => post.id !== postId);
    
    if (posts.length === filteredPosts.length) {
      // No post was deleted
      return false;
    }
    
    // Save filtered posts
    fs.writeFileSync(POSTS_FILE, JSON.stringify(filteredPosts, null, 2));
    
    // Update stats
    updateStats({ totalPosts: filteredPosts.length });
    
    return true;
  } catch (err) {
    console.error('Error deleting post:', err);
    return false;
  }
}

// Get saved posts for a user
function getSavedPosts(userId) {
  try {
    const savedPostsPath = path.join(DB_DIR, `saved_posts_${userId}.json`);
    if (fs.existsSync(savedPostsPath)) {
      const data = fs.readFileSync(savedPostsPath, 'utf8');
      const savedPosts = JSON.parse(data);
      
      // Sort by most recently saved
      return savedPosts.sort((a, b) => 
        new Date(b.savedAt) - new Date(a.savedAt)
      );
    }
    return [];
  } catch (err) {
    console.error('Error reading saved posts:', err);
    return [];
  }
}

// Save a post for a user
function savePostForUser(userId, post) {
  try {
    // Ensure the DB directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
      console.log('Created data directory:', DB_DIR);
    }
    
    const savedPostsPath = path.join(DB_DIR, `saved_posts_${userId}.json`);
    let savedPosts = getSavedPosts(userId);
    
    // Check if post is already saved (compare as strings to handle different types)
    const existingIndex = savedPosts.findIndex(saved => 
      String(saved.postId) === String(post.id)
    );
    
    if (existingIndex === -1) {
      // Add new saved post with more complete data
      const savedPost = {
        postId: post.id,
        title: post.title,
        category: post.category,
        savedAt: new Date().toISOString(),
        userId: userId,
        preview: post.content?.substring(0, 150) + '...', // Add a preview of the content
        imageUrl: post.imageUrl, // Store the image URL
        fullPost: {  // Store the full post data for easier retrieval
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          imageUrl: post.imageUrl,
          createdAt: post.createdAt || new Date().toISOString()
        }
      };
      
      savedPosts.unshift(savedPost); // Add to beginning of array
      fs.writeFileSync(savedPostsPath, JSON.stringify(savedPosts, null, 2));
      console.log(`Post ${post.id} saved for user ${userId}`);
      return true;
    }
    
    console.log(`Post ${post.id} already saved for user ${userId}`);
    return false;
  } catch (err) {
    console.error('Error saving post for user:', err);
    throw err; // Rethrow to allow handling in the API
  }
}

// Remove a saved post for a user
function removeSavedPost(userId, postId) {
  try {
    const savedPostsPath = path.join(DB_DIR, `saved_posts_${userId}.json`);
    const savedPosts = getSavedPosts(userId);
    
    // Filter out the post (compare as strings to handle different types)
    const updatedPosts = savedPosts.filter(saved => 
      String(saved.postId) !== String(postId)
    );
    
    if (updatedPosts.length < savedPosts.length) {
      fs.writeFileSync(savedPostsPath, JSON.stringify(updatedPosts, null, 2));
      console.log(`Post ${postId} removed for user ${userId}`);
      return true;
    }
    
    console.log(`Post ${postId} not found in saved posts for user ${userId}`);
    return false;
  } catch (err) {
    console.error('Error removing saved post:', err);
    throw err; // Rethrow to allow handling in the API
  }
}

// Initialize database when module is loaded
initDB();

// Export database functions
module.exports = {
  getPosts,
  getStats,
  addPost,
  updateStats,
  deletePost,
  getSavedPosts,
  savePostForUser,
  removeSavedPost,
  saveImage
}; 