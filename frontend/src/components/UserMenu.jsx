import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const dropdownRef = useRef(null);

  // Get the first letter of the email as avatar
  const getInitial = () => {
    if (!currentUser || !currentUser.email) return '?';
    return currentUser.email.charAt(0).toUpperCase();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="user-button">
        <div className="avatar">{getInitial()}</div>
        <span>My Account</span>
      </button>
      
      {isDropdownOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item">{currentUser.email}</div>
          <a href="#profile" className="dropdown-item">Profile</a>
          <a href="#settings" className="dropdown-item">Settings</a>
          <button onClick={handleLogout} className="dropdown-item logout">Log Out</button>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 