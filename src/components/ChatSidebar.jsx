import React, { useState, useEffect } from 'react';
import { Search, Plus, MessageCircle, Users, Hash, MoreVertical, Circle } from 'lucide-react';
import { chatAPI } from '../services/api';
import { formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';

function ChatSidebar({ selectedThread, onThreadSelect, onNewThread }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const response = await chatAPI.getThreads();
      setThreads(response.data || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredThreads = threads.filter(thread =>
    thread.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getThreadIcon = (threadType) => {
    switch (threadType) {
      case 'direct':
        return <MessageCircle className="w-5 h-5" />;
      case 'group':
        return <Users className="w-5 h-5" />;
      case 'house':
        return <Hash className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const getThreadAvatar = (thread) => {
    if (thread.thread_type === 'direct' && thread.participants?.length === 2) {
      const otherParticipant = thread.participants.find(p => p.id !== 'current-user-id');
      return (
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {otherParticipant?.display_name?.charAt(0) || otherParticipant?.first_name?.charAt(0) || 'U'}
          </span>
        </div>
      );
    }
    
    return (
      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
        <span className="text-white font-medium text-sm">
          {thread.name?.charAt(0) || 'C'}
        </span>
      </div>
    );
  };

  const getUnreadCount = (thread) => {
    return thread.unread_count || 0;
  };

  const isOnline = (thread) => {
    // This would be determined by user's online status
    return Math.random() > 0.5; // Placeholder
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={() => setShowNewThreadModal(true)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="New conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No conversations</h3>
            <p className="text-xs text-gray-500">
              {searchTerm ? 'No conversations match your search' : 'Start a new conversation to get messaging'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => onThreadSelect(thread)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedThread?.id === thread.id
                    ? 'bg-purple-50 border border-purple-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  {getThreadAvatar(thread)}
                  {thread.thread_type === 'direct' && (
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      isOnline(thread) ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  )}
                </div>

                {/* Thread Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {thread.name || 'Direct Message'}
                    </h3>
                    {getUnreadCount(thread) > 0 && (
                      <span className="flex-shrink-0 ml-2 bg-purple-600 text-white text-xs font-medium rounded-full px-2 py-1">
                        {getUnreadCount(thread)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 truncate">
                      {thread.last_message?.content || 'No messages yet'}
                    </p>
                    {thread.last_message_at && (
                      <span className="text-xs text-gray-400 ml-2">
                        {formatRelativeTime(thread.last_message_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thread Type Icon */}
                <div className="flex-shrink-0">
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Conversation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conversation Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="direct">Direct Message</option>
                  <option value="group">Group Chat</option>
                  <option value="house">House Chat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participants
                </label>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conversation Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter conversation name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewThreadModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNewThreadModal(false);
                  if (onNewThread) onNewThread();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatSidebar;