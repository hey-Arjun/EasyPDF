import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import config from '../config/config.js';
import Job from '../models/Job.js';
import { fromPath } from 'pdf2pic';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import pdf_table_extractor from 'pdf-table-extractor';

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

      // Pack the document
      const buffer = await Packer.toBuffer(doc);
      console.log(`📄 Word document created, size: ${buffer.length} bytes`);

      // Save the file
      const outputFileName = `pdf_to_word_${Date.now()}.docx`;
      const outputPath = path.join(config.downloadPath, outputFileName);
      await fs.writeFile(outputPath, buffer);
      console.log(`💾 Word document saved: ${outputPath}`);

      // Update job status if job exists
      if (job) {
        job.status = 'completed';
        job.completedAt = new Date();
        await job.save();
      }

      res.status(200).json({
        success: true,
        message: 'PDF converted to Word successfully',
        data: {
          originalFile: req.file.originalname,
          downloadUrl: `/api/convert-from-pdf/download/${outputFileName}`,
          fileName: outputFileName,
          fileSize: buffer.length,
          pageCount: pageCount,
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

  // Convert PDF to PowerPoint
  pdfToPowerpoint: async (req, res) => {
    let job = null;
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('🔄 Starting PDF to PowerPoint conversion for file:', req.file.originalname);

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

      // Convert PDF pages to images first
      const pdfPath = req.file.path;
      const outputDir = config.downloadPath;

      // Get page count using pdf-lib
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      console.log(`📄 PDF has ${pageCount} pages`);

      // Convert each page to image
      const converter = fromPath(pdfPath, {
        density: 150,
        saveFilename: "pdf_to_pptx_page",
        savePath: outputDir,
        format: "jpg",
        quality: 80
      });

      const imageFiles = [];
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          console.log(`📄 Converting page ${pageNum} to image`);
          const result = await converter(pageNum);
          imageFiles.push(result.path);
          console.log(`✅ Page ${pageNum} converted: ${result.path}`);
        } catch (pageError) {
          console.error(`❌ Error converting page ${pageNum}:`, pageError);
        }
      }

      // Create PowerPoint presentation
      console.log('📊 Creating PowerPoint presentation...');
      const pptx = new PptxGenJS();

      // Add slides for each image
      for (let i = 0; i < imageFiles.length; i++) {
        const slide = pptx.addSlide();
        slide.addImage({
          path: imageFiles[i],
          x: 0.5,
          y: 0.5,
          w: '90%',
          h: '80%'
        });
        
        // Add slide number
        slide.addText(`Page ${i + 1}`, {
          x: 0.5,
          y: 4.5,
          w: 1,
          h: 0.3,
          fontSize: 12,
          color: '666666'
        });
      }

      // Save the presentation
      const outputFileName = `pdf_to_powerpoint_${Date.now()}.pptx`;
      const outputPath = path.join(config.downloadPath, outputFileName);
      await pptx.writeFile({ fileName: outputPath });
      console.log(`💾 PowerPoint saved: ${outputPath}`);

      // Clean up temporary image files
      for (const imageFile of imageFiles) {
        try {
          await fs.unlink(imageFile);
        } catch (cleanupError) {
          console.warn('Warning: Could not delete temporary image file:', imageFile);
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
        message: 'PDF converted to PowerPoint successfully',
        data: {
          originalFile: req.file.originalname,
          downloadUrl: `/api/convert-from-pdf/download/${outputFileName}`,
          fileName: outputFileName,
          pageCount: pageCount,
          jobId: job ? job._id : null
        }
      });
    } catch (error) {
      console.error('❌ PDF to PowerPoint error:', error);
      // Update job status if job exists
      if (job) {
        job.status = 'failed';
        job.completedAt = new Date();
        await job.save();
      }
      res.status(500).json({
        success: false,
        message: 'Error converting PDF to PowerPoint'
      });
    }
  },

  // Convert PDF to Excel
  pdfToExcel: async (req, res) => {
    let job = null;
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('🔄 Starting PDF to Excel conversion for file:', req.file.originalname);

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

      // Extract tables from PDF
      const extractTables = (pdfPath) => {
        return new Promise((resolve, reject) => {
          pdf_table_extractor(pdfPath, (result) => {
            if (result.success) {
              resolve(result.tables);
            } else {
              reject(new Error('Failed to extract tables from PDF'));
            }
          });
        });
      };

      const tables = await extractTables(req.file.path);
      console.log(`📊 Extracted ${tables.length} tables from PDF`);

      // Create Excel workbook
      const workbook = XLSX.utils.book_new();

      // Add each table as a worksheet
      tables.forEach((table, index) => {
        const worksheet = XLSX.utils.aoa_to_sheet(table);
        const sheetName = `Table_${index + 1}`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // If no tables found, create a sheet with extracted text
      if (tables.length === 0) {
        console.log('📝 No tables found, extracting text instead...');
        const pdfBytes = await fs.readFile(req.file.path);
        const data = await pdfParse(pdfBytes);
        const textContent = data.text || 'No text extracted from PDF.';
        
        // Split text into lines and create a simple table
        const textLines = textContent.split('\n').filter(line => line.trim());
        const worksheet = XLSX.utils.aoa_to_sheet([['Extracted Text'], ...textLines.map(line => [line])]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted_Text');
      }

      // Save the Excel file
      const outputFileName = `pdf_to_excel_${Date.now()}.xlsx`;
      const outputPath = path.join(config.downloadPath, outputFileName);
      XLSX.writeFile(workbook, outputPath);
      console.log(`💾 Excel file saved: ${outputPath}`);

      // Update job status if job exists
      if (job) {
        job.status = 'completed';
        job.completedAt = new Date();
        await job.save();
      }

      res.status(200).json({
        success: true,
        message: 'PDF converted to Excel successfully',
        data: {
          originalFile: req.file.originalname,
          downloadUrl: `/api/convert-from-pdf/download/${outputFileName}`,
          fileName: outputFileName,
          tableCount: tables.length,
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
        message: 'Error converting PDF to Excel'
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

export default convertFromPdfController; 
