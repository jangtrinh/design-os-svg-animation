export async function seekFrame(page, time) {
  await page.evaluate(value => window.__seekToTime(value), time);
  // Let Chromium paint the authored virtual-time state before capture.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
