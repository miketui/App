'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Users, Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/layout/navigation'

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Mock notifications data
  const notifications = [
    {
      id: '1',
      type: 'like',
      title: 'New like on your post',
      content: 'Maria Santos liked your post about the ballroom competition',
      user: {
        name: 'Maria Santos',
        avatar: null
      },
      isRead: false,
      createdAt: '2 hours ago'
    },
    {
      id: '2',
      type: 'comment',
      title: 'New comment',
      content: 'Alex replied to your post: "Amazing performance!"',
      user: {
        name: 'Alex Rodriguez',
        avatar: null
      },
      isRead: false,
      createdAt: '4 hours ago'
    },
    {
      id: '3',
      type: 'message',
      title: 'New message',
      content: 'You have a new message in House of Eleganza group',
      user: {
        name: 'House of Eleganza',
        avatar: null
      },
      isRead: true,
      createdAt: '1 day ago'
    },
    {
      id: '4',
      type: 'system',
      title: 'Welcome to Haus of Basquiat!',
      content: 'Your application has been approved. Welcome to the community!',
      user: null,
      isRead: true,
      createdAt: '2 days ago'
    }
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-basquiat-red" />
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-basquiat-blue" />
      case 'message':
        return <MessageCircle className="w-4 h-4 text-basquiat-teal" />
      case 'system':
        return <Bell className="w-4 h-4 text-basquiat-yellow" />
      default:
        return <Bell className="w-4 h-4 text-basquiat-muted" />
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-basquiat-bg">
      <Navigation />
      
      <div className="lg:pl-64">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold basquiat-text-gradient">Notifications</h1>
              <p className="text-basquiat-muted">
                Stay updated with community activity
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-basquiat-surface p-1 rounded-basquiat">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="flex-1"
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="flex-1"
            >
              Unread ({unreadCount})
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="w-16 h-16 text-basquiat-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-basquiat-text mb-2">
                    No notifications
                  </h3>
                  <p className="text-basquiat-muted">
                    {filter === 'unread' 
                      ? "You're all caught up! No unread notifications."
                      : "When you get notifications, they'll appear here."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`transition-all hover:border-basquiat-yellow/50 cursor-pointer ${
                    !notification.isRead ? 'border-basquiat-blue/50 basquiat-glow' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {notification.user ? (
                          <div className="relative">
                            <Avatar
                              src={notification.user.avatar}
                              fallback={notification.user.name}
                              size="sm"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-basquiat-surface rounded-full flex items-center justify-center border-2 border-basquiat-surface">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-basquiat-yellow rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-basquiat-text">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-basquiat-muted mt-1 line-clamp-2">
                              {notification.content}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className="text-xs text-basquiat-muted">
                                {notification.createdAt}
                              </span>
                              {!notification.isRead && (
                                <Badge variant="default" className="px-2 py-0 text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-4">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-basquiat-muted hover:text-basquiat-text"
                              >
                                <CheckCheck className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-basquiat-muted hover:text-basquiat-red"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}