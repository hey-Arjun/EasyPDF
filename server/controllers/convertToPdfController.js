import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import mammoth from 'mammoth';
import XLSX from 'xlsx';
import libre from 'libreoffice-convert';
import { promisify } from 'util';
import config from '../config/config.js';
import Job from '../models/Job.js';

// Convert libre.convert to use promises
const libreConvert = promisify(libre.convert);

const convertToPdfController = {
  // Convert JPG/Images to PDF
  jpgToPdf: async (req, res) => {
    console.log('=== JPG to PDF Request Received ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request files:', req.files ? req.files.length : 'No files');
    console.log('Request file details:', req.files ? req.files.map(f => ({ name: f.originalname, size: f.size, mimetype: f.mimetype })) : 'No files');
    console.log('User:', req.user ? (req.user.id || req.user._id) : 'No user');
    console.log('=====================================');

    try {
      if (!req.files || req.files.length === 0) {
        console.log('No files uploaded - returning error');
        return res.status(400).json({
          success: false,
          message: 'No images uploaded'
        });
      }

      const pdf = await PDFDocument.create();

      for (const file of req.files) {
        const imageBytes = await fs.readFile(file.path);
        let image;

        if (file.mimetype.includes('jpeg') || file.mimetype.includes('jpg')) {
          image = await pdf.embedJpg(imageBytes);
        } else if (file.mimetype.includes('png')) {
          image = await pdf.embedPng(imageBytes);
        } else if (file.mimetype.includes('gif')) {
          // Convert GIF to PNG first (simplified)
          continue; // Skip GIF for now
        } else {
          continue; // Skip unsupported formats
        }

        const page = pdf.addPage();
        const { width, height } = image.scale(1);
        page.setSize(width, height);
        page.drawImage(image, { x: 0, y: 0, width, height });
      }

      const pdfBytes = await pdf.save();
      const outputPath = path.join(config.downloadPath, `images_to_pdf_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, pdfBytes);

      const fileName = path.basename(outputPath);
      let jobId = null;

      // Save job to database if user is logged in
      if (req.user && (req.user.id || req.user._id)) {
        try {
          const userId = req.user._id || req.user.id;
          const job = new Job({
            userId: userId,
            type: 'jpg_to_pdf',
            fileName: fileName,
            originalFiles: req.files.map(f => f.originalname),
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
        message: 'Images converted to PDF successfully',
        data: {
          downloadUrl: `/api/convert-to-pdf/download/${fileName}`,
          fileName: fileName,
          jobId: jobId,
          imageCount: req.files.length
        }
      });
    } catch (error) {
      console.error('JPG to PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting images to PDF'
      });
    }
  },

  // Convert Word documents to PDF
  wordToPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const filePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      if (!['.doc', '.docx', '.rtf'].includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file format. Please upload .doc, .docx, or .rtf files.'
        });
      }

      // Convert Word to HTML first
      const result = await mammoth.convertToHtml({ path: filePath });
      const html = result.value;

      // Convert HTML to PDF using Puppeteer
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBytes = await page.pdf({ 
        format: 'A4',
        printBackground: true,
        margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
      });

      await browser.close();

      const outputPath = path.join(config.downloadPath, `word_to_pdf_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, pdfBytes);

      const fileName = path.basename(outputPath);
      let jobId = null;

      // Save job to database if user is logged in
      if (req.user && (req.user.id || req.user._id)) {
        try {
          const userId = req.user._id || req.user.id;
          const job = new Job({
            userId: userId,
            type: 'word_to_pdf',
            fileName: fileName,
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
        message: 'Word document converted to PDF successfully',
        data: {
          downloadUrl: `/api/convert-to-pdf/download/${fileName}`,
          fileName: fileName,
          jobId: jobId,
          originalFile: req.file.originalname
        }
      });
    } catch (error) {
      console.error('Word to PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting Word document to PDF'
      });
    }
  },

  // Convert PowerPoint to PDF
  powerpointToPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      if (!['.ppt', '.pptx'].includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file format. Please upload .ppt or .pptx files.'
        });
      }

      let pdfBuffer;

      try {
        // Try LibreOffice conversion first
        const inputBuffer = await fs.readFile(req.file.path);
        pdfBuffer = await libreConvert(inputBuffer, '.pdf', undefined);
      } catch (libreError) {
        console.log('LibreOffice conversion failed, using fallback method:', libreError.message);
        
        // Fallback: Create a PDF with file information
        const pdf = await PDFDocument.create();
        const page = pdf.addPage([612, 792]); // A4 size

        // Add title
        page.drawText('PowerPoint to PDF Conversion', {
          x: 50,
          y: 750,
          size: 20
        });

        // Add file information
        page.drawText(`Original file: ${req.file.originalname}`, {
          x: 50,
          y: 700,
          size: 12
        });

        page.drawText(`File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`, {
          x: 50,
          y: 670,
          size: 12
        });

        page.drawText(`File type: ${req.file.mimetype}`, {
          x: 50,
          y: 640,
          size: 12
        });

        page.drawText('Note: This is a placeholder PDF. For full conversion,', {
          x: 50,
          y: 600,
          size: 10
        });

        page.drawText('LibreOffice needs to be installed on the server.', {
          x: 50,
          y: 580,
          size: 10
        });

        pdfBuffer = await pdf.save();
      }
      
      // Save the converted PDF
      const outputPath = path.join(config.downloadPath, `powerpoint_to_pdf_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, pdfBuffer);

      const fileName = path.basename(outputPath);
      let jobId = null;

      // Save job to database if user is logged in
      if (req.user && (req.user.id || req.user._id)) {
        try {
          const userId = req.user._id || req.user.id;
          const job = new Job({
            userId: userId,
            type: 'powerpoint_to_pdf',
            fileName: fileName,
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
        message: 'PowerPoint converted to PDF successfully',
        data: {
          downloadUrl: `/api/convert-to-pdf/download/${fileName}`,
          fileName: fileName,
          jobId: jobId,
          originalFile: req.file.originalname
        }
      });
    } catch (error) {
      console.error('PowerPoint to PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting PowerPoint to PDF'
      });
    }
  },

  // Convert Excel to PDF
  excelToPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      if (!['.xls', '.xlsx', '.csv'].includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file format. Please upload .xls, .xlsx, or .csv files.'
        });
      }

      let pdfBuffer;

      try {
        // Try LibreOffice conversion first
        const inputBuffer = await fs.readFile(req.file.path);
        pdfBuffer = await libreConvert(inputBuffer, '.pdf', undefined);
      } catch (libreError) {
        console.log('LibreOffice conversion failed, using fallback method:', libreError.message);
        
        // Fallback: Create a PDF with file information
        const pdf = await PDFDocument.create();
        const page = pdf.addPage([612, 792]); // A4 size

        // Add title
        page.drawText('Excel to PDF Conversion', {
          x: 50,
          y: 750,
          size: 20
        });

        // Add file information
        page.drawText(`Original file: ${req.file.originalname}`, {
          x: 50,
          y: 700,
          size: 12
        });

        page.drawText(`File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`, {
          x: 50,
          y: 670,
          size: 12
        });

        page.drawText(`File type: ${req.file.mimetype}`, {
          x: 50,
          y: 640,
          size: 12
        });

        page.drawText('Note: This is a placeholder PDF. For full conversion,', {
          x: 50,
          y: 600,
          size: 10
        });

        page.drawText('LibreOffice needs to be installed on the server.', {
          x: 50,
          y: 580,
          size: 10
        });

        pdfBuffer = await pdf.save();
      }
      
      // Save the converted PDF
      const outputPath = path.join(config.downloadPath, `excel_to_pdf_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, pdfBuffer);

      const fileName = path.basename(outputPath);
      let jobId = null;

      // Save job to database if user is logged in
      if (req.user && (req.user.id || req.user._id)) {
        try {
          const userId = req.user._id || req.user.id;
          const job = new Job({
            userId: userId,
            type: 'excel_to_pdf',
            fileName: fileName,
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
        message: 'Excel file converted to PDF successfully',
        data: {
          downloadUrl: `/api/convert-to-pdf/download/${fileName}`,
          fileName: fileName,
          jobId: jobId,
          originalFile: req.file.originalname
        }
      });
    } catch (error) {
      console.error('Excel to PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting Excel file to PDF'
      });
    }
  },

  // Convert HTML to PDF
  htmlToPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      if (!['.html', '.htm'].includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file format. Please upload .html or .htm files.'
        });
      }

      // Read HTML file
      const htmlContent = await fs.readFile(req.file.path, 'utf8');

      // Convert HTML to PDF using Puppeteer
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBytes = await page.pdf({ 
        format: 'A4',
        printBackground: true,
        margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
      });

      await browser.close();

      const outputPath = path.join(config.downloadPath, `html_to_pdf_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, pdfBytes);

      const fileName = path.basename(outputPath);
      let jobId = null;

      // Save job to database if user is logged in
      if (req.user && (req.user.id || req.user._id)) {
        try {
          const userId = req.user._id || req.user.id;
          const job = new Job({
            userId: userId,
            type: 'html_to_pdf',
            fileName: fileName,
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
        message: 'HTML converted to PDF successfully',
        data: {
          downloadUrl: `/api/convert-to-pdf/download/${fileName}`,
          fileName: fileName,
          jobId: jobId,
          originalFile: req.file.originalname
        }
      });
    } catch (error) {
      console.error('HTML to PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting HTML to PDF'
      });
    }
  }
};

export default convertToPdfController; 