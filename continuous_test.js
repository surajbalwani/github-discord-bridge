const { chromium } = require('playwright');

const URL = 'https://github-discord-bridge.vercel.app';
const DURATION_MINUTES = 30;
const INTERVAL_SECONDS = 30;

async function runTests() {
  console.log(`Starting continuous Playwright testing for ${DURATION_MINUTES} minutes...`);
  const endTime = Date.now() + DURATION_MINUTES * 60 * 1000;
  
  let attempt = 1;
  while (Date.now() < endTime) {
    console.log(`[Attempt ${attempt}] Testing ${URL} at ${new Date().toLocaleTimeString()}...`);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(URL, { waitUntil: 'networkidle' });
      
      // Verify Title
      const title = await page.title();
      console.log(`  -> Title: ${title}`);
      
      // Verify our new open beta tag exists
      const isBeta = await page.isVisible('text=Now in Open Beta v2.0');
      if (isBeta) {
        console.log('  -> ✅ Open Beta v2.0 tag found! Landing page deployed successfully.');
      } else {
        console.log('  -> ❌ Open Beta tag not found. Deployment might still be rolling out.');
      }
      
      // Check for Framer Motion animation by verifying opacity of an element
      // (This just ensures the page didn't crash)
      const h1Visible = await page.isVisible('h1');
      console.log(`  -> H1 Visible: ${h1Visible}`);
      
    } catch (e) {
      console.error(`  -> ❌ Error during test:`, e.message);
    } finally {
      await browser.close();
    }
    
    attempt++;
    // Wait for interval
    await new Promise(r => setTimeout(r, INTERVAL_SECONDS * 1000));
  }
  
  console.log('Continuous testing complete.');
}

runTests();
