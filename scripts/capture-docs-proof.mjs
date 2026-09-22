import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACTS_DIR = '/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3';

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  const fileUrl = `file://${path.join(ROOT_DIR, 'docs', 'index.html')}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // 1. Switch carousel to slide 3 (Vercel v0)
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.carousel-tab');
    if (tabs[3]) tabs[3].click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const carouselEl = await page.$('#hero-carousel');
  if (carouselEl) {
    await carouselEl.screenshot({
      path: path.join(ARTIFACTS_DIR, 'proof_docs_v0_carousel_slide.png')
    });
    console.log('Saved proof_docs_v0_carousel_slide.png');
  }

  // 2. Scroll to #showcase and capture Example 4
  await page.evaluate(() => {
    const el = document.getElementById('showcase');
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 400));

  const showcaseEl = await page.$('#showcase');
  if (showcaseEl) {
    await showcaseEl.screenshot({
      path: path.join(ARTIFACTS_DIR, 'proof_docs_v0_showcase_section.png')
    });
    console.log('Saved proof_docs_v0_showcase_section.png');
  }

  await browser.close();
  console.log('Done capturing docs proofs!');
}

main().catch(console.error);
