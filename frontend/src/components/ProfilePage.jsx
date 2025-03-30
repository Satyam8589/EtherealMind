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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get user's display name or email as fallback
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  // Load all posts when component mounts
  useEffect(() => {
    console.log("ProfilePage: Posts from allPosts:", allPosts);
    
    if (allPosts && allPosts.length > 0) {
      // Make sure we have all posts loaded
      setLocalPosts(allPosts);
      console.log("ProfilePage: Setting localPosts:", allPosts);
    } else {
      // Fallback to mock data if no posts in context
      const mockPosts = [
        {
          id: 201,
          title: 'Understanding Meditation',
          content: 'Meditation is a practice that involves training your attention and awareness to achieve mental clarity and emotional calm.',
          category: 'Meditation',
          author: 'John Doe',
          date: '2023-05-15',
          image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 202,
          title: 'Dream Interpretation',
          content: 'Dreams often reflect our subconscious thoughts and emotions, providing insights into our inner conflicts and desires.',
          category: 'Dreams',
          author: 'Jane Smith',
          date: '2023-05-20',
          image: 'https://images.unsplash.com/photo-1515894274780-af5d4d90ba32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 203,
          title: 'Chakra Healing',
          content: 'Chakra healing focuses on balancing the seven energy centers in the body to promote physical and emotional well-being.',
          category: 'Healing',
          author: 'Alex Johnson',
          date: '2023-05-25',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ];
      
      setLocalPosts(mockPosts);
      console.log("ProfilePage: No posts found in allPosts, using mock data:", mockPosts);
    }
  }, [allPosts]);
  
  // Function to check if a post is created by current user
  const isUserPost = (post) => {
    if (!post || !currentUser) {
      console.log("isUserPost: No post or currentUser", { post, currentUser });
      return false;
    }
    
    // Get user identifiers
    const userId = currentUser.uid;
    const userEmail = currentUser.email;
    const userDisplayName = currentUser.displayName;
    const emailUsername = userEmail ? userEmail.split('@')[0] : null;
    
    // Get post author identifiers
    const postAuthorId = post.authorId;
    const postAuthor = post.author || post.authorName;
    const postUserId = post.userId;
    
    // Log all identifiers for debugging
    console.log("isUserPost: Checking identifiers", { 
      userId, userEmail, userDisplayName, emailUsername,
      postAuthorId, postAuthor, postUserId,
      post
    });
    
    // Check multiple ways a post could be associated with user
    const matchById = userId && (postAuthorId === userId || postUserId === userId);
    const matchByEmail = userEmail && postAuthor === userEmail;
    const matchByDisplayName = userDisplayName && postAuthor === userDisplayName;
    const matchByUsername = emailUsername && postAuthor === emailUsername;
    
    // If the post was recently created in this session, also consider it a match
    const isRecentlyCreated = post.isCurrentUserPost === true;
    
    const isMatch = matchById || matchByEmail || matchByDisplayName || matchByUsername || isRecentlyCreated;
    console.log(`isUserPost: Post ${post.id} matches user: ${isMatch}`, {
      matchById, matchByEmail, matchByDisplayName, matchByUsername, isRecentlyCreated
    });
    
    return isMatch;
  };

  // Calculate user's post count more accurately
  const userPostCount = localPosts.filter(post => isUserPost(post)).length;

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
    { id: 'created', label: 'Your Posts', count: userPostCount },
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
    console.log("Changing tab to:", tab);
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
    console.log("ProfilePage: New post created:", newPost);
    
    // Mark the post as created by the current user to ensure it appears in Your Posts tab
    const postWithUserFlag = {
      ...newPost,
      isCurrentUserPost: true,
      authorId: currentUser?.uid || 'current-user'
    };
    
    // Manually update localPosts to ensure immediate display
    setLocalPosts(prevPosts => [postWithUserFlag, ...prevPosts]);
    
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
    if (!savedPosts || !Array.isArray(savedPosts)) {
      return false;
    }
    
    return savedPosts.some(savedItem => {
      // Handle both formats: {id: number} and {postId: number/string}
      const savedId = savedItem.postId || savedItem.id;
      return savedId === postId || savedId === String(postId);
    });
  };

  const handleViewSavedPosts = () => {
    navigate('/explore?view=saved');
  };

  // Handle saving and unsaving posts with animation feedback
  const handleSaveProfileCourse = (post) => {
    console.log("Saving/unsaving post:", post);
    
    // Call API to save/unsave
    savePost(post);
    
    // Show animation feedback
    const saveButtonElement = document.querySelector(`[data-course-id="${post.id}"]`);
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

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    console.log("Toggling mobile menu:", !mobileMenuOpen);
    setMobileMenuOpen(prevState => !prevState);
  };

  // Handle hamburger click with event stopping
  const handleHamburgerClick = (e) => {
    console.log("Hamburger clicked");
    e.stopPropagation();
    e.preventDefault();
    toggleMobileMenu();
  };

  // Add visual feedback for button clicks
  const handleButtonClick = (e, callback) => {
    const button = e.currentTarget;
    button.classList.add('clicked');
    
    setTimeout(() => {
      button.classList.remove('clicked');
      if (callback) callback();
    }, 150);
  };

  // Get all content that should be displayed based on active tab
  const getFilteredContent = () => {
    console.log("ProfilePage: Filtering content for tab:", activeTab);
    console.log("ProfilePage: Available posts:", localPosts);
    console.log("ProfilePage: Saved posts:", savedPosts);
    console.log("ProfilePage: Current user:", currentUser);
    
    // Important to prevent undefined access errors
    const postsToFilter = Array.isArray(localPosts) ? localPosts : [];
    const demoPostsToUse = Array.isArray(demoPosts) ? demoPosts : [];
    
    // Debug log post structure
    if (postsToFilter.length > 0) {
      console.log("ProfilePage: Sample post structure:", postsToFilter[0]);
    }
    
    if (activeTab === 'saved') {
      // Filter posts that are saved
      const savedContent = [...postsToFilter, ...demoPostsToUse].filter(post => {
        const isSavedResult = isSaved(post.id);
        console.log(`Post ${post.id} is saved: ${isSavedResult}`);
        return isSavedResult;
      });
      console.log("ProfilePage: Saved content:", savedContent);
      return savedContent;
    } else if (activeTab === 'created') {
      // Filter posts created by the current user
      const userContent = postsToFilter.filter(post => {
        const isUserPostResult = isUserPost(post);
        console.log(`Post ${post.id} is user post: ${isUserPostResult}`);
        return isUserPostResult;
      });
      console.log("ProfilePage: User content:", userContent);
      return userContent;
    } else if (activeTab === 'demo') {
      // Show only demo posts
      console.log("ProfilePage: Demo content:", demoPostsToUse);
      return demoPostsToUse;
    } else {
      // For recommended tab, show all posts including user posts and demos
      const allContent = [...postsToFilter, ...demoPostsToUse];
      console.log("ProfilePage: All content:", allContent);
      return allContent;
    }
  };
  
  // Get filtered content for the current tab
  const filteredContent = getFilteredContent();
  console.log(`ProfilePage Render: Tab "${activeTab}" has ${filteredContent.length} items to display:`, filteredContent);

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
          
          {/* Hamburger menu for mobile */}
          <button 
            className={`hamburger-menu ${mobileMenuOpen ? 'open' : ''}`} 
            onClick={handleHamburgerClick}
            aria-label="Toggle navigation menu"
            type="button"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          {/* Desktop navigation */}
          <div className="profile-nav-center">
            <button 
              className="profile-nav-link active" 
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <button 
              className="profile-nav-link" 
              onClick={() => navigate('/explore')}
            >
              Explore
            </button>
            <button 
              className="profile-nav-link" 
              onClick={() => alert("Notifications feature coming soon!")}
            >
              Notifications
            </button>
            <button 
              className="profile-nav-link" 
              onClick={() => alert("Messages feature coming soon!")}
            >
              Messages
            </button>
          </div>
          
          {/* Mobile navigation menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-menu-header">
              <div className="mobile-user-info">
                <div className="mobile-avatar">{userName.charAt(0).toUpperCase()}</div>
                <span className="mobile-username">{userName}</span>
              </div>
              <button 
                className="mobile-menu-close" 
                onClick={() => toggleMobileMenu()}
                aria-label="Close menu"
                type="button"
              >
                ×
              </button>
            </div>
            
            <div className="mobile-menu-items">
              <button 
                className="mobile-menu-item"
                onClick={() => {
                  toggleMobileMenu();
                  navigate('/');
                }}
                role="menuitem"
                type="button"
              >
                Home
              </button>
              
              <button 
                className="mobile-menu-item"
                onClick={() => {
                  toggleMobileMenu();
                  navigate('/explore');
                }}
                role="menuitem"
                type="button"
              >
                Explore
              </button>
              
              <button 
                className="mobile-menu-item" 
                onClick={() => {
                  toggleMobileMenu();
                  alert("Notifications feature coming soon!");
                }}
                role="menuitem"
                type="button"
              >
                Notifications
              </button>
              
              <button 
                className="mobile-menu-item" 
                onClick={() => {
                  toggleMobileMenu();
                  alert("Messages feature coming soon!");
                }}
                role="menuitem"
                type="button"
              >
                Messages
              </button>
              
              <div className="mobile-menu-divider"></div>
              
              <button 
                className="mobile-menu-item" 
                onClick={() => {
                  console.log("Edit Profile button clicked");
                  toggleMobileMenu();
                  handleEditProfile();
                }}
                role="menuitem"
                type="button"
              >
                Edit Profile
              </button>
              
              <button 
                className="mobile-menu-item logout" 
                onClick={() => {
                  console.log("Logout button clicked");
                  toggleMobileMenu();
                  handleLogout();
                }}
                role="menuitem"
                type="button"
              >
                Logout
              </button>
            </div>
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
          </div>
        </div>
      </header>
      
      {/* User stats */}
      <div className="profile-content">
        <div className="profile-content-container">
          <div className="user-stats">
            <div className="stat-item">
              <div className="stat-value">{userPostCount}</div>
              <div className="stat-label">posts</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">542</div>
              <div className="stat-label">followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">267</div>
              <div className="stat-label">following</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{savedPosts?.length || 0}</div>
              <div className="stat-label">saved</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab header showing which content is currently displayed */}
      <div className="profile-section-title">
        <h2>
          {activeTab === 'recommended' && 'Recommended Content'}
          {activeTab === 'saved' && 'Saved Content'}
          {activeTab === 'created' && 'Your Posts'}
          {activeTab === 'demo' && 'Demo Content'}
        </h2>
        <p>
          {activeTab === 'recommended' && 'Content tailored for you'}
          {activeTab === 'saved' && 'Content you\'ve saved for later'}
          {activeTab === 'created' && 'Posts you\'ve shared with the community'}
          {activeTab === 'demo' && 'Example posts to demonstrate the platform features'}
        </p>
      </div>
      
      {/* Tabs */}
      <div className="profile-tabs">
        <div className="profile-tabs-container">
          {tabOptions.map(tab => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`profile-tab-count ${activeTab === tab.id ? 'active' : ''}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="profile-content">
        <div className="profile-content-container">
          {filteredContent && filteredContent.length === 0 ? (
            <div className="no-content-message">
              <h3>No content to display</h3>
              <p>
                {activeTab === 'saved' 
                  ? "You haven't saved any posts yet." 
                  : activeTab === 'created'
                    ? "You haven't created any posts yet." 
                    : "There are no posts to display."}
              </p>
              {activeTab === 'created' ? (
                <button className="browse-explore-button" onClick={handleCreatePost}>
                  Create Your First Post
                </button>
              ) : (
                <button className="browse-explore-button" onClick={handleExploreClick}>
                  Browse Explore Page
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Debug post count display */}
              <p className="post-count-debug">
                Displaying {filteredContent.length} posts for "{activeTab}" tab
              </p>
              
              {/* Posts list */}
              {filteredContent.map((post, index) => (
                <div key={`${post.id}-${index}`} className={`profile-course-card ${post.isDemo ? 'demo-post' : ''}`}>
                  <div className="profile-course-image">
                    <img 
                      src={post.image || post.imageUrl} 
                      alt={post.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";
                      }}
                    />
                    <button 
                      className={`profile-save-button ${isSaved(post.id) ? 'saved' : ''}`}
                      onClick={() => handleSaveProfileCourse(post)}
                      data-course-id={post.id}
                    >
                      {isSaved(post.id) ? '★' : '☆'}
                    </button>
                  </div>
                  <div className="profile-course-info">
                    <div>
                      <span className="profile-course-category">{post.category || 'General'}</span>
                      {post.isDemo && <span className="demo-tag">Demo</span>}
                      {isUserPost(post) && <span className="user-post-tag">Your Post</span>}
                    </div>
                    <h3 className="profile-course-title">{post.title}</h3>
                    <p className="profile-course-description">
                      {post.description || formatPostContent(post.content)}
                    </p>
                    <button className="profile-course-action">View Details</button>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {filteredContent && filteredContent.length > 0 && (
            <div className="profile-load-more">
              <button className="profile-load-more-btn">Load More</button>
            </div>
          )}
        </div>
      </div>
      
      {/* Post Creation Modal */}
      {showPostCreation && (
        <PostCreationPage 
          onClose={handleClosePostCreation} 
          onPostCreated={handlePostCreated}
        />
      )}
      
      {/* Explore Page Modal */}
      {showExplore && (
        <ExplorePage
          onClose={handleCloseExplore}
        />
      )}
      
      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <UserProfileSettings 
          onClose={() => setShowProfileSettings(false)}
        />
      )}

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={toggleMobileMenu}
        ></div>
      )}
    </div>
  );
};

export default ProfilePage; 