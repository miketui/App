import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { userProfile, updateProfile, supabase } = useAuth();
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    pronouns: '',
    phone: '',
    date_of_birth: '',
    house_id: ''
  });
  const [houses, setHouses] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        display_name: userProfile.display_name || '',
        bio: userProfile.bio || '',
        pronouns: userProfile.pronouns || '',
        phone: userProfile.phone || '',
        date_of_birth: userProfile.date_of_birth || '',
        house_id: userProfile.house_id || ''
      });
    }
  }, [userProfile]);

  useEffect(() => {
    const loadHouses = async () => {
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
    loadHouses();
  }, [supabase]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        display_name: form.display_name,
        bio: form.bio,
        pronouns: form.pronouns,
        phone: form.phone || null,
        date_of_birth: form.date_of_birth || null,
        house_id: form.house_id || null
      };
      const { error } = await updateProfile(updates);
      if (!error) {
        toast.success('Profile saved');
      }
    } catch (e) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and house assignment.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            value={form.display_name}
            onChange={(e) => handleChange('display_name', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pronouns</label>
          <input
            type="text"
            value={form.pronouns}
            onChange={(e) => handleChange('pronouns', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={form.date_of_birth || ''}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">House</label>
          <select
            value={form.house_id || ''}
            onChange={(e) => handleChange('house_id', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No house</option>
            {houses.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;