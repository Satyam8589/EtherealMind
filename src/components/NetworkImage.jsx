import React from 'react';

const NetworkImage = () => {
  // Use the network image directly as an inline SVG
  return (
    <div className="network-image">
      <img 
        src="/images/network.png" 
        alt="Network visualization of connected people" 
        className="network-img"
      />
    </div>
  );
};

export default NetworkImage; 