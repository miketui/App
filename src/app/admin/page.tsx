'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: 'member' | 'curator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  created_at: string;
  last_sign_in_at?: string;
  post_count: number;
  library_count: number;
  follower_count: number;
}

interface SystemStats {
  total_users: number;
  active_users: number;
  new_users_this_week: number;
  total_posts: number;
  total_library_items: number;
  total_messages: number;
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const supabase = createClientComponentClient();

  const roles = [
    { value: 'member', label: 'Member', color: 'bg-basquiat-yellow text-black' },
    { value: 'curator', label: 'Curator', color: 'bg-basquiat-blue text-white' },
    { value: 'admin', label: 'Admin', color: 'bg-basquiat-red text-white' }
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: 'bg-green-500 text-white' },
    { value: 'suspended', label: 'Suspended', color: 'bg-yellow-500 text-white' },
    { value: 'banned', label: 'Banned', color: 'bg-red-500 text-white' }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // Check if user is admin
        // In a real app, this would check the user's role in the database
        // For now, we'll simulate admin access
        setIsAuthorized(true);
        loadDashboardData();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [supabase]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const loadDashboardData = () => {
    // Mock system statistics
    const mockStats: SystemStats = {
      total_users: 1247,
      active_users: 892,
      new_users_this_week: 34,
      total_posts: 5632,
      total_library_items: 2341,
      total_messages: 8901
    };

    // Mock user data
    const mockUsers: UserProfile[] = [
      {
        id: 'user1',
        username: 'artlover23',
        full_name: 'Maya Chen',
        email: 'maya.chen@email.com',
        role: 'curator',
        status: 'active',
        created_at: new Date(Date.now() - 2592000000).toISOString(),
        last_sign_in_at: new Date(Date.now() - 3600000).toISOString(),
        post_count: 45,
        library_count: 128,
        follower_count: 234
      },
      {
        id: 'user2',
        username: 'brooklyn_art',
        full_name: 'Alex Rodriguez',
        email: 'alex.rodriguez@email.com',
        role: 'member',
        status: 'active',
        created_at: new Date(Date.now() - 1209600000).toISOString(),
        last_sign_in_at: new Date(Date.now() - 7200000).toISOString(),
        post_count: 23,
        library_count: 67,
        follower_count: 89
      },
      {
        id: 'user3',
        username: 'streetart_fan',
        full_name: 'Jordan Smith',
        email: 'jordan.smith@email.com',
        role: 'member',
        status: 'active',
        created_at: new Date(Date.now() - 604800000).toISOString(),
        last_sign_in_at: new Date(Date.now() - 86400000).toISOString(),
        post_count: 12,
        library_count: 34,
        follower_count: 56
      },
      {
        id: 'user4',
        username: 'dr_williams',
        full_name: 'Dr. Sarah Williams',
        email: 'sarah.williams@university.edu',
        role: 'curator',
        status: 'active',
        created_at: new Date(Date.now() - 7776000000).toISOString(),
        last_sign_in_at: new Date(Date.now() - 1800000).toISOString(),
        post_count: 89,
        library_count: 256,
        follower_count: 445
      },
      {
        id: 'user5',
        username: 'problematic_user',
        full_name: 'Problem User',
        email: 'problem@example.com',
        role: 'member',
        status: 'suspended',
        created_at: new Date(Date.now() - 5184000000).toISOString(),
        last_sign_in_at: new Date(Date.now() - 172800000).toISOString(),
        post_count: 5,
        library_count: 12,
        follower_count: 3
      }
    ];

    setStats(mockStats);
    setUsers(mockUsers);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateUser = (userId: string, updates: Partial<UserProfile>) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, ...updates } : user
      )
    );
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const getRoleConfig = (role: string) => {
    return roles.find(r => r.value === role) || roles[0];
  };

  const getStatusConfig = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastSeen = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) {
      return 'Just now';
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else {
      return `${days}d ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-basquiat-cream p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-basquiat-cream p-4 flex items-center justify-center">
        <Card className="p-8 border-4 border-black shadow-brutal text-center max-w-md">
          <h1 className="text-3xl font-bold text-basquiat-red mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-basquiat-blue"
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basquiat-cream p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-basquiat-red">Admin Dashboard</h1>
          <Badge className="bg-basquiat-red text-white px-4 py-2 text-lg">
            Administrator
          </Badge>
        </div>

        {/* System Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 border-4 border-black shadow-brutal bg-basquiat-yellow">
              <h3 className="text-lg font-bold text-black mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-black">{stats.total_users.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">
                +{stats.new_users_this_week} this week
              </p>
            </Card>

            <Card className="p-6 border-4 border-black shadow-brutal bg-basquiat-green">
              <h3 className="text-lg font-bold text-white mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-white">{stats.active_users.toLocaleString()}</p>
              <p className="text-sm text-green-100 mt-1">
                {Math.round((stats.active_users / stats.total_users) * 100)}% of total
              </p>
            </Card>

            <Card className="p-6 border-4 border-black shadow-brutal bg-basquiat-blue">
              <h3 className="text-lg font-bold text-white mb-2">Total Posts</h3>
              <p className="text-3xl font-bold text-white">{stats.total_posts.toLocaleString()}</p>
              <p className="text-sm text-blue-100 mt-1">
                Avg {Math.round(stats.total_posts / stats.total_users)} per user
              </p>
            </Card>

            <Card className="p-6 border-4 border-black shadow-brutal bg-basquiat-purple">
              <h3 className="text-lg font-bold text-white mb-2">Library Items</h3>
              <p className="text-3xl font-bold text-white">{stats.total_library_items.toLocaleString()}</p>
              <p className="text-sm text-purple-100 mt-1">
                {stats.total_messages.toLocaleString()} messages sent
              </p>
            </Card>
          </div>
        )}

        {/* User Management Section */}
        <Card className="border-4 border-black shadow-brutal mb-6">
          <div className="p-6 border-b-2 border-black">
            <h2 className="text-2xl font-bold text-black mb-4">User Management</h2>
            
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-2 border-black"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="border-2 border-black px-3 py-2 bg-white"
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border-2 border-black px-3 py-2 bg-white"
                >
                  <option value="all">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-black">
                <tr>
                  <th className="text-left p-4 font-bold text-black">User</th>
                  <th className="text-left p-4 font-bold text-black">Role</th>
                  <th className="text-left p-4 font-bold text-black">Status</th>
                  <th className="text-left p-4 font-bold text-black">Activity</th>
                  <th className="text-left p-4 font-bold text-black">Last Seen</th>
                  <th className="text-left p-4 font-bold text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const roleConfig = getRoleConfig(user.role);
                  const statusConfig = getStatusConfig(user.status);
                  
                  return (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-black">
                            <div className="w-full h-full bg-basquiat-blue flex items-center justify-center text-white font-bold">
                              {user.full_name.charAt(0)}
                            </div>
                          </Avatar>
                          <div>
                            <p className="font-bold text-black">{user.full_name}</p>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${roleConfig.color} px-3 py-1 font-bold`}>
                          {roleConfig.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={`${statusConfig.color} px-3 py-1 font-bold`}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p>{user.post_count} posts</p>
                          <p>{user.library_count} library items</p>
                          <p>{user.follower_count} followers</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p>{formatLastSeen(user.last_sign_in_at)}</p>
                          <p className="text-gray-500">
                            Joined {formatDate(user.created_at)}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                            className="text-xs px-3 py-1 bg-basquiat-blue text-white"
                          >
                            Edit
                          </Button>
                          {user.status === 'active' && (
                            <Button
                              onClick={() => handleUpdateUser(user.id, { status: 'suspended' })}
                              className="text-xs px-3 py-1 bg-yellow-500 text-white"
                            >
                              Suspend
                            </Button>
                          )}
                          {user.status === 'suspended' && (
                            <Button
                              onClick={() => handleUpdateUser(user.id, { status: 'active' })}
                              className="text-xs px-3 py-1 bg-green-500 text-white"
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-600">
              No users found matching your criteria.
            </div>
          )}
        </Card>

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          title="Edit User"
        >
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, role: e.target.value as UserProfile['role'] } : null)}
                  className="w-full border-2 border-black px-3 py-2 bg-white"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Status</label>
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, status: e.target.value as UserProfile['status'] } : null)}
                  className="w-full border-2 border-black px-3 py-2 bg-white"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-100 p-4 rounded border-2 border-black">
                <h4 className="font-bold text-black mb-2">User Statistics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-bold">{selectedUser.post_count}</p>
                    <p className="text-gray-600">Posts</p>
                  </div>
                  <div>
                    <p className="font-bold">{selectedUser.library_count}</p>
                    <p className="text-gray-600">Library Items</p>
                  </div>
                  <div>
                    <p className="font-bold">{selectedUser.follower_count}</p>
                    <p className="text-gray-600">Followers</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-black"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateUser(selectedUser.id, {
                    role: selectedUser.role,
                    status: selectedUser.status
                  })}
                  className="flex-1 bg-basquiat-green"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}