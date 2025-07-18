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
      user: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        provider: req.user.provider,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});
<<<<<<< HEAD

export default router; 
=======
// Google OAuth strategy setup
if (config.google.clientID && config.google.clientSecret) {
  passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // If user with this Google ID doesn't exist, create one
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          provider: 'google'
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Google OAuth routes
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: true }),
    (req, res) => {
      // Successful authentication, redirect to frontend profile page with success parameter
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/profile?auth=success`);
    }
  );
} else {
  console.log('Google OAuth credentials not configured. Google authentication disabled.');
}

export default router; 
>>>>>>> f2fbb8a (Update all files before uploading build)
