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

  // Initialize posts from localStorage
  useEffect(() => {
    try {
      // Load saved posts
      const savedPostsJson = localStorage.getItem('savedPosts');
      if (savedPostsJson) {
        setSavedPosts(JSON.parse(savedPostsJson));
        console.log("Loaded saved posts from localStorage");
      }
      
      // Load all posts
      const postsJson = localStorage.getItem('posts');
      if (postsJson) {
        let loadedPosts = JSON.parse(postsJson);
        
        // Clean up duplicate posts
        loadedPosts = cleanupDuplicatePosts(loadedPosts);
        
        setAllPosts(loadedPosts);
        console.log("Loaded all posts from localStorage:", loadedPosts.length);
      } else {
        // Load demo posts if no posts exist
        const demoPosts = [
          {
            id: 101,
            title: 'Understanding Meditation',
            content: 'Meditation is a practice where an individual uses a technique – such as mindfulness, or focusing the mind on a particular object, thought, or activity – to train attention and awareness, and achieve a mentally clear and emotionally calm and stable state.',
            category: 'Meditation',
            author: 'Mindful Master',
            date: '2023-04-15',
            createdAt: new Date().toISOString()
          },
          {
            id: 102,
            title: 'Dream Analysis Techniques',
            content: 'Dream analysis is the process of assigning meaning to dreams. Dreams can be analyzed from many perspectives, including psychological, spiritual, and cultural. Some believe dreams reveal unconscious desires and thoughts.',
            category: 'Dreams',
            author: 'Sleep Sage',
            date: '2023-04-20',
            createdAt: new Date().toISOString()
          },
          {
            id: 103,
            title: 'Chakra Healing Basics',
            content: 'Chakra healing is focused on the belief that the body contains seven energy centers, from the base of the spine to the top of the head. When the chakras are open and aligned, energy can flow freely through the body.',
            category: 'Healing',
            author: 'Energy Expert',
            date: '2023-04-25',
            createdAt: new Date().toISOString()
          }
        ];
        
        // Save demo posts to localStorage
        localStorage.setItem('posts', JSON.stringify(demoPosts));
        setAllPosts(demoPosts);
        console.log("Created demo posts:", demoPosts.length);
      }
    } catch (error) {
      console.error("Error initializing posts:", error);
    }
  }, []);

  // Function to clean up duplicate posts
  const cleanupDuplicatePosts = (posts) => {
    const uniquePosts = [];
    const seenTitles = new Set();
    
    // Keep only one post with the same title
    for (const post of posts) {
      // Skip posts without title
      if (!post.title) continue;
      
      // Create a key from title and content
      const key = `${post.title}:${post.content?.substring(0, 50)}`;
      
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        uniquePosts.push(post);
      }
    }
    
    // If we removed duplicates, save the cleaned list back to localStorage
    if (uniquePosts.length < posts.length) {
      console.log(`Removed ${posts.length - uniquePosts.length} duplicate posts`);
      localStorage.setItem('posts', JSON.stringify(uniquePosts));
    }
    
    return uniquePosts;
  };

  // Save to localStorage whenever savedPosts changes
  useEffect(() => {
    if (savedPosts.length > 0) {
      localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
      console.log('SavedPostsContext: Saved posts to localStorage');
    }
  }, [savedPosts]);

  // Add a new post to the list
  const addNewPost = (post) => {
    return new Promise((resolve, reject) => {
      try {
        // Log the post being created
        console.log("Creating new post:", post);
        
        // Generate a unique ID if not provided
        const newPost = {
          ...post,
          id: post.id || `post_${Date.now()}`,
          date: post.date || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };
        
        // Get current posts from localStorage
        const storedPosts = localStorage.getItem('posts');
        const currentPosts = storedPosts ? JSON.parse(storedPosts) : [];
        
        // Check for duplicates (same title and content within last 10 seconds)
        const isDuplicate = currentPosts.some(existingPost => {
          const isSameTitle = existingPost.title === newPost.title;
          const isSameContent = existingPost.content === newPost.content;
          const isRecent = existingPost.createdAt && 
            (new Date() - new Date(existingPost.createdAt)) < 10000; // 10 seconds
          
          return isSameTitle && isSameContent && isRecent;
        });
        
        if (isDuplicate) {
          console.warn("Duplicate post detected, not adding");
          showToast("This post already exists", "warning");
          throw new Error("Duplicate post");
        }
        
        // Add new post at the beginning of the array
        const updatedPosts = [newPost, ...currentPosts];
        
        // Save back to localStorage
        localStorage.setItem('posts', JSON.stringify(updatedPosts));
        
        // Update state
        setAllPosts(updatedPosts);
        
        // Show success toast
        showToast("Post created successfully!", "success");
        
        console.log("Post created successfully:", newPost);
        console.log("Total posts:", updatedPosts.length);
        
        // Return the created post
        resolve({
          post: newPost,
          totalPosts: updatedPosts.length
        });
      } catch (error) {
        console.error("Error creating post:", error);
        if (error.message !== "Duplicate post") {
          showToast("Failed to create post. Please try again.", "error");
        }
        reject(error);
      }
    });
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
        
        // Also update localStorage
        localStorage.setItem('savedPosts', JSON.stringify(updatedSavedPosts));
      } else {
        // Add post to saved posts
        const newSavedItem = {
          postId: post.id,
          title: post.title,
          category: post.category,
          savedAt: new Date().toISOString(),
          userId: currentUser.uid
        };
        const updatedSavedPosts = [...savedPosts, newSavedItem];
        setSavedPosts(updatedSavedPosts);
        showToast("Post saved successfully", "success");
        
        // Also update localStorage
        localStorage.setItem('savedPosts', JSON.stringify(updatedSavedPosts));
      }
    } catch (error) {
      console.error("Error saving post:", error);
      showToast("Failed to save post", "error");
    }
  };

  // Refresh saved posts from the backend - now with better error handling
  const refreshSavedPosts = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from backend using environment variable (use 127.0.0.1 instead of localhost)
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api').replace('localhost', '127.0.0.1');
      
      console.log(`SavedPostsContext: Refreshing saved posts from ${apiUrl}/saved-posts`);
      
      // Add timeout to avoid long waits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${apiUrl}/saved-posts?userId=${currentUser.uid}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      setSavedPosts(data.posts || []);
      console.log('SavedPostsContext: Refreshed saved posts from API', data.posts);
      
      // Save to localStorage as backup
      localStorage.setItem('savedPosts', JSON.stringify(data.posts || []));
      
      showToast('Posts refreshed from server', 'success');
    } catch (error) {
      console.error('Error refreshing saved posts:', error);
      setError(error.message);
      
      // Fallback to localStorage in case of API failure
      try {
        const savedPostsFromStorage = localStorage.getItem('savedPosts');
        if (savedPostsFromStorage) {
          const parsedPosts = JSON.parse(savedPostsFromStorage);
          setSavedPosts(parsedPosts);
          console.log('SavedPostsContext: Falling back to posts from localStorage');
          showToast('Using locally saved posts (offline mode)', 'warning');
        }
      } catch (storageError) {
        console.error('Error parsing saved posts from localStorage:', storageError);
      }
    } finally {
      setLoading(false);
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