require('dotenv').config();
const path = require('path');

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // File upload configuration
  uploadMaxSize: process.env.UPLOAD_MAX_SIZE || '50mb',
  uploadPath: path.join(__dirname, '..', 'uploads'),
  downloadPath: path.join(__dirname, '..', 'downloads'),
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // PDF processing settings
  pdfCompressionLevels: {
    extreme: { quality: 0.3, dpi: 72 },
    recommended: { quality: 0.6, dpi: 150 },
    less: { quality: 0.8, dpi: 300 }
  },
  
  // Supported file types
  supportedFormats: {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
    documents: ['.doc', '.docx', '.rtf'],
    presentations: ['.ppt', '.pptx'],
    spreadsheets: ['.xls', '.xlsx', '.csv'],
    web: ['.html', '.htm']
  }
}; 