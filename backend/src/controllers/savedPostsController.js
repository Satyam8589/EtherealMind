// Import Firebase config if available
let db, usersCollection, savedPostsCollection, FieldValue;
try {
  // We'll get these from the app locals in each route handler instead
  console.log('Controller loaded - Firebase components will be accessed from app.locals');
} catch (error) {
  console.error('Firebase module import error:', error.message);
}

// Helper function to handle Firebase errors
const handleFirebaseError = (error) => {
  console.error('Firebase operation error:', error);
  
  // Check for specific Firebase error types
  if (error.code === 14 && error.details && error.details.includes('ECONNREFUSED')) {
    return {
      status: 503,
      error: {
        success: false,
        message: 'Firebase connection failed. Falling back to in-memory storage.',
        error: 'FIREBASE_CONNECTION_REFUSED',
        details: error.message
      }
    };
  }
  
  // Generic Firebase errors
  return {
    status: 500,
    error: {
      success: false,
      message: 'Firebase operation failed',
      error: error.code || 'FIREBASE_ERROR',
      details: error.message
    }
  };
};

// Get all saved posts for a user
exports.getSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if we should use Firebase or in-memory
    if (req.app.locals.useFirebase && req.app.locals.firebase.db) {
      try {
        // Using Firebase
        const { savedPostsCollection } = req.app.locals.firebase;
        
        if (!savedPostsCollection) {
          throw new Error('savedPostsCollection is not initialized');
        }
        
        // Check if user exists
        const userSnapshot = await req.app.locals.firebase.usersCollection
          .where('uid', '==', userId)
          .limit(1)
          .get();
        
        // Skip user check if no users in the database (first user case)
        if (userSnapshot.empty && !(await req.app.locals.firebase.usersCollection.limit(1).get()).empty) {
          return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
        
        // Query saved posts for this user
        const savedPostsSnapshot = await savedPostsCollection
          .where('userId', '==', userId)
          .orderBy('savedAt', 'desc')
          .get();
        
        const savedPosts = [];
        savedPostsSnapshot.forEach(doc => {
          savedPosts.push({
            id: doc.id,
            ...doc.data(),
            savedAt: doc.data().savedAt?.toDate?.() || new Date()
          });
        });
        
        return res.status(200).json({
          success: true,
          count: savedPosts.length,
          data: savedPosts
        });
      } catch (firebaseError) {
        console.error('Firebase error, falling back to in-memory DB:', firebaseError);
        // Set Firebase as unavailable for future requests
        req.app.locals.useFirebase = false;
        // Continue to in-memory instead of returning an error
      }
    }
    
    // Using in-memory (either by choice or as fallback)
    const { inMemoryDB } = req.app.locals;
    
    // Check if user exists
    const userExists = inMemoryDB.users.find(user => user.uid === userId);
    if (!userExists && inMemoryDB.users.length > 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get saved posts for this user
    const savedPosts = inMemoryDB.savedPosts
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    
    return res.status(200).json({
      success: true,
      count: savedPosts.length,
      data: savedPosts,
      storageMode: 'in-memory'
    });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Save a post
exports.savePost = async (req, res) => {
  try {
    const { userId } = req.params;
    const { postId, title, category } = req.body;
    
    if (!userId || !postId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, postId and title'
      });
    }
    
    // Check if we should use Firebase or in-memory
    if (req.app.locals.useFirebase && req.app.locals.firebase.db) {
      try {
        // Using Firebase
        const { usersCollection, savedPostsCollection } = req.app.locals.firebase;
        const FieldValue = req.app.locals.firebase.FieldValue;
        
        if (!usersCollection || !savedPostsCollection || !FieldValue) {
          throw new Error('Firebase components not properly initialized');
        }
        
        // Check if user exists, create if not
        const userDocRef = usersCollection.doc(userId);
        const userDoc = await userDocRef.get();
        
        if (!userDoc.exists && req.body.email) {
          // Create user if doesn't exist
          await userDocRef.set({
            uid: userId,
            email: req.body.email,
            displayName: req.body.displayName || '',
            createdAt: FieldValue.serverTimestamp()
          });
        } else if (!userDoc.exists) {
          return res.status(404).json({
            success: false,
            message: 'User not found and email not provided to create user'
          });
        }
        
        // Check if post is already saved
        const savedPostsSnapshot = await savedPostsCollection
          .where('userId', '==', userId)
          .where('postId', '==', parseInt(postId))
          .limit(1)
          .get();
        
        if (!savedPostsSnapshot.empty) {
          return res.status(400).json({
            success: false,
            message: 'Post already saved by this user'
          });
        }
        
        // Create new saved post document
        const newSavedPost = {
          userId,
          postId: parseInt(postId),
          title,
          category: category || '',
          savedAt: FieldValue.serverTimestamp()
        };
        
        const savedPostRef = await savedPostsCollection.add(newSavedPost);
        const savedPostSnapshot = await savedPostRef.get();
        
        return res.status(201).json({
          success: true,
          data: {
            id: savedPostRef.id,
            ...savedPostSnapshot.data(),
            savedAt: new Date().toISOString() // Convert server timestamp to ISO string
          },
          message: 'Post saved successfully'
        });
      } catch (firebaseError) {
        console.error('Firebase error, falling back to in-memory DB:', firebaseError);
        // Set Firebase as unavailable for future requests
        req.app.locals.useFirebase = false;
        // Continue to in-memory instead of returning an error
      }
    }
    
    // Using in-memory database (either by choice or as fallback)
    const { inMemoryDB } = req.app.locals;
    
    // Check if user exists, create if not
    let user = inMemoryDB.users.find(user => user.uid === userId);
    if (!user && req.body.email) {
      user = {
        uid: userId,
        email: req.body.email,
        displayName: req.body.displayName || '',
        createdAt: new Date().toISOString()
      };
      inMemoryDB.users.push(user);
    } else if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if post is already saved
    const existingSavedPost = inMemoryDB.savedPosts.find(
      post => post.userId === userId && post.postId === parseInt(postId)
    );
    
    if (existingSavedPost) {
      return res.status(400).json({
        success: false,
        message: 'Post already saved by this user'
      });
    }
    
    // Create new saved post
    const savedPost = {
      id: Date.now().toString(), // Generate unique ID
      userId,
      postId: parseInt(postId),
      title,
      category: category || '',
      savedAt: new Date().toISOString()
    };
    
    inMemoryDB.savedPosts.push(savedPost);
    
    return res.status(201).json({
      success: true,
      data: savedPost,
      message: 'Post saved successfully',
      storageMode: 'in-memory'
    });
  } catch (error) {
    console.error('Error saving post:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Unsave a post
exports.unsavePost = async (req, res) => {
  try {
    const { userId, postId } = req.params;
    
    // Check if we should use Firebase or in-memory
    if (req.app.locals.useFirebase && req.app.locals.firebase.db) {
      try {
        // Using Firebase
        const { savedPostsCollection } = req.app.locals.firebase;
        
        if (!savedPostsCollection) {
          throw new Error('savedPostsCollection is not initialized');
        }
        
        // Find the saved post document
        const savedPostsSnapshot = await savedPostsCollection
          .where('userId', '==', userId)
          .where('postId', '==', parseInt(postId))
          .limit(1)
          .get();
        
        if (savedPostsSnapshot.empty) {
          return res.status(404).json({
            success: false,
            message: 'Saved post not found'
          });
        }
        
        // Delete the document
        await savedPostsCollection.doc(savedPostsSnapshot.docs[0].id).delete();
        
        return res.status(200).json({
          success: true,
          message: 'Post unsaved successfully'
        });
      } catch (firebaseError) {
        console.error('Error unsaving post:', firebaseError);
        // Set Firebase as unavailable for future requests
        req.app.locals.useFirebase = false;
        // Continue to in-memory instead of returning an error
      }
    }
    
    // Using in-memory database (either by choice or as fallback)
    const { inMemoryDB } = req.app.locals;
    
    // Find the saved post in memory
    const index = inMemoryDB.savedPosts.findIndex(
      post => post.userId === userId && post.postId === parseInt(postId)
    );
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Saved post not found'
      });
    }
    
    // Remove from array
    inMemoryDB.savedPosts.splice(index, 1);
    
    return res.status(200).json({
      success: true,
      message: 'Post unsaved successfully',
      storageMode: 'in-memory'
    });
  } catch (error) {
    console.error('Error unsaving post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Check if a post is saved by a user
exports.checkIfPostSaved = async (req, res) => {
  try {
    const { userId, postId } = req.params;
    
    // Check if we should use Firebase or in-memory
    if (req.app.locals.useFirebase && req.app.locals.firebase.db) {
      try {
        // Using Firebase
        const { savedPostsCollection } = req.app.locals.firebase;
        
        if (!savedPostsCollection) {
          throw new Error('savedPostsCollection is not initialized');
        }
        
        console.log(`Checking if user ${userId} has saved post ${postId}...`);
        
        // Query for the post
        const savedPostsSnapshot = await savedPostsCollection
          .where('userId', '==', userId)
          .where('postId', '==', parseInt(postId))
          .limit(1)
          .get();
        
        return res.status(200).json({
          success: true,
          isSaved: !savedPostsSnapshot.empty
        });
      } catch (firebaseError) {
        console.error('Error checking saved post:', firebaseError);
        // Set Firebase as unavailable for future requests
        req.app.locals.useFirebase = false;
        // Continue to in-memory instead of returning an error
      }
    }
    
    // Using in-memory database (either by choice or as fallback)
    const { inMemoryDB } = req.app.locals;
    
    // Check if post is saved in in-memory DB
    const isSaved = inMemoryDB.savedPosts.some(
      post => post.userId === userId && post.postId === parseInt(postId)
    );
    
    return res.status(200).json({
      success: true,
      isSaved,
      storageMode: 'in-memory'
    });
  } catch (error) {
    console.error('Error checking saved post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 