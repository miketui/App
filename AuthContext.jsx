import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial session and listen for changes
  useEffect(() => {
    let mounted = true;
    async function init() {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    }
    init();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // When user changes, fetch extended profile (role, house etc.)
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!cancelled) {
        if (error) {
          console.error('Error fetching profile', error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Helper auth functions
  const signInWithEmail = async (email) =>
    supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ supabase, user, profile, loading, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
