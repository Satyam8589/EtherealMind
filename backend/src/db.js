/**
 * Simple in-memory database with file persistence
 */
const fs = require('fs');
const path = require('path');

// Database file paths
const DB_DIR = path.join(__dirname, '../data');
const POSTS_FILE = path.join(DB_DIR, 'posts.json');
const STATS_FILE = path.join(DB_DIR, 'stats.json');

// Initialize database
function initDB() {
  // Create data directory if it doesn't exist
  if (!fs.existsSync(DB_DIR)) {
    try {
      fs.mkdirSync(DB_DIR, { recursive: true });
      console.log('Created data directory:', DB_DIR);
    } catch (err) {
      console.error('Failed to create data directory:', err);
    }
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

// Add a new post
function addPost(post) {
  try {
    // Get current posts
    const posts = getPosts();
    
    // Generate an ID if not provided
    const newPost = {
      ...post,
      id: post.id || `post_${Date.now()}`,
      createdAt: post.createdAt || new Date().toISOString()
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

// Delete a post by ID
function deletePost(postId) {
  try {
    const posts = getPosts();
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

// Initialize database when module is loaded
initDB();

// Export database functions
module.exports = {
  getPosts,
  getStats,
  addPost,
  updateStats,
  deletePost
}; 