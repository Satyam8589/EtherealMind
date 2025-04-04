import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Testimonial from './components/Testimonial';
import Footer from './components/Footer';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import ProfilePage from './components/ProfilePage';
import ExplorePage from './components/ExplorePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SavedPostsProvider } from './contexts/SavedPostsContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Define baseUrl for API calls
const baseUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080' 
  : 'https://etherealmind-backend.vercel.app';

// Simple loading component
const LoadingIndicator = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    flexDirection: 'column',
    background: '#f9f9f9'
  }}>
    <h2>Loading EtherealMind...</h2>
    <p>Please wait while we set things up.</p>
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error("Error caught by ErrorBoundary:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page or check the console for more details.</p>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary>Error details</summary>
            <pre>{this.state.error && this.state.error.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected route component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  console.log('ProtectedRoute check - Current user:', currentUser ? 'authenticated' : 'not authenticated', 'Loading:', loading);
  
  if (loading) {
    return <LoadingIndicator />;
  }
  
  return currentUser ? children : <Navigate to="/" />;
}

// Main content wrapper to handle authenticated vs unauthenticated states
function MainContent() {
  console.log('MainContent rendering');
  const { currentUser, loading } = useAuth();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  console.log('MainContent - Current user:', currentUser ? 'authenticated' : 'not authenticated', 'Loading:', loading);

  const openSignup = () => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  };

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
  };

  const closeModals = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(false);
  };

  const switchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const switchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (currentUser) {
    console.log('Rendering authenticated routes');
    return (
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route 
          path="/explore" 
          element={
            <ProtectedRoute>
              <ExplorePage isStandalone={true} />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Return landing page if not logged in
  console.log('Rendering landing page for unauthenticated user');
  return (
    <>
      <div className="container">
        <Header onJoinClick={openSignup} onLoginClick={openLogin} />
        <Hero onJoinClick={openSignup} />
      </div>
      <Testimonial />
      <div className="container">
        <Footer />
      </div>
      <SignupForm isOpen={isSignupOpen} onClose={closeModals} onSwitchToLogin={switchToLogin} />
      <LoginForm isOpen={isLoginOpen} onClose={closeModals} onSwitchToSignup={switchToSignup} />
    </>
  );
}

function App() {
  console.log('App component rendering');
  const [appLoaded, setAppLoaded] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown');

  // Mark app as loaded
  useEffect(() => {
    // Short delay to ensure all components have initialized
    setTimeout(() => {
      setAppLoaded(true);
      console.log('App marked as loaded');
    }, 1000);
  }, []);

  // Test backend connection
  useEffect(() => {
    const testBackendConnection = async () => {
      setApiStatus('checking');
      // List of health endpoints to try - updated based on the backend screenshot
      const healthEndpoints = [
        `${baseUrl}/health`,
        `${baseUrl}/api/health`,
        `${baseUrl}/api/standalone-health`,
        `${baseUrl}/api/saved-posts`,
        // Try without trailing slashes
        `${baseUrl.replace(/\/$/, '')}/health`,
        `${baseUrl.replace(/\/$/, '')}/api/health`,
        // Try the Vercel deployment
        `https://ethereal-mind-mvqz-ght2e64uv.vercel.app/health`,
        `https://ethereal-mind-mvqz-ght2e64uv.vercel.app/api/health`
      ];

      for (const endpoint of healthEndpoints) {
        try {
          console.log(`Attempting to connect to: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: 'cors',
            credentials: 'include',
          });
          
          console.log(`Response status for ${endpoint}: ${response.status}`);
          
          // Log headers for debugging
          const headers = {};
          response.headers.forEach((value, key) => {
              headers[key] = value;
          });
          console.log('Response headers:', headers);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Backend connection successful:', data);
            setApiStatus('connected');
            return;
          } else {
            console.warn(`Endpoint ${endpoint} returned status ${response.status}`);
          }
        } catch (error) {
          console.warn(`Failed to connect to ${endpoint}:`, error);
        }
      }

      console.error('All backend connection attempts failed');
      setApiStatus('failed');
    };
    
    testBackendConnection();
  }, []);

  if (!appLoaded) {
    console.log('Showing loading state');
    return <LoadingIndicator />;
  }

  console.log('Debug - Rendering App with providers');
  
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <SavedPostsProvider>
            <div className="app">
              {apiStatus === 'failed' && (
                <div style={{ 
                  padding: '10px', 
                  background: '#ffebee', 
                  color: '#c62828', 
                  textAlign: 'center',
                  position: 'relative',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  <span role="img" aria-label="Warning" style={{ fontSize: '18px' }}>⚠️</span>
                  <div>
                    Backend connection unavailable. Running in offline mode with local data.
                    <br />
                    <small style={{ color: '#444', fontSize: '12px' }}>
                      Some features like saving posts may not work. Your data will be stored locally.
                    </small>
                  </div>
                </div>
              )}
              <MainContent />
            </div>
          </SavedPostsProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
