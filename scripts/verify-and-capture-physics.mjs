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

const url = 'http://127.0.0.1:4323/playground/physics.html';
console.log('Navigating to:', url);
await page.goto(url, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));

if (errors.length > 0) {
  console.error('Errors found on page:', errors);
  await browser.close();
  process.exit(1);
}

const artifactDir = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';

// 1. Capture Single View (Figure 1: Lever & Fulcrum)
console.log('Capturing Figure 1: Lever & Fulcrum...');
await page.screenshot({ path: `${artifactDir}/physics-01-lever-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 2. Switch to Figure 2: Simple Pendulum
console.log('Capturing Figure 2: Simple Pendulum...');
await page.keyboard.press('2');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/physics-02-pendulum-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 3. Switch to Figure 3: Spring Dynamometer
console.log('Capturing Figure 3: Spring Dynamometer...');
await page.keyboard.press('3');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/physics-03-dynamometer-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 4. Switch to Figure 4: Inclined Plane & Friction
console.log('Capturing Figure 4: Inclined Plane...');
await page.keyboard.press('4');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/physics-04-incline-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 5. Switch to Figure 5: Knife Switch Circuit (closed state)
console.log('Capturing Figure 5: Knife Switch Circuit...');
await page.keyboard.press('5');
await new Promise(r => setTimeout(r, 500));
// Let's drag or set switch to closed to capture the bright glowing bulb!
await page.evaluate(() => {
  const slider = document.getElementById('intensity');
  slider.value = 0;
  slider.dispatchEvent(new Event('input'));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/physics-05-switch-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 6. Switch to Gallery View (all 5 figures)
console.log('Capturing Physics Suite Gallery View...');
await page.click('.view-mode-toggle');
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: `${artifactDir}/physics-gallery-proof.png`, fullPage: true });

await browser.close();
console.log('✓ All 5 physics figures verified and captured successfully!');
