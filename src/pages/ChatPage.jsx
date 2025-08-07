import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Users, Send } from 'lucide-react';

const ChatPage = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
        <p className="text-gray-600 mt-2">
          Connect with community members in real-time
        </p>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-20 bg-white rounded-lg shadow-sm border">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-3">Real-time Chat Coming Soon!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We're building an amazing chat experience with 1-on-1 messaging, group chats, 
          file sharing, and real-time notifications.
        </p>
        <div className="flex justify-center space-x-8 mt-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span>Group Chats</span>
          </div>
          <div className="flex items-center space-x-2">
            <Send size={16} />
            <span>File Sharing</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle size={16} />
            <span>Real-time Messaging</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
