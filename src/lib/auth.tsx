import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<user>) => Promise<void>;
}

const AuthContext = createContext<authcontexttype |="" undefined="">(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<user |="" null="">(null);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate(); // Can't use navigate here if AuthProvider is outside Router

  useEffect(() => {
    // Simulate checking auth state
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async () => {
    // Simulate Google Sign In
    const mockUser: User = {
      uid: 'user_123',
      email: 'admin@example.com',
      displayName: '관리자',
      photoURL: 'https://picsum.photos/seed/user/200',
      isAdmin: true,
    };
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signOut = async () => {
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  const updateProfile = async (data: Partial<user>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <authcontext.provider value="{{" user,="" loading,="" signin,="" signout,="" updateprofile="" }}="">
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
