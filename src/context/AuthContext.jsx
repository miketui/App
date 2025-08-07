import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState(null);

  // Fetch user profile from custom users table
  const fetchUserProfile = async (userId) => {
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
  };

  // Check application status for new users
  const checkApplicationStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_applications')
        .select('*')
        .eq('applicant_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error checking application status:', error);
      return null;
    }
  };

  // Initialize user session and profile
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user profile
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
          
          // Check application status if user is Applicant
          if (profile?.role === 'Applicant') {
            const appStatus = await checkApplicationStatus(session.user.id);
            setApplicationStatus(appStatus);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
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
          
          if (profile?.role === 'Applicant') {
            const appStatus = await checkApplicationStatus(session.user.id);
            setApplicationStatus(appStatus);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setApplicationStatus(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Magic link login
  const signInWithMagicLink = async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Magic link error:', error);
      return { success: false, error: error.message };
    }
  };

  // Submit user application
  const submitApplication = async (applicationData) => {
    try {
      const { data, error } = await supabase
        .from('user_applications')
        .insert({
          applicant_id: user.id,
          applicant_data: applicationData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update user profile to Applicant role
      await supabase
        .from('users')
        .update({ role: 'Applicant' })
        .eq('id', user.id);

      setApplicationStatus(data);
      return { success: true, application: data };
    } catch (error) {
      console.error('Application submission error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setUserProfile(data);
      return { success: true, profile: data };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      setApplicationStatus(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Check if user has required role
  const hasRole = (requiredRoles) => {
    if (!userProfile) return false;
    return Array.isArray(requiredRoles) 
      ? requiredRoles.includes(userProfile.role)
      : userProfile.role === requiredRoles;
  };

  // Check if user is admin
  const isAdmin = () => hasRole(['Admin', 'Leader']);

  const value = {
    supabase,
    user,
    userProfile,
    loading,
    applicationStatus,
    signInWithMagicLink,
    submitApplication,
    updateProfile,
    signOut,
    hasRole,
    isAdmin,
    fetchUserProfile,
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
