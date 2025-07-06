const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function testPuppeteer() {
  let browser = null;
  try {
    console.log('🔄 Testing Puppeteer...');
    
    // Test 1: Launch browser
    console.log('🌐 Attempting to launch browser...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    console.log('✅ Browser launched successfully');
    
    // Test 2: Create a simple page
    console.log('📄 Creating new page...');
    const page = await browser.newPage();
    console.log('✅ Page created successfully');
    
    // Test 3: Navigate to a simple HTML page
    console.log('🌐 Navigating to test page...');
    await page.setContent('<html><body><h1>Test Page</h1></body></html>');
    console.log('✅ Navigation successful');
    
    // Test 4: Take a screenshot
    console.log('📸 Taking screenshot...');
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 80
    });
    console.log('✅ Screenshot taken successfully');
    
    // Test 5: Save the screenshot
    const testFileName = `test_screenshot_${Date.now()}.jpg`;
    const testPath = path.join(__dirname, 'downloads', testFileName);
    await fs.writeFile(testPath, screenshot);
    console.log(`✅ Screenshot saved: ${testFileName}`);
    
    console.log('🎉 All Puppeteer tests passed!');
    
  } catch (error) {
    console.error('❌ Puppeteer test failed:', error);
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

testPuppeteer(); 