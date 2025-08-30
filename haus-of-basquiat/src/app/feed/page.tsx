'use client'

import { useState, useEffect } from 'react'
import { Plus, Heart, MessageCircle, Share2, Filter, Globe, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { formatTime } from '@/lib/utils'
import type { AuthUser } from '@/lib/auth'

interface Post {
  id: string
  content: string
  author: {
    id: string
    display_name: string
    avatar_url?: string
  }
  likes_count: number
  comments_count: number
  visibility: 'public' | 'members_only' | 'house_only'
  created_at: string
  user_liked?: boolean
}

export default function FeedPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showComposer, setShowComposer] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [feedFilter, setFeedFilter] = useState<'all' | 'house' | 'following'>('all')

  useEffect(() => {
    const initialize = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      await loadPosts()
      setLoading(false)
    }
    initialize()
  }, [feedFilter])

  const loadPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:user_profiles!posts_author_id_fkey(id, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (feedFilter === 'house' && user?.house_id) {
        query = query.eq('house_id', user.house_id)
      } else if (feedFilter === 'following') {
        // TODO: Implement following logic
        query = query.eq('visibility', 'public')
      }

      const { data, error } = await query

      if (error) throw error

      setPosts(data || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const createPost = async () => {
    if (!newPost.trim() || posting) return

    setPosting(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: newPost.trim(),
          author_id: user?.id,
          visibility: 'public'
        })
        .select(`
          *,
          author:user_profiles!posts_author_id_fkey(id, display_name, avatar_url)
        `)
        .single()

      if (error) throw error

      setPosts(prev => [data, ...prev])
      setNewPost('')
      setShowComposer(false)
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setPosting(false)
    }
  }

  const toggleLike = async (postId: string) => {
    if (!user) return

    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      if (post.user_liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes_count: p.likes_count - 1, user_liked: false }
            : p
        ))
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id })

        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes_count: p.likes_count + 1, user_liked: true }
            : p
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'house_only':
        return <Users size={14} className="text-basquiat-teal" />
      case 'members_only':
        return <Users size={14} className="text-basquiat-blue" />
      default:
        return <Globe size={14} className="text-basquiat-yellow" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-basquiat-muted">Loading community feed...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold basquiat-text-gradient mb-2">Community Feed</h1>
          <p className="text-basquiat-muted">
            Welcome back, {user?.display_name}! Share your journey with the community.
          </p>
        </div>

        {/* Feed Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant={feedFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFeedFilter('all')}
                >
                  <Globe size={16} className="mr-2" />
                  All Posts
                </Button>
                
                {user?.house_id && (
                  <Button
                    variant={feedFilter === 'house' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFeedFilter('house')}
                  >
                    <Users size={16} className="mr-2" />
                    My House
                  </Button>
                )}
              </div>
              
              <Button onClick={() => setShowComposer(true)}>
                <Plus size={16} className="mr-2" />
                New Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-basquiat-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-basquiat-text mb-2">No posts yet</h3>
                <p className="text-basquiat-muted mb-4">
                  Be the first to share something with the community!
                </p>
                <Button onClick={() => setShowComposer(true)}>
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map(post => (
              <Card key={post.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={post.author.avatar_url}
                        alt={post.author.display_name}
                        fallback={post.author.display_name}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-basquiat-text">
                            {post.author.display_name}
                          </h3>
                          {getVisibilityIcon(post.visibility)}
                        </div>
                        <p className="text-sm text-basquiat-muted">
                          {formatTime(post.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-basquiat-text mb-4 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id)}
                        className={post.user_liked ? 'text-basquiat-red' : 'text-basquiat-muted'}
                      >
                        <Heart 
                          size={16} 
                          className={`mr-2 ${post.user_liked ? 'fill-current' : ''}`} 
                        />
                        {post.likes_count}
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="text-basquiat-muted">
                        <MessageCircle size={16} className="mr-2" />
                        {post.comments_count}
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="text-basquiat-muted">
                        <Share2 size={16} className="mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Post Composer Modal */}
        <Modal
          isOpen={showComposer}
          onClose={() => setShowComposer(false)}
          title="Create Post"
          description="Share something with the community"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Avatar
                src={user?.avatar_url}
                alt={user?.display_name || 'You'}
                fallback={user?.display_name || 'U'}
                size="md"
              />
              <div className="flex-1">
                <Textarea
                  placeholder="What's happening in the community?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[120px] resize-none border-none bg-transparent text-basquiat-text placeholder:text-basquiat-muted focus:ring-0"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-basquiat-blue/20">
              <Badge variant="outline">
                <Globe size={12} className="mr-1" />
                Public
              </Badge>
              
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowComposer(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createPost}
                  disabled={posting || !newPost.trim()}
                >
                  {posting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}