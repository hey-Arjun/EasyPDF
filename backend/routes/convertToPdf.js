const express = require('express');
const router = express.Router();
const convertToPdfController = require('../controllers/convertToPdfController');
const { upload } = require('../middleware/upload');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

// Download endpoint
router.get('/download/:filename', optionalAuth, async (req, res) => {
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

// CONVERT TO PDF routes
router.post('/jpg-to-pdf', optionalAuth, upload.array('images', 20), convertToPdfController.jpgToPdf);
router.post('/word-to-pdf', optionalAuth, upload.single('file'), convertToPdfController.wordToPdf);
router.post('/powerpoint-to-pdf', optionalAuth, upload.single('file'), convertToPdfController.powerpointToPdf);
router.post('/excel-to-pdf', optionalAuth, upload.single('file'), convertToPdfController.excelToPdf);
router.post('/html-to-pdf', optionalAuth, upload.single('file'), convertToPdfController.htmlToPdf);

module.exports = router; 