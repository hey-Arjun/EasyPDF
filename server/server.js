import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

// Import database connection
import connectDB from './config/database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (fixes X-Forwarded-For header issue)
app.set('trust proxy', 1);

// If you use __dirname or __filename, add this workaround for ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Import routes
import authRoutes from './routes/auth.js';
import organizeRoutes from './routes/organize.js';
import optimizeRoutes from './routes/optimize.js';
import convertToPdfRoutes from './routes/convertToPdf.js';
import convertFromPdfRoutes from './routes/convertFromPdf.js';
import jobsRoutes from './routes/jobs.js';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({ origin: true, credentials: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - ${req.get('User-Agent')?.substring(0, 50) || 'Unknown'}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Session middleware (must be before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'easypdf_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));

// Passport.js initialization
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth routes at root level (before API routes)
import config from './config/config.js';
import User from './models/User.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

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

  // Google OAuth routes at root level
  app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/google/callback',
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'EasyPDF Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/organize', organizeRoutes);
app.use('/api/optimize', optimizeRoutes);
app.use('/api/convert-to-pdf', convertToPdfRoutes);
app.use('/api/convert-from-pdf', convertFromPdfRoutes);
app.use('/api/jobs', jobsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', message: 'The requested endpoint does not exist' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EasyPDF Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🗄️  MongoDB URI: ${process.env.MONGODB_URI ? 'Configured' : 'NOT CONFIGURED'}`);
});

export default app; 