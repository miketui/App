'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function ProfilePage() {
  const { user, userProfile, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
  });

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        display_name: userProfile.display_name || '',
        bio: userProfile.bio || '',
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const response = await api.put('/auth/profile', editForm);
      login(user, response.data.profile); // Update the user in the context
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-basquiat-red text-white';
      case 'Leader':
        return 'bg-basquiat-blue text-white';
      default:
        return 'bg-basquiat-yellow text-black';
    }
  };

  if (!userProfile) {
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
                  {userProfile.display_name?.charAt(0) || 'U'}
                </div>
              </Avatar>
              <div className="mt-4 flex justify-center">
                <Badge className={`${getRoleBadgeColor(userProfile.role)} border-2 border-black px-3 py-1 text-sm font-bold uppercase`}>
                  {userProfile.role}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Display Name</label>
                    <Input
                      value={editForm.display_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="Your display name"
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
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-black">{userProfile.display_name}</h2>
                    <p className="text-gray-600">@{userProfile.email}</p>
                  </div>

                  {userProfile.bio && (
                    <div>
                      <h3 className="text-lg font-bold text-black mb-2">About</h3>
                      <p className="text-gray-800 whitespace-pre-wrap">{userProfile.bio}</p>
                    </div>
                  )}
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