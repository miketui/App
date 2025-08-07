import React from 'react';
import { useAuth } from '../context/AuthContext';

function FeedPage() {
  const { userProfile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Haus of Basquiat
        </h1>
        
        {userProfile && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Welcome back, {userProfile.display_name || userProfile.first_name || 'Member'}!
            </h2>
            <p className="text-gray-600">
              Role: <span className="font-medium">{userProfile.role}</span>
            </p>
            {userProfile.houses && (
              <p className="text-gray-600">
                House: <span className="font-medium">{userProfile.houses.name}</span>
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Community Feed</h3>
            <p className="text-gray-600">
              This is where community posts will appear. The feed is currently under development.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Recent Activity</h3>
            <p className="text-gray-600">
              Recent community activity will be displayed here.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Upcoming Events</h3>
            <p className="text-gray-600">
              Ball and event information will be shown here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedPage;