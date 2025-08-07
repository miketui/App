import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Users, FileText, BarChart3, Shield, Check, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { supabase } = useAuth();
  const [pendingApps, setPendingApps] = useState([]);
  const [approvedApps, setApprovedApps] = useState([]);
  const [rejectedApps, setRejectedApps] = useState([]);
  const [stats, setStats] = useState({ members: 0, documents: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [houses, setHouses] = useState([]);

  const fetchApps = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    const fetchByStatus = async (status) => {
      const res = await fetch(`/api/admin/applications?status=${status}`, { headers });
      if (!res.ok) throw new Error('Failed to load applications');
      return (await res.json()).applications;
    };

    const [pending, approved, rejected] = await Promise.all([
      fetchByStatus('pending'),
      fetchByStatus('approved'),
      fetchByStatus('rejected')
    ]);

    setPendingApps(pending);
    setApprovedApps(approved);
    setRejectedApps(rejected);
  };

  const fetchStats = async () => {
    try {
      const { count: membersCount } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .in('role', ['Member', 'Leader', 'Admin']);

      const { count: documentsCount } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true });

      setStats({ members: membersCount || 0, documents: documentsCount || 0 });
    } catch {
      // ignore
    }
  };

  const fetchHouses = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/houses', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setHouses(data.houses || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchApps(), fetchStats(), fetchHouses()]);
      setLoading(false);
    };
    load();
  }, []);

  const reviewApplication = async (id, action, assignedHouse) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action, assignedHouse: assignedHouse || null })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update application');
      }

      toast.success(action === 'approved' ? 'Application approved' : 'Application rejected');
      await fetchApps();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const visibleApps = (filter === 'pending' ? pendingApps : filter === 'approved' ? approvedApps : rejectedApps)
    .filter(app => {
      if (!search) return true;
      const meta = app.user_profile || {};
      return (
        meta.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        meta.email?.toLowerCase().includes(search.toLowerCase())
      );
    });

  if (loading) {
    return <div className="py-20 text-center text-gray-600">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage the community, review applications, and monitor platform health</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.members}</p>
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
              <p className="text-2xl font-bold text-gray-900">{pendingApps.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.documents}</p>
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

      {/* Applications Review */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >Pending</button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 rounded ${filter === 'approved' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >Approved</button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1 rounded ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >Rejected</button>
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicants..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="divide-y">
          {visibleApps.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No applications</div>
          ) : (
            visibleApps.map(app => (
              <div key={app.id} className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{app.user_profile?.display_name || 'Applicant'}</p>
                  <p className="text-sm text-gray-600">{app.user_profile?.email}</p>
                  <div className="mt-2 text-sm text-gray-700">
                    <p><span className="font-medium">Experience:</span> {app.applicant_data?.ballroomExperience || '—'}</p>
                    <p><span className="font-medium">Pronouns:</span> {app.applicant_data?.pronouns || '—'}</p>
                  </div>
                </div>

                {filter === 'pending' ? (
                  <div className="flex items-center space-x-2">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      defaultValue=""
                      onChange={(e) => (app.__houseAssign = e.target.value)}
                    >
                      <option value="">Assign house (optional)</option>
                      {houses.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => reviewApplication(app.id, 'rejected')}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => reviewApplication(app.id, 'approved', app.__houseAssign)}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Reviewed</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-10 bg-white rounded-lg shadow-sm border">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600">More admin tools coming soon.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
