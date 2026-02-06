import { createContext, useContext, useState, useEffect } from 'react';
import { checkAuth as checkAuthAPI, logout as logoutAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await checkAuthAPI();
      if (response.data.authenticated) {
        setUser({ 
          username: response.data.username,
          userId: response.data.userId,
          userRole: response.data.userRole
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
