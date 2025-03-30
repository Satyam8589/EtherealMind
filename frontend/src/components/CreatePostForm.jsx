import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CreatePostForm = ({ onPostCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    isAnonymous: false,
    image: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Load categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await api.getCategories();
        if (result.success && result.categories) {
          setCategories(result.categories);
        } else {
          // Use default categories if API fails
          setCategories([
            { id: 'meditation', name: 'Meditation' },
            { id: 'dreams', name: 'Dreams' },
            { id: 'healing', name: 'Healing' },
            { id: 'general', name: 'General' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Please enter content for your post');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      
      const result = await api.createPost(formData);
      
      if (result.success) {
        setMessage('Post created successfully!');
        setFormData({
          title: '',
          content: '',
          category: 'General',
          isAnonymous: false,
          image: ''
        });
        
        // Call the callback with the new post data
        if (onPostCreated) {
          onPostCreated(result.post, result.totalPosts);
        }
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-form" style={{ 
      backgroundColor: '#f8f9fa', 
      padding: '20px', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0 }}>Share Your Thoughts</h3>
      
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px' 
        }}>
          {error}
        </div>
      )}
      
      {message && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px' 
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ced4da' 
            }}
            placeholder="Enter a title for your post"
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="content" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ced4da',
              minHeight: '120px' 
            }}
            placeholder="Share your thoughts, experiences, or ideas..."
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ced4da' 
            }}
            disabled={loading}
          >
            <option value="General">General</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name} {cat.icon}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="image" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Image URL (optional)
          </label>
          <input
            type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ced4da' 
            }}
            placeholder="Enter an image URL (leave empty for default)"
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleChange}
              style={{ marginRight: '8px' }}
              disabled={loading}
            />
            Post anonymously
          </label>
        </div>
        
        <button
          type="submit"
          style={{ 
            backgroundColor: '#4a90e2', 
            color: 'white', 
            border: 'none', 
            padding: '10px 15px', 
            borderRadius: '4px', 
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
          disabled={loading}
        >
          {loading ? 'Creating Post...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePostForm; 