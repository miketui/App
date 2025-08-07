import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Globe, Users, Lock, Clock, User } from 'lucide-react';
import { postAPI } from '../services/api';
import { formatRelativeTime, formatNumber } from '../utils/helpers';
import toast from 'react-hot-toast';

function PostCard({ post, onPostUpdate }) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      if (isLiked) {
        await postAPI.unlike(post.id);
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await postAPI.like(post.id);
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await postAPI.comment(post.id, { content: newComment.trim() });
      setCommentCount(prev => prev + 1);
      setNewComment('');
      toast.success('Comment added successfully!');
      
      if (onPostUpdate) {
        onPostUpdate();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post from Haus of Basquiat',
          text: post.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share post');
    }
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'members_only':
        return <Users className="w-4 h-4" />;
      case 'house_only':
        return <Users className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getVisibilityText = () => {
    switch (post.visibility) {
      case 'public':
        return 'Public';
      case 'members_only':
        return 'Members Only';
      case 'house_only':
        return 'House Only';
      case 'private':
        return 'Private';
      default:
        return 'Public';
    }
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    if (post.media.length === 1) {
      const media = post.media[0];
      return (
        <div className="mt-3">
          {media.type.startsWith('image/') ? (
            <img
              src={media.url}
              alt="Post media"
              className="w-full rounded-lg max-h-96 object-cover"
            />
          ) : (
            <video
              src={media.url}
              controls
              className="w-full rounded-lg max-h-96"
            />
          )}
        </div>
      );
    }

    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {post.media.slice(0, 4).map((media, index) => (
          <div key={index} className="relative">
            {media.type.startsWith('image/') ? (
              <img
                src={media.url}
                alt={`Post media ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
            ) : (
              <video
                src={media.url}
                className="w-full h-32 object-cover rounded-lg"
                muted
              />
            )}
            {index === 3 && post.media.length > 4 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium">+{post.media.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {post.author?.display_name?.charAt(0) || post.author?.first_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">
                {post.author?.display_name || post.author?.first_name || 'Unknown User'}
              </h3>
              <div className="flex items-center space-x-1 text-gray-500">
                {getVisibilityIcon()}
                <span className="text-xs">{getVisibilityText()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(post.created_at)}</span>
            </div>
          </div>
        </div>
        
        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
        {renderMedia()}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span>{formatNumber(likeCount)} like{likeCount !== 1 ? 's' : ''}</span>
          <span>{formatNumber(commentCount)} comment{commentCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isLiked
              ? 'text-red-500 hover:bg-red-50'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Comment Input */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-xs">U</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {comment.author?.display_name?.charAt(0) || comment.author?.first_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author?.display_name || comment.author?.first_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PostCard;