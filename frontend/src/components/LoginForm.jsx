import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const { login, currentUser } = useAuth();
  const formRef = useRef();
  const emailInputRef = useRef();

  // Focus the email input when the form opens
  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close the form if the user is already logged in
  useEffect(() => {
    if (currentUser && isOpen) {
      onClose();
    }
  }, [currentUser, isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    // Clear auth error when user makes changes
    if (authError) {
      setAuthError('');
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
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
    setAuthError('');
    
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      setFormErrors({});
      
      try {
        console.log('Submitting login form with email:', formData.email);
        const user = await login(formData.email, formData.password);
        
        if (user) {
          console.log('Login successful, closing modal');
          // Clear form data
          setFormData({
            email: '',
            password: ''
          });
          onClose();
        } else {
          throw new Error('Login failed - no user returned');
        }
      } catch (error) {
        console.error('Login form error:', error);
        setAuthError(error.message || 'An unexpected error occurred. Please try again.');
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

  // Function to get a user-friendly error message from Firebase error codes
  const getFirebaseErrorMessage = (errorCode) => {
    switch(errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid login credentials. Please check and try again.';
      case 'auth/invalid-email':
        return 'Invalid email format. Please check and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later or reset your password.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return 'An error occurred during login. Please try again later.';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" ref={formRef}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Log In</h2>
          <p className="demo-credentials">
            Demo: demo@example.com / password123
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          {authError && <div className="auth-error">{authError}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              ref={emailInputRef}
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
              placeholder="Enter your password"
            />
            {formErrors.password && <span className="error-message">{formErrors.password}</span>}
          </div>
          
          <button 
            type="submit" 
            className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Log In'}
          </button>
          
          <div className="form-switch">
            <p>Don't have an account? <button type="button" onClick={onSwitchToSignup} className="switch-button">Sign up</button></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 