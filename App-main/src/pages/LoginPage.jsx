import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showApplication, setShowApplication] = useState(false);
  const [applicationData, setApplicationData] = useState({
    displayName: '',
    bio: '',
    pronouns: '',
    ballroomExperience: '',
    interestedHouse: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      tiktok: ''
    }
  });
  
  const { signInWithEmail, submitApplication, supabase } = useAuth();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      switch (error) {
        case 'auth_callback_failed':
          toast.error('Authentication failed. Please try again.');
          break;
        case 'unexpected_error':
          toast.error('An unexpected error occurred. Please try again.');
          break;
        default:
          toast.error('An error occurred during authentication.');
      }
    }
  }, [error]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id, role, status')
        .eq('email', email)
        .single();

      if (existingUser) {
        // Existing user - send magic link
        const result = await signInWithEmail(email);
        if (result.success) {
          setEmailSent(true);
        }
      } else {
        // New user - show application form
        setShowApplication(true);
      }
    } catch (error) {
      // User doesn't exist, show application
      setShowApplication(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      // First, create the auth user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36), // Random password since we use magic links
        options: {
          data: {
            display_name: applicationData.displayName,
          }
        }
      });

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      // Send magic link for verification
      const result = await signInWithEmail(email);
      if (result.success) {
        setEmailSent(true);
        toast.success('Application submitted! Check your email to complete registration.');
      }
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setApplicationData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setApplicationData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a magic link to <strong>{email}</strong>. 
            Click the link in your email to complete your sign-in.
          </p>
          <div className="text-sm text-gray-500">
            <p>Didn't receive the email? Check your spam folder or</p>
            <button 
              onClick={() => {
                setEmailSent(false);
                setShowApplication(false);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showApplication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Haus of Basquiat</h2>
            <p className="text-gray-600">Tell us about yourself to complete your application</p>
          </div>

          <form onSubmit={handleApplicationSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={applicationData.displayName}
                  onChange={(e) => handleApplicationChange('displayName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="How should we call you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pronouns
                </label>
                <input
                  type="text"
                  value={applicationData.pronouns}
                  onChange={(e) => handleApplicationChange('pronouns', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="she/her, he/him, they/them, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                required
                rows={4}
                value={applicationData.bio}
                onChange={(e) => handleApplicationChange('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Tell us about yourself, your interests, and what brings you to our community..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ballroom Experience
              </label>
              <select
                value={applicationData.ballroomExperience}
                onChange={(e) => handleApplicationChange('ballroomExperience', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select your experience level</option>
                <option value="none">New to ballroom culture</option>
                <option value="beginner">Beginner (0-1 years)</option>
                <option value="intermediate">Intermediate (1-3 years)</option>
                <option value="advanced">Advanced (3+ years)</option>
                <option value="legend">Legendary status</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                House Interest
              </label>
              <select
                value={applicationData.interestedHouse}
                onChange={(e) => handleApplicationChange('interestedHouse', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Choose a house that interests you</option>
                <option value="eleganza">House of Eleganza</option>
                <option value="avant-garde">House of Avant-Garde</option>
                <option value="butch-realness">House of Butch Realness</option>
                <option value="femme">House of Femme</option>
                <option value="bizarre">House of Bizarre</option>
                <option value="leadership">Leadership Committee</option>
                <option value="events">Events Committee</option>
                <option value="mentorship">Mentorship Committee</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Social Links (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="url"
                  value={applicationData.socialLinks.instagram}
                  onChange={(e) => handleApplicationChange('socialLinks.instagram', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Instagram URL"
                />
                <input
                  type="url"
                  value={applicationData.socialLinks.twitter}
                  onChange={(e) => handleApplicationChange('socialLinks.twitter', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Twitter/X URL"
                />
                <input
                  type="url"
                  value={applicationData.socialLinks.tiktok}
                  onChange={(e) => handleApplicationChange('socialLinks.tiktok', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="TikTok URL"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => setShowApplication(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !applicationData.displayName || !applicationData.bio}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center space-x-2"
              >
                <span>{isLoading ? 'Submitting...' : 'Submit Application'}</span>
                {!isLoading && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to</h1>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Haus of Basquiat
          </h2>
          <p className="text-gray-600">
            Enter your email to sign in or apply for membership
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Processing...' : 'Continue'}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our community guidelines and 
            <br />
            commitment to creating a safe, inclusive space.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
