'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

interface Notification {
  id: string;
  type: 'message' | 'mention' | 'follow' | 'like' | 'comment' | 'system' | 'announcement';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
  related_user?: {
    id: string;
    username: string;
    full_name: string;
    role: string;
  };
  related_content?: {
    id: string;
    type: string;
    title: string;
  };
}

export default function NotificationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const supabase = createClientComponentClient();

  const notificationTypes = [
    { value: 'all', label: 'All', color: 'bg-gray-500' },
    { value: 'message', label: 'Messages', color: 'bg-basquiat-blue' },
    { value: 'mention', label: 'Mentions', color: 'bg-basquiat-green' },
    { value: 'follow', label: 'Follows', color: 'bg-basquiat-yellow' },
    { value: 'like', label: 'Likes', color: 'bg-basquiat-red' },
    { value: 'comment', label: 'Comments', color: 'bg-basquiat-purple' },
    { value: 'system', label: 'System', color: 'bg-gray-600' },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadNotifications();
      }
      setIsLoading(false);
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    filterNotifications();
    updateUnreadCount();
  }, [notifications, selectedFilter]);

  const loadNotifications = () => {
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'message',
        title: 'New Message',
        message: 'Maya Chen sent you a message about Basquiat\'s Crown series',
        is_read: false,
        created_at: new Date().toISOString(),
        user_id: 'current-user',
        related_user: {
          id: 'user2',
          username: 'artlover23',
          full_name: 'Maya Chen',
          role: 'curator'
        }
      },
      {
        id: '2',
        type: 'like',
        title: 'Post Liked',
        message: 'Alex Rodriguez liked your post about "Untitled (Skull)"',
        is_read: false,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        user_id: 'current-user',
        related_user: {
          id: 'user3',
          username: 'brooklyn_art',
          full_name: 'Alex Rodriguez',
          role: 'member'
        },
        related_content: {
          id: 'post1',
          type: 'post',
          title: 'Analysis of Untitled (Skull)'
        }
      },
      {
        id: '3',
        type: 'follow',
        title: 'New Follower',
        message: 'Jordan Smith started following you',
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user_id: 'current-user',
        related_user: {
          id: 'user4',
          username: 'streetart_fan',
          full_name: 'Jordan Smith',
          role: 'member'
        }
      },
      {
        id: '4',
        type: 'mention',
        title: 'You were mentioned',
        message: 'Dr. Sarah Williams mentioned you in a discussion about political themes in art',
        is_read: false,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        user_id: 'current-user',
        related_user: {
          id: 'user5',
          username: 'dr_williams',
          full_name: 'Dr. Sarah Williams',
          role: 'curator'
        },
        related_content: {
          id: 'discussion1',
          type: 'discussion',
          title: 'Political Themes in Contemporary Art'
        }
      },
      {
        id: '5',
        type: 'system',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        user_id: 'current-user',
      },
      {
        id: '6',
        type: 'announcement',
        title: 'New Exhibition Added',
        message: 'King Pleasure exhibition has been added to the community events',
        is_read: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        user_id: 'current-user',
        related_content: {
          id: 'event1',
          type: 'event',
          title: 'King Pleasure Exhibition'
        }
      },
      {
        id: '7',
        type: 'comment',
        title: 'New Comment',
        message: 'Marcus Johnson commented on your library item "The Radiant Child Documentary"',
        is_read: true,
        created_at: new Date(Date.now() - 259200000).toISOString(),
        user_id: 'current-user',
        related_user: {
          id: 'user6',
          username: 'art_historian',
          full_name: 'Marcus Johnson',
          role: 'curator'
        },
        related_content: {
          id: 'library1',
          type: 'library_item',
          title: 'The Radiant Child Documentary'
        }
      }
    ];

    setNotifications(mockNotifications);
  };

  const filterNotifications = () => {
    if (selectedFilter === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(notifications.filter(n => n.type === selectedFilter));
    }
  };

  const updateUnreadCount = () => {
    const unread = notifications.filter(n => !n.is_read).length;
    setUnreadCount(unread);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'mention':
        return '@';
      case 'follow':
        return '👤';
      case 'like':
        return '❤️';
      case 'comment':
        return '💭';
      case 'system':
        return '⚙️';
      case 'announcement':
        return '📢';
      default:
        return '📋';
    }
  };

  const getTypeConfig = (type: string) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-basquiat-cream p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basquiat-cream p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-basquiat-red">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-basquiat-red text-white mt-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="bg-basquiat-green"
            >
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="p-4 border-4 border-black shadow-brutal mb-6">
          <div className="flex flex-wrap gap-2">
            {notificationTypes.map(type => (
              <Button
                key={type.value}
                onClick={() => setSelectedFilter(type.value)}
                className={`${selectedFilter === type.value ? `${type.color} text-white` : 'bg-white text-black border-2 border-black'}`}
              >
                {type.label}
                {type.value === 'all' && unreadCount > 0 && (
                  <Badge className="ml-2 bg-basquiat-red text-white">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 border-4 border-black shadow-brutal text-center">
              <h3 className="text-xl font-bold text-black mb-2">No notifications</h3>
              <p className="text-gray-600">
                {selectedFilter === 'all' 
                  ? 'You\'re all caught up! No new notifications.'
                  : `No ${selectedFilter} notifications found.`
                }
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-4 border-4 border-black shadow-brutal cursor-pointer transition-all hover:shadow-brutal-lg ${
                  !notification.is_read ? 'bg-blue-50 border-basquiat-blue' : 'bg-white'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  {notification.related_user ? (
                    <Avatar className="w-12 h-12 border-2 border-black">
                      <div className="w-full h-full bg-basquiat-blue flex items-center justify-center text-white font-bold">
                        {notification.related_user.full_name?.charAt(0) || 
                         notification.related_user.username?.charAt(0) || 'U'}
                      </div>
                    </Avatar>
                  ) : (
                    <div className="w-12 h-12 border-2 border-black bg-gray-200 flex items-center justify-center text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-black">{notification.title}</h3>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-basquiat-red rounded-full"></div>
                      )}
                      <Badge className={`${getTypeConfig(notification.type).color} text-white text-xs px-2 py-0`}>
                        {notification.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-800 mb-2">{notification.message}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatTime(notification.created_at)}</span>
                      
                      {notification.related_user && (
                        <div className="flex items-center gap-1">
                          <span>by {notification.related_user.full_name || notification.related_user.username}</span>
                          <Badge className={`${getRoleBadgeColor(notification.related_user.role)} text-xs px-2 py-0`}>
                            {notification.related_user.role}
                          </Badge>
                        </div>
                      )}
                      
                      {notification.related_content && (
                        <span className="text-basquiat-blue">
                          {notification.related_content.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {!notification.is_read && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="text-xs px-2 py-1 bg-basquiat-green text-white"
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-xs px-2 py-1 bg-basquiat-red text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Load More (placeholder for pagination) */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <Button
              className="bg-basquiat-blue text-white"
              disabled
            >
              Load More (Coming Soon)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}