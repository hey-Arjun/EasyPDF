import express from 'express';
import authController from '../controllers/authController.js';
import { validateLogin, validateSignup } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Authentication routes
router.post('/login', validateLogin, (req, res, next) => {
  console.log('Login route hit');
  next();
}, authController.login);
router.post('/signup', validateSignup, authController.signup);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Session-based logout for Google auth
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
    });
    res.json({ message: 'Logged out successfully' });
  });
});

// Protected routes (require authentication)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

// Session-based profile route for Google auth
router.get('/session-profile', (req, res) => {
  if (req.user) {
    res.json({
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      provider: req.user.provider
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export default router; 