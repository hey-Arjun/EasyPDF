import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './Profile.css';

const Profile = () => {
  const { user, checkSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [authChecking, setAuthChecking] = useState(false);

  // Check for auth success parameter and trigger session check
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('auth') === 'success') {
      console.log('Auth success detected, checking session...');
      setAuthChecking(true);
      checkSession().then(success => {
        setAuthChecking(false);
        if (success) {
          console.log('Session check successful, user authenticated');
          // Remove the auth parameter from URL and redirect to home
          window.history.replaceState({}, document.title, '/profile');
          // Redirect to home page after successful Google auth
          navigate('/');
        } else {
          console.log('Session check failed, user not authenticated');
        }
      });
    }
  }, [location.search, checkSession, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrors({});
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      setIsChangingPassword(false);
      
      if (response.ok) {
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        alert('Password changed successfully!');
      } else {
        setPasswordErrors({ api: data.message || 'Failed to change password' });
      }
    } catch (err) {
      setIsChangingPassword(false);
      setPasswordErrors({ api: 'Network error. Please try again.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add Authorization header only if token exists (for regular login users)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        credentials: 'include', // Include cookies for session-based auth (Google users)
        headers,
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setIsLoading(false);
      
      if (response.ok) {
        setIsEditing(false);
        // Update user data in context
        window.location.reload(); // Simple refresh for now
      } else {
        setErrors({ api: data.message || 'Update failed' });
      }
    } catch (err) {
      setIsLoading(false);
      setErrors({ api: 'Network error. Please try again.' });
    }
  };

  if (authChecking) {
    return (
      <div className="profile-page">
        <main className="profile-main">
          <div className="profile-container">
            <div className="profile-card">
              <div className="profile-header">
                <h1>Setting up your account...</h1>
                <p>Please wait while we complete your Google signup</p>
              </div>
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Redirecting to home page...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <main className="profile-main">
          <div className="profile-container">
            <div className="profile-card">
              <div className="profile-header">
                <h1>Authentication Required</h1>
                <p>Please log in to view your profile</p>
              </div>
              <div className="auth-actions">
                <a href="/login" className="login-button">Login</a>
                <a href="/signup" className="signup-button">Sign Up</a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header">
              <h1>Profile</h1>
              <p>Manage your account settings and preferences</p>
            </div>

            <div className="profile-content">
              <div className="profile-section">
                <div className="section-header">
                  <h2>Personal Information</h2>
                  <button 
                    className="edit-button"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                      />
                    </div>

                    {errors.api && <span className="error-message">{errors.api}</span>}

                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="save-button"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-info">
                    <div className="info-item">
                      <label>Full Name</label>
                      <span>{user.name}</span>
                    </div>
                    <div className="info-item">
                      <label>Email Address</label>
                      <span>{user.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Member Since</label>
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Login</label>
                      <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h2>Change Password</h2>
                  <button 
                    className="edit-button"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {showPasswordForm ? (
                  <form onSubmit={handlePasswordSubmit} className="profile-form">
                    <div className="form-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                      />
                      {passwordErrors.currentPassword && <span className="error-message">{passwordErrors.currentPassword}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        minLength="6"
                      />
                      {passwordErrors.newPassword && <span className="error-message">{passwordErrors.newPassword}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        minLength="6"
                      />
                      {passwordErrors.confirmPassword && <span className="error-message">{passwordErrors.confirmPassword}</span>}
                    </div>

                    {passwordErrors.api && <span className="error-message">{passwordErrors.api}</span>}

                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="save-button"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-info">
                    <div className="info-item">
                      <label>Password</label>
                      <span>••••••••</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-section">
                <h2>Account Statistics</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">0</div>
                    <div className="stat-label">PDFs Processed</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">0</div>
                    <div className="stat-label">Files Uploaded</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">0</div>
                    <div className="stat-label">Storage Used</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile; 