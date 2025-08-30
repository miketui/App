'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserSettings {
  id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  privacy_level: 'public' | 'private' | 'friends';
  theme_preference: 'light' | 'dark' | 'auto';
  language: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUser(user);
        setNewEmail(user.email || '');

        const { data: settingsData, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching settings:', error);
        }

        if (settingsData) {
          setSettings(settingsData);
        } else {
          const defaultSettings: UserSettings = {
            id: user.id,
            email_notifications: true,
            push_notifications: true,
            marketing_emails: false,
            privacy_level: 'public',
            theme_preference: 'auto',
            language: 'en',
          };
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error in getSettings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSettings();
  }, [supabase]);

  const handleSaveSettings = async () => {
    if (!user || !settings) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert(settings)
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === user?.email) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating email:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending password reset:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-basquiat-cream p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-basquiat-cream p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-basquiat-red mb-4">Settings Not Found</h1>
          <p className="text-gray-600">Unable to load settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basquiat-cream p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-basquiat-red">Settings</h1>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-basquiat-green"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card className="p-6 border-4 border-black shadow-brutal">
            <h2 className="text-2xl font-bold text-black mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Email Address</label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="border-2 border-black flex-1"
                  />
                  <Button
                    onClick={handleUpdateEmail}
                    disabled={isSaving || newEmail === user?.email}
                    className="bg-basquiat-blue"
                  >
                    Update
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Password</label>
                <Button
                  onClick={handlePasswordReset}
                  disabled={isChangingPassword}
                  variant="outline"
                  className="border-2 border-black"
                >
                  {isChangingPassword ? 'Sending...' : 'Send Password Reset Email'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6 border-4 border-black shadow-brutal">
            <h2 className="text-2xl font-bold text-black mb-4">Privacy Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Profile Visibility</label>
                <div className="flex gap-2 flex-wrap">
                  {['public', 'private', 'friends'].map((level) => (
                    <Button
                      key={level}
                      onClick={() => setSettings(prev => prev ? { ...prev, privacy_level: level as UserSettings['privacy_level'] } : null)}
                      className={`${settings.privacy_level === level ? 'bg-basquiat-yellow text-black' : 'bg-white text-black border-2 border-black'} capitalize`}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 border-4 border-black shadow-brutal">
            <h2 className="text-2xl font-bold text-black mb-4">Notification Settings</h2>
            
            <div className="space-y-4">
              {[
                { key: 'email_notifications', label: 'Email Notifications' },
                { key: 'push_notifications', label: 'Push Notifications' },
                { key: 'marketing_emails', label: 'Marketing Emails' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-bold text-black">{label}</label>
                  <Button
                    onClick={() => setSettings(prev => prev ? { ...prev, [key]: !prev[key as keyof UserSettings] } : null)}
                    className={`${settings[key as keyof UserSettings] ? 'bg-basquiat-green' : 'bg-gray-400'} text-white min-w-[60px]`}
                  >
                    {settings[key as keyof UserSettings] ? 'ON' : 'OFF'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="p-6 border-4 border-black shadow-brutal">
            <h2 className="text-2xl font-bold text-black mb-4">Appearance</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Theme Preference</label>
                <div className="flex gap-2 flex-wrap">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <Button
                      key={theme}
                      onClick={() => setSettings(prev => prev ? { ...prev, theme_preference: theme as UserSettings['theme_preference'] } : null)}
                      className={`${settings.theme_preference === theme ? 'bg-basquiat-yellow text-black' : 'bg-white text-black border-2 border-black'} capitalize`}
                    >
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, language: e.target.value } : null)}
                  className="border-2 border-black px-3 py-2 bg-white"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-4 border-basquiat-red shadow-brutal bg-red-50">
            <h2 className="text-2xl font-bold text-basquiat-red mb-4">Danger Zone</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-black">Sign Out</h3>
                  <p className="text-sm text-gray-600">Sign out of your account on this device</p>
                </div>
                <Button
                  onClick={handleSignOut}
                  className="bg-basquiat-red text-white"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}