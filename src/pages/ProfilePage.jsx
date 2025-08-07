import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin, 
  Award, 
  Home, 
  Edit, 
  Save, 
  X, 
  Calendar,
  Shield,
  Star,
  Users,
  FileText,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

function ProfilePage() {
  const { userProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: userProfile?.first_name || '',
    last_name: userProfile?.last_name || '',
    display_name: userProfile?.display_name || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    experience_level: userProfile?.experience_level || 'Beginner',
    ballroom_categories: userProfile?.ballroom_categories || [],
    social_links: userProfile?.social_links || {}
  });

  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
  const ballroomCategories = [
    'Vogue Femme', 'Butch Queen', 'Butch Queen Vogue Femme', 'Femme Queen',
    'Butch Queen Up in Drags', 'Butch Queen Realness', 'Femme Queen Realness',
    'Butch Queen Face', 'Femme Queen Face', 'Butch Queen Body', 'Femme Queen Body',
    'Butch Queen Runway', 'Femme Queen Runway', 'Butch Queen Performance', 'Femme Queen Performance'
  ];

  const getRoleColor = (role) => {
    const colors = {
      'Applicant': 'bg-yellow-100 text-yellow-800',
      'Member': 'bg-blue-100 text-blue-800',
      'Leader': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'banned': 'bg-red-100 text-red-800',
      'suspended': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: userProfile?.first_name || '',
      last_name: userProfile?.last_name || '',
      display_name: userProfile?.display_name || '',
      bio: userProfile?.bio || '',
      location: userProfile?.location || '',
      experience_level: userProfile?.experience_level || 'Beginner',
      ballroom_categories: userProfile?.ballroom_categories || [],
      social_links: userProfile?.social_links || {}
    });
    setIsEditing(false);
  };

  const toggleCategory = (category) => {
    if (!isEditing) return;
    
    setFormData(prev => ({
      ...prev,
      ballroom_categories: prev.ballroom_categories.includes(category)
        ? prev.ballroom_categories.filter(c => c !== category)
        : [...prev.ballroom_categories, category]
    }));
  };

  const updateSocialLink = (platform, value) => {
    if (!isEditing) return;
    
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {userProfile.display_name || `${userProfile.first_name} ${userProfile.last_name}`}
                </h1>
                <p className="text-purple-100">{userProfile.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getRoleColor(userProfile.role)}`}>
                    <Shield className="w-4 h-4 mr-1" />
                    {userProfile.role}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getStatusColor(userProfile.status)}`}>
                    {userProfile.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{userProfile.first_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{userProfile.last_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{userProfile.display_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {userProfile.location || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{userProfile.bio || 'No bio provided'}</p>
                  )}
                </div>
              </div>

              {/* Ballroom Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Ballroom Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience Level
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.experience_level}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{userProfile.experience_level || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      House
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Home className="w-4 h-4 mr-1" />
                      {userProfile.houses?.name || 'Not assigned'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ballroom Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ballroomCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        disabled={!isEditing}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          (userProfile.ballroom_categories || []).includes(category)
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-600'
                        } ${isEditing ? 'hover:bg-purple-200 cursor-pointer' : 'cursor-default'}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Social Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['instagram', 'twitter', 'tiktok', 'youtube'].map(platform => (
                    <div key={platform}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {platform}
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={formData.social_links[platform] || ''}
                          onChange={(e) => updateSocialLink(platform, e.target.value)}
                          placeholder={`https://${platform}.com/username`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {userProfile.social_links?.[platform] || 'Not provided'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last active</span>
                    <span className="font-medium">
                      {new Date(userProfile.last_active_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <FileText className="w-4 h-4 mr-2" />
                    View Documents
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open Chat
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Users className="w-4 h-4 mr-2" />
                    View House Members
                  </button>
                </div>
              </div>

              {/* Application Status */}
              {userProfile.role === 'Applicant' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-800">Application Status</h3>
                  <p className="text-yellow-700 text-sm">
                    Your application is currently under review. You'll be notified once a decision has been made.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;