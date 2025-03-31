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
        
        // Handle image upload if present
        let imageUrl = post.imageUrl;
        if (post.image && post.image.startsWith('data:image')) {
          try {
            const response = await fetch('/api/upload-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ image: post.image })
            });
            
            if (!response.ok) {
              throw new Error('Failed to upload image');
            }
            
            const data = await response.json();
            imageUrl = data.data.imageUrl;
          } catch (error) {
            console.error('Error uploading image:', error);
            showToast('Failed to upload image, but continuing with post creation', 'warning');
          }
        }
        
        // Generate a unique ID if not provided
        const newPost = {
          ...post,
          id: post.id || `post_${Date.now()}`,
          date: post.date || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          imageUrl: imageUrl
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
    if (!savedPosts || savedPosts.length === 0) return false;
    return savedPosts.some(savedItem => 
      String(savedItem.postId) === String(postId)
    );
  };

  // Add function to check server health before operations
  const checkServerHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return { healthy: true };
      }
      return { healthy: false, error: `Server returned ${response.status}` };
    } catch (error) {
      console.error('Health check failed:', error);
      return { healthy: false, error: error.message };
    }
  };

  // Save a post locally (when server is unavailable)
  const savePostLocally = (post, shouldSave = true) => {
    console.log(`SavedPostsContext: Saving post locally (shouldSave=${shouldSave}):`, post.id);
    
    try {
      // Get current saved state
      const isAlreadySaved = isPostSaved(post.id);
      
      // If trying to save a post that's already saved, or unsave one that's not saved, do nothing
      if ((shouldSave && isAlreadySaved) || (!shouldSave && !isAlreadySaved)) {
        console.log(`SavedPostsContext: Post ${post.id} is already in desired state (saved=${isAlreadySaved})`);
        return;
      }
      
      let updatedSavedPosts;
      
      if (shouldSave) {
        // Add to saved posts
        const newSavedItem = {
          postId: post.id,
          title: post.title || 'Untitled Post',
          category: post.category || 'Uncategorized',
          savedAt: new Date().toISOString(),
          userId: currentUser?.uid || 'local-user',
          savedLocally: true,
          post: {
            ...post,
            isSaved: true
          }
        };
        updatedSavedPosts = [...savedPosts, newSavedItem];
        console.log(`SavedPostsContext: Added post ${post.id} to local saved posts`);
      } else {
        // Remove from saved posts
        updatedSavedPosts = savedPosts.filter(item => String(item.postId) !== String(post.id));
        console.log(`SavedPostsContext: Removed post ${post.id} from local saved posts`);
      }
      
      // Update state and localStorage
      setSavedPosts(updatedSavedPosts);
      localStorage.setItem('savedPosts', JSON.stringify(updatedSavedPosts));
      
      // Show feedback
      showToast(
        shouldSave 
          ? "Post saved locally (offline mode)" 
          : "Post removed from saved items (offline mode)", 
        shouldSave ? "success" : "info"
      );
      
      return true;
    } catch (error) {
      console.error('Error saving post locally:', error);
      showToast("Failed to update saved posts locally", "error");
      return false;
    }
  };

  // Save a post or remove it if already saved
  const savePost = async (post) => {
    if (!post || !post.id) {
      console.error("SavedPostsContext: Invalid post data:", post);
      showToast("Error: Cannot save invalid post", "error");
      return false;
    }

    try {
      setLoading(true);
      console.log("SavedPostsContext: Attempting to save/unsave post:", post.id);
      
      // Check if post is already saved
      const isAlreadySaved = isPostSaved(post.id);
      
      // If user is not logged in, save locally only
      if (!currentUser) {
        console.log("SavedPostsContext: No user logged in, saving locally only");
        showToast("Saving locally only. Login to sync your saved posts.", "warning");
        return savePostLocally(post, !isAlreadySaved);
      }
      
      // Check server health first
      console.log("SavedPostsContext: Checking server health...");
      const healthStatus = await checkServerHealth();
      
      if (!healthStatus.healthy) {
        console.warn(`SavedPostsContext: Server health check failed: ${healthStatus.error}`);
        showToast("Server unavailable. Saving locally only.", "warning");
        return savePostLocally(post, !isAlreadySaved);
      }
      
      console.log("SavedPostsContext: Server is healthy, proceeding with API call");
      console.log("SavedPostsContext: Post is already saved:", isAlreadySaved);

      if (isAlreadySaved) {
        // Remove post from saved posts
        console.log(`SavedPostsContext: Removing post ${post.id} for user ${currentUser.uid}`);
        try {
          const token = await currentUser.getIdToken();
          console.log("SavedPostsContext: Got auth token");
          
          const response = await fetch(`/api/saved-posts/${currentUser.uid}/${post.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          console.log("SavedPostsContext: Delete response status:", response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("SavedPostsContext: Error response from delete:", errorData);
            throw new Error(`Failed to remove saved post: ${response.status} ${errorData.message || ''}`);
          }

          // Update local state even if API fails (for better UX)
          const updatedSavedPosts = savedPosts.filter(savedItem => 
            String(savedItem.postId) !== String(post.id)
          );
          setSavedPosts(updatedSavedPosts);
          
          // Save to localStorage as backup
          localStorage.setItem('savedPosts', JSON.stringify(updatedSavedPosts));
          
          showToast("Post removed from saved items", "info");
          console.log("SavedPostsContext: Post successfully removed from saved items");
          return true;
        } catch (deleteError) {
          console.error("SavedPostsContext: Error in delete operation:", deleteError);
          // Try local fallback
          return savePostLocally(post, false);
        }
      } else {
        // Add post to saved posts
        console.log(`SavedPostsContext: Saving post ${post.id} for user ${currentUser.uid}`);
        try {
          const token = await currentUser.getIdToken();
          console.log("SavedPostsContext: Got auth token for save");
          
          const postData = {
            id: post.id,
            title: post.title || 'Untitled Post',
            content: post.content || '',
            category: post.category || 'Uncategorized',
            imageUrl: post.imageUrl || post.image || '',
            createdAt: post.createdAt || new Date().toISOString()
          };
          
          console.log("SavedPostsContext: Sending post data:", postData);
          
          const response = await fetch(`/api/saved-posts/${currentUser.uid}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(postData)
          });

          console.log("SavedPostsContext: Save response status:", response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("SavedPostsContext: Error response from save:", errorData);
            throw new Error(`Failed to save post: ${response.status} ${errorData.message || ''}`);
          }

          // Try to parse response data
          let data;
          try {
            data = await response.json();
            console.log("SavedPostsContext: Save response data:", data);
          } catch (parseError) {
            console.error("SavedPostsContext: Error parsing response:", parseError);
            data = { status: 'success' };
          }
          
          // Update local state even if API response parsing fails
          const newSavedItem = {
            postId: post.id,
            title: post.title || 'Untitled Post',
            category: post.category || 'Uncategorized',
            savedAt: new Date().toISOString(),
            userId: currentUser.uid,
            post: {
              ...post,
              isSaved: true
            }
          };
          
          // Update state and localStorage
          const updatedSavedPosts = [...savedPosts, newSavedItem];
          setSavedPosts(updatedSavedPosts);
          localStorage.setItem('savedPosts', JSON.stringify(updatedSavedPosts));
          
          showToast("Post saved successfully", "success");
          console.log("SavedPostsContext: Post successfully saved");
          return true;
        } catch (saveError) {
          console.error("SavedPostsContext: Error in save operation:", saveError);
          // Try local fallback
          return savePostLocally(post, true);
        }
      }
    } catch (error) {
      console.error("SavedPostsContext: Error in savePost:", error);
      
      // Show error but keep local state updated for better UX
      showToast(`${error.message || "Error saving post"}. Using local data.`, "error");
      
      // Use optimistic update for better UX
      return savePostLocally(post, !isPostSaved(post.id));
    } finally {
      setLoading(false);
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