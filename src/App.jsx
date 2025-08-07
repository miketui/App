import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import DocsPage from './pages/DocsPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import SubscriptionPlans from './components/SubscriptionPlans';
import EventManager from './components/EventManager';
import AdminDashboard from './components/AdminDashboard';

function PrivateRoute({ children, roles = [] }) {
  const { userProfile, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(userProfile.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppContent() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userProfile && <Navigation />}
      <main className={userProfile ? 'pt-16' : ''}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute roles={['Applicant', 'Member', 'Leader', 'Admin']}>
                <FeedPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/docs"
            element={
              <PrivateRoute roles={['Member', 'Leader', 'Admin']}>
                <DocsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute roles={['Member', 'Leader', 'Admin']}>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={['Admin']}>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute roles={['Applicant', 'Member', 'Leader', 'Admin']}>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route 
            path="/subscriptions" 
            element={
              <PrivateRoute roles={['Member', 'Leader', 'Admin']}>
                <div className="container mx-auto px-4 py-8">
                  <SubscriptionPlans 
                    currentPlan={userProfile?.subscription_plan}
                    onPlanChange={(planId) => {
                      // Handle plan change
                      console.log('Plan changed to:', planId);
                    }}
                  />
                </div>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/events" 
            element={
              <PrivateRoute roles={['Admin', 'Leader', 'Member']}>
                <div className="container mx-auto px-4 py-8">
                  <EventManager userRole={userProfile?.role} />
                </div>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute roles={['Admin', 'Leader']}>
                <div className="container mx-auto px-4 py-8">
                  <AdminDashboard />
                </div>
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;