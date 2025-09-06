import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Users, FileText, BarChart3, Shield } from 'lucide-react';

const DashboardPage = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage the community, review applications, and monitor platform health
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activity Score</p>
              <p className="text-2xl font-bold text-gray-900">100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-20 bg-white rounded-lg shadow-sm border">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Settings className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-3">Advanced Admin Tools Coming Soon!</h3>
        <p className="text-gray-600 max-w-lg mx-auto">
          We're building comprehensive admin tools including application reviews, 
          user management, analytics dashboard, and community moderation features.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto text-sm text-gray-500">
          <div className="flex flex-col items-center space-y-2">
            <Users size={20} />
            <span>User Management</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Shield size={20} />
            <span>Application Reviews</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <BarChart3 size={20} />
            <span>Analytics</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Settings size={20} />
            <span>Moderation Tools</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
