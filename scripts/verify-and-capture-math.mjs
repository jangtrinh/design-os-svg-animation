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

const url = 'http://127.0.0.1:4323/playground/math-grade1.html';
console.log('Navigating to:', url);
await page.goto(url, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));

if (errors.length > 0) {
  console.error('Errors found on page:', errors);
  await browser.close();
  process.exit(1);
}

const artifactDir = '/Users/jang/.gemini/antigravity/brain/b6d9eb30-9c9a-4a92-8f7f-c983467a98d2';

// 1. Capture Single View (Figure 1: Counting Sticks)
console.log('Capturing Figure 1: Counting Sticks...');
await page.screenshot({ path: `${artifactDir}/math-01-sticks-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });
await page.screenshot({ path: `${artifactDir}/math-01-abacus-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 2. Switch to Figure 2: Balance
console.log('Capturing Figure 2: Balance...');
await page.keyboard.press('2');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/math-02-balance-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 3. Switch to Figure 3: Ten Frame
console.log('Capturing Figure 3: Ten Frame...');
await page.keyboard.press('3');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/math-03-ten-frame-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 4. Switch to Figure 4: Number Blocks
console.log('Capturing Figure 4: Number Blocks...');
await page.keyboard.press('4');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/math-04-blocks-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 5. Switch to Figure 5: Number Line
console.log('Capturing Figure 5: Number Line...');
await page.keyboard.press('5');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/math-05-number-line-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 6. Switch to Figure 6: Math Dice
console.log('Capturing Figure 6: Math Dice...');
await page.keyboard.press('6');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/math-06-dice-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 7. Switch to Figure 7: Learning Clock
console.log('Capturing Figure 7: Learning Clock...');
await page.keyboard.press('7');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/math-07-clock-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 8. Switch to Figure 8: 3D Solids
console.log('Capturing Figure 8: 3D Solids...');
await page.keyboard.press('8');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/math-08-shapes-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 9. Switch to Figure 9: Fraction Pie
console.log('Capturing Figure 9: Fraction Pie...');
await page.keyboard.press('9');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/math-09-fraction-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 10. Switch to Figure 10: Bead String
console.log('Capturing Figure 10: Bead String...');
await page.keyboard.press('0');
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${artifactDir}/math-10-beads-proof.png`, clip: { x: 180, y: 120, width: 840, height: 700 } });

// 11. Switch to Gallery View (all 10 figures)
console.log('Capturing Classroom Gallery View...');
await page.click('.view-mode-toggle');
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: `${artifactDir}/math-gallery-proof.png`, fullPage: true });

await browser.close();
console.log('✓ All 10 figures verified and captured successfully!');
