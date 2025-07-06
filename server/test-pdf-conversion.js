const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function testPdfConversion() {
  let browser = null;
  try {
    console.log('🔄 Testing PDF to Image conversion...');
    
    // Read the test PDF
    const pdfPath = path.join(__dirname, 'test.pdf');
    console.log(`📄 Reading PDF from: ${pdfPath}`);
    
    const pdfBytes = await fs.readFile(pdfPath);
    console.log(`✅ PDF read successfully, size: ${pdfBytes.length} bytes`);
    
    // Load PDF with pdf-lib
    const pdf = await PDFDocument.load(pdfBytes);
    const pageCount = pdf.getPageCount();
    console.log(`📄 PDF has ${pageCount} pages`);
    
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({ 
      headless: true, // Use old headless mode for compatibility
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    console.log('✅ Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('✅ Page created successfully');
    
    // Convert PDF to base64
    const pdfBase64 = pdfBytes.toString('base64');
    console.log(`📄 PDF converted to base64, length: ${pdfBase64.length}`);
    
    // Navigate to PDF data URL
    console.log('🌐 Navigating to PDF data URL...');
    await page.goto(`data:application/pdf;base64,${pdfBase64}`);
    console.log('✅ Navigation to PDF successful');
    
    // Wait for PDF to load
    console.log('⏳ Waiting for PDF to load...');
    await page.waitForTimeout(2000);
    console.log('✅ Wait completed');
    
    // Take screenshot
    console.log('📸 Taking screenshot...');
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 80,
      fullPage: false
    });
    console.log('✅ Screenshot taken successfully');
    
    // Save the screenshot
    const outputFileName = `test_pdf_conversion_${Date.now()}.jpg`;
    const outputPath = path.join(__dirname, 'downloads', outputFileName);
    await fs.writeFile(outputPath, screenshot);
    console.log(`✅ Screenshot saved: ${outputFileName}`);
    
    console.log('🎉 PDF to Image conversion test passed!');
    
  } catch (error) {
    console.error('❌ PDF to Image conversion test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('🌐 Browser closed');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

testPdfConversion(); 