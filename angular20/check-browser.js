const { chromium } = require('playwright-core');

(async () => {
  let browser;
  try {
    console.log('Attempting to launch Chromium...');
    browser = await chromium.launch();
    const page = await browser.newPage();
    console.log('Successfully launched Chromium.');
    console.log('Navigating to a test page...');
    await page.goto('https://www.google.com');
    console.log(`Page title: "${await page.title()}"`);
    console.log('Verification successful. Chromium is installed and working.');
  } catch (error) {
    console.error('Failed to launch or use Chromium:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();