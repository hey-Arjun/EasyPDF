import express from 'express';
import convertFromPdfController from '../controllers/convertFromPdfController.js';
import { upload } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/config.js';

const router = express.Router();

// Authentication middleware that works with both token and session
const authenticateUser = (req, res, next) => {
  console.log('authenticateUser - req.user:', req.user);
  console.log('authenticateUser - req.session:', req.session);
  
  // Check if user is authenticated via token (JWT)
  if (req.user && (req.user.id || req.user._id)) {
    console.log('User authenticated via token');
    return next();
  }
  
  // Check if user is authenticated via session (Google auth)
  if (req.user && req.user._id) {
    console.log('User authenticated via session');
    return next();
  }
  
  // Check if user is in session but not deserialized
  if (req.session && req.session.passport && req.session.passport.user) {
    console.log('User found in session, attempting to deserialize');
    // Try to manually deserialize the user
    import('../models/User.js').then(({ default: User }) => {
      User.findById(req.session.passport.user)
        .then(user => {
          if (user) {
            req.user = user;
            console.log('User deserialized from session:', user);
            return next();
          } else {
            console.log('User not found in database');
            return next(); // Allow anonymous access
          }
        })
        .catch(err => {
          console.error('Error deserializing user:', err);
          return next(); // Allow anonymous access
        });
    });
  } else {
    console.log('No authentication found - allowing anonymous access');
    return next(); // Allow anonymous access
  }
};

// Download endpoint
router.get('/download/:filename', authenticateUser, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(config.downloadPath, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set proper headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the file
    const { createReadStream } = await import('fs');
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
});

// CONVERT FROM PDF routes
router.post('/pdf-to-jpg', authenticateUser, upload.single('file'), convertFromPdfController.pdfToJpg);
router.post('/pdf-to-word', authenticateUser, upload.single('file'), convertFromPdfController.pdfToWord);
router.post('/pdf-to-powerpoint', authenticateUser, upload.single('file'), convertFromPdfController.pdfToPowerpoint);
router.post('/pdf-to-excel', authenticateUser, upload.single('file'), convertFromPdfController.pdfToExcel);

export default router; 
