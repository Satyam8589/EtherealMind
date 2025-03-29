import React from 'react';
import NetworkImage from './NetworkImage';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content animate-fadeIn">
        <h1>Share your thoughts with</h1>
        <p>Connect and inspire through diverse ideas.</p>
        <a href="#join" className="btn">Join now</a>
      </div>
      <div className="hero-image animate-fadeIn">
        <NetworkImage />
      </div>
    </section>
  );
};

export default Hero; 