/**
 * API Service for EtherealMind
 * Handles all API requests to the backend
 */

// Base API configuration
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api',
  timeout: 10000,
  fallbackUrls: [
    'https://ethereal-mind-mvqz-ght2e64uv.vercel.app/api',
    'https://ethereal-mind-mvqz-ght2e64uv.vercel.app'
  ]
};

// Helper to get the base API URL with a given endpoint
const getApiUrl = (endpoint, baseUrl = API_CONFIG.baseUrl) => {
  // Remove trailing slash from base URL if present
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  // Remove leading slash from endpoint if present
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  return `${base}/${path}`;
};

// Create a timeout promise for fetch requests
const timeoutPromise = (ms) => {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
  );
};

/**
 * Fetch data from the API with fallback URLs if the main one fails
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - API response data
 */
export const fetchWithFallback = async (endpoint, options = {}) => {
  // List of URLs to try in order
  const urlsToTry = [
    getApiUrl(endpoint), // Main URL from env
    ...API_CONFIG.fallbackUrls.map(url => getApiUrl(endpoint, url))
  ];
  
  // Prepare fetch options with defaults
  const fetchOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  let lastError = null;
  
  // Try each URL in sequence until one works
  for (const url of urlsToTry) {
    try {
      console.log(`API: Attempting to fetch from ${url}`);
      
      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url, fetchOptions),
        timeoutPromise(API_CONFIG.timeout)
      ]);
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      // Parse and return JSON response
      const data = await response.json();
      console.log(`API: Successfully fetched from ${url}`, data);
      return data;
    } catch (error) {
      console.warn(`API: Failed to fetch from ${url}:`, error);
      lastError = error;
      // Continue to next URL
    }
  }
  
  // If all URLs failed, throw the last error
  throw lastError || new Error('Failed to fetch data from all API endpoints');
};

/**
 * API methods for different endpoints
 */
export const api = {
  // Health check
  checkHealth: async () => {
    try {
      const data = await fetchWithFallback('health');
      return { success: true, data };
    } catch (error) {
      console.error('API: Health check failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get all posts
  getPosts: async () => {
    try {
      const endpoints = ['saved-posts', 'api/saved-posts'];
      
      for (const endpoint of endpoints) {
        try {
          const result = await fetchWithFallback(endpoint);
          if (result && result.data) {
            return { success: true, posts: result.data };
          }
        } catch (error) {
          console.warn(`API: Failed to fetch posts from ${endpoint}:`, error);
        }
      }
      
      throw new Error('Failed to fetch posts from all endpoints');
    } catch (error) {
      console.error('API: Get posts failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get categories
  getCategories: async () => {
    try {
      const endpoints = ['categories', 'api/categories'];
      
      for (const endpoint of endpoints) {
        try {
          const result = await fetchWithFallback(endpoint);
          if (result && result.data) {
            return { success: true, categories: result.data };
          }
        } catch (error) {
          console.warn(`API: Failed to fetch categories from ${endpoint}:`, error);
        }
      }
      
      throw new Error('Failed to fetch categories from all endpoints');
    } catch (error) {
      console.error('API: Get categories failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Create a new post
  createPost: async (postData) => {
    try {
      const data = await fetchWithFallback('saved-posts', {
        method: 'POST',
        body: JSON.stringify(postData)
      });
      return { success: true, post: data };
    } catch (error) {
      console.error('API: Create post failed:', error);
      return { success: false, error: error.message };
    }
  }
};

export default api; 