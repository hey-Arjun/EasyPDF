import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/User.js';

const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    // If no Authorization header, check for session-based authentication
    if (!authHeader) {
      // Check if user is authenticated via session (Google auth)
      if (req.session && req.session.passport && req.session.passport.user) {
        console.log('No JWT token, checking session authentication');
        // Try to manually deserialize the user
        User.findById(req.session.passport.user)
          .then(user => {
            if (user) {
              req.user = user;
              console.log('User authenticated via session:', user);
              return next();
            } else {
              console.log('User not found in database');
              return res.status(401).json({
                success: false,
                message: 'Authentication required'
              });
            }
          })
          .catch(err => {
            console.error('Error deserializing user:', err);
            return res.status(401).json({
              success: false,
              message: 'Authentication required'
            });
          });
        return;
      }
      
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Add user info to request
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Optional authentication middleware - doesn't fail if no token provided
const optionalAuth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Add user info to request
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    
    // If token is invalid, continue without authentication
    req.user = null;
    next();
  }
};

export { auth as authenticateToken, optionalAuth }; 