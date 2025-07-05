const express = require('express');
const router = express.Router();
const convertFromPdfController = require('../controllers/convertFromPdfController');
const { upload } = require('../middleware/upload');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

// Download endpoint
router.get('/download/:filename', authenticateToken, async (req, res) => {
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
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (ext === '.xlsx') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (ext === '.pptx') {
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (ext === '.txt') {
      contentType = 'text/plain';
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
router.post('/pdf-to-jpg', optionalAuth, upload.single('file'), convertFromPdfController.pdfToJpg);
router.post('/pdf-to-word', optionalAuth, upload.single('file'), convertFromPdfController.pdfToWord);
router.post('/pdf-to-powerpoint', optionalAuth, upload.single('file'), convertFromPdfController.pdfToPowerpoint);
router.post('/pdf-to-excel', optionalAuth, upload.single('file'), convertFromPdfController.pdfToExcel);
router.post('/pdf-to-pdfa', optionalAuth, upload.single('file'), convertFromPdfController.pdfToPdfA);

module.exports = router; 