import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MessageCircle, 
  Users, 
  Send, 
  Plus, 
  Search, 
  Paperclip, 
  Image as ImageIcon,
  File,
  X,
  ArrowLeft,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ChatPage = () => {
  const { userProfile, supabase } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch threads
  const fetchThreads = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch('/api/chat/threads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }

      const data = await response.json();
      setThreads(data.threads);
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast.error('Failed to load conversations');
    }
  };

  // Fetch messages for selected thread
  const fetchMessages = async (threadId) => {
    if (!threadId) return;
    
    setMessagesLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`/api/chat/threads/${threadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  // Fetch users for new chat
  const fetchUsers = async (search = '') => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedThread || sendingMessage) return;

    setSendingMessage(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const formData = new FormData();
      
      if (newMessage.trim()) {
        formData.append('content', newMessage.trim());
      }
      
      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('messageType', selectedFile.type.startsWith('image/') ? 'image' : 'file');
      }

      const response = await fetch(`/api/chat/threads/${selectedThread.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      
      // Add message to local state
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      setSelectedFile(null);
      
      // Update thread's last message
      setThreads(prev => prev.map(thread => 
        thread.id === selectedThread.id 
          ? { ...thread, last_message: data.message, last_message_at: data.message.created_at }
          : thread
      ));

      // Scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // Create new thread
  const createThread = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participantIds: selectedUsers.map(u => u.id),
          threadType: selectedUsers.length > 1 ? 'group' : 'direct',
          name: selectedUsers.length > 1 ? selectedUsers.map(u => u.display_name).join(', ') : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create thread');
      }

      const data = await response.json();
      
      // Add to threads list
      const formattedThread = {
        ...data.thread,
        other_participants: data.thread.participants.filter(p => p.id !== userProfile.id),
        last_message: null,
        unread_count: 0
      };
      
      setThreads(prev => [formattedThread, ...prev]);
      setSelectedThread(formattedThread);
      setShowNewChat(false);
      setSelectedUsers([]);
      setSearchUsers('');
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to create conversation');
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get thread display name
  const getThreadDisplayName = (thread) => {
    if (thread.name) return thread.name;
    if (thread.other_participants.length === 1) {
      return thread.other_participants[0].display_name;
    }
    return thread.other_participants.map(p => p.display_name).join(', ');
  };

  // Setup real-time subscriptions
  useEffect(() => {
    if (!selectedThread) return;

    // Subscribe to new messages in the selected thread
    const subscription = supabase
      .channel(`messages:${selectedThread.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${selectedThread.id}`
      }, (payload) => {
        // Only add if it's not from the current user (to avoid duplicates)
        if (payload.new.sender_id !== userProfile.id) {
          setMessages(prev => [...prev, payload.new]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedThread, userProfile.id, supabase]);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchThreads(), fetchUsers()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Fetch messages when thread is selected
  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread]);

  // Search users
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (showNewChat) {
        fetchUsers(searchUsers);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchUsers, showNewChat]);

  if (loading) {
    return <LoadingSpinner text="Loading conversations..." />;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Sidebar - Thread List */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedThread ? 'hidden md:flex' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-4">Start a conversation with community members</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Chatting
              </button>
            </div>
          ) : (
            threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedThread?.id === thread.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {thread.other_participants.length === 1 ? (
                      thread.other_participants[0].avatar_url ? (
                        <img
                          src={thread.other_participants[0].avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-700">
                          {thread.other_participants[0].display_name?.[0]?.toUpperCase()}
                        </span>
                      )
                    ) : (
                      <Users size={16} className="text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {getThreadDisplayName(thread)}
                      </h3>
                      {thread.last_message && (
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(thread.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    
                    {thread.last_message && (
                      <p className="text-sm text-gray-600 truncate">
                        {thread.last_message.message_type === 'image' ? '📷 Image' :
                         thread.last_message.message_type === 'file' ? '📎 File' :
                         thread.last_message.content}
                      </p>
                    )}
                    
                    {thread.unread_count > 0 && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                        <span className="text-xs text-white font-medium">{thread.unread_count}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedThread ? 'hidden md:flex' : ''}`}>
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedThread(null)}
                  className="md:hidden p-1 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={20} />
                </button>
                
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {selectedThread.other_participants.length === 1 ? (
                    selectedThread.other_participants[0].avatar_url ? (
                      <img
                        src={selectedThread.other_participants[0].avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-700">
                        {selectedThread.other_participants[0].display_name?.[0]?.toUpperCase()}
                      </span>
                    )
                  ) : (
                    <Users size={14} className="text-gray-600" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">
                    {getThreadDisplayName(selectedThread)}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {selectedThread.other_participants.length === 1 ? 'Online' : `${selectedThread.participants?.length || 0} members`}
                  </p>
                </div>
              </div>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="sm" text="Loading messages..." />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === userProfile.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      message.sender_id === userProfile.id
                        ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg'
                        : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                    } px-4 py-2`}>
                      {message.sender_id !== userProfile.id && selectedThread.thread_type === 'group' && (
                        <p className="text-xs font-medium mb-1 opacity-75">
                          {message.sender?.display_name}
                        </p>
                      )}
                      
                      {message.message_type === 'image' && message.file_url && (
                        <img
                          src={message.file_url}
                          alt="Shared image"
                          className="max-w-full h-auto rounded mb-2 cursor-pointer"
                          onClick={() => window.open(message.file_url, '_blank')}
                        />
                      )}
                      
                      {message.message_type === 'file' && message.file_url && (
                        <div className="flex items-center space-x-2 mb-2">
                          <File size={16} />
                          <a
                            href={message.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline"
                          >
                            Download File
                          </a>
                        </div>
                      )}
                      
                      {message.content && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      <p className={`text-xs mt-1 ${
                        message.sender_id === userProfile.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {selectedFile.type.startsWith('image/') ? (
                      <ImageIcon size={16} className="text-gray-600" />
                    ) : (
                      <File size={16} className="text-gray-600" />
                    )}
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="1"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Paperclip size={20} />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || (!newMessage.trim() && !selectedFile)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">New Conversation</h2>
                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setSelectedUsers([]);
                    setSearchUsers('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search Users */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{user.display_name}</span>
                        <button
                          onClick={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {users.filter(user => !selectedUsers.some(su => su.id === user.id)).map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUsers(prev => [...prev, user])}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-700">
                            {user.display_name?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.display_name}</p>
                        <p className="text-xs text-gray-600">
                          {user.role} {user.house?.name && `• ${user.house.name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="p-8 text-center text-gray-600">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No members found</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-6">
                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setSelectedUsers([]);
                    setSearchUsers('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createThread}
                  disabled={selectedUsers.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
