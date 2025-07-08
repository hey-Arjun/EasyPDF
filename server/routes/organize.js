const express = require('express');
const router = express.Router();
const organizeController = require('../controllers/organizeController');
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

// Test endpoint
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Organize routes are working'
  });
});

// Simple test PDF creation endpoint (no auth required)
router.get('/test-pdf-simple', async (req, res) => {
  try {
    const { PDFDocument, rgb } = require('pdf-lib');
    const fs = require('fs').promises;
    const path = require('path');
    const config = require('../config/config');

    // Ensure downloads directory exists
    const ensureDownloadsDir = async () => {
      try {
        await fs.access(config.downloadPath);
      } catch (error) {
        await fs.mkdir(config.downloadPath, { recursive: true });
      }
    };
    await ensureDownloadsDir();

    // Create a simple PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    
    page.drawText('Hello, this is a test PDF!', {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(config.downloadPath, `test_simple_${Date.now()}.pdf`);
    await fs.writeFile(outputPath, pdfBytes);

    console.log('Simple Test PDF created:', {
      outputPath,
      fileSize: pdfBytes.length,
      firstBytes: pdfBytes.slice(0, 8).toString('hex'),
      firstBytesAscii: Array.from(pdfBytes.slice(0, 8)).map(b => b.toString()).join(','),
      isPDF: pdfBytes.slice(0, 4).toString() === '%PDF'
    });

    res.status(200).json({
      success: true,
      message: 'Simple test PDF created successfully',
      data: {
        downloadUrl: `/api/organize/download-simple/${path.basename(outputPath)}`,
        fileName: path.basename(outputPath),
        fileSize: pdfBytes.length
      }
    });
  } catch (error) {
    console.error('Simple test PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating simple test PDF: ' + error.message
    });
  }
});

// Test PDF creation endpoint
router.get('/test-pdf', authenticateToken, async (req, res) => {
  try {
    const { PDFDocument, rgb } = require('pdf-lib');
    const fs = require('fs').promises;
    const path = require('path');
    const config = require('../config/config');

    // Ensure downloads directory exists
    const ensureDownloadsDir = async () => {
      try {
        await fs.access(config.downloadPath);
      } catch (error) {
        await fs.mkdir(config.downloadPath, { recursive: true });
      }
    };
    await ensureDownloadsDir();

    // Create a simple PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    
    page.drawText('Hello, this is a test PDF!', {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(config.downloadPath, `test_${Date.now()}.pdf`);
    await fs.writeFile(outputPath, pdfBytes);

    console.log('Test PDF created:', {
      outputPath,
      fileSize: pdfBytes.length,
      firstBytes: pdfBytes.slice(0, 8).toString('hex'),
      firstBytesAscii: Array.from(pdfBytes.slice(0, 8)).map(b => b.toString()).join(','),
      isPDF: pdfBytes.slice(0, 4).toString() === '%PDF'
    });

    res.status(200).json({
      success: true,
      message: 'Test PDF created successfully',
      data: {
        downloadUrl: `/api/organize/download/${path.basename(outputPath)}`,
        fileName: path.basename(outputPath),
        fileSize: pdfBytes.length
      }
    });
  } catch (error) {
    console.error('Test PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test PDF: ' + error.message
    });
  }
});

// Download endpoint - authentication optional
router.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(config.downloadPath, filename);
    
    console.log('Download request:', { filename, filePath, configDownloadPath: config.downloadPath });
    
    // Check if file exists
    try {
      await fs.access(filePath);
      const stats = await fs.stat(filePath);
      console.log('File exists:', { filePath, size: stats.size, isFile: stats.isFile() });
    } catch (error) {
      console.error('File access error:', error);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Read the first few bytes to check if it's a valid PDF
    const fileBuffer = await fs.readFile(filePath);
    console.log('File content check:', { 
      fileSize: fileBuffer.length, 
      firstBytes: fileBuffer.slice(0, 8).toString('hex'),
      isPDF: fileBuffer.slice(0, 4).toString() === '%PDF'
    });

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Send the file buffer directly instead of streaming
    res.send(fileBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
});

// Simple download endpoint (no auth required for testing)
router.get('/download-simple/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(config.downloadPath, filename);
    
    console.log('Simple download request:', { filename, filePath, configDownloadPath: config.downloadPath });
    
    // Check if file exists
    try {
      await fs.access(filePath);
      const stats = await fs.stat(filePath);
      console.log('File exists:', { filePath, size: stats.size, isFile: stats.isFile() });
    } catch (error) {
      console.error('File access error:', error);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Read the first few bytes to check if it's a valid PDF
    const fileBuffer = await fs.readFile(filePath);
    console.log('File content check:', { 
      fileSize: fileBuffer.length, 
      firstBytes: fileBuffer.slice(0, 8).toString('hex'),
      isPDF: fileBuffer.slice(0, 4).toString() === '%PDF'
    });

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Send the file buffer directly instead of streaming
    res.send(fileBuffer);
  } catch (error) {
    console.error('Simple download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
});

// Alternative test PDF creation endpoint (using different method)
router.get('/test-pdf-alt', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const config = require('../config/config');

    // Ensure downloads directory exists
    const ensureDownloadsDir = async () => {
      try {
        await fs.access(config.downloadPath);
      } catch (error) {
        await fs.mkdir(config.downloadPath, { recursive: true });
      }
    };
    await ensureDownloadsDir();

    // Create a minimal valid PDF manually
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Hello World!) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

    const outputPath = path.join(config.downloadPath, `test_alt_${Date.now()}.pdf`);
    await fs.writeFile(outputPath, pdfContent);

    console.log('Alternative Test PDF created:', {
      outputPath,
      fileSize: pdfContent.length,
      firstBytes: Buffer.from(pdfContent.slice(0, 8)).toString('hex'),
      isPDF: pdfContent.slice(0, 4) === '%PDF'
    });

    res.status(200).json({
      success: true,
      message: 'Alternative test PDF created successfully',
      data: {
        downloadUrl: `/api/organize/download-simple/${path.basename(outputPath)}`,
        fileName: path.basename(outputPath),
        fileSize: pdfContent.length
      }
    });
  } catch (error) {
    console.error('Alternative test PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating alternative test PDF: ' + error.message
    });
  }
});

// ORGANIZE PDF routes - authentication optional
router.post('/merge', authenticateUser, upload.array('files', 10), organizeController.mergePdf);
router.post('/split', authenticateUser, upload.single('file'), organizeController.splitPdf);
router.post('/remove-pages', authenticateUser, upload.single('file'), organizeController.removePages);
router.post('/extract-pages', authenticateUser, upload.single('file'), organizeController.extractPages);
router.post('/organize', authenticateUser, upload.single('file'), organizeController.organizePdf);
router.post('/scan-to-pdf', authenticateUser, upload.array('images', 20), organizeController.scanToPdf);

export default router; 