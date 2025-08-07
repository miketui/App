import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Home, Award, Users, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [step, setStep] = useState('email'); // email, code, application
  const [applicationData, setApplicationData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    ballroomExperience: '',
    whyJoin: '',
    housePreference: '',
    references: [''],
    portfolioLinks: ['']
  });
  const [loading, setLoading] = useState(false);
  
  const { 
    loginWithMagicLink, 
    loginWithCode, 
    generateLoginCode, 
    showLoginCode, 
    setShowLoginCode,
    loading: authLoading 
  } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    const result = await generateLoginCode(email);
    setLoading(false);

    if (result.success) {
      if (result.code) {
        setStep('code');
      } else {
        toast.success('Magic link sent! Check your email.');
      }
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!loginCode) {
      toast.error('Please enter the login code');
      return;
    }

    setLoading(true);
    const result = await loginWithCode(email, loginCode);
    setLoading(false);

    if (result.success) {
      // Check if user needs to complete application
      // This would be determined by user status/role
      setStep('application');
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!applicationData.firstName || !applicationData.lastName || !applicationData.displayName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Submit application logic would go here
      toast.success('Application submitted successfully!');
      setStep('email');
      setEmail('');
      setLoginCode('');
      setApplicationData({
        firstName: '',
        lastName: '',
        displayName: '',
        bio: '',
        ballroomExperience: '',
        whyJoin: '',
        housePreference: '',
        references: [''],
        portfolioLinks: ['']
      });
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const addReference = () => {
    setApplicationData(prev => ({
      ...prev,
      references: [...prev.references, '']
    }));
  };

  const removeReference = (index) => {
    setApplicationData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const updateReference = (index, value) => {
    setApplicationData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => i === index ? value : ref)
    }));
  };

  const addPortfolioLink = () => {
    setApplicationData(prev => ({
      ...prev,
      portfolioLinks: [...prev.portfolioLinks, '']
    }));
  };

  const removePortfolioLink = (index) => {
    setApplicationData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index)
    }));
  };

  const updatePortfolioLink = (index, value) => {
    setApplicationData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.map((link, i) => i === index ? value : link)
    }));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center">
          <div className="flex items-center justify-center mb-4">
            <Home className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">Haus of Basquiat</h1>
          </div>
          <p className="text-purple-100">Join the ballroom community</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'email' && (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>
            </motion.form>
          )}

          {step === 'code' && (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleCodeSubmit}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">Enter the login code sent to:</p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </motion.form>
          )}

          {step === 'application' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-900">Complete Your Application</h2>
                <p className="text-gray-600">Tell us about yourself and your ballroom experience</p>
              </div>

              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={applicationData.firstName}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={applicationData.lastName}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={applicationData.displayName}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="How you want to be known in the community"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={applicationData.bio}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ballroom Experience
                  </label>
                  <textarea
                    value={applicationData.ballroomExperience}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, ballroomExperience: e.target.value }))}
                    placeholder="Describe your experience with ballroom culture..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why do you want to join?
                  </label>
                  <textarea
                    value={applicationData.whyJoin}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, whyJoin: e.target.value }))}
                    placeholder="What brings you to the Haus of Basquiat community?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    House Preference
                  </label>
                  <select
                    value={applicationData.housePreference}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, housePreference: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a house category</option>
                    <option value="Vogue Femme">Vogue Femme</option>
                    <option value="Butch Queen">Butch Queen</option>
                    <option value="Butch Queen Vogue Femme">Butch Queen Vogue Femme</option>
                    <option value="Femme Queen">Femme Queen</option>
                    <option value="Butch Queen Up in Drags">Butch Queen Up in Drags</option>
                    <option value="Butch Queen Realness">Butch Queen Realness</option>
                    <option value="Femme Queen Realness">Femme Queen Realness</option>
                    <option value="Butch Queen Face">Butch Queen Face</option>
                    <option value="Femme Queen Face">Femme Queen Face</option>
                    <option value="Butch Queen Body">Butch Queen Body</option>
                    <option value="Femme Queen Body">Femme Queen Body</option>
                    <option value="Butch Queen Runway">Butch Queen Runway</option>
                    <option value="Femme Queen Runway">Femme Queen Runway</option>
                    <option value="Butch Queen Performance">Butch Queen Performance</option>
                    <option value="Femme Queen Performance">Femme Queen Performance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    References
                  </label>
                  {applicationData.references.map((reference, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => updateReference(index, e.target.value)}
                        placeholder="Reference name or contact"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {applicationData.references.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeReference(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addReference}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    + Add Reference
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portfolio Links
                  </label>
                  {applicationData.portfolioLinks.map((link, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => updatePortfolioLink(index, e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {applicationData.portfolioLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePortfolioLink(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPortfolioLink}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    + Add Portfolio Link
                  </button>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep('code')}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center">
          <p className="text-sm text-gray-600">
            By continuing, you agree to our{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700">Privacy Policy</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;