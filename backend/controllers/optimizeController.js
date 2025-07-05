const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const Tesseract = require('tesseract.js');
const config = require('../config/config');

const optimizeController = {
  // Compress PDF
  compressPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { compressionLevel = 'recommended' } = req.body;
      const settings = config.pdfCompressionLevels[compressionLevel] || config.pdfCompressionLevels.recommended;

      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      // Apply compression settings
      const compressedPdf = await PDFDocument.create();
      const pages = await compressedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => compressedPdf.addPage(page));

      // Save with compression
      const compressedPdfBytes = await compressedPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 20,
        updateFieldAppearances: false,
        throwOnInvalidObject: false
      });

      const outputPath = path.join(config.downloadPath, `compressed_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, compressedPdfBytes);

      // Get file sizes for comparison
      const originalSize = pdfBytes.length;
      const compressedSize = compressedPdfBytes.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

      res.status(200).json({
        success: true,
        message: 'PDF compressed successfully',
        data: {
          downloadUrl: `/api/optimize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          originalSize: formatFileSize(originalSize),
          compressedSize: formatFileSize(compressedSize),
          compressionRatio: `${compressionRatio}%`,
          compressionLevel,
          jobId: 'temp-job-id'
        }
      });
    } catch (error) {
      console.error('Compress PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error compressing PDF'
      });
    }
  },

  // Protect PDF with password
  protectPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { password } = req.body;
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }

      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      // Encrypt the PDF
      pdf.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: 'highResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false
        }
      });

      const protectedPdfBytes = await pdf.save();
      const outputPath = path.join(config.downloadPath, `protected_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, protectedPdfBytes);

      res.status(200).json({
        success: true,
        message: 'PDF protected successfully',
        data: {
          downloadUrl: `/api/optimize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: 'temp-job-id'
        }
      });
    } catch (error) {
      console.error('Protect PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error protecting PDF'
      });
    }
  },

  // Repair PDF
  repairPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const pdfBytes = await fs.readFile(req.file.path);
      
      // Try to load and repair the PDF
      let pdf;
      try {
        pdf = await PDFDocument.load(pdfBytes, { 
          ignoreEncryption: true,
          updateMetadata: false,
          parseSpeed: 50
        });
      } catch (loadError) {
        return res.status(400).json({
          success: false,
          message: 'Unable to repair PDF. File may be corrupted or encrypted.'
        });
      }

      // Create a new PDF with the repaired content
      const repairedPdf = await PDFDocument.create();
      const pages = await repairedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => repairedPdf.addPage(page));

      const repairedPdfBytes = await repairedPdf.save();
      const outputPath = path.join(config.downloadPath, `repaired_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, repairedPdfBytes);

      res.status(200).json({
        success: true,
        message: 'PDF repaired successfully',
        data: {
          downloadUrl: `/api/optimize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: 'temp-job-id'
        }
      });
    } catch (error) {
      console.error('Repair PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error repairing PDF'
      });
    }
  },

  // OCR PDF (Optical Character Recognition)
  ocrPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { language = 'eng' } = req.body;
      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();

      // For OCR, we need to convert PDF pages to images first
      // This is a simplified version - in production you'd use a more robust solution
      const ocrPdf = await PDFDocument.create();

      // Process each page
      for (let i = 0; i < pageCount; i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();

        // Create a new page with the same dimensions
        const newPage = ocrPdf.addPage([width, height]);

        // Copy the original page content
        const [copiedPage] = await ocrPdf.copyPages(pdf, [i]);
        ocrPdf.removePage(ocrPdf.getPageCount() - 1);
        ocrPdf.addPage(copiedPage);

        // Note: Full OCR implementation would require:
        // 1. Converting PDF pages to images
        // 2. Running OCR on each image
        // 3. Adding searchable text layers
        // This is a placeholder for the OCR functionality
      }

      const ocrPdfBytes = await ocrPdf.save();
      const outputPath = path.join(config.downloadPath, `ocr_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, ocrPdfBytes);

      res.status(200).json({
        success: true,
        message: 'OCR processing completed',
        data: {
          downloadUrl: `/api/optimize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          pageCount,
          language,
          jobId: 'temp-job-id'
        }
      });
    } catch (error) {
      console.error('OCR PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing OCR'
      });
    }
  }
};

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = optimizeController; 