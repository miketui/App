import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import DocsPage from './pages/DocsPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import ApplyPage from './pages/ApplyPage';
import ProfilePage from './pages/ProfilePage';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';
import AuthCallback from './components/AuthCallback';

function PrivateRoute({ children, roles, requiresApproval = false }) {
  const { user, userProfile, loading, initializing } = useAuth();
  
  if (loading || initializing) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!userProfile) {
    return <LoadingSpinner />;
  }

  // Check if user needs to complete application
  if (
    requiresApproval &&
    userProfile.role === 'Applicant' &&
    userProfile.status === 'pending'
  ) {
    return <Navigate to="/apply" replace />;
  }

  // Check role permissions
  if (roles && !roles.includes(userProfile.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading, initializing } = useAuth();
  
  if (loading || initializing) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Application route (accessible to any authenticated user) */}
      <Route
        path="/apply"
        element={
          <PrivateRoute>
            <ApplyPage />
          </PrivateRoute>
        }
      />

      {/* Protected routes that require approval */}
      <Route
        path="/"
        element={
          <PrivateRoute roles={['Member', 'Leader', 'Admin']} requiresApproval={true}>
            <FeedPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/docs"
        element={
          <PrivateRoute roles={['Member', 'Leader', 'Admin']} requiresApproval={true}>
            <DocsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute roles={['Member', 'Leader', 'Admin']} requiresApproval={true}>
            <ChatPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute roles={['Member', 'Leader', 'Admin']} requiresApproval={true}>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={['Admin']} requiresApproval={true}>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
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
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
