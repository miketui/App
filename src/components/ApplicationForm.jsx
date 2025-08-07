import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ballroomCategories = [
  'Vogue Femme',
  'Vogue Performance',
  'Runway',
  'Face',
  'Body',
  'Realness',
  'Commentary',
  'DJ',
  'MC',
  'Photographer',
  'Videographer',
  'Stylist',
  'Makeup Artist',
  'Choreographer',
  'Producer',
  'Event Organizer'
];

const houses = [
  { id: '1', name: 'House of Basquiat', category: 'Art & Performance' },
  { id: '2', name: 'House of Xtravaganza', category: 'Fashion & Style' },
  { id: '3', name: 'House of Ninja', category: 'Dance & Movement' },
  { id: '4', name: 'House of LaBeija', category: 'Community & Leadership' },
  { id: '5', name: 'House of Aviance', category: 'Music & Entertainment' },
  { id: '6', name: 'House of Ebony', category: 'Fashion & Beauty' },
  { id: '7', name: 'House of Dupree', category: 'Performance & Art' },
  { id: '8', name: 'House of Garcon', category: 'Fashion & Style' }
];

function ApplicationForm({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    ballroomCategories: [],
    preferredHouse: '',
    experience: '',
    goals: '',
    socialMedia: '',
    references: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { submitApplication } = useAuth();

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      ballroomCategories: prev.ballroomCategories.includes(category)
        ? prev.ballroomCategories.filter(c => c !== category)
        : [...prev.ballroomCategories, category]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.displayName || !formData.bio || formData.ballroomCategories.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    const result = await submitApplication(formData);
    
    if (result.success) {
      onComplete(result.application);
    } else {
      setError(result.error || 'Failed to submit application');
    }
    
    setLoading(false);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => updateFormData('displayName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your ballroom name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio *
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => updateFormData('bio', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell us about yourself and your connection to ballroom culture..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ballroom Categories</h3>
        <p className="text-sm text-gray-600 mb-4">Select the categories that interest you:</p>
        <div className="grid grid-cols-2 gap-3">
          {ballroomCategories.map(category => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ballroomCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">House & Experience</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred House
            </label>
            <select
              value={formData.preferredHouse}
              onChange={(e) => updateFormData('preferredHouse', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a house (optional)</option>
              {houses.map(house => (
                <option key={house.id} value={house.id}>
                  {house.name} - {house.category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ballroom Experience
            </label>
            <textarea
              value={formData.experience}
              onChange={(e) => updateFormData('experience', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe your experience in ballroom culture..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goals in the Community
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => updateFormData('goals', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What do you hope to achieve in the Haus of Basquiat community?"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Media (optional)
            </label>
            <input
              type="text"
              value={formData.socialMedia}
              onChange={(e) => updateFormData('socialMedia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Instagram, Twitter, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              References (optional)
            </label>
            <textarea
              value={formData.references}
              onChange={(e) => updateFormData('references', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Any community members who can vouch for you..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Haus of Basquiat</h2>
        <p className="text-gray-600">Complete your application to join our ballroom community</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 4 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ApplicationForm;