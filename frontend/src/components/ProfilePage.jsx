import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSavedPosts } from '../contexts/SavedPostsContext';
import { Link, useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import PostCreationPage from './PostCreationPage';
import ExplorePage from './ExplorePage';
import UserProfileSettings from './UserProfileSettings';

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const { savedPosts, savePost, isPostSaved, allPosts, addNewPost, toast } = useSavedPosts();
  const [activeTab, setActiveTab] = useState('recommended');
  const [showPostCreation, setShowPostCreation] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [localPosts, setLocalPosts] = useState([]);
  const [demoPostsVisible, setDemoPostsVisible] = useState(true); // Control visibility of demo posts
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const navigate = useNavigate();
  
  // Get user's display name or email as fallback
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  // Load all posts when component mounts
  useEffect(() => {
    if (allPosts && allPosts.length > 0) {
      setLocalPosts(allPosts);
    } else {
      // Fallback to mock data if no posts in context
      setLocalPosts([]);
    }
  }, [allPosts]);
  
  // Calculate user's post count - only count posts authored by current user
  const userPostCount = localPosts.filter(post => 
    post.authorId === currentUser?.uid || 
    post.author === currentUser?.displayName || 
    post.author === currentUser?.email
  ).length;

  // Demo posts - kept separate from user posts
  const demoPosts = [
    {
      id: 101,
      title: 'The Art of Stand-Up Comedy',
      description: 'Discover the secrets behind making people laugh and the challenges comedians face in a stand-up performance. Read more to explore...',
      category: 'Comedy',
      image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      isDemo: true
    },
    {
      id: 102,
      title: 'Fuel Your Motivation',
      description: 'Explore strategies to boost your motivation and achieve your personal and professional goals. Find out what experts say...',
      category: 'Motivation',
      image: 'https://images.unsplash.com/photo-1519834584171-e03a7fefd0a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      isDemo: true
    },
    {
      id: 103,
      title: 'Business Strategies for Growth',
      description: 'Learn about innovative business strategies that can help your company grow and thrive in today\'s competitive market...',
      category: 'Business',
      image: 'https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      isDemo: true
    },
    {
      id: 104,
      title: 'Technology Trends for 2023',
      description: 'Stay updated with the latest technology trends that are shaping our future. From AI to blockchain, discover what\'s next...',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      isDemo: true
    },
  ];
  
  // Tab options for the profile page
  const tabOptions = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'saved', label: 'Saved', count: savedPosts?.length },
    { id: 'created', label: 'Your Posts' },
    { id: 'demo', label: 'Demo Content', count: demoPosts.length }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreatePost = () => {
    console.log("Opening post creation modal");
    setShowPostCreation(true);
  };

  const handleClosePostCreation = () => {
    console.log("Closing post creation modal");
    setShowPostCreation(false);
  };

  const handlePostCreated = (newPost) => {
    console.log("New post created:", newPost);
    
    // No need to manually add to localPosts, as the addNewPost function in SavedPostsContext
    // already adds it to allPosts which is used to populate localPosts via useEffect
    
    // Close the post creation modal
    setShowPostCreation(false);
    
    // Switch to "Your Posts" tab to show the new post
    setActiveTab('created');
  };

  const handleExploreClick = () => {
    setShowExplore(true);
  };

  const handleCloseExplore = () => {
    setShowExplore(false);
  };

  // Function to check if a post is saved
  const isSaved = (postId) => {
    return savedPosts.some(savedItem => 
      savedItem.postId === postId || 
      savedItem.postId === String(postId)
    );
  };

  const handleViewSavedPosts = () => {
    navigate('/explore?view=saved');
  };

  // Handle saving and unsaving posts with animation feedback
  const handleSaveProfileCourse = (course) => {
    // Call API to save/unsave
    savePost(course);
    
    // Show animation feedback
    const saveButtonElement = document.querySelector(`[data-course-id="${course.id}"]`);
    if (saveButtonElement) {
      saveButtonElement.classList.add('save-animation');
      setTimeout(() => {
        saveButtonElement.classList.remove('save-animation');
      }, 500);
    }
  };

  const handleEditProfile = () => {
    console.log("Opening profile settings modal");
    setShowProfileSettings(true);
  };

  const handleCloseProfileSettings = () => {
    console.log("Closing profile settings modal");
    setShowProfileSettings(false);
  };

  // Get all content that should be displayed based on active tab
  const getFilteredContent = () => {
    if (activeTab === 'saved') {
      // Filter posts that are saved
      return [...localPosts, ...demoPosts].filter(post => isSaved(post.id));
    } else if (activeTab === 'created') {
      // Filter posts created by the current user
      return localPosts.filter(post => 
        post.authorId === currentUser?.uid || 
        post.author === currentUser?.displayName || 
        post.author === currentUser?.email
      );
    } else if (activeTab === 'demo') {
      // Show only demo posts
      return demoPosts;
    } else {
      // For recommended/All tab, show all posts including user posts and demos
      return [...localPosts, ...demoPosts];
    }
  };
  
  const filteredContent = getFilteredContent();

  // Function to format post content
  const formatPostContent = (content) => {
    if (!content) return '';
    
    // Truncate long content
    if (content.length > 150) {
      return content.substring(0, 150) + '...';
    }
    return content;
  };

  return (
    <div className="profile-page">
      {/* Navigation */}
      <nav className="profile-nav">
        <div className="profile-nav-container">
          <div className="profile-logo">
            <span className="profile-logo-dot">●</span>
            EtherealMind
          </div>
          <div className="profile-nav-center">
            <Link to="/" className="profile-nav-link active">Home</Link>
            <Link to="/explore" className="profile-nav-link">Explore</Link>
            <a href="#" className="profile-nav-link">Notifications</a>
            <a href="#" className="profile-nav-link">Messages</a>
          </div>
          <div className="profile-nav-right">
            <button className="profile-signup-btn" onClick={handleLogout}>
              Logout
            </button>
            <div className="profile-avatar" onClick={handleEditProfile}>
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-container">
          <div className="profile-header-content">
            <div className="profile-image">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Profile" />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{userName}</h1>
              <p className="profile-description">Passionate about learning and sharing knowledge on technology, design, and productivity.</p>
              <div className="profile-actions">
                <button className="profile-follow-btn">Follow</button>
                <button className="profile-share-btn" onClick={handleCreatePost}>Create Post</button>
                <button className="profile-edit-btn" onClick={handleEditProfile}>Edit Profile</button>
              </div>
            </div>
          </div>
          
          <div className="profile-links">
            <div className="profile-social-links">
              <a href="#" className="profile-social-link">t</a>
              <a href="#" className="profile-social-link">f</a>
              <a href="#" className="profile-social-link">ig</a>
            </div>
            <a href="#" className="profile-footer-link">Privacy Policy</a>
            <a href="#" className="profile-footer-link">Terms of Service</a>
            <p className="profile-copyright">© 2023 EtherealMind</p>
          </div>
        </div>
      </header>
      
      {/* User stats section */}
      <div className="user-stats">
        <div className="stat-item">
          <div className="stat-value">27</div>
          <div className="stat-label">Following</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">134</div>
          <div className="stat-label">Followers</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{userPostCount}</div>
          <div className="stat-label">Posts</div>
        </div>
      </div>
      
      {/* Tabs */}
      <section className="profile-tabs">
        <div className="profile-tabs-container">
          {tabOptions.map(tab => (
            <button 
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => tab.id === 'saved' ? handleViewSavedPosts() : handleTabChange(tab.id)}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="profile-tab-count">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </section>
      
      {/* Content */}
      <div className="profile-content">
        {activeTab === 'demo' && (
          <div className="profile-section-title">
            <h2>Demo Content</h2>
            <p>Example posts to demonstrate the platform features</p>
          </div>
        )}
        
        <div className="profile-content-container">
          {filteredContent.length > 0 ? (
            filteredContent.map(post => (
              <div className={`profile-course-card ${post.isDemo ? 'demo-post' : ''}`} key={post.id}>
                <div className="profile-course-info">
                  <span className="profile-course-category">{post.category}</span>
                  {post.isDemo && <span className="demo-tag">Demo</span>}
                  <h2 className="profile-course-title">{post.title}</h2>
                  <p className="profile-course-description">
                    {formatPostContent(post.description || post.content)}
                  </p>
                  <button className="profile-course-action">View Details</button>
                </div>
                <div className="profile-course-image">
                  <img 
                    src={post.image || post.imageUrl || "https://images.unsplash.com/photo-1519834584171-e03a7fefd0a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"} 
                    alt={post.title} 
                  />
                  <button 
                    className={`profile-save-button ${isSaved(post.id) ? 'saved' : ''}`} 
                    onClick={() => handleSaveProfileCourse(post)}
                    data-course-id={post.id}
                  >
                    {isSaved(post.id) ? '★' : '☆'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-content-message">
              {activeTab === 'saved' ? (
                <div>
                  <h3>No saved items yet</h3>
                  <p>Your saved courses and posts will appear here.</p>
                  <button 
                    className="browse-explore-button"
                    onClick={() => navigate('/explore')}
                  >
                    Browse Explore Page
                  </button>
                </div>
              ) : activeTab === 'created' ? (
                <div>
                  <h3>You haven't created any posts yet</h3>
                  <p>Share your thoughts with the community by creating a post.</p>
                  <button 
                    className="browse-explore-button create-post-button"
                    onClick={handleCreatePost}
                  >
                    Create Your First Post
                  </button>
                </div>
              ) : (
                <div>
                  <h3>No content available</h3>
                  <p>Check back later for more content.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Load More Button */}
        {filteredContent.length > 0 && (
          <div className="profile-load-more">
            <button className="profile-load-more-btn">Load More</button>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && toast.show && (
        <div className={`profile-toast-notification ${toast.type}`}>
          <p>{toast.message}</p>
        </div>
      )}

      {/* Post Creation Modal */}
      {showPostCreation && (
        <PostCreationPage 
          onClose={handleClosePostCreation} 
          onPostCreated={handlePostCreated}
        />
      )}
      
      {/* Explore Page Modal */}
      {showExplore && (
        <ExplorePage onClose={handleCloseExplore} />
      )}

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <UserProfileSettings 
          onClose={handleCloseProfileSettings} 
        />
      )}
    </div>
  );
};

export default ProfilePage; 