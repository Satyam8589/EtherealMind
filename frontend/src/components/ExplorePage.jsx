import React, { useState, useEffect } from 'react';
import { useSavedPosts } from '../contexts/SavedPostsContext';
import { useNavigate } from 'react-router-dom';
import './ExplorePage.css';

const ExplorePage = ({ onClose, isStandalone = false }) => {
  const { savedPosts, savePost, isPostSaved, toast } = useSavedPosts();
  const [activeCategory, setActiveCategory] = useState(isStandalone ? 'All' : 'Motivation');
  const [sortByDate, setSortByDate] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Use useEffect to check if we should show Saved category by default
  useEffect(() => {
    // If URL has a "saved" query parameter, switch to Saved category
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'saved') {
      setActiveCategory('Saved');
    }
  }, []);

  const categories = [
    'Comedy',
    'Motivation',
    'Business',
    'Technology',
    'Lifestyle'
  ];

  // Mock post data
  const posts = [
    {
      id: 101,
      title: 'The Art of Stand-Up Comedy',
      description: 'Discover the secrets behind making people laugh and the challenges comedians face in a stand-up performance. Read more to explore...',
      category: 'Comedy',
      image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 102,
      title: 'Fuel Your Motivation',
      description: 'Explore strategies to boost your motivation and achieve your personal and professional goals. Find out what experts say...',
      category: 'Motivation',
      image: 'https://images.unsplash.com/photo-1519834584171-e03a7fefd0a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 103,
      title: 'Business Strategies for Growth',
      description: 'Learn about innovative business strategies that can help your company grow and thrive in today\'s competitive market...',
      category: 'Business',
      image: 'https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 104,
      title: 'Technology Trends for 2023',
      description: 'Stay updated with the latest technology trends that are shaping our future. From AI to blockchain, discover what\'s next...',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 105,
      title: 'Mindful Living Essentials',
      description: 'Discover practical tips for incorporating mindfulness into your everyday life for better mental health and wellbeing...',
      category: 'Lifestyle',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ];

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    
    // Update URL if standalone
    if (isStandalone && category === 'Saved') {
      navigate('/explore?view=saved');
    } else if (isStandalone) {
      navigate('/explore');
    }
  };

  const handleSortChange = (sortOption) => {
    setSortByDate(sortOption === 'date');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle saving and unsaving posts with animation feedback
  const handleSavePost = (post) => {
    // Get the element before saving to animate it
    const postIsSaved = isSaved(post.id);
    
    // Call API to save/unsave
    savePost(post);
    
    // Show animation feedback
    const saveButtonElement = document.querySelector(`[data-post-id="${post.id}"]`);
    if (saveButtonElement) {
      saveButtonElement.classList.add('save-animation');
      setTimeout(() => {
        saveButtonElement.classList.remove('save-animation');
      }, 500);
    }
  };

  // Function to check if a post is saved
  const isSaved = (postId) => {
    return savedPosts.some(savedItem => 
      savedItem.postId === postId || 
      savedItem.postId === String(postId)
    );
  };

  // Filter posts based on active category and search query
  const filteredPosts = posts.filter(post => {
    let categoryMatch = true;
    
    // If it's not "All" or "Saved", filter by the selected category
    if (activeCategory !== 'All' && activeCategory !== 'Saved') {
      categoryMatch = post.category === activeCategory;
    }
    
    // If "Saved" is selected, only show saved posts
    if (activeCategory === 'Saved') {
      categoryMatch = isSaved(post.id);
    }
    
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && matchesSearch;
  });

  const handleBackToProfile = () => {
    if (isStandalone) {
      navigate('/');
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`explore-page ${isStandalone ? 'standalone' : ''}`}>
      <div className="explore-header">
        <div className="explore-logo">
          <span className="explore-logo-icon">🔸</span>
          <span className="explore-logo-text">ThoughtShare</span>
        </div>
        <div className="explore-search">
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchQuery}
            onChange={handleSearch}
            className="explore-search-input"
          />
        </div>
        <button className="explore-back-button" onClick={handleBackToProfile}>
          Back to Profile
        </button>
      </div>

      <div className="explore-content">
        <div className="explore-sidebar">
          <div className="explore-filters">
            <h3 className="filters-title">Filters</h3>
            
            <div className="sort-options">
              <p className="sort-by-text">Sort By</p>
              <div className="sort-radio">
                <input 
                  type="radio" 
                  id="sort-date" 
                  name="sort" 
                  checked={sortByDate} 
                  onChange={() => handleSortChange('date')}
                />
                <label htmlFor="sort-date">Date</label>
              </div>
              <div className="sort-radio">
                <input 
                  type="radio" 
                  id="sort-popularity" 
                  name="sort" 
                  checked={!sortByDate} 
                  onChange={() => handleSortChange('popularity')}
                />
                <label htmlFor="sort-popularity">Popularity</label>
              </div>
            </div>
          </div>
        </div>

        <div className="explore-main">
          <div className="explore-categories">
            <button 
              key="All"
              className={`category-button ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('All')}
            >
              All
            </button>
            {categories.map(category => (
              <button 
                key={category}
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
            <button 
              key="Saved"
              className={`category-button ${activeCategory === 'Saved' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('Saved')}
            >
              Saved {savedPosts.length > 0 && <span className="saved-count">{savedPosts.length}</span>}
            </button>
          </div>

          <div className="explore-posts">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <div className="post-card" key={post.id}>
                  <div className="post-image">
                    <img src={post.image} alt={post.title} />
                    <button 
                      className={`save-button ${isSaved(post.id) ? 'saved' : ''}`}
                      onClick={() => handleSavePost(post)}
                      title={isSaved(post.id) ? "Unsave" : "Save"}
                      data-post-id={post.id}
                    >
                      {isSaved(post.id) ? '★' : '☆'}
                    </button>
                  </div>
                  <div className="post-details">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-description">{post.description}</p>
                    <div className="post-actions">
                      <button className="read-more-button">Read More</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-posts-message">
                {activeCategory === 'Saved' ? (
                  <>
                    <h3>No saved posts yet</h3>
                    <p>Posts you save will appear here</p>
                  </>
                ) : (
                  <>
                    <h3>No posts available</h3>
                    <p>Try a different category or search term</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="explore-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="contact-info">
              <p>Contact Us</p>
              <p className="email">Email: support@thoughtshare.com</p>
            </div>
            <div className="newsletter">
              <p>Subscribe to Our Newsletter</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email address" className="newsletter-input" />
                <button className="subscribe-button">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="footer-right">
            <div className="social-links">
              <a href="#" className="social-link">f</a>
              <a href="#" className="social-link">t</a>
              <a href="#" className="social-link">i</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast notification */}
      {toast && toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default ExplorePage; 