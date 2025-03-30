import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSavedPosts } from '../contexts/SavedPostsContext';
import './CreatePostForm.css';

const CreatePostForm = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const { addNewPost } = useSavedPosts();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    imageUrl: '',
    isAnonymous: false
  });
  
  const [categories, setCategories] = useState([
    'Meditation', 'Dreams', 'Healing', 'General'
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };
  
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prevent duplicate submissions
    if (loading) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create post object
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        author: formData.isAnonymous ? 'Anonymous' : (currentUser?.displayName || 'User'),
        authorId: currentUser?.uid,
        date: new Date().toISOString().split('T')[0],
        image: formData.imageUrl || null
      };
      
      console.log("Submitting post:", postData);
      
      // Add new post
      const result = await addNewPost(postData);
      
      console.log("Post created:", result);
      
      // Show success message
      setSuccess('Your post has been created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'General',
        imageUrl: '',
        isAnonymous: false
      });
      
      // Notify parent component if needed
      if (onPostCreated) {
        onPostCreated(result.post);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error("Error creating post:", error);
      if (error.message === "Duplicate post") {
        setError('You have already submitted this post recently');
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="create-post-form">
      <h2>Create a New Post</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter post title"
            maxLength={100}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content*</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your thoughts..."
            rows={6}
            disabled={loading}
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (Optional)</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Enter image URL"
            disabled={loading}
          />
        </div>
        
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="isAnonymous"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="isAnonymous">Post anonymously</label>
        </div>
        
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePostForm; 