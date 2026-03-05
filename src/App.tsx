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
  
  if (loading) return <div classname="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <navigate to="/login" replace=""/>;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <authprovider>
      <browserrouter>
        <routes>
          <route path="/" element="{&lt;LandingPage"/>} />
          <route path="/login" element="{&lt;LoginPage"/>} />
          
          <route element="{&lt;ProtectedRoute"><layout/></ProtectedRoute>}>
            <route path="/dashboard" element="{&lt;Dashboard"/>} />
            <route path="/create" element="{&lt;CreateMemorial"/>} />
            <route path="/edit/:id" element="{&lt;CreateMemorial"/>} />
            <route path="/profile" element="{&lt;ProfilePage"/>} />
            <route path="/memorial/:id" element="{&lt;MemorialDetail"/>} />
          </Route>
          
          {/* Service Player is fullscreen, so it's outside Layout */}
          <route path="/service/:id" element="{" <protectedroute="">
              <serviceplayer/>
            </ProtectedRoute>
          } />
          
          <route path="*" element="{&lt;Navigate" to="/" replace=""/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
