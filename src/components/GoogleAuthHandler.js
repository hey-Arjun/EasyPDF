import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkSession } = useAuth();

  useEffect(() => {
    // If user is authenticated and we're on the login or signup page, redirect to home
    if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/');
    }
  }, [user, location.pathname, navigate]);

  // Check for session on app load
  useEffect(() => {
    if (!user) {
      checkSession();
    }
  }, [user, checkSession]);

  return null; // This component doesn't render anything
};

export default GoogleAuthHandler; 