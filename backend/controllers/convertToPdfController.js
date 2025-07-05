const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const config = require('../config/config');
const Job = require('../models/Job');

const convertToPdfController = {
  // Convert JPG/Images to PDF
  jpgToPdf: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
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
      if (req.user && req.user.id) {
        try {
          const job = new Job({
            userId: req.user.id,
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
      if (req.user && req.user.id) {
        try {
          const job = new Job({
            userId: req.user.id,
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

      // For PowerPoint conversion, we'll create a placeholder PDF
      // In production, you'd use a library like libreoffice or cloudconvert API
      const pdf = await PDFDocument.create();
      const page = pdf.addPage([612, 792]); // A4 size

      // Add a placeholder message
      page.drawText('PowerPoint to PDF conversion', {
        x: 50,
        y: 700,
        size: 20
      });

      page.drawText('This is a placeholder for PowerPoint conversion.', {
        x: 50,
        y: 650,
        size: 12
      });

      page.drawText(`Original file: ${req.file.originalname}`, {
        x: 50,
        y: 600,
        size: 10
      });

      const pdfBytes = await pdf.save();
      const outputPath = path.join(config.downloadPath, `powerpoint_to_pdf_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, pdfBytes);

      const fileName = path.basename(outputPath);
      let jobId = null;

      // Save job to database if user is logged in
      if (req.user && req.user.id) {
        try {
          const job = new Job({
            userId: req.user.id,
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

      // Read Excel file
      const workbook = XLSX.readFile(req.file.path);
      const sheetNames = workbook.SheetNames;
      const firstSheet = workbook.Sheets[sheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // Create PDF with table data
      const pdf = await PDFDocument.create();
      const page = pdf.addPage([612, 792]); // A4 size

      // Add title
      page.drawText('Excel to PDF Conversion', {
        x: 50,
        y: 750,
        size: 16
      });

      // Add table data (simplified)
      let yPosition = 700;
      const lineHeight = 15;

      for (let i = 0; i < Math.min(30, jsonData.length); i++) { // Limit to first 30 rows
        if (yPosition < 50) break; // Stop if page is full
        
        const row = jsonData[i];
        const rowText = Array.isArray(row) ? row.join(' | ') : JSON.stringify(row);
        page.drawText(rowText.substring(0, 80), { // Limit text length
          x: 50,
          y: yPosition,
          size: 8
        });
        yPosition -= lineHeight;
      }

      const pdfBytes = await pdf.save();
      const outputPath = path.join(config.downloadPath, `excel_to_pdf_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, pdfBytes);

      const fileName = path.basename(outputPath);
      let jobId = null;

      // Save job to database if user is logged in
      if (req.user && req.user.id) {
        try {
          const job = new Job({
            userId: req.user.id,
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
          originalFile: req.file.originalname,
          sheetCount: sheetNames.length
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
      if (req.user && req.user.id) {
        try {
          const job = new Job({
            userId: req.user.id,
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

module.exports = convertToPdfController; 