import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProfilePage() {
  const { supabase, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ house_id: '', bio: '' });
  const [houses, setHouses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({ house_id: profile.house_id || '', bio: profile.profile_data?.bio || '' });
    }
  }, [profile]);

  useEffect(() => {
    const fetchHouses = async () => {
      const { data } = await supabase.from('houses').select('*');
      setHouses(data || []);
    };
    fetchHouses();
  }, [supabase]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    const body = {
      house_id: form.house_id || null,
      profile_data: { ...(profile?.profile_data || {}), bio: form.bio }
    };
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/user/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabase.auth.session()?.access_token}`
      },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setMsg('Profile saved');
    } else {
      setMsg('Error saving');
    }
    setSaving(false);
  };

  if (!profile) return null;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow p-8 rounded">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>
      <label className="block mb-4">
        House
        <select
          name="house_id"
          value={form.house_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a house</option>
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} - {h.category}
            </option>
          ))}
        </select>
      </label>
      <label className="block mb-4">
        Bio
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={5}
          className="w-full p-2 border rounded"
        />
      </label>
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
      <button
        onClick={() => signOut() && navigate('/login')}
        className="ml-4 text-red-600 underline"
      >
        Logout
      </button>
      {msg && <p className="mt-4">{msg}</p>}
    </div>
  );
}

export default ProfilePage;