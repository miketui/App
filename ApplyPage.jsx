import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ApplyPage() {
  const navigate = useNavigate();
  const { supabase, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    display_name: '',
    category: '',
    bio: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (profile && profile.role !== 'Applicant') {
    navigate('/');
  }

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabase.auth.session()?.access_token}`
        },
        body: JSON.stringify({ applicant_data: { ...form, user_id: profile.id } })
      });
      if (!res.ok) throw new Error('Submission failed');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow p-8 rounded">
      <h1 className="text-2xl font-bold mb-6 text-center">Membership Application</h1>
      {step === 1 && (
        <div>
          <label className="block mb-4">
            Display Name
            <input
              type="text"
              name="display_name"
              value={form.display_name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </label>
          <label className="block mb-4">
            Category (e.g., Vogue Femme, Runway)
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </label>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={next}
            disabled={!form.display_name || !form.category}
          >
            Next
          </button>
        </div>
      )}
      {step === 2 && (
        <div>
          <label className="block mb-4">
            Short Bio
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={5}
            />
          </label>
          <div className="flex justify-between">
            <button className="px-4 py-2 rounded border" onClick={prev}>Back</button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleSubmit}
              disabled={submitting || !form.bio}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default ApplyPage;