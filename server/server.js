const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (fixes X-Forwarded-For header issue)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Import routes
const authRoutes = require('./routes/auth');
const organizeRoutes = require('./routes/organize');
const optimizeRoutes = require('./routes/optimize');
const convertToPdfRoutes = require('./routes/convertToPdf');
const convertFromPdfRoutes = require('./routes/convertFromPdf');
const jobsRoutes = require('./routes/jobs');

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://easypdf.vercel.app',
    'https://easypdf-client.vercel.app'
  ],
  credentials: true
}));

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
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
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

module.exports = app; 