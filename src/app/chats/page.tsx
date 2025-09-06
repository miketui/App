'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  sender?: {
    id: string;
    display_name: string;
    avatar_url: string;
    role: string;
  };
}

interface Conversation {
  id: string;
  participants: any[];
  last_message: any;
  last_message_at: string;
  created_at: string;
  other_participants?: any[];
}

export default function ChatsPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await api.get('/chat/threads');
      setConversations(response.data.threads);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await api.get(`/chat/threads/${conversationId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    setIsSending(true);
    try {
      const response = await api.post(`/chat/threads/${activeConversation}/messages`, { content: newMessage.trim() });
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, last_message: { content: newMessage.trim() }, last_message_at: new Date().toISOString() }
            : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    loadMessages(conversationId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
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
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basquiat-cream p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-basquiat-red mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="p-4 border-4 border-black shadow-brutal overflow-hidden">
            <h2 className="text-xl font-bold text-black mb-4">Conversations</h2>
            
            <div className="space-y-2 overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="text-center text-gray-600 mt-8">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start connecting with other members!</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    className={`p-3 rounded border-2 border-black cursor-pointer transition-colors ${
                      activeConversation === conversation.id
                        ? 'bg-basquiat-yellow'
                        : 'bg-white hover:bg-basquiat-cream'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-black">
                        <div className="w-full h-full bg-basquiat-blue flex items-center justify-center text-white font-bold">
                          {conversation.other_participants[0]?.display_name?.charAt(0) || 'U'}
                        </div>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-black truncate">
                            {conversation.other_participants[0]?.display_name || 'Unknown User'}
                          </p>
                          <Badge className={`${getRoleBadgeColor(conversation.other_participants[0]?.role || 'member')} text-xs px-2 py-0`}>
                            {conversation.other_participants[0]?.role || 'member'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.last_message?.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(conversation.last_message_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2 border-4 border-black shadow-brutal overflow-hidden flex flex-col">
            {activeConversation ? (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg border-2 border-black ${
                            message.sender_id === user?.id
                              ? 'bg-basquiat-blue text-white'
                              : 'bg-white text-black'
                          }`}
                        >
                          {message.sender_id !== user?.id && message.sender && (
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-bold">
                                {message.sender.display_name}
                              </p>
                              <Badge className={`${getRoleBadgeColor(message.sender.role || 'member')} text-xs px-2 py-0`}>
                                {message.sender.role || 'member'}
                              </Badge>
                            </div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t-2 border-black">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="border-2 border-black"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={isSending}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="bg-basquiat-green"
                    >
                      {isSending ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-black mb-4">Select a Conversation</h2>
                  <p className="text-gray-600 mb-6">Choose a conversation from the list to start messaging</p>
                  <Button className="bg-basquiat-blue">
                    Find Members to Chat With
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}