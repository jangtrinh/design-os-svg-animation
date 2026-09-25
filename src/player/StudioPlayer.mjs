/**
 * StudioPlayer.mjs — Design OS Canonical Universal Studio Player Compiler
 * 
 * Compiles any motion graphic, interactive walkthrough, or short-form video
 * into a standalone, production-ready deliverable HTML file.
 * 
 * Enforces Zero Re-Implementation Invariant:
 * Every deliverable output automatically inherits standard viewport auto-scaling,
 * transport dock, keyboard navigation, Phosphor vector icons, and clean export.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getViewportConfig } from '../geometry/viewport.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSS_PATH = path.join(__dirname, 'studio-player.css');
const RUNTIME_PATH = path.join(__dirname, 'studio-player-runtime.js');

/**
 * Official Phosphor SVG symbols sprite definitions (Zero Emojis Hardrule).
 */
const PHOSPHOR_SPRITE = `
  <svg style="display: none;" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Phosphor Lock -->
      <symbol id="icon-lock" viewBox="0 0 256 256">
        <path fill="currentColor" d="M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16Zm-112-24a32 32 0 0 1 64 0v24H96ZM48 96h160v112H48Z"/>
      </symbol>
      <!-- Phosphor Sparkle -->
      <symbol id="icon-sparkle" viewBox="0 0 256 256">
        <path fill="currentColor" d="M213.66 122.34a8 8 0 0 0-11.32 0L176 148.69l-26.34-26.35a8 8 0 0 0-11.32 11.32L164.69 160l-26.35 26.34a8 8 0 0 0 11.32 11.32L176 171.31l26.34 26.35a8 8 0 0 0 11.32-11.32L187.31 160l26.35-26.34a8 8 0 0 0 0-11.32Zm-80-64a8 8 0 0 0-11.32 0L96 84.69 69.66 58.34a8 8 0 0 0-11.32 11.32L84.69 96 58.34 122.34a8 8 0 0 0 11.32 11.32L96 107.31l26.34 26.35a8 8 0 0 0 11.32-11.32L107.31 96l26.35-26.34a8 8 0 0 0 0-11.32Z"/>
      </symbol>
      <!-- Phosphor Code -->
      <symbol id="icon-code" viewBox="0 0 256 256">
        <path fill="currentColor" d="M69.66 154.34a8 8 0 0 1 0 11.32l-48 48a8 8 0 0 1-11.32-11.32L52.69 160 10.34 117.66a8 8 0 0 1 11.32-11.32Zm176-48a8 8 0 0 0-11.32 0l-48 48a8 8 0 0 0 0 11.32l48 48a8 8 0 0 0 11.32-11.32L203.31 160l42.35-42.34a8 8 0 0 0 0-11.32Zm-88-64a8 8 0 0 0-10.12 5.06l-48 144a8 8 0 0 0 15.18 5.06l48-144a8 8 0 0 0-5.06-10.12Z"/>
      </symbol>
      <!-- Phosphor Check -->
      <symbol id="icon-check" viewBox="0 0 256 256">
        <path fill="currentColor" d="M229.66 77.66a8 8 0 0 0-11.32-11.32L96 188.69l-58.34-58.35a8 8 0 0 0-11.32 11.32l64 64a8 8 0 0 0 11.32 0Z"/>
      </symbol>
      <!-- Phosphor Return -->
      <symbol id="icon-return" viewBox="0 0 256 256">
        <path fill="currentColor" d="M224 88v64a16 16 0 0 1-16 16H83.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L83.31 152H208V88a8 8 0 0 1 16 0Z"/>
      </symbol>
      <!-- Phosphor Search -->
      <symbol id="icon-search" viewBox="0 0 256 256">
        <path fill="currentColor" d="M229.66 218.34l-50.07-50.06a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32ZM40 112a72 72 0 1 1 72 72 72.08 72.08 0 0 1-72-72Z"/>
      </symbol>
      <!-- Phosphor Restart -->
      <symbol id="icon-restart" viewBox="0 0 256 256">
        <path fill="currentColor" d="M224 128a96 96 0 0 1-96 96 95.53 95.53 0 0 1-67.88-28.12L38.63 174.4A8 8 0 0 1 50 163.09l21.49 21.48A79.52 79.52 0 0 0 128 208a80 80 0 1 0-80-80 8 8 0 0 1-16 0 96 96 0 1 1 192 0Z"/>
      </symbol>
      <!-- Phosphor Fullscreen -->
      <symbol id="icon-fullscreen" viewBox="0 0 256 256">
        <path fill="currentColor" d="M216 48v40a8 8 0 0 1-16 0V56h-32a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8ZM88 200H56v-32a8 8 0 0 0-16 0v40a8 8 0 0 0 8 8h40a8 8 0 0 0 0-16Zm120-40a8 8 0 0 0-8 8v32h-32a8 8 0 0 0 0 16h40a8 8 0 0 0 8-8v-40a8 8 0 0 0-8-8ZM48 96a8 8 0 0 0 8-8V56h32a8 8 0 0 0 0-16H48a8 8 0 0 0-8 8v40a8 8 0 0 0 8 8Z"/>
      </symbol>
    </defs>
  </svg>
`;

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${tenths}`;
}

/**
 * Compiles a complete, self-contained deliverable HTML document using the Universal Studio Player.
 * 
 * @param {object} options
 * @param {string} options.title - Deliverable title
 * @param {string} options.subtitle - Optional subtitle / branding tag
 * @param {string} options.aspectKey - '16:9' | '9:16' | '1:1'
 * @param {number} options.durationSeconds - Video duration in seconds
 * @param {number} options.fps - Frame rate (default: 60)
 * @param {Array<{ id: string, name: string, startTime: number }>} options.scenes - Scene pill markers
 * @param {string} options.canvasHTML - Inner HTML contents of the video stage (scenes, layers, SVGs)
 * @param {string} options.engineScriptContent - Animation choreographing JS script (or callback)
 * @param {string} options.customStyles - Additional custom CSS
 * @param {boolean} options.inlineAssets - Whether to inline CSS and Runtime JS (default: true)
 * @returns {string} Fully self-contained HTML deliverable
 */
export function renderPlayerHTML(options = {}) {
  const {
    title = 'Design OS Motion Deliverable',
    subtitle = 'Design OS Studio Runner',
    aspectKey = '16:9',
    durationSeconds = 10.0,
    fps = 60,
    scenes = [],
    canvasHTML = '',
    engineScriptContent = '',
    customStyles = '',
    inlineAssets = true
  } = options;

  const vp = getViewportConfig(aspectKey);
  const nativeWidth = vp.width;
  const nativeHeight = vp.height;

  // Frame sizing style
  let frameStyle = '';
  if (aspectKey === '16:9') {
    frameStyle = 'width: min(1120px, calc((100vh - 200px) * 16 / 9), calc(100vw - 48px)); aspect-ratio: 16/9;';
  } else if (aspectKey === '9:16') {
    frameStyle = 'width: min(480px, calc((100vh - 200px) * 9 / 16), calc(100vw - 48px)); aspect-ratio: 9/16;';
  } else {
    frameStyle = 'width: min(720px, calc(100vh - 200px), calc(100vw - 48px)); aspect-ratio: 1/1;';
  }

  const cssContent = inlineAssets ? fs.readFileSync(CSS_PATH, 'utf-8') : '';
  const runtimeContent = inlineAssets ? fs.readFileSync(RUNTIME_PATH, 'utf-8') : '';

  // Render Scene Pills
  const scenePillsHTML = scenes.map((s, idx) => {
    const activeClass = idx === 0 ? 'active' : '';
    return `<button class="studio-scene-pill ${activeClass}" data-seek="${s.startTime}" data-name="${s.name}">${s.id || `S${idx + 1}`}</button>`;
  }).join('\n          ');

  const initialSceneName = scenes[0]?.name || 'Scene 1: Introduction';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  ${inlineAssets ? `<style>\n${cssContent}\n${customStyles}\n</style>` : `<link rel="stylesheet" href="studio-player.css">`}
</head>
<body class="studio-body">

  ${PHOSPHOR_SPRITE}

  <!-- Studio Topbar -->
  <header class="studio-topbar">
    <div class="studio-brand-group">
      <div class="studio-logo">
        <svg viewBox="0 0 256 256" style="color: var(--studio-accent);"><use href="#icon-sparkle"></use></svg>
        <span>${title}</span>
      </div>
      <span class="studio-meta-tag">${nativeWidth} × ${nativeHeight} · ${fps}fps · ${formatDuration(durationSeconds)}</span>
    </div>

    <div class="studio-top-actions">
      <div class="studio-speed-group">
        <button class="studio-speed-btn active" data-speed="1">1x</button>
        <button class="studio-speed-btn" data-speed="2">2x</button>
        <button class="studio-speed-btn" data-speed="4">4x</button>
      </div>
      <button class="studio-action-btn primary" onclick="alert('Ready for export: append ?clean=true to render at native 60fps')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>
        <span>Export MP4</span>
      </button>
    </div>
  </header>

  <!-- Master Studio Stage Container -->
  <main class="studio-stage-container">
    <div id="video-stage-frame" class="studio-stage-frame" style="${frameStyle}">
      <div class="video-stage-wrapper">
        <div id="video-stage" class="video-stage"
             data-native-width="${nativeWidth}"
             data-native-height="${nativeHeight}"
             data-duration="${durationSeconds}"
             data-fps="${fps}"
             style="width: ${nativeWidth}px; height: ${nativeHeight}px;">
          ${canvasHTML}
        </div>
      </div>
    </div>

    <!-- Transport Controls Dock -->
    <div class="studio-transport-bar">
      <div class="studio-transport-row">
        <div class="studio-transport-left">
          <button id="studio-btn-restart" class="studio-icon-button" title="Restart (Home)">
            <svg viewBox="0 0 256 256" width="14" height="14"><use href="#icon-restart"></use></svg>
          </button>
          <button id="studio-btn-play" class="studio-icon-button primary" title="Play/Pause (Space)">
            <span id="studio-play-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </span>
          </button>
          <div class="studio-timecode">
            <span id="studio-timecode-display"><strong>00:00.0</strong> / ${formatDuration(durationSeconds)}</span>
          </div>
        </div>

        <div class="studio-scrubber-lane">
          <input type="range" id="studio-video-scrubber" class="studio-scrubber" min="0" max="${durationSeconds}" step="0.05" value="0" aria-label="Scrub video">
        </div>

        <div class="studio-transport-right">
          <button id="studio-btn-fullscreen" class="studio-icon-button" title="Toggle Fullscreen (F)">
            <svg viewBox="0 0 256 256" width="14" height="14"><use href="#icon-fullscreen"></use></svg>
          </button>
        </div>
      </div>

      ${scenes.length > 0 ? `
      <div class="studio-scenes-row">
        <div class="studio-scene-pills">
          ${scenePillsHTML}
        </div>
        <span id="studio-scene-name" class="studio-scene-name">${initialSceneName}</span>
      </div>` : ''}
    </div>
  </main>

  <!-- Canonical Studio Player Runtime -->
  ${inlineAssets ? `<script>\n${runtimeContent}\n</script>` : `<script src="studio-player-runtime.js"></script>`}

  <!-- Animation Choreography Engine -->
  <script>
    ${engineScriptContent}
  </script>
</body>
</html>
`;
}
