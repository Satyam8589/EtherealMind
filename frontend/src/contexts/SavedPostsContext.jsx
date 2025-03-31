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

  // Fetch saved posts when user logs in
  useEffect(() => {
    if (currentUser) {
      refreshSavedPosts();
    } else {
      setSavedPosts([]); // Clear saved posts when user logs out
    }
  }, [currentUser]);

  // Initialize posts from backend and localStorage
  useEffect(() => {
    const initializePosts = async () => {
      try {
        // Try to fetch posts from backend first
        const response = await fetch('/api/saved-posts');
        if (response.ok) {
          const data = await response.json();
          const posts = data.data || [];
          setAllPosts(posts);
          localStorage.setItem('posts', JSON.stringify(posts));
          return;
        }
      } catch (error) {
        console.error('Error fetching posts from backend:', error);
      }

      // Fallback to localStorage if backend fails
      try {
        const postsJson = localStorage.getItem('posts');
        if (postsJson) {
          let loadedPosts = JSON.parse(postsJson);
          loadedPosts = cleanupDuplicatePosts(loadedPosts);
          setAllPosts(loadedPosts);
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
          setAllPosts(demoPosts);
          localStorage.setItem('posts', JSON.stringify(demoPosts));
        }
      } catch (error) {
        console.error('Error initializing posts:', error);
      }
    };

    initializePosts();
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
    return new Promise(async (resolve, reject) => {
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
        
        // Get current posts from localStorage for duplicate checking
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
        
        try {
          // Try to save to Firebase first
          if (currentUser) {
            // Import Firebase modules if not already imported at the top
            const { getFirestore, collection, addDoc } = await import('firebase/firestore');
            const { getApp } = await import('firebase/app');
            
            const app = getApp();
            const db = getFirestore(app);
            
            // Add post to Firestore 'posts' collection
            const postRef = await addDoc(collection(db, "posts"), {
              ...newPost,
              authorId: currentUser.uid,
              authorEmail: currentUser.email
            });
            
            console.log("Post saved to Firebase with ID:", postRef.id);
            
            // Update the ID with Firebase ID
            newPost.id = postRef.id;
          }
        } catch (firebaseError) {
          console.error("Error saving to Firebase, falling back to localStorage:", firebaseError);
        }
        
        // Add new post at the beginning of the array (local storage as backup)
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
  const savePost = async (post) => {
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
        try {
          const response = await fetch(`/api/saved-posts/${currentUser.uid}/${post.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${await currentUser.getIdToken()}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to remove saved post');
          }

          const updatedSavedPosts = savedPosts.filter(savedItem => 
            savedItem.postId !== post.id && String(savedItem.postId) !== String(post.id)
          );
          setSavedPosts(updatedSavedPosts);
          showToast("Post removed from saved items", "info");
        } catch (error) {
          console.error("Error removing saved post:", error);
          showToast("Failed to remove saved post", "error");
        }
      } else {
        // Add post to saved posts
        try {
          const response = await fetch(`/api/saved-posts/${currentUser.uid}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await currentUser.getIdToken()}`
            },
            body: JSON.stringify(post)
          });

          if (!response.ok) {
            throw new Error('Failed to save post');
          }

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
        } catch (error) {
          console.error("Error saving post:", error);
          showToast("Failed to save post", "error");
        }
      }
    } catch (error) {
      console.error("Error in savePost:", error);
      showToast("An error occurred while saving the post", "error");
    }
  };

  // Refresh saved posts from the backend
  const refreshSavedPosts = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/saved-posts/${currentUser.uid}`, {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      setSavedPosts(data.data || []);
      console.log('SavedPostsContext: Refreshed saved posts from API', data.data);
      
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