import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const kernel = readFileSync(path.join(ROOT, '../.agents/skills/hairline-create/kernel.js'), 'utf8');
const appJs = readFileSync(path.join(ROOT, 'playground/math-grade1-app.js'), 'utf8');

const html = `<!doctype html>
<html lang="vi" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DESIGN:OS · Toán Học Lớp 1 (Grade 1 Elementary Math)</title>
<link rel="icon" href="data:,">
<style>
  :root {
    color-scheme: light !important;
    --ground: #ffffff;
    --ink: #232327;
    --muted: #6f6f78;
    --line: #e0e0e4;
    --accent: #111113;
    --card-bg: #fafafa;
    --pill-bg: #f4f4f6;
    --pill-active: #232327;
    --pill-text-active: #ffffff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh;
    background: var(--ground); color: var(--ink);
    font: 13px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    padding: 32px 20px 60px;
    display: flex; flex-direction: column; align-items: center;
  }
  header { width: 100%; max-width: 840px; margin-bottom: 24px; text-align: left; }
  .top-nav-bar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--line);
  }
  .back-link, .github-link {
    display: inline-flex; align-items: center; gap: 6px;
    font: 11px/1.2 ui-monospace, monospace; text-decoration: none;
    color: var(--muted); transition: color 0.15s ease;
  }
  .back-link:hover, .github-link:hover { color: var(--ink); }
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    font: 10px/1 ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.08em;
    padding: 4px 8px; border-radius: 4px; background: #eef0f4; color: var(--ink);
    border: 1px solid var(--line); margin-bottom: 10px;
  }
  h1 { font-size: 20px; font-weight: 600; margin: 0 0 6px; letter-spacing: -0.01em; }
  .subtitle { color: var(--muted); font-size: 13px; margin: 0; }

  /* Navigation Pills */
  .nav-strip {
    width: 100%; max-width: 840px; display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;
  }
  .nav-btn {
    font: 11px/1.2 ui-monospace, monospace; padding: 6px 12px; border-radius: 6px;
    border: 1px solid var(--line); background: var(--pill-bg); color: var(--ink);
    cursor: pointer; transition: all 0.15s ease;
  }
  .nav-btn:hover { background: #e8e8ec; }
  .nav-btn.active {
    background: var(--pill-active); color: var(--pill-text-active); border-color: var(--pill-active);
  }
  .view-mode-toggle {
    margin-left: auto; background: #ffffff; font-weight: 500;
  }

  /* Stage Container */
  .main-stage-wrapper {
    width: 100%; max-width: 840px; display: flex; flex-direction: column; gap: 16px;
  }
  .plate {
    position: relative; border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
    background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }
  .tag {
    position: absolute; top: 12px; z-index: 2; color: var(--muted); pointer-events: none;
    font: 11px/1 ui-monospace, monospace;
  }
  #name { left: 16px; font-weight: 600; color: var(--ink); }
  #read { right: 16px; color: var(--ink); font-variant-numeric: tabular-nums; }
  #stage { aspect-ratio: 400 / 320; width: 100%; display: block; }
  #stage svg { width: 100%; height: 100%; display: block; }

  /* Controls */
  .controls {
    display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
    padding: 12px 16px; background: var(--card-bg); border: 1px solid var(--line); border-radius: 8px;
  }
  .label { font: 11px/1 ui-monospace, monospace; color: var(--muted); }
  input[type="range"] {
    flex: 1 1 120px; min-width: 0; height: 28px; margin: 0; background: transparent; cursor: pointer;
    -webkit-appearance: none; appearance: none;
  }
  input[type="range"]::-webkit-slider-runnable-track { height: 1px; background: var(--muted); }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 13px; height: 13px; margin-top: -6px; border-radius: 50%;
    border: 1px solid var(--ink); background: var(--ground);
  }
  input[type="range"]:focus-visible, button:focus-visible { outline: 1.5px solid var(--ink); outline-offset: 2px; }
  output { font: 11px/1 ui-monospace, monospace; min-width: 4ch; text-align: right; font-variant-numeric: tabular-nums; }
  .btn-nav {
    height: 28px; padding: 0 10px; border: 1px solid var(--line); border-radius: 6px;
    background: #ffffff; color: var(--ink); font: 11px/1 ui-monospace, monospace; cursor: pointer;
  }
  .btn-nav:hover { background: #f0f0f4; }

  .meta-box {
    margin-top: 4px; padding: 14px 18px; border: 1px solid var(--line); border-radius: 8px;
    background: #ffffff;
  }
  .meta-title { font-size: 13px; font-weight: 600; margin: 0 0 4px; }
  .meta-desc { font-size: 12px; color: var(--muted); margin: 0; line-height: 1.5; }
  .meta-rule { font: 11px/1 ui-monospace, monospace; color: var(--muted); margin-top: 8px; }

  /* Gallery Grid View */
  #gallery-view {
    width: 100%; max-width: 840px; display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px; margin-top: 8px;
  }
  .grid-card {
    border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: #ffffff;
    display: flex; flex-direction: column; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .grid-card:hover {
    transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: #c0c0c6;
  }
  .grid-stage { aspect-ratio: 400 / 300; width: 100%; background: #ffffff; }
  .grid-stage svg { width: 100%; height: 100%; display: block; }
  .grid-meta { padding: 12px 14px; border-top: 1px solid var(--line); background: var(--card-bg); }
  .grid-name { font-weight: 600; font-size: 12px; margin: 0 0 2px; }
  .grid-desc { font-size: 11px; color: var(--muted); margin: 0; }

  [hidden] { display: none !important; }
</style>
</head>
<body>

<header>
  <div class="top-nav-bar">
    <a href="../index.html" class="back-link">
      <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>
      <span>design-os-svg-animation (Parent GitHub Page)</span>
    </a>
    <a href="https://github.com/jangtrinh/design-os-svg-animation" class="github-link" target="_blank" rel="noopener">
      <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,16,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40h16v16a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V200a40,40,0,0,0-8-24.53A56.06,56.06,0,0,0,200,120v-8A58.14,58.14,0,0,0,208.31,75.68Z"/></svg>
      <span>GitHub Repo</span>
    </a>
  </div>
  <div class="badge">DESIGN:OS · HAIRLINE KINEMATICS</div>
  <h1>Toán Học Lớp 1 — 10 Hình Tương Tác 2:1 Isometric</h1>
  <p class="subtitle">Bộ sưu tập mô hình tương tác trục đo 2:1 minh họa các khái niệm toán học nền tảng: đếm hạt, so sánh cân bằng, khung 10 ô, trục số, hình khối và phân số.</p>
</header>

<nav class="nav-strip" id="nav-tabs" aria-label="Danh mục 10 hình toán học">
  <!-- Dynamic buttons inserted here -->
</nav>

<!-- Single Figure Focus Mode -->
<div class="main-stage-wrapper" id="single-view">
  <div class="plate">
    <span class="tag" id="name"></span>
    <span class="tag" id="read"></span>
    <div id="stage"></div>
  </div>
  <div class="controls">
    <button class="btn-nav" id="btn-prev" aria-label="Hình trước">&larr; Trước</button>
    <label class="label" for="intensity">intensity</label>
    <input id="intensity" type="range" min="0" max="1" step="0.01" value="0.5">
    <output id="value" for="intensity">0.5</output>
    <button class="btn-nav" id="btn-next" aria-label="Hình kế tiếp">Kế tiếp &rarr;</button>
  </div>
  <div class="meta-box">
    <div class="meta-title" id="meta-title"></div>
    <p class="meta-desc" id="meta-desc"></p>
    <div class="meta-rule" id="meta-rule"></div>
  </div>
</div>

<!-- All Figures Gallery Mode -->
<div id="gallery-view" hidden>
  <!-- 10 figure cards rendered here -->
</div>

<script id="hl-kernel">
` + kernel + `
</script>

<script>
` + appJs + `
</script>
</body>
</html>
`;

writeFileSync(path.join(ROOT, 'playground/math-grade1.html'), html);
writeFileSync(path.join(ROOT, 'docs/playground/math-grade1.html'), html);
console.log('✓ Successfully generated playground/math-grade1.html & docs/playground/math-grade1.html');
