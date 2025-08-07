import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = [
  { key: 'basic', title: 'Basic Info' },
  { key: 'experience', title: 'Experience' },
  { key: 'house', title: 'House Interest' },
  { key: 'social', title: 'Social Links' }
];

const ApplyPage = () => {
  const navigate = useNavigate();
  const { supabase, userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationData, setApplicationData] = useState({
    displayName: userProfile?.display_name || '',
    bio: userProfile?.bio || '',
    pronouns: userProfile?.pronouns || '',
    ballroomExperience: userProfile?.ballroom_experience || '',
    interestedHouse: userProfile?.house_id || '',
    socialLinks: userProfile?.social_links || { instagram: '', twitter: '', tiktok: '' }
  });

  const updateField = (path, value) => {
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      setApplicationData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setApplicationData(prev => ({ ...prev, [path]: value }));
    }
  };

  const canContinue = () => {
    const step = steps[currentStep].key;
    if (step === 'basic') return applicationData.displayName && applicationData.bio;
    if (step === 'experience') return true;
    if (step === 'house') return true;
    if (step === 'social') return true;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch('/api/auth/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit application');
      }

      setSubmitted(true);
      toast.success('Application submitted! You will be notified after review.');
    } catch (error) {
      console.error('Application submit error:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted</h2>
        <p className="text-gray-600 mb-6">Your application is now pending review. You will gain access once approved by an admin.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Membership Application</h1>
        <p className="text-gray-600 mt-2">Please complete your application to join the community.</p>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex-1 flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              idx === currentStep ? 'bg-blue-600 text-white' : idx < currentStep ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {idx + 1}
            </div>
            <span className={`ml-2 text-sm ${idx === currentStep ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{s.title}</span>
            {idx < steps.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-3" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {steps[currentStep].key === 'basic' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
              <input
                type="text"
                value={applicationData.displayName}
                onChange={(e) => updateField('displayName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
              <textarea
                rows={4}
                value={applicationData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pronouns</label>
              <input
                type="text"
                value={applicationData.pronouns}
                onChange={(e) => updateField('pronouns', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {steps[currentStep].key === 'experience' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ballroom Experience</label>
            <select
              value={applicationData.ballroomExperience}
              onChange={(e) => updateField('ballroomExperience', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your experience level</option>
              <option value="none">New to ballroom culture</option>
              <option value="beginner">Beginner (0-1 years)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="advanced">Advanced (3+ years)</option>
              <option value="legend">Legendary status</option>
            </select>
          </div>
        )}

        {steps[currentStep].key === 'house' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">House Interest</label>
            <input
              type="text"
              value={applicationData.interestedHouse}
              onChange={(e) => updateField('interestedHouse', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter preferred house or committee"
            />
          </div>
        )}

        {steps[currentStep].key === 'social' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input
                type="url"
                value={applicationData.socialLinks.instagram || ''}
                onChange={(e) => updateField('socialLinks.instagram', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://instagram.com/yourname"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter/X</label>
              <input
                type="url"
                value={applicationData.socialLinks.twitter || ''}
                onChange={(e) => updateField('socialLinks.twitter', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://twitter.com/yourname"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
              <input
                type="url"
                value={applicationData.socialLinks.tiktok || ''}
                onChange={(e) => updateField('socialLinks.tiktok', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://tiktok.com/@yourname"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => (currentStep === 0 ? navigate('/') : setCurrentStep(s => s - 1))}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <span className="inline-flex items-center"><ArrowLeft className="w-4 h-4 mr-2" /> Back</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              disabled={!canContinue()}
              onClick={() => setCurrentStep(s => s + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <span className="inline-flex items-center">Next <ArrowRight className="w-4 h-4 ml-2" /></span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !canContinue()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;