import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Capture console and errors
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    page.on('requestfailed', req => console.log('FAILED REQUEST:', req.url(), req.failure()?.errorText));

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    // Wait a bit to let any React hydration errors happen
    await new Promise(r => setTimeout(r, 3000));
    
    // Check if the body has content and what its bounding box is
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('BODY TEXT LENGTH:', bodyText.length);
    console.log('BODY VISIBLE?', await page.evaluate(() => document.body.offsetHeight > 0));
    
    const rootHtml = await page.evaluate(() => document.body.innerHTML.slice(0, 300));
    console.log('ROOT HTML START:', rootHtml);

    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
