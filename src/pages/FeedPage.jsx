import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Filter, TrendingUp, Clock, Star } from 'lucide-react';
import PostCreator from '../components/PostCreator';
import PostCard from '../components/PostCard';
import { postAPI } from '../services/api';
import toast from 'react-hot-toast';

function FeedPage() {
  const { userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts(true);
  }, [sortBy, filterVisibility]);

  const fetchPosts = async (reset = false) => {
    if (reset) {
      setCurrentPage(1);
      setPosts([]);
    }

    setLoading(true);
    try {
      const params = {
        page: reset ? 1 : currentPage + 1,
        limit: 10,
        sort_by: sortBy,
        visibility: filterVisibility === 'all' ? undefined : filterVisibility
      };

      const response = await postAPI.getAll(params);
      const newPosts = response.data.posts || response.data;
      
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setCurrentPage(reset ? 1 : currentPage + 1);
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(true);
    setRefreshing(false);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdate = () => {
    // Refresh posts when a post is updated
    fetchPosts(true);
  };

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
      if (hasMore && !loading) {
        fetchPosts();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, currentPage]);

  const getSortIcon = () => {
    switch (sortBy) {
      case 'latest':
        return <Clock className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      case 'top':
        return <Star className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Feed</h1>
            <p className="text-gray-600 mt-2">
              Stay connected with the ballroom community
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="latest">Latest</option>
                <option value="trending">Trending</option>
                <option value="top">Top</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {getSortIcon()}
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Posts</option>
                <option value="public">Public</option>
                <option value="members_only">Members Only</option>
                <option value="house_only">House Only</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Filter className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Creator */}
      <div className="mb-6">
        <PostCreator onPostCreated={handlePostCreated} />
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">
              Be the first to share something with the community!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdate={handlePostUpdate}
            />
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          </div>
        )}

        {/* End of Feed */}
        {!hasMore && posts.length > 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">You've reached the end of the feed</p>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          title="Refresh feed"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default FeedPage;