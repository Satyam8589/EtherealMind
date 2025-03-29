import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSavedPosts } from '../contexts/SavedPostsContext';
import './PostCreationPage.css';

const PostCreationPage = ({ onClose, onPostCreated }) => {
  const { currentUser } = useAuth();
  const { addNewPost } = useSavedPosts();
  const [postContent, setPostContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    // Focus the title input when component mounts
    const titleInput = document.getElementById('post-title-input');
    if (titleInput) titleInput.focus();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("PostCreationPage: Form submitted");
    console.log("Current form values:", { title, postContent, category, isAnonymous });
    
    // Form validation
    if (!title.trim()) {
      setError('Please add a title to your post');
      return;
    }
    
    if (!postContent.trim()) {
      setError('Please add some content to your post');
      return;
    }
    
    if (!category) {
      setError('Please select a category');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log("Creating post with data:", { title, category, isAnonymous });
      
      // Create post data with a random id to ensure uniqueness
      const postId = Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      const postData = {
        id: postId,
        title: title,
        content: postContent,
        description: postContent.substring(0, 150) + (postContent.length > 150 ? '...' : ''),
        category: category,
        isAnonymous: isAnonymous,
        authorId: currentUser?.uid || 'anonymous',
        authorName: isAnonymous ? 'Anonymous' : (currentUser?.displayName || currentUser?.email || 'Anonymous User'),
        createdAt: new Date(),
        likes: 0,
        comments: 0
      };
      
      // Add image URL if an image is selected
      if (imagePreview) {
        postData.imageUrl = imagePreview;
      }
      
      console.log("Post data prepared:", postData);
      
      // Add the new post to context
      const newPost = addNewPost(postData);
      console.log('Post created successfully:', newPost);
      
      // Set success message
      setSuccess('Post created successfully!');
      
      // Reset form
      setPostContent('');
      setTitle('');
      setCategory('');
      setIsAnonymous(false);
      setImageFile(null);
      setImagePreview('');
      
      // Notify parent component about the new post
      if (onPostCreated) {
        console.log("Calling onPostCreated callback with new post");
        onPostCreated(newPost);
      } else {
        console.warn("onPostCreated callback is not defined");
      }
      
      // Close the post creation page after a short delay
      setTimeout(() => {
        if (onClose) {
          console.log("Closing post creation modal");
          onClose();
        }
      }, 1500);
      
    } catch (error) {
      console.error("Error creating post: ", error);
      setError('Failed to create post: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyFormatting = (format) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = postContent.substring(start, end);
    
    let formattedText = '';
    let newCursorPos = end;
    
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = start + 2 + selectedText.length;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = start + 1 + selectedText.length;
        break;
      case 'underline':
        formattedText = `_${selectedText}_`;
        newCursorPos = start + 1 + selectedText.length;
        break;
      default:
        return;
    }
    
    const newContent = postContent.substring(0, start) + formattedText + postContent.substring(end);
    setPostContent(newContent);
    
    // Set focus back to textarea and position cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    if (file.size > maxSize) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setError('');
  };
  
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="post-creation-overlay">
      <div className="post-creation-container">
        <div className="post-creation-header">
          <div className="post-creation-logo">EtherealMind</div>
          <div className="post-creation-nav">
            <button className="post-nav-link" onClick={onClose}>Homepage</button>
            <button className="post-nav-link active">Post Creation</button>
            <button className="post-nav-link">Topic Categories</button>
          </div>
          <button className="post-creation-back" onClick={onClose} title="Back to profile">
            ← Back
          </button>
        </div>
        
        <div className="post-creation-content">
          <form className="post-editor-section" onSubmit={handleSubmit}>
            <div className="post-editor">
              <input
                id="post-title-input"
                type="text"
                className="post-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add your post title..."
                maxLength={100}
              />
              
              <textarea 
                ref={textareaRef}
                className="post-textarea"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write your thoughts here..."
              />
              
              <div className="formatting-toolbar">
                <button 
                  type="button"
                  className="format-button"
                  onClick={() => applyFormatting('bold')}
                  title="Bold"
                >
                  B
                </button>
                <button 
                  type="button"
                  className="format-button"
                  onClick={() => applyFormatting('italic')}
                  title="Italic"
                >
                  I
                </button>
                <button 
                  type="button"
                  className="format-button"
                  onClick={() => applyFormatting('underline')}
                  title="Underline"
                >
                  U
                </button>
              </div>
              
              <div 
                className={`image-upload-area ${imagePreview ? 'has-preview' : ''}`}
                onClick={!imagePreview ? triggerFileInput : undefined}
              >
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button 
                      type="button"
                      className="remove-image-btn"
                      onClick={removeImage}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <p>Drop image here or click to upload</p>
                    <small>Max file size: 5MB</small>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="file-input"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          
            <div className="post-options-section">
              <div className="category-selection">
                <h3>Category</h3>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`category-dropdown ${!category ? 'empty' : ''}`}
                  required
                >
                  <option value="" disabled>Choose a category</option>
                  <option value="Motivation">Motivation</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Business">Business</option>
                  <option value="Technology">Technology</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
                
                <div className="anonymous-option">
                  <input 
                    type="checkbox" 
                    id="anonymous-checkbox" 
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <label htmlFor="anonymous-checkbox">Post as anonymous</label>
                </div>
                
                {error && <div className="post-error-message">{error}</div>}
                {success && <div className="post-success-message">{success}</div>}
                
                <button 
                  type="submit"
                  className="post-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <footer className="post-creation-footer">
        <div className="footer-links">
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Contact Us</a>
        </div>
      </footer>
    </div>
  );
};

export default PostCreationPage; 