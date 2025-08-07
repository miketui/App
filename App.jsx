import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import FeedPage from './FeedPage';
import DocsPage from './DocsPage';
import ChatPage from './ChatPage';
import DashboardPage from './DashboardPage';
import { AuthProvider, useAuth } from './AuthContext';

function PrivateRoute({ children, roles }) {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute roles={['Applicant','Member','Admin']}> <FeedPage /> </PrivateRoute>
            }
          />
          <Route
            path="/docs"
            element={
              <PrivateRoute roles={['Member','Admin']}> <DocsPage /> </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute roles={['Member','Admin']}> <ChatPage /> </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={['Admin']}> <DashboardPage /> </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
