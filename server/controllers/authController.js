import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/User.js';

const authController = {
  // User registration
  signup: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const newUser = await User.create({
        name,
        email,
        password
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Remove password from response
      const userResponse = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          token
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors).map(err => err.message).join(', ')
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // User login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      await user.updateLastLogin();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Remove password from response
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      };

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // User logout
  logout: async (req, res) => {
    try {
      // Handle session-based logout (for Google auth)
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destroy error:', err);
          }
        });
      }
      
      // In a real application, you might want to blacklist the token
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Check if user still exists
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token: newToken }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // In a real application, send password reset email
      res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // In a real application, verify reset token
      // For now, just update the password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      };

      res.status(200).json({
        success: true,
        data: { user: userResponse }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { name, email } = req.body;

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email is already taken'
          });
        }
      }

      // Update user
      if (name) user.name = name;
      if (email) user.email = email;
      await user.save();

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      };

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: userResponse }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors).map(err => err.message).join(', ')
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export default authController; 