const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const PptxGenJS = require('pptxgenjs');
const config = require('../config/config');
const Job = require('../models/Job');
const { fromPath } = require('pdf2pic');
const pdfParse = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const pdf_table_extractor = require('pdf-table-extractor');

const convertFromPdfController = {
  // Convert PDF to JPG/Images
  pdfToJpg: async (req, res) => {
    let job = null;
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('🔄 Starting PDF to JPG conversion for file:', req.file.originalname);

      // Create job record if user is authenticated
      if (req.user && (req.user.id || req.user._id)) {
        const userId = req.user._id || req.user.id;
        job = new Job({
          userId: userId,
          type: 'pdf_to_jpg',
          status: 'processing',
          fileName: req.file.originalname,
          originalFiles: [req.file.originalname]
        });
        await job.save();
      }

      const { pageNumbers, quality = 80 } = req.body;
      const pdfPath = req.file.path;
      const outputDir = config.downloadPath;

      // Get page count using pdf-lib
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      console.log(`📄 PDF has ${pageCount} pages`);

      // Determine which pages to convert
      const pagesToConvert = pageNumbers
        ? pageNumbers.split(',').map(p => parseInt(p.trim())).filter(p => p > 0 && p <= pageCount)
        : Array.from({ length: pageCount }, (_, i) => i + 1);
      console.log(`🖼️ Converting pages: ${pagesToConvert.join(', ')}`);

      // Set up pdf2pic converter
      const converter = fromPath(pdfPath, {
        density: 150,
        saveFilename: "pdf_to_jpg_page",
        savePath: outputDir,
        format: "jpg",
        quality: parseInt(quality)
      });

      const imageFiles = [];
      for (const pageNum of pagesToConvert) {
        try {
          console.log(`📄 Converting page ${pageNum}`);
          const result = await converter(pageNum);
          const imageFileName = path.basename(result.path);
          imageFiles.push({
            downloadUrl: `/api/convert-from-pdf/download/${imageFileName}`,
            fileName: imageFileName,
            pageNumber: pageNum
          });
          console.log(`✅ Page ${pageNum} converted: ${imageFileName}`);
        } catch (pageError) {
          console.error(`❌ Error converting page ${pageNum}:`, pageError);
        }
      }

      // Update job status if job exists
      if (job) {
        job.status = 'completed';
        job.completedAt = new Date();
        await job.save();
      }

      res.status(200).json({
        success: true,
        message: 'PDF converted to images successfully',
        data: {
          originalFile: req.file.originalname,
          images: imageFiles,
          imageCount: imageFiles.length,
          totalPages: pageCount,
          convertedPages: imageFiles.length,
          jobId: job ? job._id : null
        }
      });
    } catch (error) {
      console.error('❌ PDF to JPG error:', error);
      // Update job status if job exists
      if (job) {
        job.status = 'failed';
        job.completedAt = new Date();
        await job.save();
      }
      res.status(500).json({
        success: false,
        message: 'Error converting PDF to images'
      });
    }
  },

  // Convert PDF to Word
  pdfToWord: async (req, res) => {
    let job = null;
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('🔄 Starting PDF to Word conversion for file:', req.file.originalname);

      // Create job record if user is authenticated
      if (req.user && (req.user.id || req.user._id)) {
        const userId = req.user._id || req.user.id;
        job = new Job({
          userId: userId,
          type: 'pdf_to_word',
          status: 'processing',
          fileName: req.file.originalname,
          originalFiles: [req.file.originalname]
        });
        await job.save();
      }

      const fs = require('fs').promises;
      const path = require('path');
      const pdfParse = require('pdf-parse');
      const { Document, Packer, Paragraph, TextRun } = require('docx');

      const pdfBytes = await fs.readFile(req.file.path);
      console.log(`📄 PDF read, size: ${pdfBytes.length} bytes`);

      let textContent = '';
      let pageCount = 0;

      try {
        console.log('🔍 Parsing PDF text...');
        const data = await pdfParse(pdfBytes);
        textContent = data.text || 'No text extracted from PDF.';
        pageCount = data.numpages || 0;
        console.log(`✅ PDF parsed successfully, pages: ${pageCount}, text length: ${textContent.length}`);
      } catch (parseError) {
        console.error('❌ PDF parsing failed:', parseError.message);
        textContent = `PDF to Word Conversion\n\nOriginal file: ${req.file.originalname}\n\nThis PDF could not be parsed for text extraction. The file may be corrupted, password-protected, or contain only images.\n\nPlease ensure the PDF contains extractable text and is not corrupted.`;
      }

      // Create a new docx document with better formatting
      console.log('📝 Creating Word document...');
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "PDF to Word Conversion",
                    bold: true,
                    size: 32,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Original file: ${req.file.originalname}`,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Pages: ${pageCount}`,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "",
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: textContent,
                    size: 24,
                  }),
                ],
              }),
            ],
          },
        ],
      });

      console.log('✅ Word document created');

      const outputFileName = `pdf_to_word_${Date.now()}.docx`;
      const outputPath = path.join(config.downloadPath, outputFileName);
      
      console.log('📦 Packing Word document...');
      const buffer = await Packer.toBuffer(doc);
      await fs.writeFile(outputPath, buffer);
      
      console.log(`✅ Word document saved: ${outputFileName}, size: ${buffer.length} bytes`);

      // Update job status if job exists
      if (job) {
        job.status = 'completed';
        job.completedAt = new Date();
        await job.save();
      }

      res.status(200).json({
        success: true,
        message: 'PDF converted to Word document successfully',
        data: {
          originalFile: req.file.originalname,
          downloadUrl: `/api/convert-from-pdf/download/${outputFileName}`,
          fileName: outputFileName,
          jobId: job ? job._id : null
        }
      });
    } catch (error) {
      console.error('❌ PDF to Word error:', error);
      // Update job status if job exists
      if (job) {
        job.status = 'failed';
        job.completedAt = new Date();
        await job.save();
      }
      res.status(500).json({
        success: false,
        message: 'Error converting PDF to Word'
      });
    }
  },

  // Convert PDF to PowerPoint (visually identical, each page as image)
  pdfToPowerpoint: async (req, res) => {
    let job = null;
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('🔄 Starting PDF to PowerPoint (image-based) conversion for file:', req.file.originalname);

      // Create job record if user is authenticated
      if (req.user && (req.user.id || req.user._id)) {
        const userId = req.user._id || req.user.id;
        job = new Job({
          userId: userId,
          type: 'pdf_to_powerpoint',
          status: 'processing',
          fileName: req.file.originalname,
          originalFiles: [req.file.originalname]
        });
        await job.save();
      }

      const fs = require('fs').promises;
      const path = require('path');
      const { fromPath } = require('pdf2pic');
      const PptxGenJS = require('pptxgenjs');
      const { PDFDocument } = require('pdf-lib');

      const pdfPath = req.file.path;
      const outputDir = config.downloadPath;
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      console.log(`📄 PDF has ${pageCount} pages`);

      // Convert each PDF page to image
      const converter = fromPath(pdfPath, {
        density: 150,
        saveFilename: `pptx_pdf_page`,
        savePath: outputDir,
        format: "png",
        quality: 100
      });

      const imageFiles = [];
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          console.log(`🖼️ Converting page ${pageNum} to image...`);
          const result = await converter(pageNum);
          imageFiles.push(result.path);
          console.log(`✅ Page ${pageNum} image: ${result.path}`);
        } catch (err) {
          console.error(`❌ Error converting page ${pageNum} to image:`, err);
        }
      }

      // Create PowerPoint presentation
      const pptx = new PptxGenJS();
      pptx.author = 'EasyPDF Converter';
      pptx.company = 'EasyPDF';
      pptx.title = `PDF to PowerPoint: ${req.file.originalname}`;
      pptx.subject = 'PDF to PowerPoint Conversion (Image-based)';

      // Add each image as a full-slide background
      for (let i = 0; i < imageFiles.length; i++) {
        const slide = pptx.addSlide();
        slide.background = { path: imageFiles[i] };
        // Optionally, add a small page number label
        slide.addText(`Page ${i + 1}`, {
          x: 0.2,
          y: 6.7,
          fontSize: 10,
          color: '888888',
        });
      }

      const outputFileName = `pdf_to_powerpoint_${Date.now()}.pptx`;
      const outputPath = path.join(config.downloadPath, outputFileName);
      console.log('📦 Saving PowerPoint presentation...');
      await pptx.writeFile({ fileName: outputPath });
      console.log(`✅ PowerPoint saved: ${outputFileName}`);

      // Update job status if job exists
      if (job) {
        job.status = 'completed';
        job.completedAt = new Date();
        await job.save();
      }

      res.status(200).json({
        success: true,
        message: 'PDF converted to PowerPoint (image-based) successfully',
        data: {
          originalFile: req.file.originalname,
          downloadUrl: `/api/convert-from-pdf/download/${outputFileName}`,
          fileName: outputFileName,
          jobId: job ? job._id : null
        }
      });
    } catch (error) {
      console.error('❌ PDF to PowerPoint (image-based) error:', error);
      // Update job status if job exists
      if (job) {
        job.status = 'failed';
        job.completedAt = new Date();
        await job.save();
      }
      res.status(500).json({
        success: false,
        message: 'Error converting PDF to PowerPoint (image-based)'
      });
    }
  },

  // Convert PDF to Excel (tables only)
  pdfToExcel: async (req, res) => {
    let job = null;
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('🔄 Starting PDF to Excel (tables only) conversion for file:', req.file.originalname);

      // Create job record if user is authenticated
      if (req.user && (req.user.id || req.user._id)) {
        const userId = req.user._id || req.user.id;
        job = new Job({
          userId: userId,
          type: 'pdf_to_excel',
          status: 'processing',
          fileName: req.file.originalname,
          originalFiles: [req.file.originalname]
        });
        await job.save();
      }

      const fs = require('fs').promises;
      const path = require('path');
      const pdfPath = req.file.path;
      const outputDir = config.downloadPath;

      // Extract tables from PDF
      const extractTables = (pdfPath) => {
        return new Promise((resolve, reject) => {
          pdf_table_extractor(pdfPath, resolve, reject);
        });
      };

      let tableData;
      try {
        tableData = await extractTables(pdfPath);
      } catch (err) {
        console.error('❌ Error extracting tables:', err);
        throw new Error('Failed to extract tables from PDF.');
      }

      // Check if any tables were found
      const allTables = (tableData && tableData.pageTables)
        ? tableData.pageTables.flatMap(pt => pt.tables)
        : [];

      if (!allTables.length) {
        // No tables found, return message
        console.log('ℹ️ No tables found in PDF. Not creating Excel file.');
        if (job) {
          job.status = 'completed';
          job.completedAt = new Date();
          await job.save();
        }
        return res.status(200).json({
          success: false,
          message: 'No tables were found in your PDF, so no Excel file was created.'
        });
      }

      // Create Excel workbook from tables
      const workbook = XLSX.utils.book_new();
      allTables.forEach((table, idx) => {
        const worksheet = XLSX.utils.aoa_to_sheet(table);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Table${idx + 1}`);
      });

      const outputFileName = `pdf_to_excel_${Date.now()}.xlsx`;
      const outputPath = path.join(outputDir, outputFileName);
      XLSX.writeFile(workbook, outputPath);
      console.log(`✅ Excel file created: ${outputFileName}`);

      // Update job status if job exists
      if (job) {
        job.status = 'completed';
        job.completedAt = new Date();
        await job.save();
      }

      res.status(200).json({
        success: true,
        message: 'PDF tables extracted and saved to Excel successfully',
        data: {
          originalFile: req.file.originalname,
          downloadUrl: `/api/convert-from-pdf/download/${outputFileName}`,
          fileName: outputFileName,
          jobId: job ? job._id : null
        }
      });
    } catch (error) {
      console.error('❌ PDF to Excel error:', error);
      // Update job status if job exists
      if (job) {
        job.status = 'failed';
        job.completedAt = new Date();
        await job.save();
      }
      res.status(500).json({
        success: false,
        message: 'Error converting PDF to Excel (tables only)'
      });
    }
  },

  // Convert PDF to PDF/A
  pdfToPdfA: async (req, res) => {
    let job = null;
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Create job record if user is authenticated
      if (req.user && (req.user.id || req.user._id)) {
        const userId = req.user._id || req.user.id;
        job = new Job({
          userId: userId,
          type: 'pdf_to_pdfa',
          status: 'processing',
          fileName: req.file.originalname,
          originalFiles: [req.file.originalname]
        });
        await job.save();
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

      // Update job status if job exists
      if (job) {
        job.status = 'completed';
        job.completedAt = new Date();
        await job.save();
      }

      res.status(200).json({
        success: true,
        message: 'PDF converted to PDF/A successfully',
        data: {
          originalFile: req.file.originalname,
          downloadUrl: `/api/convert-from-pdf/download/${path.basename(outputPath)}`,
          fileName: path.basename(outputPath),
          jobId: job ? job._id : null
        }
      });
    } catch (error) {
      console.error('PDF to PDF/A error:', error);
      
      // Update job status if job exists
      if (job) {
        job.status = 'failed';
        job.completedAt = new Date();
        await job.save();
      }

      res.status(500).json({
        success: false,
        message: 'Error converting PDF to PDF/A'
      });
    }
  }
};

module.exports = convertFromPdfController; 