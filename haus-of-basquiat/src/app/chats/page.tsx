'use client'

import { useState, useEffect } from 'react'
import { Plus, Send, Users, User, Search, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/layout/navigation'

export default function ChatsPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')

  // Mock data - replace with real data from Supabase
  const threads = [
    {
      id: '1',
      name: 'House of Eleganza',
      type: 'group',
      lastMessage: 'Ready for tonight\'s ball!',
      lastMessageAt: '2 hours ago',
      unreadCount: 3,
      participants: ['Alice', 'Bob', 'Charlie']
    },
    {
      id: '2',
      name: 'Maria Santos',
      type: 'direct',
      lastMessage: 'See you at practice tomorrow',
      lastMessageAt: '1 day ago',
      unreadCount: 0,
      participants: ['Maria Santos']
    }
  ]

  const messages = [
    {
      id: '1',
      content: 'Ready for tonight\'s ball!',
      sender: 'Alice',
      timestamp: '2:30 PM',
      isOwn: false
    },
    {
      id: '2',
      content: 'Absolutely! Been practicing all week',
      sender: 'You',
      timestamp: '2:35 PM',
      isOwn: true
    }
  ]

  return (
    <div className="flex h-screen bg-basquiat-bg">
      <Navigation />
      
      <div className="flex-1 lg:pl-64">
        <div className="flex h-full">
          {/* Threads List */}
          <div className="w-full max-w-sm border-r border-basquiat-blue/20 bg-basquiat-surface">
            <div className="p-4 border-b border-basquiat-blue/20">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-basquiat-text">Messages</h1>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-basquiat-muted" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`flex items-center p-4 hover:bg-basquiat-bg/50 cursor-pointer transition-colors ${
                    selectedThread === thread.id ? 'bg-basquiat-bg/30 border-r-2 border-basquiat-yellow' : ''
                  }`}
                >
                  <div className="relative mr-3">
                    {thread.type === 'group' ? (
                      <div className="w-10 h-10 bg-basquiat-blue rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-basquiat-text" />
                      </div>
                    ) : (
                      <Avatar
                        fallback="M"
                        size="md"
                      />
                    )}
                    {thread.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-basquiat-red rounded-full flex items-center justify-center">
                        <span className="text-xs text-basquiat-text font-semibold">
                          {thread.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-basquiat-text truncate">
                        {thread.name}
                      </h3>
                      <span className="text-xs text-basquiat-muted">
                        {thread.lastMessageAt}
                      </span>
                    </div>
                    <p className="text-sm text-basquiat-muted truncate">
                      {thread.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedThread ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-basquiat-blue/20 bg-basquiat-surface">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar fallback="H" />
                      <div>
                        <h2 className="font-semibold text-basquiat-text">
                          House of Eleganza
                        </h2>
                        <p className="text-sm text-basquiat-muted">
                          3 members
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-basquiat-blue text-basquiat-bg'
                            : 'bg-basquiat-surface text-basquiat-text'
                        }`}
                      >
                        {!message.isOwn && (
                          <p className="text-xs text-basquiat-yellow font-semibold mb-1">
                            {message.sender}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? 'text-basquiat-bg/70' : 'text-basquiat-muted'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-basquiat-blue/20 bg-basquiat-surface">
                  <div className="flex items-center space-x-3">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newMessage.trim()) {
                          // Handle send message
                          setNewMessage('')
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      size="icon"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-basquiat-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-basquiat-text mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-basquiat-muted">
                    Choose a chat to start messaging with your community
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}