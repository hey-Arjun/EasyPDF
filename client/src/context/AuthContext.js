import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on mount, then validate with backend
  useEffect(() => {
    const restoreUser = async () => {
      // Try to restore from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      }
      // Always validate with backend session
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/session-profile`, {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          localStorage.setItem('user', JSON.stringify(userData.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    };
    restoreUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const checkSessionProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/session-profile`, {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
        setLoading(false);
        return userData.user;
      }
    } catch (error) {
      console.error('Error checking session profile:', error);
    }
    setUser(null);
    localStorage.removeItem('user');
    setLoading(false);
    return null;
  };

  const value = {
    user,
    login,
    logout,
    loading,
    checkSession: checkSessionProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 