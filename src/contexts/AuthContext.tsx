import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserProfile, isAdmin, isTeacher } from '../lib/rbac';
import type { UserProfile } from '../lib/types';

interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const loggedUser = localStorage.getItem('loggedUser');
      if (!loggedUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const user = JSON.parse(loggedUser);

      if (user.loggedAs === 'admin' || user.loggedAs === 'teacher') {
        const profile = await getUserProfile(user.email);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    await loadProfile();
  };

  const logout = () => {
    localStorage.removeItem('loggedUser');
    setUserProfile(null);
    window.dispatchEvent(new CustomEvent('authChanged', { detail: null }));
  };

  useEffect(() => {
    loadProfile();

    const handleAuthChange = () => {
      loadProfile();
    };

    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);

  const value: AuthContextType = {
    userProfile,
    loading,
    isAdmin: isAdmin(userProfile),
    isTeacher: isTeacher(userProfile),
    refreshProfile,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
