import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ApiTest = () => {
  const [healthStatus, setHealthStatus] = useState({ checking: true, success: false, message: 'Checking...' });
  const [posts, setPosts] = useState({ checking: true, success: false, data: [], message: 'Loading posts...' });
  const [categories, setCategories] = useState({ checking: true, success: false, data: [], message: 'Loading categories...' });
  const [directTest, setDirectTest] = useState({ checking: false, results: {} });

  // Check health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await api.checkHealth();
        setHealthStatus({
          checking: false,
          success: result.success,
          message: result.success ? 'API is connected!' : 'API connection failed',
          data: result.data || result.error
        });
      } catch (error) {
        setHealthStatus({
          checking: false,
          success: false,
          message: `Error: ${error.message}`,
        });
      }
    };

    checkHealth();
  }, []);

  // Load posts when health check succeeds
  useEffect(() => {
    if (healthStatus.success) {
      const loadPosts = async () => {
        try {
          const result = await api.getPosts();
          setPosts({
            checking: false,
            success: result.success,
            data: result.posts || [],
            message: result.success ? `Loaded ${result.posts?.length || 0} posts` : 'Failed to load posts'
          });
        } catch (error) {
          setPosts({
            checking: false,
            success: false,
            data: [],
            message: `Error: ${error.message}`
          });
        }
      };

      const loadCategories = async () => {
        try {
          const result = await api.getCategories();
          setCategories({
            checking: false,
            success: result.success,
            data: result.categories || [],
            message: result.success ? `Loaded ${result.categories?.length || 0} categories` : 'Failed to load categories'
          });
        } catch (error) {
          setCategories({
            checking: false,
            success: false,
            data: [],
            message: `Error: ${error.message}`
          });
        }
      };

      loadPosts();
      loadCategories();
    }
  }, [healthStatus.success]);

  // Direct endpoint test function
  const testEndpoint = async (endpoint) => {
    setDirectTest({ checking: true, results: {} });
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setDirectTest({
        checking: false,
        results: {
          success: true,
          status: response.status,
          data: data
        }
      });
    } catch (error) {
      setDirectTest({
        checking: false,
        results: {
          success: false,
          error: error.message
        }
      });
    }
  };

  return (
    <div className="api-test-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>API Connection Test</h2>
      
      {/* Health Check Section */}
      <div className="test-section" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Health Check</h3>
        <div className="status-indicator" style={{ 
          padding: '10px', 
          backgroundColor: healthStatus.checking ? '#f8f9fa' : healthStatus.success ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          <p><strong>Status:</strong> {healthStatus.message}</p>
          {!healthStatus.checking && healthStatus.data && (
            <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', maxHeight: '150px', overflow: 'auto' }}>
              {JSON.stringify(healthStatus.data, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className="test-section" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Posts</h3>
        <div className="status-indicator" style={{ 
          padding: '10px', 
          backgroundColor: posts.checking ? '#f8f9fa' : posts.success ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          <p><strong>Status:</strong> {posts.message}</p>
          {!posts.checking && posts.success && posts.data.length > 0 && (
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              <ul style={{ padding: '0 0 0 20px' }}>
                {posts.data.map(post => (
                  <li key={post.id}>{post.title} - {post.category}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="test-section" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Categories</h3>
        <div className="status-indicator" style={{ 
          padding: '10px', 
          backgroundColor: categories.checking ? '#f8f9fa' : categories.success ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          <p><strong>Status:</strong> {categories.message}</p>
          {!categories.checking && categories.success && categories.data.length > 0 && (
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              <ul style={{ padding: '0 0 0 20px' }}>
                {categories.data.map(cat => (
                  <li key={cat.id}>{cat.name} {cat.icon}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Direct Endpoint Testing */}
      <div className="test-section" style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Test Specific Endpoints</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => testEndpoint('https://ethereal-mind-mvqz-ght2e64uv.vercel.app/api/standalone-health')}
            style={{ padding: '8px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Test Standalone Health
          </button>
          <button 
            onClick={() => testEndpoint('https://ethereal-mind-mvqz-ght2e64uv.vercel.app/api/saved-posts')}
            style={{ padding: '8px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Test Posts API
          </button>
          <button 
            onClick={() => testEndpoint('https://ethereal-mind-mvqz-ght2e64uv.vercel.app/api/categories')}
            style={{ padding: '8px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Test Categories API
          </button>
        </div>
        
        {directTest.checking ? (
          <p>Testing endpoint...</p>
        ) : directTest.results.success ? (
          <div>
            <p style={{ color: 'green' }}><strong>Success!</strong> Status: {directTest.results.status}</p>
            <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', maxHeight: '300px', overflow: 'auto' }}>
              {JSON.stringify(directTest.results.data, null, 2)}
            </pre>
          </div>
        ) : directTest.results.error ? (
          <p style={{ color: 'red' }}><strong>Error:</strong> {directTest.results.error}</p>
        ) : null}
      </div>
    </div>
  );
};

export default ApiTest; 