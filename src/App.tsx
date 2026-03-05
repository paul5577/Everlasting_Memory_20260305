import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

import ServicePlayer from './pages/ServicePlayer';

import CreateMemorial from './pages/CreateMemorial';

import ProfilePage from './pages/ProfilePage';
import MemorialDetail from './pages/MemorialDetail';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateMemorial />} />
            <Route path="/edit/:id" element={<CreateMemorial />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/memorial/:id" element={<MemorialDetail />} />
          </Route>
          
          {/* Service Player is fullscreen, so it's outside Layout */}
          <Route path="/service/:id" element={
            <ProtectedRoute>
              <ServicePlayer />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
