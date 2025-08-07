import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Image as ImageIcon, 
  X, 
  Send,
  MoreVertical,
  Filter,
  Users,
  Globe,
  Sparkles,
  Hash,
  Wand2
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const FeedPage = () => {
  const { userProfile, supabase, isMemberOrAbove } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all'); // all, house
  const [newPost, setNewPost] = useState({
    content: '',
    visibility: 'public',
    media: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [generatingHashtags, setGeneratingHashtags] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  const fileInputRef = useRef(null);

  // Fetch posts
  const fetchPosts = async (page = 1) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(feedFilter === 'house' && { houseOnly: 'true' })
      });
      
      const response = await fetch(`/api/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      
      if (page === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    }
  };

  // Create new post
  const createPost = async () => {
    if (!newPost.content.trim() && selectedFiles.length === 0) {
      toast.error('Please add some content or media to your post');
      return;
    }

    setPosting(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const formData = new FormData();
      
      formData.append('content', newPost.content);
      formData.append('visibility', newPost.visibility);
      
      if (userProfile.house_id) {
        formData.append('houseId', userProfile.house_id);
      }
      
      selectedFiles.forEach(file => {
        formData.append('media', file);
      });

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }

      const data = await response.json();
      
      // Add new post to the top of the feed
      setPosts(prev => [data.post, ...prev]);
      
      // Reset form
      setNewPost({ content: '', visibility: 'public', media: [] });
      setSelectedFiles([]);
      setShowPostModal(false);
      
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  };

  // Toggle like on post
  const toggleLike = async (postId) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      
      // Update post in local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              user_liked: data.liked,
              likes_count: data.liked ? post.likes_count + 1 : post.likes_count - 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`/api/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(prev => ({ ...prev, [postId]: data.comments }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  // Add comment
  const addComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content || !content.trim()) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: content.trim() })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      const data = await response.json();
      
      // Add comment to local state
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment]
      }));
      
      // Update post comment count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ));
      
      // Clear input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.message);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Generate AI caption
  const generateAICaption = async () => {
    if (!newPost.content.trim() && selectedFiles.length === 0) {
      toast.error('Please add some content or media first');
      return;
    }

    setGeneratingCaption(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newPost.content || 'Sharing some amazing content!',
          mediaType: selectedFiles.length > 0 ? 'image' : 'text'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate caption');
      }

      const data = await response.json();
      
      if (data.caption) {
        setNewPost(prev => ({ ...prev, content: data.caption }));
        setAiSuggestions(data.suggestions || []);
        toast.success('AI caption generated! ✨');
      } else if (data.fallback) {
        setNewPost(prev => ({ ...prev, content: data.fallback }));
        toast.success('Fallback caption applied!');
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      toast.error(error.message || 'Failed to generate AI caption');
    } finally {
      setGeneratingCaption(false);
    }
  };

  // Generate hashtag suggestions
  const generateHashtags = async () => {
    if (!newPost.content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    setGeneratingHashtags(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch('/api/ai/generate-hashtags', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newPost.content,
          count: 5
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate hashtags');
      }

      const data = await response.json();
      
      const hashtags = data.hashtags || data.fallback || [];
      if (hashtags.length > 0) {
        const hashtagString = hashtags.join(' ');
        setNewPost(prev => ({ 
          ...prev, 
          content: prev.content + '\n\n' + hashtagString 
        }));
        toast.success(`Added ${hashtags.length} hashtags! #️⃣`);
      }
    } catch (error) {
      console.error('Error generating hashtags:', error);
      toast.error(error.message || 'Failed to generate hashtags');
    } finally {
      setGeneratingHashtags(false);
    }
  };

  // Toggle comments visibility
  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    // Fetch comments if not already loaded
    if (!comments[postId]) {
      fetchComments(postId);
    }
  };

  // Format post time
  const formatPostTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get visibility icon
  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'house_only':
        return <Users size={14} className="text-gray-500" />;
      case 'members_only':
        return <Users size={14} className="text-blue-500" />;
      default:
        return <Globe size={14} className="text-green-500" />;
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPosts(1);
      setLoading(false);
    };
    
    loadData();
  }, [feedFilter]);

  if (loading) {
    return <LoadingSpinner text="Loading community feed..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Feed</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userProfile?.display_name || 'Member'}! Share your journey with the community.
          </p>
        </div>
      </div>

      {/* Feed Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                feedFilter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Globe size={16} className="inline mr-2" />
              All Posts
            </button>
            
            {userProfile?.house_id && (
              <button
                onClick={() => setFeedFilter('house')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  feedFilter === 'house'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Users size={16} className="inline mr-2" />
                My House
              </button>
            )}
          </div>
          
          {isMemberOrAbove() && (
            <button
              onClick={() => setShowPostModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>New Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share something with the community!
            </p>
            {isMemberOrAbove() && (
              <button
                onClick={() => setShowPostModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm border">
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {post.author.avatar_url ? (
                        <img
                          src={post.author.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-700">
                          {post.author.display_name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{post.author.display_name}</h3>
                        {getVisibilityIcon(post.visibility)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{formatPostTime(post.created_at)}</span>
                        {post.author.house && (
                          <>
                            <span>•</span>
                            <span>{post.author.house.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                {/* Post Content */}
                {post.content && (
                  <p className="text-gray-900 mb-4 whitespace-pre-wrap">{post.content}</p>
                )}
              </div>

              {/* Post Media */}
              {post.media_urls && post.media_urls.length > 0 && (
                <div className="px-6 pb-4">
                  <div className={`grid gap-2 ${
                    post.media_urls.length === 1 ? 'grid-cols-1' :
                    post.media_urls.length === 2 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {post.media_urls.slice(0, 4).map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(url, '_blank')}
                        />
                        {index === 3 && post.media_urls.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg font-medium">
                              +{post.media_urls.length - 4} more
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.user_liked
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <Heart 
                        size={20} 
                        className={post.user_liked ? 'fill-current' : ''} 
                      />
                      <span className="text-sm font-medium">{post.likes_count}</span>
                    </button>
                    
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle size={20} />
                      <span className="text-sm font-medium">{post.comments_count}</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                      <Share2 size={20} />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        {userProfile?.avatar_url ? (
                          <img
                            src={userProfile.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-700">
                            {userProfile?.display_name?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addComment(post.id);
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => addComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {comments[post.id] && comments[post.id].length > 0 && (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {comments[post.id].map(comment => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                              {comment.author.avatar_url ? (
                                <img
                                  src={comment.author.avatar_url}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-700">
                                  {comment.author.display_name?.[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-lg px-3 py-2">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {comment.author.display_name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatPostTime(comment.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-900">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    setNewPost({ content: '', visibility: 'public', media: [] });
                    setSelectedFiles([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Post Content */}
                <div>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="What's happening in the community?"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="4"
                  />
                </div>

                {/* Media Preview */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Features */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <span className="text-sm font-medium text-purple-700">✨ AI-Powered Features</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={generateAICaption}
                      disabled={generatingCaption}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {generatingCaption ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>AI Caption</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={generateHashtags}
                      disabled={generatingHashtags || !newPost.content.trim()}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {generatingHashtags ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <Hash size={14} />
                          <span>Hashtags</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Post Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={selectedFiles.length >= 5}
                      title="Add images (max 5)"
                    >
                      <ImageIcon size={20} />
                    </button>
                  </div>

                  <select
                    value={newPost.visibility}
                    onChange={(e) => setNewPost(prev => ({ ...prev, visibility: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="public">🌍 Public</option>
                    <option value="members_only">👥 Members Only</option>
                    {userProfile?.house_id && (
                      <option value="house_only">🏠 House Only</option>
                    )}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPostModal(false);
                      setNewPost({ content: '', visibility: 'public', media: [] });
                      setSelectedFiles([]);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createPost}
                    disabled={posting || (!newPost.content.trim() && selectedFiles.length === 0)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
