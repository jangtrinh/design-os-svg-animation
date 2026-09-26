#!/usr/bin/env node
/**
 * export-player-deliverable.mjs — Design OS Universal Deliverable Compiler CLI
 * 
 * Pipeline tool to compile any motion recipe or animation specification
 * into a production deliverable using the canonical Universal Studio Player.
 * 
 * Usage:
 *   node scripts/export-player-deliverable.mjs --out promo/my-deliverable.html
 *   node scripts/export-player-deliverable.mjs --spec path/to/spec.json --out dist/output.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderPlayerHTML } from '../src/player/StudioPlayer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Simple CLI arg parser
const args = process.argv.slice(2);
let outPath = path.join(ROOT_DIR, 'promo', 'samples/sample-deliverable.html');
let specPath = null;
let title = 'Design OS Universal Deliverable';
let aspectKey = '16:9';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out' && args[i + 1]) {
    outPath = path.resolve(process.cwd(), args[i + 1]);
    i++;
  } else if (args[i] === '--spec' && args[i + 1]) {
    specPath = path.resolve(process.cwd(), args[i + 1]);
    i++;
  } else if (args[i] === '--title' && args[i + 1]) {
    title = args[i + 1];
    i++;
  } else if (args[i] === '--aspect' && args[i + 1]) {
    aspectKey = args[i + 1];
    i++;
  }
}

let deliverableOptions = {
  title,
  subtitle: 'Official Pipeline Deliverable',
  aspectKey,
  durationSeconds: 15.0,
  fps: 60,
  scenes: [
    { id: 'S1', name: 'Scene 1: Introduction & Contract', startTime: 0.0 },
    { id: 'S2', name: 'Scene 2: Core Walkthrough', startTime: 5.0 },
    { id: 'S3', name: 'Scene 3: Conversion Outro', startTime: 11.0 }
  ],
  canvasHTML: `
    <!-- Scene 1: Hero Card -->
    <div id="scene-s1" class="scene-layer active" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse at 20% 20%, #F5F7FB 0%, #EAEFF6 50%, #DEE4EE 100%);">
      <div style="background: #FFFFFF; padding: 48px 64px; border-radius: 20px; box-shadow: 0 35px 100px rgba(0,0,0,0.12); text-align: center; border: 1px solid rgba(0,0,0,0.08); max-width: 960px;">
        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 99px; background: rgba(0, 122, 255, 0.08); color: #007AFF; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
          <svg viewBox="0 0 256 256" width="14" height="14" fill="currentColor"><use href="#icon-sparkle"></use></svg>
          CANONICAL STUDIO PLAYER DELIVERABLE
        </span>
        <h1 style="font-size: 42px; font-weight: 800; color: #0D0D0D; margin-bottom: 16px; letter-spacing: -0.02em;">
          Zero Re-Implementation Invariant
        </h1>
        <p style="font-size: 18px; color: #52525B; line-height: 1.6;">
          This deliverable was compiled directly by the Design OS pipeline.<br>
          Viewport auto-scaling, transport dock, and keyboard navigation are 100% standardized.
        </p>
      </div>
    </div>
  `,
  engineScriptContent: `
    // Standalone Animation Choreographer Hook
    window.__onRenderFrame = function(frameIndex, timeSeconds) {
      // Custom animation hooks can be declared here
    };
  `
};

if (specPath && fs.existsSync(specPath)) {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
  deliverableOptions = { ...deliverableOptions, ...spec };
}

const html = renderPlayerHTML(deliverableOptions);

const outDir = path.dirname(outPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outPath, html, 'utf-8');

console.log('='.repeat(70));
console.log(' 🚀 DESIGN OS UNIVERSAL DELIVERABLE COMPILED SUCCESSFULLY');
console.log('='.repeat(70));
console.log(` 📄 Output:      ${outPath}`);
console.log(` 📐 Aspect:      ${deliverableOptions.aspectKey}`);
console.log(` ⏱️ Duration:    ${deliverableOptions.durationSeconds}s @ ${deliverableOptions.fps}fps`);
console.log(` 🎬 Scenes:      ${deliverableOptions.scenes.length}`);
console.log('='.repeat(70));
