'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string;
  role: 'member' | 'curator' | 'admin';
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    website: '',
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUser(user);

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(profileData);
        setEditForm({
          username: profileData.username || '',
          full_name: profileData.full_name || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
        });
      } catch (error) {
        console.error('Error in getProfile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getProfile();
  }, [supabase]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          full_name: editForm.full_name,
          bio: editForm.bio,
          location: editForm.location,
          website: editForm.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-basquiat-red text-white';
      case 'curator':
        return 'bg-basquiat-blue text-white';
      default:
        return 'bg-basquiat-yellow text-black';
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-basquiat-cream p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-basquiat-red mb-4">Profile Not Found</h1>
          <p className="text-gray-600">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basquiat-cream p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-basquiat-red">Profile</h1>
          <Button
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            disabled={isSaving}
            className={isEditing ? 'bg-basquiat-green' : 'bg-basquiat-blue'}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>

        <Card className="p-6 border-4 border-black shadow-brutal">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 border-4 border-black">
                <div className="w-full h-full bg-basquiat-yellow flex items-center justify-center text-4xl font-bold text-black">
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </div>
              </Avatar>
              <div className="mt-4 flex justify-center">
                <Badge className={`${getRoleBadgeColor(profile.role)} border-2 border-black px-3 py-1 text-sm font-bold uppercase`}>
                  {profile.role}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Username</label>
                    <Input
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="Your username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Full Name</label>
                    <Input
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Bio</label>
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="border-2 border-black min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Location</label>
                    <Input
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="Your location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Website</label>
                    <Input
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-black">{profile.full_name || profile.username}</h2>
                    <p className="text-gray-600">@{profile.username}</p>
                  </div>

                  {profile.bio && (
                    <div>
                      <h3 className="text-lg font-bold text-black mb-2">About</h3>
                      <p className="text-gray-800 whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.location && (
                      <div>
                        <h3 className="text-sm font-bold text-black mb-1">Location</h3>
                        <p className="text-gray-800">{profile.location}</p>
                      </div>
                    )}

                    {profile.website && (
                      <div>
                        <h3 className="text-sm font-bold text-black mb-1">Website</h3>
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-basquiat-blue hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-bold text-black mb-1">Member Since</h3>
                      <p className="text-gray-800">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-black mb-1">Email</h3>
                      <p className="text-gray-800">{user?.email}</p>
                    </div>
                  </div>
                </>
              )}

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-2 border-black"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-basquiat-green"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}