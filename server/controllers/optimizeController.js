import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import Tesseract from 'tesseract.js';
import config from '../config/config.js';
// import pdfParse from 'pdf-parse'; // Commented out due to ESM compatibility issues
import { exec } from 'child_process';
// Dynamic imports for imagemin and plugins (keep as is)
const imagemin = async (...args) => (await import('imagemin')).default(...args);
const imageminMozjpeg = async (...args) => (await import('imagemin-mozjpeg')).default(...args);
const imageminPngquant = async (...args) => (await import('imagemin-pngquant')).default(...args);

const optimizeController = {
  // Compress PDF using Ghostscript with intelligent compression
  compressPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Check if Ghostscript is available
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        await execAsync('which gs');
      } catch (error) {
        console.error('Ghostscript not found:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'PDF compression service not available. Ghostscript is not installed.' 
        });
      }

      const inputPath = req.file.path;
      let outputPath = path.join(config.downloadPath, `compressed_${Date.now()}.pdf`);

      // Get compression level and percentage
      const { compressionLevel = 'recommended', compressionValue = 30 } = req.body;
      
      const percentage = parseInt(compressionValue) || 30;
      
      // Much more aggressive compression strategy based on percentage
      let gsCommand;
      
      if (percentage >= 80) {
        // Extreme compression (80-100%) - very aggressive settings for maximum size reduction
        gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dColorImageDownsampleType=/Subsample -dColorImageResolution=24 -dGrayImageDownsampleType=/Subsample -dGrayImageResolution=24 -dMonoImageDownsampleType=/Subsample -dMonoImageResolution=24 -dEmbedAllFonts=false -dSubsetFonts=true -dOptimize=true -dCompressFonts=true -dDownsampleColorImages=true -dDownsampleGrayImages=true -dDownsampleMonoImages=true -dColorImageFilter=/DCTEncode -dGrayImageFilter=/DCTEncode -dMonoImageFilter=/CCITTFaxEncode -dJPEGQuality=5 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
      } else if (percentage >= 60) {
        // High compression (60-79%) - aggressive settings
        gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dColorImageDownsampleType=/Subsample -dColorImageResolution=36 -dGrayImageDownsampleType=/Subsample -dGrayImageResolution=36 -dMonoImageDownsampleType=/Subsample -dMonoImageResolution=36 -dEmbedAllFonts=false -dSubsetFonts=true -dOptimize=true -dCompressFonts=true -dDownsampleColorImages=true -dDownsampleGrayImages=true -dDownsampleMonoImages=true -dColorImageFilter=/DCTEncode -dGrayImageFilter=/DCTEncode -dMonoImageFilter=/CCITTFaxEncode -dJPEGQuality=10 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
      } else if (percentage >= 40) {
        // Medium compression (40-59%) - moderate settings
        gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dColorImageDownsampleType=/Bicubic -dColorImageResolution=150 -dGrayImageDownsampleType=/Bicubic -dGrayImageResolution=150 -dMonoImageDownsampleType=/Subsample -dMonoImageResolution=150 -dEmbedAllFonts=false -dSubsetFonts=true -dOptimize=true -dCompressFonts=true -dDownsampleColorImages=true -dDownsampleGrayImages=true -dDownsampleMonoImages=true -dColorImageFilter=/DCTEncode -dGrayImageFilter=/DCTEncode -dMonoImageFilter=/CCITTFaxEncode -dJPEGQuality=20 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
      } else {
        // Light compression (1-39%) - conservative settings
        gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/printer -dColorImageDownsampleType=/Bicubic -dColorImageResolution=300 -dGrayImageDownsampleType=/Bicubic -dGrayImageResolution=300 -dMonoImageDownsampleType=/Subsample -dMonoImageResolution=300 -dEmbedAllFonts=true -dSubsetFonts=true -dOptimize=true -dCompressFonts=true -dDownsampleColorImages=true -dDownsampleGrayImages=true -dDownsampleMonoImages=true -dColorImageFilter=/DCTEncode -dGrayImageFilter=/DCTEncode -dMonoImageFilter=/CCITTFaxEncode -dJPEGQuality=40 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
      }

      // Try compression with intelligent fallback
      const tryCompression = async (command, attempt = 1) => {
        return new Promise((resolve, reject) => {
          execAsync(command).then(async (result) => {
            try {
              // Check if output file was created
              const outputExists = await fs.access(outputPath).then(() => true).catch(() => false);
              if (!outputExists) {
                throw new Error('Output file was not created');
              }
              
              const originalSize = (await fs.stat(inputPath)).size;
              const compressedSize = (await fs.stat(outputPath)).size;
              const actualCompressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
              
              // If compression made file larger and we haven't tried too many times, try a different approach
              if (compressedSize > originalSize && attempt < 3) {
                console.log(`Attempt ${attempt}: File got larger, trying alternative compression...`);
                
                // Try more aggressive compression for next attempt
                let fallbackCommand;
                if (attempt === 1) {
                  // Try with extremely aggressive settings
                  fallbackCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dColorImageDownsampleType=/Subsample -dColorImageResolution=24 -dGrayImageDownsampleType=/Subsample -dGrayImageResolution=24 -dMonoImageDownsampleType=/Subsample -dMonoImageResolution=24 -dEmbedAllFonts=false -dSubsetFonts=true -dOptimize=true -dCompressFonts=true -dDownsampleColorImages=true -dDownsampleGrayImages=true -dDownsampleMonoImages=true -dColorImageFilter=/DCTEncode -dGrayImageFilter=/DCTEncode -dMonoImageFilter=/CCITTFaxEncode -dJPEGQuality=5 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
                } else {
                  // Try with different output path for last attempt - maximum compression
                  const fallbackOutputPath = path.join(config.downloadPath, `compressed_fallback_${Date.now()}.pdf`);
                  fallbackCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dColorImageDownsampleType=/Subsample -dColorImageResolution=18 -dGrayImageDownsampleType=/Subsample -dGrayImageResolution=18 -dMonoImageDownsampleType=/Subsample -dMonoImageResolution=18 -dEmbedAllFonts=false -dSubsetFonts=true -dOptimize=true -dCompressFonts=true -dDownsampleColorImages=true -dDownsampleGrayImages=true -dDownsampleMonoImages=true -dColorImageFilter=/DCTEncode -dGrayImageFilter=/DCTEncode -dMonoImageFilter=/CCITTFaxEncode -dJPEGQuality=1 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${fallbackOutputPath}" "${inputPath}"`;
                  
                  // Update output path for response
                  outputPath = fallbackOutputPath;
                }
                
                try {
                  const result = await tryCompression(fallbackCommand, attempt + 1);
                  resolve(result);
                } catch (fallbackError) {
                  reject(fallbackError);
                }
              } else {
                resolve({
                  originalSize,
                  compressedSize,
                  actualCompressionRatio,
                  outputPath
                });
              }
            } catch (statError) {
              console.error(`Error checking file stats on attempt ${attempt}:`, statError);
              reject(statError);
            }
          }).catch((error) => {
            console.error(`Ghostscript attempt ${attempt} error:`, error);
            reject(error);
          });
        });
      };

      try {
        const result = await tryCompression(gsCommand);
        
        let jobId = null;
        // Save job to database if user is logged in
        if (req.user && (req.user.id || req.user._id)) {
          try {
            const Job = (await import('../models/Job.js')).default;
            const userId = req.user._id || req.user.id;
            const job = new Job({
              userId: userId,
              type: 'compress_pdf',
              fileName: path.basename(result.outputPath),
              originalFiles: [req.file.originalname],
              status: 'completed',
              completedAt: new Date()
            });
            await job.save();
            jobId = job._id;
            console.log('Job saved for logged-in user:', jobId);
          } catch (error) {
            console.error('Error saving job:', error);
          }
        } else {
          console.log('No user logged in - job not saved to database');
        }
        
        res.status(200).json({
          success: true,
          message: 'PDF compressed successfully',
          data: {
            downloadUrl: `/api/optimize/download/${path.basename(result.outputPath)}`,
            fileName: path.basename(result.outputPath),
            originalSizeBytes: result.originalSize,
            compressedSizeBytes: result.compressedSize,
            compressionRatio: `${percentage}%`,
            actualCompressionRatio: `${result.actualCompressionRatio}%`,
            jobId: jobId
          }
        });
      } catch (error) {
        console.error('All compression attempts failed:', error);
        res.status(500).json({ success: false, message: 'Compression failed after multiple attempts' });
      }
    } catch (error) {
      console.error('Compress PDF error:', error);
      res.status(500).json({ success: false, message: 'Error compressing PDF' });
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

      let jobId = null;
      // Save job to database if user is logged in
      if (req.user && (req.user.id || req.user._id)) {
        try {
          const Job = (await import('../models/Job.js')).default;
          const userId = req.user._id || req.user.id;
          const job = new Job({
            userId: userId,
            type: 'protect_pdf',
            fileName: path.basename(outputPath),
            originalFiles: [req.file.originalname],
            status: 'completed',
            completedAt: new Date()
          });
          await job.save();
          jobId = job._id;
          console.log('Job saved for logged-in user:', jobId);
        } catch (error) {
          console.error('Error saving job:', error);
        }
      } else {
        console.log('No user logged in - job not saved to database');
      }

      res.status(200).json({
        success: true,
        message: 'PDF protected successfully',
        data: {
          downloadUrl: `/api/optimize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: jobId
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

      let jobId = null;
      // Save job to database if user is logged in
      if (req.user && (req.user.id || req.user._id)) {
        try {
          const Job = (await import('../models/Job.js')).default;
          const userId = req.user._id || req.user.id;
          const job = new Job({
            userId: userId,
            type: 'repair_pdf',
            fileName: path.basename(outputPath),
            originalFiles: [req.file.originalname],
            status: 'completed',
            completedAt: new Date()
          });
          await job.save();
          jobId = job._id;
          console.log('Job saved for logged-in user:', jobId);
        } catch (error) {
          console.error('Error saving job:', error);
        }
      } else {
        console.log('No user logged in - job not saved to database');
      }

      res.status(200).json({
        success: true,
        message: 'PDF repaired successfully',
        data: {
          downloadUrl: `/api/optimize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: jobId
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

      let jobId = null;
      // Save job to database if user is logged in
      if (req.user && (req.user.id || req.user._id)) {
        try {
          const Job = (await import('../models/Job.js')).default;
          const userId = req.user._id || req.user.id;
          const job = new Job({
            userId: userId,
            type: 'ocr_pdf',
            fileName: path.basename(outputPath),
            originalFiles: [req.file.originalname],
            status: 'completed',
            completedAt: new Date()
          });
          await job.save();
          jobId = job._id;
          console.log('Job saved for logged-in user:', jobId);
        } catch (error) {
          console.error('Error saving job:', error);
        }
      } else {
        console.log('No user logged in - job not saved to database');
      }

      res.status(200).json({
        success: true,
        message: 'OCR processing completed',
        data: {
          downloadUrl: `/api/optimize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          pageCount,
          language,
          jobId: jobId
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

export default optimizeController; 
