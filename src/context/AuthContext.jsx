import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginCode, setLoginCode] = useState('');
  const [showLoginCode, setShowLoginCode] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          houses (
            id,
            name,
            category,
            description
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  // Magic link login
  const loginWithMagicLink = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email
          }
        }
      });

      if (error) throw error;
      
      toast.success('Magic link sent to your email!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to send magic link');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login with code (for new users)
  const loginWithCode = async (email, code) => {
    try {
      setLoading(true);
      
      // Verify login code
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('login_code', code)
        .eq('login_code_expires_at', '>', new Date().toISOString())
        .single();

      if (error || !data) {
        throw new Error('Invalid or expired login code');
      }

      // Create user account if doesn't exist
      if (!data.id) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email,
            role: 'Applicant',
            status: 'pending',
            login_code: null,
            login_code_expires_at: null
          })
          .select()
          .single();

        if (createError) throw createError;
        setUserProfile(newUser);
      } else {
        setUserProfile(data);
      }

      // Generate session token
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email,
        password: code // Using code as temporary password
      });

      if (sessionError) throw sessionError;

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Generate login code for new users
  const generateLoginCode = async (email) => {
    try {
      setLoading(true);
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role, status')
        .eq('email', email)
        .single();

      if (existingUser) {
        // User exists, send magic link
        return await loginWithMagicLink(email);
      }

      // Generate unique login code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Store login code
      const { error } = await supabase
        .from('users')
        .insert({
          email,
          login_code: code,
          login_code_expires_at: expiresAt.toISOString(),
          role: 'Applicant',
          status: 'pending'
        });

      if (error) throw error;

      setLoginCode(code);
      setShowLoginCode(true);
      
      toast.success('Login code generated!');
      return { success: true, code };
    } catch (error) {
      console.error('Generate code error:', error);
      toast.error(error.message || 'Failed to generate login code');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!userProfile?.id) throw new Error('No user profile found');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userProfile.id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data);
      toast.success('Profile updated successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  // Submit application
  const submitApplication = async (applicationData) => {
    try {
      if (!userProfile?.id) throw new Error('No user profile found');

      const { data, error } = await supabase
        .from('user_applications')
        .insert({
          user_id: userProfile.id,
          applicant_data: applicationData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update user status
      await updateProfile({ status: 'pending' });

      toast.success('Application submitted successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Submit application error:', error);
      toast.error(error.message || 'Failed to submit application');
      return { success: false, error: error.message };
    }
  };

  // Check if user has permission
  const hasPermission = (requiredRoles) => {
    if (!userProfile) return false;
    return requiredRoles.includes(userProfile.role);
  };

  // Check if user can access feature
  const canAccess = (feature) => {
    if (!userProfile) return false;
    
    const featurePermissions = {
      'feed': ['Applicant', 'Member', 'Leader', 'Admin'],
      'docs': ['Member', 'Leader', 'Admin'],
      'chat': ['Member', 'Leader', 'Admin'],
      'dashboard': ['Admin'],
      'upload_docs': ['Admin'],
      'moderate_content': ['Leader', 'Admin'],
      'manage_users': ['Admin'],
      'create_events': ['Leader', 'Admin']
    };

    return featurePermissions[feature]?.includes(userProfile.role) || false;
  };

  const value = {
    user,
    userProfile,
    loading,
    loginCode,
    showLoginCode,
    setShowLoginCode,
    loginWithMagicLink,
    loginWithCode,
    generateLoginCode,
    logout,
    updateProfile,
    submitApplication,
    hasPermission,
    canAccess,
    supabase
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}