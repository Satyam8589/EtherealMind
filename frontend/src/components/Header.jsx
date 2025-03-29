import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';

const Header = ({ onJoinClick, onLoginClick }) => {
  const { currentUser } = useAuth();

  return (
    <header className="animate-fadeIn">
      <a href="/" className="logo">Etherealmind</a>
      
      {currentUser ? (
        <UserMenu />
      ) : (
        <div className="auth-buttons">
          <button onClick={onLoginClick} className="login-btn">Log In</button>
          <button onClick={onJoinClick} className="btn">Join now</button>
        </div>
      )}
    </header>
  );
};

export default Header; 