import express from 'express';
import organizeController from '../controllers/organizeController.js';
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

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
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

// ORGANIZE PDF routes
router.post('/merge-pdf', authenticateUser, upload.array('files', 10), organizeController.mergePdf);
router.post('/split-pdf', authenticateUser, upload.single('file'), organizeController.splitPdf);
router.post('/extract-pages', authenticateUser, upload.single('file'), organizeController.extractPages);
router.post('/remove-pages', authenticateUser, upload.single('file'), organizeController.removePages);

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> f2fbb8a (Update all files before uploading build)
