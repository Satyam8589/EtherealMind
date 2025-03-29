import React from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Testimonial from './components/Testimonial';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <div className="container">
        <Header />
        <Hero />
      </div>
      <Testimonial />
      <div className="container">
        <Footer />
      </div>
    </div>
  );
}

export default App;
