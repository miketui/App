'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
  author: {
    id: string;
    display_name: string;
    avatar_url: string;
    house: {
      name: string;
    }
  };
  tags?: string[];
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const response = await api.get('/posts');
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Error loading feed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadFeed();
    }
  }, [user]);

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    setIsPosting(true);
    try {
      const response = await api.post('/posts', { content: newPost.trim() });
      setPosts(prev => [response.data.post, ...prev]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                user_liked: response.data.liked,
                likes_count: response.data.liked ? post.likes_count + 1 : post.likes_count - 1
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-basquiat-red text-white';
      case 'curator':
        return 'bg-basquiat-blue text-white';
      default:
        return 'bg-basquiat-yellow text-black';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) {
      return 'Just now';
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-basquiat-cream p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="h-48 bg-gray-300 rounded"></div>
            <div className="h-48 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basquiat-cream p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-basquiat-red mb-6">Community Feed</h1>
        
        {/* Create Post */}
        <Card className="p-6 border-4 border-black shadow-brutal mb-6">
          <h2 className="text-xl font-bold text-black mb-4">Share with the community</h2>
          
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind about Basquiat's art, exhibitions, or the community?"
            className="border-2 border-black mb-4 min-h-[100px]"
          />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {newPost.length}/500 characters
            </div>
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.trim() || isPosting || newPost.length > 500}
              className="bg-basquiat-green"
            >
              {isPosting ? 'Posting...' : 'Share Post'}
            </Button>
          </div>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="p-6 border-4 border-black shadow-brutal">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12 border-2 border-black">
                  <div className="w-full h-full bg-basquiat-blue flex items-center justify-center text-white font-bold">
                    {post.author.display_name.charAt(0)}
                  </div>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-black">{post.author.display_name}</h3>
                    <Badge className={`${getRoleBadgeColor(post.author.house.name)} text-xs px-2 py-1`}>
                      {post.author.house.name}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{formatTime(post.created_at)}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-basquiat-cream text-basquiat-blue text-xs font-bold rounded border-2 border-basquiat-blue hover:bg-basquiat-blue hover:text-white cursor-pointer transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-4 border-t-2 border-gray-200">
                <Button
                  onClick={() => handleLike(post.id)}
                  className={`text-sm px-4 py-2 ${
                    post.user_liked 
                      ? 'bg-basquiat-red text-white' 
                      : 'bg-white text-black border-2 border-black hover:bg-basquiat-red hover:text-white'
                  }`}
                >
                  ❤️ {post.likes_count}
                </Button>
                
                <Button className="text-sm px-4 py-2 bg-white text-black border-2 border-black hover:bg-basquiat-blue hover:text-white">
                  💭 {post.comments_count}
                </Button>
                
                <Button className="text-sm px-4 py-2 bg-white text-black border-2 border-black hover:bg-basquiat-green hover:text-white">
                  🔄 Share
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button className="bg-basquiat-blue text-white px-8 py-3">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
}