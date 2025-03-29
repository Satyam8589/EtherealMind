import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { app, db } from '../firebase';
import './UserProfileSettings.css';

const UserProfileSettings = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    bio: '',
    website: '',
    location: ''
  });
  const [firestoreAvailable, setFirestoreAvailable] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      
      // Initialize with current auth data first
      setFormData(prev => ({
        ...prev,
        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || '',
      }));
      
      setLoading(true);
      try {
        // Try to get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        // If user document exists, use its data
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            displayName: currentUser.displayName || '',
            bio: userData.bio || '',
            website: userData.website || '',
            location: userData.location || ''
          });
          setFirestoreAvailable(true);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setFirestoreAvailable(false);
        setMessage({
          text: "Unable to access your full profile data. Basic profile editing is available.",
          type: "warning"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setMessage({
        text: "You must be logged in to update your profile",
        type: "error"
      });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Always update displayName in Firebase Auth (this shouldn't require special permissions)
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: formData.displayName
        });
      }
      
      // Only try to update Firestore if it was available during fetch
      if (firestoreAvailable) {
        try {
          // Save profile data to Firestore
          await setDoc(doc(db, "users", currentUser.uid), {
            uid: currentUser.uid,
            displayName: formData.displayName,
            email: currentUser.email,
            bio: formData.bio,
            website: formData.website,
            location: formData.location,
            updatedAt: new Date()
          }, { merge: true });
          
          setMessage({
            text: "Profile updated successfully!",
            type: "success"
          });
        } catch (firestoreError) {
          console.error("Error updating Firestore profile:", firestoreError);
          setFirestoreAvailable(false);
          
          // Still show success for auth update
          setMessage({
            text: "Basic profile updated. Additional data couldn't be saved.",
            type: "warning"
          });
        }
      } else {
        // If Firestore wasn't available, just show success for auth update
        setMessage({
          text: "Display name updated successfully!",
          type: "success"
        });
      }
      
      // Close modal after a delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        text: "Failed to update profile. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings-overlay">
      <div className="profile-settings-modal">
        <div className="profile-settings-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-settings-form">
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Your display name"
            />
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
              disabled={!firestoreAvailable}
            />
            {!firestoreAvailable && <small className="field-note">Extended profile features unavailable</small>}
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
              disabled={!firestoreAvailable}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Your location"
              disabled={!firestoreAvailable}
            />
          </div>
          
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          
          <div className="form-buttons">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileSettings; 