const express = require('express');
const router = express.Router();
const optimizeController = require('../controllers/optimizeController');
const { upload } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

// Download endpoint
router.get('/download/:filename', async (req, res) => {
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

// OPTIMIZE PDF routes (no authentication required)
router.post('/compress', upload.single('file'), optimizeController.compressPdf);
router.post('/protect', upload.single('file'), optimizeController.protectPdf);
router.post('/repair', upload.single('file'), optimizeController.repairPdf);
router.post('/ocr', upload.single('file'), optimizeController.ocrPdf);

module.exports = router; 