// Serverless function to handle post creation
let posts = [];

// Initialize with sample posts
try {
  // Try to read mock posts from saved-posts.js
  const fs = require('fs');
  const path = require('path');
  const savedPostsPath = path.join(__dirname, './saved-posts.js');
  
  if (fs.existsSync(savedPostsPath)) {
    const content = fs.readFileSync(savedPostsPath, 'utf8');
    const mockPostsMatch = content.match(/const\s+mockPosts\s*=\s*(\[[\s\S]*?\]);/);
    
    if (mockPostsMatch && mockPostsMatch[1]) {
      // eslint-disable-next-line no-eval
      posts = eval(mockPostsMatch[1]);
    }
  }
} catch (error) {
  console.error('Error initializing posts:', error);
}

// Set CORS headers
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      // Get post data from request body
      let postData;
      try {
        postData = JSON.parse(req.body);
      } catch (e) {
        postData = req.body; // Assume it's already an object
      }
      
      // Validate post data
      if (!postData || !postData.title || !postData.content) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid post data. Title and content are required.',
          timestamp: new Date().toISOString()
        });
      }
      
      // Create new post
      const newPost = {
        id: `post_${Date.now()}`,
        title: postData.title,
        content: postData.content,
        category: postData.category || 'General',
        author: postData.author || 'Anonymous',
        date: new Date().toISOString(),
        isAnonymous: postData.isAnonymous || false,
        isSaved: false,
        image: postData.image || 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc2NzYxNA&ixlib=rb-4.0.3&q=80&w=1080'
      };
      
      // Add to beginning of array
      posts.unshift(newPost);
      
      res.status(201).json({
        status: 'success',
        message: 'Post created successfully',
        data: newPost,
        timestamp: new Date().toISOString(),
        totalPosts: posts.length
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
  } else {
    res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }
}; 