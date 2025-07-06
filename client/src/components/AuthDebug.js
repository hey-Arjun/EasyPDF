import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug = () => {
  const { user, loading, checkSession } = useAuth();

  const handleCheckSession = async () => {
    console.log('Manual session check...');
    const success = await checkSession();
    console.log('Session check result:', success);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <h4>Auth Debug</h4>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>User: {user ? `${user.name} (${user.email})` : 'None'}</div>
      <button onClick={handleCheckSession} style={{ marginTop: '5px' }}>
        Check Session
      </button>
    </div>
  );
};

export default AuthDebug; 