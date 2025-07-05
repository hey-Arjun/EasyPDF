const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');
const Job = require('../models/Job');
const File = require('../models/File');

// Ensure downloads directory exists
const ensureDownloadsDir = async () => {
  try {
    await fs.access(config.downloadPath);
  } catch (error) {
    await fs.mkdir(config.downloadPath, { recursive: true });
  }
};

const organizeController = {
  // Merge multiple PDFs into one
  mergePdf: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Ensure downloads directory exists
      await ensureDownloadsDir();

      const mergedPdf = await PDFDocument.create();

      for (const file of req.files) {
        const pdfBytes = await fs.readFile(file.path);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const outputPath = path.join(config.downloadPath, `merged_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, mergedPdfBytes);

      console.log('PDF created successfully:', {
        outputPath,
        fileSize: mergedPdfBytes.length,
        firstBytes: mergedPdfBytes.slice(0, 8).toString('hex'),
        isPDF: mergedPdfBytes.slice(0, 4).toString() === '%PDF'
      });

      // Verify file was written correctly
      const writtenFile = await fs.readFile(outputPath);
      console.log('File verification:', {
        writtenSize: writtenFile.length,
        matches: writtenFile.length === mergedPdfBytes.length
      });

      // Save job to MongoDB only if user is logged in
      let jobId = null;
      if (req.user && req.user.id) {
        const job = new Job({
          userId: req.user.id,
          type: 'merge',
          status: 'completed',
          fileName: path.basename(outputPath),
          createdAt: new Date(),
          completedAt: new Date()
        });
        await job.save();
        jobId = job._id;
        console.log('Job saved for logged-in user:', jobId);
      } else {
        console.log('No user logged in - job not saved to database');
      }

      res.status(200).json({
        success: true,
        message: 'PDFs merged successfully',
        data: {
          downloadUrl: `/api/organize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: jobId
        }
      });
    } catch (error) {
      console.error('Merge PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error merging PDFs: ' + error.message
      });
    }
  },

  // Split PDF into multiple files
  splitPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      if (!req.body.pageRanges) {
        return res.status(400).json({
          success: false,
          message: 'Please specify page ranges'
        });
      }

      // Ensure downloads directory exists
      await ensureDownloadsDir();

      const { pageRanges } = req.body; // e.g., "1-3,5,7-9"
      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();

      const ranges = parsePageRanges(pageRanges, pageCount);
      const splitFiles = [];

      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const splitPdf = await PDFDocument.create();
        
        for (let j = range.start - 1; j < range.end; j++) {
          const [copiedPage] = await splitPdf.copyPages(pdf, [j]);
          splitPdf.addPage(copiedPage);
        }

        const splitPdfBytes = await splitPdf.save();
        const outputPath = path.join(config.downloadPath, `split_${i + 1}_${Date.now()}.pdf`);
        await fs.writeFile(outputPath, splitPdfBytes);
        
        splitFiles.push({
          downloadUrl: `/api/organize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          pages: `${range.start}-${range.end}`
        });
      }

      // Save job to MongoDB only if user is logged in
      let jobId = null;
      if (req.user && req.user.id) {
        const job = new Job({
          userId: req.user.id,
          type: 'split',
          status: 'completed',
          fileName: `split_${splitFiles.length}_files_${Date.now()}.pdf`,
          createdAt: new Date(),
          completedAt: new Date()
        });
        await job.save();
        jobId = job._id;
        console.log('Job saved for logged-in user:', jobId);
      } else {
        console.log('No user logged in - job not saved to database');
      }

      res.status(200).json({
        success: true,
        message: 'PDF split successfully',
        data: {
          downloadUrl: `/api/organize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: jobId
        }
      });
    } catch (error) {
      console.error('Split PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error splitting PDF: ' + error.message
      });
    }
  },

  // Remove specific pages from PDF
  removePages: async (req, res) => {
    try {
      console.log('Remove pages request received:', {
        hasFile: !!req.file,
        hasPagesToRemove: !!req.body.pagesToRemove,
        pagesToRemove: req.body.pagesToRemove,
        userId: req.user?.id
      });

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      if (!req.body.pagesToRemove) {
        return res.status(400).json({
          success: false,
          message: 'Please specify which pages to remove'
        });
      }

      // Ensure downloads directory exists
      await ensureDownloadsDir();

      const { pagesToRemove } = req.body; // e.g., "1,3,5"
      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();

      console.log('PDF loaded:', { pageCount, pagesToRemove });

      const pagesToRemoveArray = pagesToRemove.split(',').map(p => parseInt(p.trim()));
      const pagesToKeep = [];

      for (let i = 0; i < pageCount; i++) {
        if (!pagesToRemoveArray.includes(i + 1)) {
          pagesToKeep.push(i);
        }
      }

      console.log('Pages processing:', { pagesToRemoveArray, pagesToKeep });

      if (pagesToKeep.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove all pages from the PDF'
        });
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const outputPath = path.join(config.downloadPath, `removed_pages_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, newPdfBytes);

      console.log('PDF saved:', { outputPath, fileSize: newPdfBytes.length });

      // Save job to MongoDB only if user is logged in
      let jobId = null;
      if (req.user && req.user.id) {
        const job = new Job({
          userId: req.user.id,
          type: 'remove_pages',
          status: 'completed',
          fileName: path.basename(outputPath),
          createdAt: new Date(),
          completedAt: new Date()
        });
        await job.save();
        jobId = job._id;
        console.log('Job saved for logged-in user:', jobId);
      } else {
        console.log('No user logged in - job not saved to database');
      }

      res.status(200).json({
        success: true,
        message: 'Pages removed successfully',
        data: {
          downloadUrl: `/api/organize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: jobId
        }
      });
    } catch (error) {
      console.error('Remove pages error:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing pages: ' + error.message
      });
    }
  },

  // Extract specific pages from PDF
  extractPages: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      if (!req.body.pageRanges) {
        return res.status(400).json({
          success: false,
          message: 'Please specify which pages to extract'
        });
      }

      // Ensure downloads directory exists
      await ensureDownloadsDir();

      const { pageRanges } = req.body; // e.g., "1,3,5"
      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      const pagesToExtractArray = pageRanges.split(',').map(p => parseInt(p.trim()) - 1);
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pagesToExtractArray);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const outputPath = path.join(config.downloadPath, `extracted_pages_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, newPdfBytes);

      // Save job to MongoDB only if user is logged in
      let jobId = null;
      if (req.user && req.user.id) {
        const job = new Job({
          userId: req.user.id,
          type: 'extract_pages',
          status: 'completed',
          fileName: path.basename(outputPath),
          createdAt: new Date(),
          completedAt: new Date()
        });
        await job.save();
        jobId = job._id;
        console.log('Job saved for logged-in user:', jobId);
      } else {
        console.log('No user logged in - job not saved to database');
      }

      res.status(200).json({
        success: true,
        message: 'Pages extracted successfully',
        data: {
          downloadUrl: `/api/organize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: jobId
        }
      });
    } catch (error) {
      console.error('Extract pages error:', error);
      res.status(500).json({
        success: false,
        message: 'Error extracting pages: ' + error.message
      });
    }
  },

  // Organize PDF (reorder pages)
  organizePdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      if (!req.body.pageOrder) {
        return res.status(400).json({
          success: false,
          message: 'Please specify the new page order'
        });
      }

      // Ensure downloads directory exists
      await ensureDownloadsDir();

      const { pageOrder } = req.body; // e.g., "3,1,2,5,4"
      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      const pageOrderArray = pageOrder.split(',').map(p => parseInt(p.trim()) - 1);
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pageOrderArray);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const outputPath = path.join(config.downloadPath, `organized_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, newPdfBytes);

      // Save job to MongoDB only if user is logged in
      let jobId = null;
      if (req.user && req.user.id) {
        const job = new Job({
          userId: req.user.id,
          type: 'organize',
          status: 'completed',
          fileName: path.basename(outputPath),
          createdAt: new Date(),
          completedAt: new Date()
        });
        await job.save();
        jobId = job._id;
        console.log('Job saved for logged-in user:', jobId);
      } else {
        console.log('No user logged in - job not saved to database');
      }

      res.status(200).json({
        success: true,
        message: 'PDF organized successfully',
        data: {
          downloadUrl: `/api/organize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: jobId
        }
      });
    } catch (error) {
      console.error('Organize PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error organizing PDF: ' + error.message
      });
    }
  },

  // Scan images to PDF
  scanToPdf: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images uploaded'
        });
      }

      // Ensure downloads directory exists
      await ensureDownloadsDir();

      const pdf = await PDFDocument.create();

      for (const file of req.files) {
        const imageBytes = await fs.readFile(file.path);
        let image;

        if (file.mimetype.includes('jpeg') || file.mimetype.includes('jpg')) {
          image = await pdf.embedJpg(imageBytes);
        } else if (file.mimetype.includes('png')) {
          image = await pdf.embedPng(imageBytes);
        } else {
          continue; // Skip unsupported formats
        }

        const page = pdf.addPage();
        const { width, height } = image.scale(1);
        page.setSize(width, height);
        page.drawImage(image, { x: 0, y: 0, width, height });
      }

      const pdfBytes = await pdf.save();
      const outputPath = path.join(config.downloadPath, `scanned_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, pdfBytes);

      // Save job to MongoDB only if user is logged in
      let jobId = null;
      if (req.user && req.user.id) {
        const job = new Job({
          userId: req.user.id,
          type: 'scan_to_pdf',
          status: 'completed',
          fileName: path.basename(outputPath),
          createdAt: new Date(),
          completedAt: new Date()
        });
        await job.save();
        jobId = job._id;
        console.log('Job saved for logged-in user:', jobId);
      } else {
        console.log('No user logged in - job not saved to database');
      }

      res.status(200).json({
        success: true,
        message: 'Images converted to PDF successfully',
        data: {
          downloadUrl: `/api/organize/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: jobId
        }
      });
    } catch (error) {
      console.error('Scan to PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting images to PDF: ' + error.message
      });
    }
  }
};

// Helper function to parse page ranges
function parsePageRanges(ranges, totalPages) {
  const result = [];
  const parts = ranges.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(p => parseInt(p.trim()));
      result.push({
        start: Math.max(1, start),
        end: Math.min(totalPages, end)
      });
    } else {
      const page = parseInt(trimmed);
      if (page >= 1 && page <= totalPages) {
        result.push({ start: page, end: page });
      }
    }
  }

  return result;
}

module.exports = organizeController; 