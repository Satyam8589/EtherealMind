import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SignupForm = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [authError, setAuthError] = useState('');
  const { signup } = useAuth();
  const formRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      setFormErrors({});
      setAuthError('');
      
      try {
        // Attempt to register the user
        console.log('Submitting signup form with email:', formData.email);
        const user = await signup(formData.email, formData.password, formData.fullName);
        console.log('Signup successful, user created:', user);
        
        // Make sure data is saved to localStorage correctly
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        console.log('Current users in localStorage:', Object.keys(users));
        
        // Show success message before closing
        setSubmitSuccess(true);
        
        // Close after a delay
        setTimeout(() => {
          console.log('Closing signup form after successful registration');
          onClose();
          onSwitchToLogin(); // Direct to login
        }, 1500);
      } catch (error) {
        console.error('Signup form error:', error);
        setAuthError(getErrorMessage(error.code || 'unknown'));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleOverlayClick = (e) => {
    if (formRef.current && !formRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" ref={formRef}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Join Our Community</h2>
        </div>
        
        {submitSuccess ? (
          <div className="success-message">
            <span role="img" aria-label="success">✅</span>
            <p>Registration successful! Welcome to our community.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="signup-form">
            {authError && <div className="auth-error">{authError}</div>}
            
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={formErrors.fullName ? 'error' : ''}
                placeholder="Enter your full name"
              />
              {formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? 'error' : ''}
                placeholder="Enter your email address"
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={formErrors.password ? 'error' : ''}
                placeholder="Create a password"
              />
              {formErrors.password && <span className="error-message">{formErrors.password}</span>}
            </div>
            
            <button 
              type="submit" 
              className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Join Now'}
            </button>
            
            <div className="form-switch">
              <p>Already have an account? <button type="button" onClick={onSwitchToLogin} className="switch-button">Log in</button></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupForm; 