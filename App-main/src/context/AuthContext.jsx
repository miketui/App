import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Fetch user profile data
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          house:houses(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Handle authentication state changes
  const handleAuthStateChange = async (event, session) => {
    console.log('Auth state changed:', event, session?.user?.id);
    
    if (session?.user) {
      setUser(session.user);
      const profile = await fetchUserProfile(session.user.id);
      setUserProfile(profile);
    } else {
      setUser(null);
      setUserProfile(null);
    }
    
    setLoading(false);
    if (initializing) setInitializing(false);
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          setInitializing(false);
          return;
        }

        if (mounted) {
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitializing(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with magic link
  const signInWithEmail = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Check your email for the login link!');
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return { error };
      }

      setUser(null);
      setUserProfile(null);
      toast.success('Signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select(`
          *,
          house:houses(*)
        `)
        .single();

      if (error) {
        toast.error(error.message);
        return { error };
      }

      setUserProfile(data);
      toast.success('Profile updated successfully');
      return { data };
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      return { error };
    }
  };

  // Submit application for membership
  const submitApplication = async (applicationData) => {
    try {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_applications')
        .insert({
          user_id: user.id,
          applicant_data: applicationData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        return { error };
      }

      // Update user profile status to pending
      await updateProfile({ status: 'pending' });
      
      toast.success('Application submitted successfully!');
      return { data };
    } catch (error) {
      console.error('Submit application error:', error);
      toast.error('Failed to submit application');
      return { error };
    }
  };

  // Check if user has specific role
  const hasRole = (roles) => {
    if (!userProfile) return false;
    if (typeof roles === 'string') roles = [roles];
    return roles.includes(userProfile.role);
  };

  // Check if user is admin
  const isAdmin = () => hasRole('Admin');

  // Check if user is leader or admin
  const isLeaderOrAdmin = () => hasRole(['Leader', 'Admin']);

  // Check if user is member, leader, or admin
  const isMemberOrAbove = () => hasRole(['Member', 'Leader', 'Admin']);

  // Refresh user profile
  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchUserProfile(user.id);
    setUserProfile(profile);
    return profile;
  };

  const value = {
    // State
    user,
    userProfile,
    loading,
    initializing,
    
    // Auth methods
    signInWithEmail,
    signOut,
    
    // Profile methods
    updateProfile,
    refreshProfile,
    submitApplication,
    
    // Permission checks
    hasRole,
    isAdmin,
    isLeaderOrAdmin,
    isMemberOrAbove,
    
    // Supabase client
    supabase,
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
