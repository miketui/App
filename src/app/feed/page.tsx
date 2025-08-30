'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  author: {
    id: string;
    username: string;
    full_name: string;
    role: string;
  };
  tags?: string[];
}

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      loadFeed();
      setIsLoading(false);
    };

    getUser();
  }, [supabase]);

  const loadFeed = () => {
    // Mock feed data
    const mockPosts: Post[] = [
      {
        id: '1',
        content: 'Just discovered an incredible analysis of Basquiat\'s "Untitled (Skull)" from 1981. The way he combines African mask traditions with contemporary urban art is absolutely revolutionary. The skull isn\'t just death - it\'s transformation, ancestry, and rebirth all at once. 💀✨',
        author_id: 'user1',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        like_count: 23,
        comment_count: 7,
        is_liked: false,
        author: {
          id: 'user1',
          username: 'artlover23',
          full_name: 'Maya Chen',
          role: 'curator'
        },
        tags: ['basquiat', 'skull', 'analysis', 'african-art']
      },
      {
        id: '2',
        content: 'Walking through Brooklyn today, I couldn\'t help but think about Jean-Michel\'s early days here. The energy, the raw creativity, the way art explodes from every corner. Street art isn\'t just decoration - it\'s revolution made visible.',
        author_id: 'user2',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        like_count: 15,
        comment_count: 4,
        is_liked: true,
        author: {
          id: 'user2',
          username: 'brooklyn_art',
          full_name: 'Alex Rodriguez',
          role: 'member'
        },
        tags: ['brooklyn', 'street-art', 'inspiration']
      },
      {
        id: '3',
        content: 'New exhibition opening next week: "Words as Weapons: Text in Basquiat\'s Work." Looking at how he used language not just as art but as activism. His words carry the weight of history and the promise of change. Who else is planning to attend? 📝🎨',
        author_id: 'user3',
        created_at: new Date(Date.now() - 14400000).toISOString(),
        like_count: 31,
        comment_count: 12,
        is_liked: false,
        author: {
          id: 'user3',
          username: 'dr_williams',
          full_name: 'Dr. Sarah Williams',
          role: 'curator'
        },
        tags: ['exhibition', 'text-art', 'activism']
      },
      {
        id: '4',
        content: 'Teaching my kids about Basquiat today. They were amazed that someone could make art that\'s both beautiful AND tells important stories about justice and identity. Art education starts early! 👨‍👩‍👧‍👦',
        author_id: 'user4',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        like_count: 42,
        comment_count: 9,
        is_liked: true,
        author: {
          id: 'user4',
          username: 'parentartist',
          full_name: 'Marcus Johnson',
          role: 'member'
        },
        tags: ['education', 'family', 'justice']
      },
      {
        id: '5',
        content: 'Reminder: The crown motif in Basquiat\'s work isn\'t about vanity or ego. It\'s about reclaiming power, dignity, and self-worth in a world that often denies these things to Black bodies. Every crown is a statement of inherent royalty. 👑',
        author_id: 'user5',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        like_count: 67,
        comment_count: 18,
        is_liked: false,
        author: {
          id: 'user5',
          username: 'cultural_critic',
          full_name: 'Dr. Amara Washington',
          role: 'curator'
        },
        tags: ['crown', 'power', 'identity', 'symbolism']
      }
    ];

    setPosts(mockPosts);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    setIsPosting(true);
    try {
      const post: Post = {
        id: Date.now().toString(),
        content: newPost.trim(),
        author_id: user.id,
        created_at: new Date().toISOString(),
        like_count: 0,
        comment_count: 0,
        is_liked: false,
        author: {
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          full_name: user.user_metadata?.full_name || 'User',
          role: 'member'
        }
      };

      setPosts(prev => [post, ...prev]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              is_liked: !post.is_liked,
              like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1
            }
          : post
      )
    );
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
                    {post.author.full_name.charAt(0)}
                  </div>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-black">{post.author.full_name}</h3>
                    <Badge className={`${getRoleBadgeColor(post.author.role)} text-xs px-2 py-1`}>
                      {post.author.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">@{post.author.username}</p>
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
                    post.is_liked 
                      ? 'bg-basquiat-red text-white' 
                      : 'bg-white text-black border-2 border-black hover:bg-basquiat-red hover:text-white'
                  }`}
                >
                  ❤️ {post.like_count}
                </Button>
                
                <Button className="text-sm px-4 py-2 bg-white text-black border-2 border-black hover:bg-basquiat-blue hover:text-white">
                  💭 {post.comment_count}
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