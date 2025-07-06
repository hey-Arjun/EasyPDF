const express = require('express');
const router = express.Router();
const convertFromPdfController = require('../controllers/convertFromPdfController');
const { upload } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

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
    const User = require('../models/User');
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

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    let disposition = 'attachment';
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (ext === '.xlsx') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (ext === '.pptx') {
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (ext === '.txt') {
      contentType = 'text/plain';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.zip') {
      contentType = 'application/zip';
    }

    // Set proper headers for download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the file
    const fileStream = require('fs').createReadStream(filePath);
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
router.post('/pdf-to-pdfa', authenticateUser, upload.single('file'), convertFromPdfController.pdfToPdfA);

module.exports = router; 