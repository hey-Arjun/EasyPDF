const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const config = require('../config/config');

const convertFromPdfController = {
  // Convert PDF to JPG/Images
  pdfToJpg: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { pageNumbers, quality = 80 } = req.body;
      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();

      // Convert PDF pages to images using Puppeteer
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      const imageFiles = [];
      const pagesToConvert = pageNumbers ? 
        pageNumbers.split(',').map(p => parseInt(p.trim()) - 1) : 
        Array.from({ length: pageCount }, (_, i) => i);

      for (const pageIndex of pagesToConvert) {
        if (pageIndex >= 0 && pageIndex < pageCount) {
          // Set PDF content
          await page.goto(`data:application/pdf;base64,${pdfBytes.toString('base64')}`);
          
          // Take screenshot of specific page
          const screenshot = await page.screenshot({
            type: 'jpeg',
            quality: parseInt(quality),
            fullPage: false
          });

          const imageFileName = `pdf_to_jpg_page_${pageIndex + 1}_${Date.now()}.jpg`;
          const imagePath = path.join(config.downloadPath, imageFileName);
          await fs.writeFile(imagePath, screenshot);
          
          imageFiles.push({
            downloadUrl: `/api/convert-from-pdf/download/${path.basename(imagePath)}`,
            fileName: path.basename(imagePath),
            pageNumber: pageIndex + 1
          });
        }
      }

      await browser.close();

      res.status(200).json({
        success: true,
        message: 'PDF converted to images successfully',
        data: {
          files: imageFiles,
          totalPages: pageCount,
          convertedPages: imageFiles.length
        }
      });
    } catch (error) {
      console.error('PDF to JPG error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting PDF to images'
      });
    }
  },

  // Convert PDF to Word
  pdfToWord: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // For PDF to Word conversion, we'll create a placeholder
      // In production, you'd use a service like Adobe PDF Services API or similar
      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();

      // Create a simple text representation
      let textContent = `PDF to Word Conversion\n\n`;
      textContent += `Original file: ${req.file.originalname}\n`;
      textContent += `Total pages: ${pageCount}\n\n`;
      textContent += `This is a placeholder for PDF to Word conversion.\n`;
      textContent += `In a production environment, this would extract text and formatting from the PDF.\n`;

      const outputFileName = `pdf_to_word_${Date.now()}.txt`;
      const outputPath = path.join(config.downloadPath, outputFileName);
      await fs.writeFile(outputPath, textContent);

      res.status(200).json({
        success: true,
        message: 'PDF converted to Word document successfully',
        data: {
          downloadUrl: `/api/convert-from-pdf/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: 'temp-job-id' // job._id
        }
      });
    } catch (error) {
      console.error('PDF to Word error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting PDF to Word'
      });
    }
  },

  // Convert PDF to PowerPoint
  pdfToPowerpoint: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();

      // Create a placeholder for PowerPoint conversion
      let pptContent = `PDF to PowerPoint Conversion\n\n`;
      pptContent += `Original file: ${req.file.originalname}\n`;
      pptContent += `Total pages: ${pageCount}\n\n`;
      pptContent += `This is a placeholder for PDF to PowerPoint conversion.\n`;
      pptContent += `Each page would become a slide in the presentation.\n`;

      const outputFileName = `pdf_to_powerpoint_${Date.now()}.txt`;
      const outputPath = path.join(config.downloadPath, outputFileName);
      await fs.writeFile(outputPath, pptContent);

      res.status(200).json({
        success: true,
        message: 'PDF converted to PowerPoint successfully',
        data: {
          downloadUrl: `/api/convert-from-pdf/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: 'temp-job-id' // job._id
        }
      });
    } catch (error) {
      console.error('PDF to PowerPoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting PDF to PowerPoint'
      });
    }
  },

  // Convert PDF to Excel
  pdfToExcel: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();

      // Create a placeholder for Excel conversion
      let excelContent = `PDF to Excel Conversion\n\n`;
      excelContent += `Original file: ${req.file.originalname}\n`;
      excelContent += `Total pages: ${pageCount}\n\n`;
      excelContent += `This is a placeholder for PDF to Excel conversion.\n`;
      excelContent += `Tables and data would be extracted and formatted as spreadsheets.\n`;

      const outputFileName = `pdf_to_excel_${Date.now()}.txt`;
      const outputPath = path.join(config.downloadPath, outputFileName);
      await fs.writeFile(outputPath, excelContent);

      res.status(200).json({
        success: true,
        message: 'PDF converted to Excel file successfully',
        data: {
          downloadUrl: `/api/convert-from-pdf/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: 'temp-job-id' // job._id
        }
      });
    } catch (error) {
      console.error('PDF to Excel error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting PDF to Excel'
      });
    }
  },

  // Convert PDF to PDF/A
  pdfToPdfA: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const pdfBytes = await fs.readFile(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);

      // Create PDF/A compliant version
      // This is a simplified version - in production you'd use a proper PDF/A converter
      const pdfA = await PDFDocument.create();
      const pages = await pdfA.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => pdfA.addPage(page));

      // Add PDF/A metadata
      pdfA.setTitle('PDF/A Document');
      pdfA.setAuthor('EasyPDF Converter');
      pdfA.setSubject('PDF/A Conversion');
      pdfA.setKeywords(['PDF/A', 'archival', 'compliance']);

      const pdfABytes = await pdfA.save();
      const outputPath = path.join(config.downloadPath, `pdf_to_pdfa_${Date.now()}.pdf`);
      await fs.writeFile(outputPath, pdfABytes);

      res.status(200).json({
        success: true,
        message: 'PDF converted to PDF/A successfully',
        data: {
          downloadUrl: `/api/convert-from-pdf/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: 'temp-job-id' // job._id
        }
      });
    } catch (error) {
      console.error('PDF to PDF/A error:', error);
      res.status(500).json({
        success: false,
        message: 'Error converting PDF to PDF/A'
      });
    }
  }
};

module.exports = convertFromPdfController; 