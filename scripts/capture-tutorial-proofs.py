#!/usr/bin/env python3
"""
capture-tutorial-proofs.py — Automated Visual Evidence Capture for Design OS Tutorial Video
Captures keyframes using Google Chrome Headless at 1920x1080 native resolution.
Generates an 8-panel contact sheet and saves image artifacts to the agent artifact directory.
"""

import os
import sys
import subprocess
import time
from pathlib import Path
from PIL import Image

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ARTIFACTS_DIR = "/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3"
ROOT_DIR = Path(__file__).resolve().parent.parent
TUTORIAL_HTML = str(ROOT_DIR / "promo" / "design-os-tutorial/design-os-tutorial.html")

FRAMES = [
    ("tutorial_beat1_hook.png", 1.2, "Beat 1: Instant Hook & Kinetic Text"),
    ("tutorial_beat2_diagram_flow.png", 5.0, "Beat 2: Declarative Pipeline Diagram Flow"),
    ("tutorial_beat3_app_window.png", 9.5, "Beat 3: macOS Sonoma AppFrame Studio View"),
    ("tutorial_beat3_concentric_click.png", 11.3, "Beat 3: Concentric Cursor Click (Δ=0.0px)"),
    ("tutorial_beat3_callout_badge.png", 13.0, "Beat 3: Non-Occluding Callout Badge"),
    ("tutorial_beat4_waveform_sync.png", 18.0, "Beat 4: Audio PCM Waveform Equalizer"),
    ("tutorial_beat5_multi_aspect.png", 23.0, "Beat 5: Multi-Aspect Safe Zones (16:9, 9:16, 1:1)"),
    ("tutorial_beat6_outro_cta.png", 26.5, "Beat 6: Conversion Outro & Brand Lockup")
]

def capture_frame(filename, t_sec, label):
    target_path = os.path.join(ARTIFACTS_DIR, filename)
    if os.path.exists(target_path):
        try: os.remove(target_path)
        except: pass

    user_data = f"/tmp/chrome_tutorial_{int(time.time()*1000)%10000}"
    url = f"file://{TUTORIAL_HTML}?clean=true"

    # Start headless Chrome and evaluate window.__seekToTime(t)
    script = f"window.__seekToTime({t_sec});"
    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        f"--user-data-dir={user_data}",
        "--window-size=1920,1080",
        "--virtual-time-budget=1500",
        "--run-all-compositor-stages-before-draw",
        f"--screenshot={target_path}",
        f"file://{TUTORIAL_HTML}?clean=true"
    ]

    # For accurate seek, we can use a temporary file or node script with puppeteer
    return target_path

def main():
    print("🎬 Capturing 8 Keyframes for Design OS Tutorial Video...")
    # Use a small node script with puppeteer-core for 100% deterministic time seeking
    runner_script = ROOT_DIR / "scripts" / "capture-tutorial-frames.mjs"
    runner_code = """
import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACTS_DIR = '/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3';
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const FRAMES = [
  ['tutorial_beat1_hook.png', 1.2],
  ['tutorial_beat2_diagram_flow.png', 5.0],
  ['tutorial_beat3_app_window.png', 9.5],
  ['tutorial_beat3_concentric_click.png', 11.3],
  ['tutorial_beat3_callout_badge.png', 13.0],
  ['tutorial_beat4_waveform_sync.png', 18.0],
  ['tutorial_beat5_multi_aspect.png', 23.0],
  ['tutorial_beat6_outro_cta.png', 26.5]
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_BIN,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  const htmlPath = path.join(ROOT_DIR, 'promo', 'design-os-tutorial/design-os-tutorial.html');
  await page.goto(`file://${htmlPath}?clean=true`, { waitUntil: 'networkidle0' });

  for (const [filename, timeSec] of FRAMES) {
    await page.evaluate((t) => {
      window.__seekToTime(t);
    }, timeSec);
    await new Promise(r => setTimeout(r, 80)); // Allow render stage flush
    const outPath = path.join(ARTIFACTS_DIR, filename);
    await page.screenshot({ path: outPath });
    console.log(`✓ Captured ${filename} at t=${timeSec}s`);
  }

  await browser.close();
}

run().catch(console.error);
"""
    runner_script.write_text(runner_code, encoding="utf-8")

    subprocess.run(["node", str(runner_script)], check=True)

    # Now create Contact Sheet using PIL
    print("📸 Stitching 8-panel Contact Sheet...")
    images = []
    for filename, _, _ in FRAMES:
        p = os.path.join(ARTIFACTS_DIR, filename)
        if os.path.exists(p):
            images.append(Image.open(p))

    if len(images) == 8:
        # 4 columns, 2 rows
        thumb_w, thumb_h = 480, 270
        sheet = Image.new("RGB", (thumb_w * 4, thumb_h * 2), (10, 12, 18))
        for idx, img in enumerate(images):
            col = idx % 4
            row = idx // 4
            resized = img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            sheet.paste(resized, (col * thumb_w, row * thumb_h))

        contact_path = os.path.join(ARTIFACTS_DIR, "proof_tutorial_contact_sheet.jpg")
        sheet.save(contact_path, quality=92)
        print(f"✅ Contact sheet saved: {contact_path}")

if __name__ == "__main__":
    main()
