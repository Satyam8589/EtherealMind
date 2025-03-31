import React, { useState, useEffect } from 'react';
import { useSavedPosts } from '../contexts/SavedPostsContext';
import { useNavigate } from 'react-router-dom';
import './ExplorePage.css';

const ExplorePage = ({ onClose, isStandalone = false }) => {
  const { savedPosts, savePost, isPostSaved, allPosts, toast } = useSavedPosts();
  const [activeCategory, setActiveCategory] = useState(isStandalone ? 'All' : 'Motivation');
  const [sortByDate, setSortByDate] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const navigate = useNavigate();

  // Use useEffect to check if we should show Saved category by default
  useEffect(() => {
    // If URL has a "saved" query parameter, switch to Saved category
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'saved') {
      setActiveCategory('Saved');
    }
  }, []);
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && showPostModal) {
        closePostModal();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showPostModal]);

  const categories = [
    'Comedy',
    'Motivation',
    'Business',
    'Technology',
    'Lifestyle'
  ];

  // Demo posts - these are the fixed standard posts shown to everyone
  const demoPosts = [
    {
      id: 101,
      title: 'The Art of Stand-Up Comedy',
      description: 'Discover the secrets behind making people laugh and the challenges comedians face in a stand-up performance. Read more to explore...',
      content: `Stand-up comedy is a craft that requires incredible resilience, creativity, and timing. Comics spend years perfecting their material, learning to read audiences, and developing a unique voice that sets them apart. Behind every successful stand-up routine is countless hours of writing, revising, and bombing on stage.

The most effective comedians find ways to transform personal struggles, observations, and social commentary into relatable content that resonates with audiences. They develop the courage to be vulnerable while maintaining control of the room.

Many comedians describe the feeling of making a room full of strangers laugh as an unparalleled high - it's what keeps them coming back despite the challenging nature of the profession. Understanding the psychology of laughter and the technical aspects of delivery are skills that take years to master.

Whether you're an aspiring comedian or simply a fan of the art form, appreciating the work that goes into crafting the perfect set can deepen your enjoyment of stand-up comedy.`,
      category: 'Comedy',
      author: 'Michael Thompson',
      createdAt: new Date('2023-11-15'),
      image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 102,
      title: 'Fuel Your Motivation',
      description: 'Explore strategies to boost your motivation and achieve your personal and professional goals. Find out what experts say...',
      content: `Motivation is the driving force behind all human action and achievement. It's what pushes us to take action, to work toward our goals, and to persist in the face of challenges and setbacks. But motivation isn't constant - it ebbs and flows, influenced by a complex mix of internal and external factors.

Experts in psychology and neuroscience have identified several effective strategies for boosting and maintaining motivation:

1. Set clear, specific, and achievable goals that align with your values
2. Break large goals into smaller, manageable tasks to create a sense of progress
3. Establish a routine that incorporates habits supporting your goals
4. Find your "why" - connect your actions to deeper meaning and purpose
5. Surround yourself with supportive people who believe in your goals
6. Celebrate small wins along the way to reinforce positive behavior

Understanding that motivation fluctuates naturally can help you develop strategies for those low-energy days. Building systems and habits that don't rely solely on feeling motivated is key to long-term success and achievement.`,
      category: 'Motivation',
      author: 'Rebecca Chen',
      createdAt: new Date('2023-11-22'),
      image: 'https://images.unsplash.com/photo-1519834584171-e03a7fefd0a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 103,
      title: 'Business Strategies for Growth',
      description: 'Learn about innovative business strategies that can help your company grow and thrive in today\'s competitive market...',
      content: `In today's rapidly evolving business landscape, companies must adopt innovative strategies to achieve sustainable growth. The most successful organizations understand that growth requires a multifaceted approach that balances short-term gains with long-term vision.

Key strategies that industry leaders are implementing include:

• Customer-centric product development that addresses real pain points
• Leveraging data analytics to make informed, evidence-based decisions
• Developing agile processes that allow quick pivots in response to market changes
• Investing in employee development to build organizational capabilities
• Exploring strategic partnerships to expand reach and capabilities
• Implementing sustainable practices that appeal to modern consumers

Companies like Amazon, Apple, and Tesla have demonstrated that challenging industry norms and focusing relentlessly on customer experience can lead to exceptional growth, even in crowded markets. The ability to adapt quickly while maintaining a clear long-term vision is what separates market leaders from the competition.

Remember that growth strategies must be tailored to your specific industry, company size, and market position - there is no one-size-fits-all approach to business expansion.`,
      category: 'Business',
      author: 'James Wilson',
      createdAt: new Date('2023-12-05'),
      image: 'https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 104,
      title: 'Technology Trends for 2023',
      description: 'Stay updated with the latest technology trends that are shaping our future. From AI to blockchain, discover what\'s next...',
      content: `The pace of technological innovation continues to accelerate, with 2023 bringing transformative advancements across multiple domains. Several key trends are reshaping industries, consumer experiences, and society as a whole:

1. Artificial Intelligence and Machine Learning - AI models are becoming more sophisticated and accessible, with generative AI tools like ChatGPT, DALL-E, and Midjourney revolutionizing content creation and problem-solving.

2. Sustainable Technology - As environmental concerns mount, green tech innovations in renewable energy storage, carbon capture, and eco-friendly manufacturing are gaining traction.

3. Extended Reality (XR) - The boundaries between physical and digital worlds continue to blur as VR, AR, and mixed reality technologies mature and find practical applications beyond gaming.

4. Edge Computing - Processing data closer to where it's collected is reducing latency and enabling real-time applications in IoT, autonomous vehicles, and smart infrastructure.

5. Quantum Computing - While still in early stages, quantum computing breakthroughs are beginning to address previously unsolvable problems in cryptography, materials science, and complex system modeling.

Business leaders and individuals alike must stay informed about these developments, as they present both opportunities for innovation and potential disruption to established patterns and industries.`,
      category: 'Technology',
      author: 'Sophia Rodriguez',
      createdAt: new Date('2023-12-15'),
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 105,
      title: 'Mindful Living Essentials',
      description: 'Discover practical tips for incorporating mindfulness into your everyday life for better mental health and wellbeing...',
      content: `In our busy, hyper-connected world, mindfulness offers a powerful antidote to stress, anxiety, and burnout. Mindfulness is the practice of bringing your awareness to the present moment - observing your thoughts, feelings, and sensations without judgment.

Research has demonstrated numerous benefits of regular mindfulness practice, including:
• Reduced stress and anxiety
• Improved focus and concentration
• Enhanced emotional regulation
• Better sleep quality
• Stronger immune function
• Increased self-awareness and compassion

Integrating mindfulness into daily life doesn't require hours of meditation. Simple practices can be incorporated throughout your day:

- Begin your morning with a brief breathing exercise before checking devices
- Practice mindful eating by savoring each bite without distractions
- Take "mindful minutes" between tasks to check in with your body and breath
- Transform routine activities like showering or walking into opportunities for presence
- End your day with a brief gratitude practice, acknowledging positive moments

Mindfulness isn't about emptying your mind or achieving a specific state - it's about developing a different relationship with your thoughts and experiences, characterized by openness and curiosity rather than reactivity.

With consistent practice, mindfulness can become less of a formal exercise and more of an integrated approach to living with greater awareness, balance, and fulfillment.`,
      category: 'Lifestyle',
      author: 'David Kim',
      createdAt: new Date('2023-12-28'),
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
  const handleSavePost = async (post) => {
    try {
      // Get the element before saving to animate it
      const postIsSaved = isPostSaved(post.id);
      console.log(`Attempting to ${postIsSaved ? 'unsave' : 'save'} post:`, post.id);
      
      // Call API to save/unsave
      await savePost(post);
      
      // Show animation feedback
      const saveButtonElement = document.querySelector(`[data-post-id="${post.id}"]`);
      if (saveButtonElement) {
        saveButtonElement.classList.add('save-animation');
        setTimeout(() => {
          saveButtonElement.classList.remove('save-animation');
        }, 500);
      }
    } catch (error) {
      console.error('Error in handleSavePost:', error);
      // Show error alert
      alert(`Failed to ${isPostSaved(post.id) ? 'remove' : 'save'} post. Please try again.`);
    }
  };
  
  // Handle opening post modal
  const handleReadMore = (post) => {
    console.log('Read More clicked for post:', post);
    if (!post) {
      console.error('No post provided to handleReadMore');
      return;
    }
    
    try {
      setSelectedPost({...post});
      setShowPostModal(true);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
      console.log('Modal should be visible now, showPostModal:', true);
    } catch (error) {
      console.error('Error in handleReadMore:', error);
    }
  };
  
  // Close post modal
  const closePostModal = () => {
    console.log('Closing post modal');
    setShowPostModal(false);
    document.body.style.overflow = ''; // Restore scrolling
    // Add a small delay before clearing the selected post to avoid UI flickering
    setTimeout(() => setSelectedPost(null), 300);
  };

  // Filter posts based on active category and search query
  const filteredPosts = (() => {
    let postsToShow = [];
    
    // For the "Saved" category, only show saved posts
    if (activeCategory === 'Saved') {
      // Get IDs of all saved posts
      const savedPostIds = savedPosts.map(item => item.postId);
      
      // Find the corresponding full post objects from both demo posts and user posts
      const savedDemoPosts = demoPosts.filter(post => 
        savedPostIds.includes(String(post.id)) || savedPostIds.includes(post.id)
      );
      
      const savedUserPosts = (allPosts || []).filter(post => 
        savedPostIds.includes(String(post.id)) || savedPostIds.includes(post.id)
      );
      
      postsToShow = [...savedDemoPosts, ...savedUserPosts];
    } 
    // For specific categories, show only posts from that category
    else if (activeCategory !== 'All') {
      // Get demo posts in this category
      const categoryDemoPosts = demoPosts.filter(post => post.category === activeCategory);
      
      // Get user posts in this category
      const categoryUserPosts = (allPosts || []).filter(post => post.category === activeCategory);
      
      postsToShow = [...categoryDemoPosts, ...categoryUserPosts];
    } 
    // For "All" category, show all demo posts and user posts
    else {
      postsToShow = [...demoPosts, ...(allPosts || [])];
    }
    
    // Apply search filter if search query exists
    if (searchQuery) {
      postsToShow = postsToShow.filter(post => {
        const title = (post.title || '').toLowerCase();
        const description = (post.description || post.content || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || description.includes(query);
      });
    }
    
    return postsToShow;
  })();

  // Sort posts by date if selected
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortByDate) {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(Date.now() - 100000);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(Date.now() - 200000);
      return dateB - dateA; // newer first
    }
    return (b.likes || 0) - (a.likes || 0); // more popular first
  });

  const handleBackToProfile = () => {
    if (isStandalone) {
      navigate('/');
    } else if (onClose) {
      onClose();
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
            {sortedPosts.length > 0 ? (
              sortedPosts.map(post => (
                <div className="post-card" key={post.id}>
                  <div className="post-image">
                    <img src={post.image || post.imageUrl || "https://images.unsplash.com/photo-1519834584171-e03a7fefd0a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"} alt={post.title} />
                    <button 
                      className={`save-button ${isPostSaved(post.id) ? 'saved' : ''}`}
                      onClick={() => handleSavePost(post)}
                      title={isPostSaved(post.id) ? "Unsave" : "Save"}
                      data-post-id={post.id}
                    >
                      {isPostSaved(post.id) ? '★' : '☆'}
                    </button>
                  </div>
                  <div className="post-details">
                    <h3 className="post-title">{post.title}</h3>
                    {!post.isAnonymous && post.author && (
                      <p className="post-author">By: {post.author}</p>
                    )}
                    <p className="post-description">{post.description || post.content}</p>
                    <div className="post-actions">
                      <button 
                        className="read-more-button" 
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Read More button clicked for post:', post.id);
                          handleReadMore(post);
                        }}
                        data-post-id={post.id}
                      >
                        Read More
                      </button>
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

      {/* Post Modal */}
      {showPostModal && selectedPost && (
        <div className="post-modal-overlay" onClick={closePostModal}>
          <div className="post-modal" onClick={(e) => e.stopPropagation()}>
            <button className="post-modal-close" onClick={closePostModal}>×</button>
            
            <div className="post-modal-image">
              <img 
                src={selectedPost.image || selectedPost.imageUrl || "https://images.unsplash.com/photo-1519834584171-e03a7fefd0a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"} 
                alt={selectedPost.title} 
              />
            </div>
            
            <div className="post-modal-content">
              <div className="post-modal-header">
                <h2 className="post-modal-title">{selectedPost.title}</h2>
                <div className="post-modal-meta">
                  {!selectedPost.isAnonymous && selectedPost.author && (
                    <p className="post-modal-author">By: {selectedPost.author}</p>
                  )}
                  {selectedPost.createdAt && (
                    <p className="post-modal-date">
                      {formatDate(selectedPost.createdAt)}
                    </p>
                  )}
                  <span className="post-modal-category">{selectedPost.category}</span>
                </div>
              </div>
              
              <div className="post-modal-body">
                <p>{selectedPost.content || selectedPost.description}</p>
              </div>
              
              <div className="post-modal-actions">
                <button 
                  className={`post-modal-save ${isPostSaved(selectedPost.id) ? 'saved' : ''}`}
                  onClick={() => handleSavePost(selectedPost)}
                >
                  {isPostSaved(selectedPost.id) ? 'Saved ★' : 'Save ☆'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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