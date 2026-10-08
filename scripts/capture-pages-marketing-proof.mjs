import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu']
});

const ARTIFACT_DIR = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';

// 1. Desktop Viewport (1280x800)
const pageDesktop = await browser.newPage();
await pageDesktop.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
await pageDesktop.goto('http://127.0.0.1:4323/docs/index.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));

// Full page desktop capture
await pageDesktop.screenshot({ path: `${ARTIFACT_DIR}/github-pages-desktop-top.png` });

// Scroll to #hairline
const hairlineSec = await pageDesktop.$('#hairline');
if (hairlineSec) {
  await hairlineSec.scrollIntoView();
  await new Promise(r => setTimeout(r, 600));
  await pageDesktop.screenshot({ path: `${ARTIFACT_DIR}/github-pages-desktop-hairline.png` });
}

// Scroll to #faq
const faqSec = await pageDesktop.$('#faq');
if (faqSec) {
  await faqSec.scrollIntoView();
  await new Promise(r => setTimeout(r, 600));
  await pageDesktop.screenshot({ path: `${ARTIFACT_DIR}/github-pages-desktop-faq.png` });
}

// 2. Mobile Viewport (iPhone 14 / 390x844)
const pageMobile = await browser.newPage();
await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await pageMobile.goto('http://127.0.0.1:4323/docs/index.html', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));
await pageMobile.screenshot({ path: `${ARTIFACT_DIR}/github-pages-mobile-hero.png` });

const hairlineMobile = await pageMobile.$('#hairline');
if (hairlineMobile) {
  await hairlineMobile.scrollIntoView();
  await new Promise(r => setTimeout(r, 600));
  await pageMobile.screenshot({ path: `${ARTIFACT_DIR}/github-pages-mobile-hairline.png` });
}

await browser.close();
console.log('Successfully captured all marketing proofs: desktop + mobile!');
