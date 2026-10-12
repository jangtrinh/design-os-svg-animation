import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu']
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });

const errors = [];
page.on('pageerror', err => errors.push(err.message));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

const url = 'http://127.0.0.1:4323/playground/chemistry.html';
console.log('Navigating to:', url);
await page.goto(url, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));

if (errors.length > 0) {
  console.error('Errors found on page:', errors);
  await browser.close();
  process.exit(1);
}

const artifactDir = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';

// 1. Capture Single View (Figure 1: Acid-Base Titration & Buret)
console.log('Capturing Figure 1: Titration & Buret...');
// Trigger equivalence point
await page.evaluate(() => {
  const slider = document.getElementById('intensity');
  slider.value = 20.0;
  slider.dispatchEvent(new Event('input'));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/chemistry-01-titration-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 2. Switch to Figure 2: Alcohol Burner & Heating
console.log('Capturing Figure 2: Alcohol Burner & Heating...');
await page.keyboard.press('2');
await new Promise(r => setTimeout(r, 500));
await page.evaluate(() => {
  const slider = document.getElementById('intensity');
  slider.value = 90.0;
  slider.dispatchEvent(new Event('input'));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/chemistry-02-burner-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 3. Switch to Figure 3: Crystal Lattice
console.log('Capturing Figure 3: Crystal Lattice...');
await page.keyboard.press('3');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/chemistry-03-lattice-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 4. Switch to Figure 4: Distillation Apparatus
console.log('Capturing Figure 4: Distillation Apparatus...');
await page.keyboard.press('4');
await new Promise(r => setTimeout(r, 500));
await page.evaluate(() => {
  const slider = document.getElementById('intensity');
  slider.value = 82.0;
  slider.dispatchEvent(new Event('input'));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/chemistry-04-distillation-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 5. Switch to Figure 5: pH Scale & Indicator Test Strip
console.log('Capturing Figure 5: pH Scale & Indicator...');
await page.keyboard.press('5');
await new Promise(r => setTimeout(r, 500));
await page.evaluate(() => {
  const slider = document.getElementById('intensity');
  slider.value = 28.0; // Dip into NaOH well
  slider.dispatchEvent(new Event('input'));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/chemistry-05-ph-scale-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 6. Switch to Gallery View (all 5 figures)
console.log('Capturing Chemistry Suite Gallery View...');
await page.click('.view-mode-toggle');
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: `${artifactDir}/chemistry-gallery-proof.png`, fullPage: true });

await browser.close();
console.log('✓ All 5 chemistry figures verified and captured successfully!');
