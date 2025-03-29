import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add error handling for React initialization
try {
  console.log('Initializing React application');
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found. Cannot mount React application.');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('React application mounted successfully');
} catch (error) {
  console.error('Failed to initialize React application:', error);
  
  // Display error message to user
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h2>Failed to load application</h2>
        <p>We encountered an error while starting the application. Please try refreshing the page.</p>
        <details style="margin-top: 20px; text-align: left;">
          <summary>Error details</summary>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${error.message}</pre>
        </details>
      </div>
    `;
  }
}
