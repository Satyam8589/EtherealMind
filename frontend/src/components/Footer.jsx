import React from 'react';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-info">
            <h3>ThoughtShare</h3>
            <p>Platform for idea sharing and interaction.</p>
            <div className="social-icons">
              <a href="#" aria-label="Instagram">
                <span role="img" aria-hidden="true">📷</span>
              </a>
              <a href="#" aria-label="Twitter">
                <span role="img" aria-hidden="true">🐦</span>
              </a>
              <a href="#" aria-label="LinkedIn">
                <span role="img" aria-hidden="true">💼</span>
              </a>
            </div>
            <p>Join us on:</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Comedy</h4>
              <ul>
                <li><a href="#">Motivation</a></li>
                <li><a href="#">Collaboration</a></li>
                <li><a href="#">Business</a></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Business</h4>
              <ul>
                <li><a href="#">Technology</a></li>
                <li><a href="#">Inspiration</a></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Health</h4>
              <ul>
                <li><a href="#">Education</a></li>
                <li><a href="#">Career</a></li>
                <li><a href="#">Updates</a></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Art</h4>
              <ul>
                <li><a href="#">Science</a></li>
                <li><a href="#">Learning Center</a></li>
                <li><a href="#">Customer</a></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Travel</h4>
              <ul>
                <li><a href="#">Food</a></li>
                <li><a href="#">Feedback</a></li>
                <li><a href="#">Contact us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 