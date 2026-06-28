const { chromium } = require('playwright');

const EMAIL = 'wendaotan@gmail.com';
const PASSWORD = 'Wendaotan135790&';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  console.log("Navigating to SiteGround login...");
  await page.goto('https://login.siteground.com/?lang=en', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log("Current URL:", page.url());
  
  // Fill login form
  await page.fill('input[name="username"]', EMAIL);
  await page.fill('input[name="fields.password.name"]', PASSWORD);
  
  // Click login button
  const submitBtn = page.getByRole('button', { name: 'Login', exact: true });
  await submitBtn.click();
  
  // Wait for redirect to dashboard
  await page.waitForTimeout(10000);
  
  console.log("After login URL:", page.url());
  await page.screenshot({ path: 'sg-dashboard.png', fullPage: true });
  console.log("Dashboard screenshot saved!");
  
  // Check page content
  const pageText = await page.textContent('body');
  console.log("Page title:", await page.title());
  
  if (pageText.includes('primook') || pageText.toLowerCase().includes('domain') || pageText.toLowerCase().includes('dns')) {
    console.log("Found domain/DNS related content!");
  }
  
  // Try to find DNS/domain links
  const links = await page.locator('a').all();
  for (const link of links) {
    const text = await link.textContent();
    if (text && (text.toLowerCase().includes('domain') || text.toLowerCase().includes('dns') || text.toLowerCase().includes('primook'))) {
      console.log("DNS/domain link found:", text.trim());
    }
  }
  
  await browser.close();
})().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
