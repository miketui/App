import React, { useState, useEffect } from 'react';
import { Users, Shield, BarChart3, Settings, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, DollarSign, FileText, MessageCircle } from 'lucide-react';
import { USER_ROLES, MODERATION_STATUSES } from '../utils/constants';
import { formatDate, formatNumber } from '../utils/helpers';
import AIInsights from './AIInsights';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - would fetch from backend
      const mockUsers = [
        {
          id: 1,
          display_name: 'John Doe',
          email: 'john@example.com',
          role: 'Member',
          status: 'active',
          joined_at: '2024-01-15T10:00:00Z',
          last_active: '2024-01-20T15:30:00Z',
          posts_count: 12,
          house: 'House of Basquiat'
        },
        {
          id: 2,
          display_name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Applicant',
          status: 'pending',
          joined_at: '2024-01-18T14:20:00Z',
          last_active: '2024-01-19T09:15:00Z',
          posts_count: 0,
          house: null
        }
      ];

      const mockApplications = [
        {
          id: 1,
          user_name: 'Jane Smith',
          email: 'jane@example.com',
          status: 'pending',
          submitted_at: '2024-01-18T14:20:00Z',
          ballroom_experience: '2 years',
          why_join: 'I want to connect with the ballroom community...',
          house_preference: 'House of Basquiat'
        }
      ];

      const mockModerationQueue = [
        {
          id: 1,
          content_type: 'post',
          content: 'This is a sample post that needs moderation...',
          author: 'John Doe',
          submitted_at: '2024-01-20T12:00:00Z',
          status: 'pending',
          flags: ['inappropriate_content']
        }
      ];

      const mockAnalytics = {
        totalUsers: 1250,
        activeUsers: 890,
        newUsersThisMonth: 45,
        totalPosts: 3420,
        postsThisMonth: 156,
        totalRevenue: 1250000, // $12,500.00
        revenueThisMonth: 450000, // $4,500.00
        pendingApplications: 12,
        pendingModeration: 8,
        communityHealth: 'excellent',
        growthRate: 15.5
      };

      setUsers(mockUsers);
      setApplications(mockApplications);
      setModerationQueue(mockModerationQueue);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationReview = async (applicationId, status, notes = '') => {
    try {
      // This would update the application via API
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status, reviewed_at: new Date().toISOString(), notes }
            : app
        )
      );
      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to review application');
    }
  };

  const handleModerationAction = async (itemId, action) => {
    try {
      // This would update the moderation item via API
      setModerationQueue(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: action, moderated_at: new Date().toISOString() }
            : item
        )
      );
      toast.success(`Content ${action === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error moderating content:', error);
      toast.error('Failed to moderate content');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Leader':
        return 'bg-green-100 text-green-800';
      case 'Member':
        return 'bg-blue-100 text-blue-800';
      case 'Applicant':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRevenue = (revenue) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(revenue / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your ballroom community platform</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'users', name: 'Users', icon: Users },
            { id: 'applications', name: 'Applications', icon: Shield },
            { id: 'moderation', name: 'Moderation', icon: AlertTriangle },
            { id: 'analytics', name: 'Analytics', icon: TrendingUp },
            { id: 'settings', name: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalUsers)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600">+{analytics.newUsersThisMonth} this month</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Posts</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalPosts)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600">+{analytics.postsThisMonth} this month</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatRevenue(analytics.totalRevenue)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600">+{formatRevenue(analytics.revenueThisMonth)} this month</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.pendingApplications + analytics.pendingModeration}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-orange-600">{analytics.pendingApplications} applications, {analytics.pendingModeration} moderation</span>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <AIInsights 
                communityData={{
                  totalPosts: analytics.totalPosts,
                  activeUsers: analytics.activeUsers,
                  engagementRate: 75,
                  growthRate: analytics.growthRate
                }}
                timeRange="month"
              />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage community members and their roles</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.display_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.joined_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.last_active)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-purple-600 hover:text-purple-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Ban</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Application Review</h3>
                <p className="text-sm text-gray-600">Review and approve new member applications</p>
              </div>
              
              <div className="p-6 space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{application.user_name}</h4>
                        <p className="text-sm text-gray-500">{application.email}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Experience:</span>
                        <p className="text-sm text-gray-900">{application.ballroom_experience}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">House Preference:</span>
                        <p className="text-sm text-gray-900">{application.house_preference}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-600">Why Join:</span>
                      <p className="text-sm text-gray-900 mt-1">{application.why_join}</p>
                    </div>
                    
                    {application.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApplicationReview(application.id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApplicationReview(application.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Content Moderation</h3>
                <p className="text-sm text-gray-600">Review flagged content and take action</p>
              </div>
              
              <div className="p-6 space-y-4">
                {moderationQueue.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.content_type} by {item.author}</h4>
                        <p className="text-sm text-gray-500">{formatDate(item.submitted_at)}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-600">Content:</span>
                      <p className="text-sm text-gray-900 mt-1">{item.content}</p>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-600">Flags:</span>
                      <div className="flex space-x-2 mt-1">
                        {item.flags.map((flag, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {item.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleModerationAction(item.id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerationAction(item.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">User Growth</span>
                      <span className="text-sm font-medium text-green-600">+{analytics.growthRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Engagement Rate</span>
                      <span className="text-sm font-medium text-blue-600">75%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Community Health</span>
                      <span className="text-sm font-medium text-green-600 capitalize">{analytics.communityHealth}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monthly Revenue</span>
                      <span className="text-sm font-medium text-green-600">{formatRevenue(analytics.revenueThisMonth)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="text-sm font-medium text-purple-600">{formatRevenue(analytics.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Growth Rate</span>
                      <span className="text-sm font-medium text-green-600">+12.5%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(analytics.activeUsers)}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(analytics.postsThisMonth)}</div>
                    <div className="text-sm text-gray-600">Posts This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{analytics.pendingApplications}</div>
                    <div className="text-sm text-gray-600">Pending Applications</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Platform Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                      <input type="text" className="input-field" defaultValue="Haus of Basquiat" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                      <input type="email" className="input-field" defaultValue="admin@hausofbasquiat.com" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Moderation Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                      <label className="ml-2 text-sm text-gray-700">Enable AI content moderation</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                      <label className="ml-2 text-sm text-gray-700">Require approval for new posts</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <label className="ml-2 text-sm text-gray-700">Enable automatic content filtering</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Payment Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Public Key</label>
                      <input type="text" className="input-field" placeholder="pk_test_..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select className="input-field">
                        <option value="usd">USD</option>
                        <option value="eur">EUR</option>
                        <option value="gbp">GBP</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="btn-primary">Save Settings</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;