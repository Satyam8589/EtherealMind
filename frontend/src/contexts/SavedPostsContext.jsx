import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create context
const SavedPostsContext = createContext();

export function useSavedPosts() {
  return useContext(SavedPostsContext);
}

export function SavedPostsProvider({ children }) {
  const { currentUser } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load mock data for initial state
  useEffect(() => {
    console.log("SavedPostsContext: Initializing...");
    
    // Try to load posts from localStorage first
    try {
      const storedPosts = localStorage.getItem('allPosts');
      if (storedPosts) {
        const parsedPosts = JSON.parse(storedPosts);
        console.log(`SavedPostsContext: Found ${parsedPosts.length} posts in localStorage`);
        setAllPosts(parsedPosts);
      } else {
        // Example mock posts (fallback)
        console.log("SavedPostsContext: No posts found in localStorage, using mock data");
        const mockPosts = [
          {
            id: '101',
            title: 'The Art of Stand-Up Comedy',
            content: 'Discover the secrets behind making people laugh and the challenges comedians face in a stand-up performance.',
            category: 'Comedy',
            authorId: 'user123',
            authorName: 'John Doe',
            createdAt: new Date(),
            likes: 42,
            comments: 7,
            image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: '102',
            title: 'Fuel Your Motivation',
            content: 'Explore strategies to boost your motivation and achieve your personal and professional goals.',
            category: 'Motivation',
            authorId: 'user456',
            authorName: 'Jane Smith',
            createdAt: new Date(),
            likes: 36,
            comments: 12,
            image: 'https://images.unsplash.com/photo-1519834584171-e03a7fefd0a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: '103',
            title: 'Business Strategies for Growth',
            content: 'Learn about innovative business strategies that can help your company grow and thrive in today\'s competitive market.',
            category: 'Business',
            authorId: 'user789',
            authorName: 'Robert Johnson',
            createdAt: new Date(),
            likes: 28,
            comments: 5,
            image: 'https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          }
        ];

        setAllPosts(mockPosts);
        // Store mock posts to localStorage for future use
        localStorage.setItem('allPosts', JSON.stringify(mockPosts));
      }
    } catch (err) {
      console.error('Error loading posts from localStorage:', err);
      // Fallback to mock data
      setAllPosts([]);
    }

    // Load saved posts from localStorage
    try {
      const savedPostsFromStorage = localStorage.getItem('savedPosts');
      if (savedPostsFromStorage) {
        setSavedPosts(JSON.parse(savedPostsFromStorage));
        console.log('SavedPostsContext: Loaded saved posts from localStorage');
      }
    } catch (err) {
      console.error('Error parsing saved posts from localStorage:', err);
      setSavedPosts([]);
    }
  }, []);

  // Save to localStorage whenever savedPosts changes
  useEffect(() => {
    if (savedPosts.length > 0) {
      localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
      console.log('SavedPostsContext: Saved posts to localStorage');
    }
  }, [savedPosts]);

  // IMPORTANT: Function to add a new post
  const addNewPost = (post) => {
    console.log("SavedPostsContext: Adding new post", post);
    
    if (!post || !post.title) {
      console.error("Cannot add post: Invalid post data", post);
      showToast("Error: Invalid post data", "error");
      return null;
    }
    
    try {
      // Generate a unique ID if not provided
      const newPost = {
        ...post,
        id: post.id || Date.now().toString(),
        createdAt: post.createdAt || new Date(),
        likes: post.likes || 0,
        comments: post.comments || 0
      };
      
      if (!newPost.authorId && currentUser) {
        newPost.authorId = currentUser.uid;
        newPost.authorName = post.isAnonymous ? 'Anonymous' : (currentUser.displayName || currentUser.email || 'Anonymous');
      }
      
      // Add to all posts
      setAllPosts(prevPosts => {
        const updatedPosts = [newPost, ...prevPosts];
        // Save all posts to localStorage for persistence
        try {
          localStorage.setItem('allPosts', JSON.stringify(updatedPosts));
          console.log('SavedPostsContext: Saved all posts to localStorage');
        } catch (err) {
          console.error('Error saving posts to localStorage:', err);
        }
        return updatedPosts;
      });
      
      // Show success toast notification
      showToast('Post created successfully!', 'success');
      
      console.log('SavedPostsContext: Added new post', newPost);
      
      // Return the new post object
      return newPost;
    } catch (error) {
      console.error("Error adding new post:", error);
      showToast("Failed to create post", "error");
      return null;
    }
  };

  // Check if post is saved
  const isPostSaved = (postId) => {
    return savedPosts.some(savedItem => 
      savedItem.postId === postId || 
      savedItem.postId === String(postId)
    );
  };

  // Save a post or remove it if already saved
  const savePost = (post) => {
    if (!post || !post.id) {
      console.error("SavedPostsContext: Invalid post data:", post);
      showToast("Error: Cannot save invalid post", "error");
      return;
    }

    if (!currentUser) {
      showToast("Please login to save posts", "warning");
      return;
    }

    try {
      // Check if post is already saved
      const isAlreadySaved = isPostSaved(post.id);

      if (isAlreadySaved) {
        // Remove post from saved posts
        const updatedSavedPosts = savedPosts.filter(savedItem => 
          savedItem.postId !== post.id && String(savedItem.postId) !== String(post.id)
        );
        setSavedPosts(updatedSavedPosts);
        showToast("Post removed from saved items", "info");
      } else {
        // Add post to saved posts
        const newSavedItem = {
          postId: post.id,
          title: post.title,
          category: post.category,
          savedAt: new Date().toISOString()
        };
        setSavedPosts([...savedPosts, newSavedItem]);
        showToast("Post saved successfully", "success");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      showToast("Failed to save post", "error");
    }
  };

  // Refresh saved posts (reload from storage)
  const refreshSavedPosts = () => {
    try {
      const savedPostsFromStorage = localStorage.getItem('savedPosts');
      if (savedPostsFromStorage) {
        setSavedPosts(JSON.parse(savedPostsFromStorage));
        console.log('SavedPostsContext: Refreshed saved posts from localStorage');
      }
    } catch (err) {
      console.error('Error parsing saved posts from localStorage:', err);
    }
  };

  // Dismiss toast
  const dismissToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Show toast notification
  const showToast = (message, type = 'info') => {
    console.log(`Toast notification: ${message} (${type})`);
    setToast({ show: true, message, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      dismissToast();
    }, 3000);
  };

  // Context value
  const contextValue = {
    savedPosts,
    allPosts,
    loading,
    error,
    addNewPost,
    savePost,
    isPostSaved,
    refreshSavedPosts,
    dismissToast,
    showToast,
    toast
  };

  return (
    <SavedPostsContext.Provider value={contextValue}>
      {children}
    </SavedPostsContext.Provider>
  );
}

export default SavedPostsContext; 