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
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/session-profile`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          setLoading(false); // Changed from setIsAuthenticated to setLoading
        } else {
          setUser(null);
          setLoading(false); // Changed from setIsAuthenticated to setLoading
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setLoading(false); // Changed from setIsAuthenticated to setLoading
      }
    };

    checkAuthStatus();
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
      setLoading(false); // Changed from setIsAuthenticated to setLoading
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
        setLoading(false); // Changed from setIsAuthenticated to setLoading
        return userData.user;
      }
    } catch (error) {
      console.error('Error checking session profile:', error);
    }
    return null;
  };

  const value = {
    user,
    login,
    logout,
    loading,
    checkSession: checkSessionProfile // Renamed to avoid conflict with new checkSessionProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 