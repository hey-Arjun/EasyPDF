const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const PptxGenJS = require('pptxgenjs');

async function testPdfToPowerpoint() {
  try {
    console.log('🔄 Testing PDF to PowerPoint conversion...');
    
    const pdfPath = path.join(__dirname, 'downloads', 'compressed_1751709360027.pdf');
    const outputDir = path.join(__dirname, 'downloads');
    
    console.log(`📄 PDF path: ${pdfPath}`);
    console.log(`📁 Output dir: ${outputDir}`);
    
    // Check if PDF exists
    try {
      await fs.access(pdfPath);
      console.log('✅ PDF file exists');
    } catch (error) {
      console.error('❌ PDF file not found:', error);
      return;
    }
    
    // Read and parse PDF
    console.log('📖 Reading PDF...');
    const pdfBytes = await fs.readFile(pdfPath);
    console.log(`✅ PDF read, size: ${pdfBytes.length} bytes`);
    
    console.log('🔍 Parsing PDF text...');
    const data = await pdfParse(pdfBytes);
    const textContent = data.text || 'No text extracted from PDF.';
    const pageCount = data.numpages || 0;
    console.log(`✅ PDF parsed successfully, pages: ${pageCount}, text length: ${textContent.length}`);
    
    if (textContent) {
      console.log('📄 First 300 characters of extracted text:');
      console.log(textContent.substring(0, 300));
    }
    
    // Create PowerPoint presentation
    console.log('📝 Creating PowerPoint presentation...');
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'EasyPDF Converter';
    pptx.company = 'EasyPDF';
    pptx.title = 'PDF to PowerPoint Test';
    pptx.subject = 'PDF to PowerPoint Conversion Test';

    // Add title slide
    const titleSlide = pptx.addSlide();
    titleSlide.addText('PDF to PowerPoint Conversion', {
      x: 1,
      y: 2,
      w: 8,
      h: 1,
      fontSize: 28,
      bold: true,
      color: '2E86AB',
      align: 'center'
    });
    titleSlide.addText(`Pages: ${pageCount}`, {
      x: 1,
      y: 3.5,
      w: 8,
      h: 0.5,
      fontSize: 16,
      color: '666666',
      align: 'center'
    });

    // Split text content into lines
    const lines = textContent.split('\n').filter(line => line.trim().length > 0);
    console.log(`📝 Found ${lines.length} non-empty lines`);
    
    // Create one slide per PDF page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      console.log(`📄 Creating slide for page ${pageNum}`);
      const slide = pptx.addSlide();
      
      // Add page header
      slide.addText(`Page ${pageNum}`, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.6,
        fontSize: 18,
        bold: true,
        color: '2E86AB'
      });

      // Calculate content for this page
      const linesPerPage = Math.ceil(lines.length / pageCount);
      const startIndex = (pageNum - 1) * linesPerPage;
      const endIndex = Math.min(startIndex + linesPerPage, lines.length);
      const pageLines = lines.slice(startIndex, endIndex);
      
      console.log(`📝 Page ${pageNum}: ${pageLines.length} lines (${startIndex}-${endIndex})`);

      if (pageLines.length > 0) {
        // Simple approach: group lines into chunks of 3-4 lines each
        const chunks = [];
        const chunkSize = 4; // Lines per chunk
        
        for (let i = 0; i < pageLines.length; i += chunkSize) {
          const chunk = pageLines.slice(i, i + chunkSize);
          const chunkText = chunk.join(' ').trim();
          if (chunkText.length > 5) { // Only add meaningful chunks
            chunks.push(chunkText);
          }
        }

        // Limit to 3 chunks per slide for readability
        const displayChunks = chunks.slice(0, 3);

        console.log(`📝 Page ${pageNum}: Created ${chunks.length} chunks, using ${displayChunks.length} display chunks`);

        // Add chunks to slide
        let yPosition = 1.2;
        for (let i = 0; i < displayChunks.length; i++) {
          const chunk = displayChunks[i];
          
          // Truncate very long chunks
          const displayText = chunk.length > 350 ? chunk.substring(0, 350) + '...' : chunk;
          
          slide.addText(displayText, {
            x: 0.5,
            y: yPosition,
            w: 9,
            h: 1.5,
            fontSize: 14,
            color: '333333',
            wrap: true,
            valign: 'top'
          });
          
          yPosition += 1.8; // Good spacing between chunks
        }

        // If there are more chunks, add a note
        if (chunks.length > 3) {
          slide.addText(`... and ${chunks.length - 3} more sections`, {
            x: 0.5,
            y: 6.5,
            w: 9,
            h: 0.5,
            fontSize: 12,
            color: '999999',
            italic: true
          });
        }
      } else {
        // No content for this page
        slide.addText('No content available for this page', {
          x: 1,
          y: 2,
          w: 8,
          h: 1,
          fontSize: 16,
          color: '999999',
          align: 'center'
        });
      }
    }

    console.log(`✅ PowerPoint created with ${pageCount + 1} slides`);

    const outputFileName = `test_pdf_to_powerpoint_${Date.now()}.pptx`;
    const outputPath = path.join(outputDir, outputFileName);
    
    console.log('📦 Saving PowerPoint presentation...');
    await pptx.writeFile({ fileName: outputPath });
    
    console.log(`✅ PowerPoint saved: ${outputFileName}`);
    console.log(`📁 Full path: ${outputPath}`);
    
    // Verify file exists and check size
    try {
      const stats = await fs.stat(outputPath);
      console.log(`📊 File size: ${stats.size} bytes`);
      console.log('✅ File verification successful');
    } catch (error) {
      console.error('❌ File verification failed:', error);
    }
    
    console.log('🎉 PDF to PowerPoint conversion test completed!');
    
  } catch (error) {
    console.error('❌ PDF to PowerPoint test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testPdfToPowerpoint(); 