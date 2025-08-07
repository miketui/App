import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  Settings,
  Shield,
  Star,
  Crown,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { userProfile, supabase } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      // Get basic counts
      const [usersCount, postsCount, documentsCount, messagesCount] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('documents').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true })
      ]);

      // Get role distribution
      const { data: roleData } = await supabase
        .from('user_profiles')
        .select('role')
        .not('role', 'eq', 'Applicant');

      const roleCounts = roleData?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get recent activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [recentUsers, recentPosts, recentMessages] = await Promise.all([
        supabase.from('user_profiles').select('id').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('posts').select('id').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('messages').select('id').gte('created_at', thirtyDaysAgo.toISOString())
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalPosts: postsCount.count || 0,
        totalDocuments: documentsCount.count || 0,
        totalMessages: messagesCount.count || 0,
        roleCounts,
        recentActivity: {
          newUsers: recentUsers.data?.length || 0,
          newPosts: recentPosts.data?.length || 0,
          newMessages: recentMessages.data?.length || 0
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch users for management
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          house:houses(name),
          subscription:subscriptions(status, current_period_end)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch pending applications
  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('user_applications')
        .select(`
          *,
          user:user_profiles(display_name, email, avatar_url)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Fetch posts for moderation
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_profiles(display_name, avatar_url),
          _count_likes:post_likes(count),
          _count_comments:comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const formattedPosts = data?.map(post => ({
        ...post,
        likes_count: post._count_likes?.[0]?.count || 0,
        comments_count: post._count_comments?.[0]?.count || 0
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Handle user role update
  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success(`User role updated to ${newRole}`);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  // Handle application review
  const reviewApplication = async (applicationId, status, notes = '') => {
    try {
      const { error } = await supabase
        .from('user_applications')
        .update({
          status,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userProfile.id
        })
        .eq('id', applicationId);

      if (error) throw error;

      if (status === 'approved') {
        // Update user role to Member
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          await updateUserRole(application.user_id, 'Member');
        }
      }

      toast.success(`Application ${status}`);
      await fetchApplications();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to review application');
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Leader': return 'bg-purple-100 text-purple-800';
      case 'Member': return 'bg-blue-100 text-blue-800';
      case 'Applicant': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return Crown;
      case 'Leader': return Star;
      case 'Member': return Users;
      default: return Users;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'banned': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchApplications(),
        fetchPosts()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your community, monitor activity, and oversee platform operations.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-green-600 text-sm mt-1">
                +{stats.recentActivity?.newUsers} this month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
              <p className="text-green-600 text-sm mt-1">
                +{stats.recentActivity?.newPosts} this month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Documents</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDocuments}</p>
              <p className="text-gray-600 text-sm mt-1">Library resources</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Messages</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
              <p className="text-green-600 text-sm mt-1">
                +{stats.recentActivity?.newMessages} this month
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'applications', label: `Applications (${applications.length})`, icon: UserPlus },
              { id: 'content', label: 'Content Moderation', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Role Distribution */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.roleCounts || {}).map(([role, count]) => {
                      const Icon = getRoleIcon(role);
                      const percentage = ((count / stats.totalUsers) * 100).toFixed(1);
                      
                      return (
                        <div key={role} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon size={16} className="text-gray-600" />
                            <span className="text-gray-900">{role}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">New Members</p>
                        <p className="text-sm text-gray-600">{stats.recentActivity?.newUsers} joined this month</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Content Activity</p>
                        <p className="text-sm text-gray-600">{stats.recentActivity?.newPosts} new posts this month</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Community Engagement</p>
                        <p className="text-sm text-gray-600">{stats.recentActivity?.newMessages} messages this month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Leader">Leader</option>
                    <option value="Member">Member</option>
                    <option value="Applicant">Applicant</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        House
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-700">
                                  {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.display_name || 'No name'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.house?.name || 'None'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="Applicant">Applicant</option>
                            <option value="Member">Member</option>
                            <option value="Leader">Leader</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
                  <p className="text-gray-600">All applications have been reviewed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map(application => (
                    <div key={application.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            {application.user?.avatar_url ? (
                              <img
                                src={application.user.avatar_url}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-medium text-gray-700">
                                {application.user?.display_name?.[0]?.toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {application.user?.display_name || 'Unknown User'}
                            </h4>
                            <p className="text-gray-600">{application.user?.email}</p>
                            <p className="text-sm text-gray-500">
                              Applied {formatDate(application.submitted_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => reviewApplication(application.id, 'approved')}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle size={16} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => reviewApplication(application.id, 'rejected', 'Application did not meet requirements')}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle size={16} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Application Details */}
                      <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Bio:</p>
                          <p className="text-gray-600">{application.applicant_data?.bio || 'No bio provided'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Experience:</p>
                          <p className="text-gray-600">{application.applicant_data?.ballroom_experience || 'No experience provided'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Pronouns:</p>
                          <p className="text-gray-600">{application.applicant_data?.pronouns || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">House Interest:</p>
                          <p className="text-gray-600">{application.applicant_data?.house_interest || 'None specified'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
                <p className="text-sm text-gray-600">{posts.length} posts</p>
              </div>
              
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          {post.author?.avatar_url ? (
                            <img
                              src={post.author.avatar_url}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-700">
                              {post.author?.display_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">{post.author?.display_name}</p>
                          <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <span>❤️</span>
                          <span>{post.likes_count}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare size={14} />
                          <span>{post.comments_count}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-gray-900">{post.content}</p>
                      {post.media_urls && post.media_urls.length > 0 && (
                        <div className="mt-2 flex space-x-2">
                          {post.media_urls.slice(0, 3).map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt=""
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ))}
                          {post.media_urls.length > 3 && (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600">
                              +{post.media_urls.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
