import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Share2, Plus } from 'lucide-react';

const FeedPage = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Feed</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userProfile?.display_name || 'Member'}! See what's happening in the community.
          </p>
        </div>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          <span>New Post</span>
        </button>
      </div>

      {/* Feed Content */}
      <div className="space-y-6">
        {/* Sample Post */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
              A
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Admin</h3>
              <p className="text-sm text-gray-600">2 hours ago</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-900 mb-3">
              Welcome to Haus of Basquiat! 🎉 We're excited to have you join our vibrant community. 
              This is where we'll share updates, celebrate achievements, and connect with each other.
            </p>
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                📋 Complete your profile • 📚 Check out the document library • 💬 Join the conversation in chat
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-gray-600">
            <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
              <Heart size={18} />
              <span className="text-sm">12</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
              <MessageCircle size={18} />
              <span className="text-sm">3</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
              <Share2 size={18} />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">More posts coming soon!</h3>
          <p className="text-gray-600">
            The full social feed with AI-powered features will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
