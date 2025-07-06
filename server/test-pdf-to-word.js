const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require('docx');

async function testPdfToWord() {
  try {
    console.log('🔄 Testing PDF to Word conversion...');
    
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
    console.log(`✅ PDF parsed, pages: ${data.numpages}`);
    console.log(`📝 Extracted text length: ${data.text ? data.text.length : 0} characters`);
    
    if (data.text) {
      console.log('📄 First 200 characters of extracted text:');
      console.log(data.text.substring(0, 200));
    }
    
    // Create Word document with better formatting
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
                  text: `Original file: test.pdf`,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Pages: ${data.numpages}`,
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
                  text: data.text || "No text extracted from PDF.",
                  size: 24,
                }),
              ],
            }),
          ],
        },
      ],
    });
    
    console.log('✅ Word document created');
    
    // Pack and save
    console.log('📦 Packing Word document...');
    const buffer = await Packer.toBuffer(doc);
    console.log(`✅ Document packed, size: ${buffer.length} bytes`);
    
    const outputFileName = `test_pdf_to_word_${Date.now()}.docx`;
    const outputPath = path.join(outputDir, outputFileName);
    await fs.writeFile(outputPath, buffer);
    
    console.log(`✅ Word document saved: ${outputFileName}`);
    console.log(`📁 Full path: ${outputPath}`);
    
    // Verify file exists and check size
    try {
      const stats = await fs.stat(outputPath);
      console.log(`📊 File size: ${stats.size} bytes`);
      console.log('✅ File verification successful');
    } catch (error) {
      console.error('❌ File verification failed:', error);
    }
    
    console.log('🎉 PDF to Word conversion test completed!');
    
  } catch (error) {
    console.error('❌ PDF to Word test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testPdfToWord(); 