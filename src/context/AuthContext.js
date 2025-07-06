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

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // If no local user, try to fetch from backend (for Google login/session)
    fetch('/api/auth/session-profile', { 
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return null;
      })
      .then(data => {
        if (data && data.email) {
          setUser(data);
          // Store user data for consistency
          localStorage.setItem('user', JSON.stringify(data));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error checking auth status:', error);
        setLoading(false);
      });
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Try session-based logout first (for Google auth)
      await fetch('/api/auth/logout', { 
        method: 'GET',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Session logout error:', error);
    }
    
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session-profile', { 
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.email) {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 