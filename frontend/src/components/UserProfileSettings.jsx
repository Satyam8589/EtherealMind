import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserProfileSettings.css';

const UserProfileSettings = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    website: '',
    twitter: '',
    instagram: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    // Load user data when component mounts
    const loadUserData = () => {
      try {
        // Get current user from localStorage
        const user = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!user) {
          setApiError("User not found. Please log in again.");
          return;
        }
        
        // Get all users
        const savedUserData = localStorage.getItem('users') ? 
          JSON.parse(localStorage.getItem('users')) : {};
        
        if (!savedUserData[user.email]) {
          setApiError("User data not found. Please log in again.");
          return;
        }
        
        // Get user profile data
        const userData = savedUserData[user.email];
        const profileLinks = userData.profileLinks || {};
        
        // Update form data
        setFormData({
          displayName: userData.displayName || '',
          bio: userData.bio || '',
          website: profileLinks.website || '',
          twitter: profileLinks.twitter || '',
          instagram: profileLinks.instagram || ''
        });
        
      } catch (error) {
        console.error("Error loading user data:", error);
        setApiError("Failed to load profile data. Please try again.");
      }
    };
    
    loadUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear form errors
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate forms
    const errors = {};
    if (!formData.displayName.trim()) {
      errors.displayName = "Display name is required";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage("");
    setApiError("");
    
    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get all users
      const savedUserData = localStorage.getItem('users') ? 
        JSON.parse(localStorage.getItem('users')) : {};
      
      if (!savedUserData[currentUser.email]) {
        throw new Error("User data not found");
      }
      
      // Update user data
      savedUserData[currentUser.email] = {
        ...savedUserData[currentUser.email],
        displayName: formData.displayName,
        bio: formData.bio,
        profileLinks: {
          website: formData.website,
          twitter: formData.twitter,
          instagram: formData.instagram
        }
      };
      
      // Save updated user data
      localStorage.setItem('users', JSON.stringify(savedUserData));
      
      // Update current user session
      const updatedUser = {
        ...currentUser,
        displayName: formData.displayName
      };
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setSuccessMessage("Profile updated successfully!");
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        // Force page refresh to show updated profile
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setApiError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-settings-overlay">
      <div className="profile-settings-modal">
        <div className="profile-settings-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {/* Success and error messages */}
        {successMessage && (
          <div className="message success">
            {successMessage}
          </div>
        )}
        
        {apiError && (
          <div className="message error">
            {apiError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="profile-settings-form">
          <div className="form-group">
            <label htmlFor="displayName">Display Name*</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Your display name"
              className={formErrors.displayName ? "error" : ""}
            />
            {formErrors.displayName && (
              <span className="error-message">{formErrors.displayName}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Your website URL"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="twitter">Twitter</label>
            <input
              type="url"
              id="twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="Your Twitter URL"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="instagram">Instagram</label>
            <input
              type="url"
              id="instagram"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="Your Instagram URL"
            />
          </div>
          
          <div className="form-buttons">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`save-button ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileSettings; 