import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PostStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const result = await api.getStats();
        
        if (result.success) {
          setStats(result.stats);
        } else {
          setError(result.error || 'Failed to load stats');
          // Use fallback stats if available
          if (result.stats) {
            setStats(result.stats);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 5 minutes
    const intervalId = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="stats-container" style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
        <p>Loading stats...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="stats-container" style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px', marginBottom: '20px' }}>
        <p>Error loading stats: {error}</p>
      </div>
    );
  }

  return (
    <div className="stats-container" style={{ 
      padding: '15px', 
      backgroundColor: '#f0f7ff', 
      borderRadius: '8px', 
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.2rem' }}>Community Stats</h3>
      
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '10px',
        textAlign: 'center'
      }}>
        <div className="stat-item">
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4a90e2' }}>
            {stats?.totalPosts || 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Posts</div>
        </div>
        
        <div className="stat-item">
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4a90e2' }}>
            {stats?.totalViews ? stats.totalViews.toLocaleString() : 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Views</div>
        </div>
        
        {stats?.popularCategories && stats.popularCategories.length > 0 && (
          <div className="stat-item" style={{ gridColumn: '1 / -1', marginTop: '5px' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>Popular Categories</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
              {stats.popularCategories.map(cat => (
                <span key={cat.name} style={{ 
                  backgroundColor: '#e0f0ff', 
                  padding: '3px 8px', 
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}>
                  {cat.name} ({cat.count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', textAlign: 'right' }}>
        Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Unknown'}
      </div>
    </div>
  );
};

export default PostStats; 