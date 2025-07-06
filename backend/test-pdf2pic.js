const { fromPath } = require('pdf2pic');
const fs = require('fs').promises;
const path = require('path');

async function testPdf2pic() {
  try {
    console.log('🔄 Testing pdf2pic...');
    
    const pdfPath = path.join(__dirname, 'test.pdf');
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
    
    // Check if output directory exists
    try {
      await fs.access(outputDir);
      console.log('✅ Output directory exists');
    } catch (error) {
      console.error('❌ Output directory not found:', error);
      return;
    }
    
    // Set up pdf2pic converter
    console.log('🔧 Setting up pdf2pic converter...');
    const converter = fromPath(pdfPath, {
      density: 150,
      saveFilename: "test_pdf2pic_page",
      savePath: outputDir,
      format: "jpg",
      quality: 80
    });
    
    console.log('✅ Converter created successfully');
    
    // Convert first page
    console.log('📄 Converting page 1...');
    const result = await converter(1);
    
    console.log('✅ Conversion result:', result);
    console.log('📁 Result path:', result.path);
    console.log('📊 Result name:', result.name);
    
    // Check if file was created
    try {
      await fs.access(result.path);
      console.log('✅ Output file exists');
      
      const stats = await fs.stat(result.path);
      console.log(`📊 File size: ${stats.size} bytes`);
    } catch (error) {
      console.error('❌ Output file not found:', error);
    }
    
  } catch (error) {
    console.error('❌ pdf2pic test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testPdf2pic(); 