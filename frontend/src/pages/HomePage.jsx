import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import PostStats from '../components/PostStats';
import CreatePostForm from '../components/CreatePostForm';

const HomePage = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const result = await api.getPosts();
        
        if (result.success) {
          setPosts(result.posts || []);
          setTotalPosts(result.posts?.length || 0);
        } else {
          setError(result.error || 'Failed to load posts');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostCreated = (newPost, newTotalPosts) => {
    // Add the new post to the top of the list
    setPosts(prevPosts => [newPost, ...prevPosts]);
    
    // Update total posts count if provided
    if (newTotalPosts) {
      setTotalPosts(newTotalPosts);
    } else {
      setTotalPosts(prevCount => prevCount + 1);
    }
  };

  return (
    <div className="home-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Welcome to EtherealMind</h2>
      <p>A community for sharing thoughts and experiences</p>
      
      {/* Stats Component */}
      <PostStats />
      
      {/* Create Post Form */}
      {currentUser ? (
        <CreatePostForm onPostCreated={handlePostCreated} />
      ) : (
        <div style={{ 
          backgroundColor: '#e2f3fd', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p>Sign in to share your thoughts with the community</p>
          <button 
            style={{ 
              backgroundColor: '#4a90e2', 
              color: 'white', 
              border: 'none', 
              padding: '8px 15px', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
            onClick={() => window.location.href = '/login'}
          >
            Sign In
          </button>
        </div>
      )}
      
      {/* Posts List */}
      <div className="posts-section">
        <h3>Recent Posts {totalPosts > 0 && `(${totalPosts})`}</h3>
        
        {loading ? (
          <p>Loading posts...</p>
        ) : error ? (
          <div style={{ color: 'red' }}>Error: {error}</div>
        ) : posts.length === 0 ? (
          <p>No posts yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <div 
                key={post.id} 
                className="post-card"
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <h4 style={{ marginTop: 0 }}>{post.title}</h4>
                
                {post.image && (
                  <div style={{ marginBottom: '10px' }}>
                    <img 
                      src={post.image} 
                      alt={post.title}
                      style={{ maxWidth: '100%', borderRadius: '4px', maxHeight: '200px' }}
                    />
                  </div>
                )}
                
                <p>{post.content.length > 200 
                  ? `${post.content.substring(0, 200)}...` 
                  : post.content}</p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  color: '#666',
                  marginTop: '10px'
                }}>
                  <div>
                    <span style={{ 
                      backgroundColor: '#e0f0ff', 
                      padding: '3px 8px', 
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      {post.category}
                    </span>
                  </div>
                  <div>
                    By {post.isAnonymous ? 'Anonymous' : post.author} • {
                      new Date(post.date || post.createdAt).toLocaleDateString()
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 