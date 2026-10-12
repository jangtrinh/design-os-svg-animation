import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const kernel = readFileSync(path.join(ROOT, '../.agents/skills/hairline-create/kernel.js'), 'utf8');
const appJs = readFileSync(path.join(ROOT, 'playground/chemistry-app.js'), 'utf8');

const html = `<!doctype html>
<html lang="vi" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DESIGN:OS · Hóa Học Thực Nghiệm (Interactive Chemistry Suite)</title>
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
  [hidden] { display: none !important; }
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
    position: absolute; top: 12px;
    font: 10px/1 ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--muted); background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(4px);
    padding: 3px 6px; border-radius: 4px; border: 1px solid var(--line); z-index: 2;
  }
  #name { left: 12px; }
  #read { right: 12px; text-transform: none; font-size: 11px; }

  #stage {
    width: 100%; height: auto; aspect-ratio: 400 / 320;
    display: flex; align-items: center; justify-content: center;
    touch-action: none; cursor: grab;
  }
  #stage:active { cursor: grabbing; }
  #stage svg { width: 100%; height: 100%; display: block; }

  /* Controls */
  .controls {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--card-bg);
  }
  .label { font: 11px/1 ui-monospace, monospace; text-transform: uppercase; color: var(--muted); }
  input[type="range"] {
    flex: 1; accent-color: var(--ink); cursor: pointer;
  }
  output {
    font: 11px/1 ui-monospace, monospace; min-width: 48px; text-align: right; color: var(--ink);
  }

  /* Metadata description */
  .meta-box {
    padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff;
  }
  .meta-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .meta-desc { font-size: 12px; color: var(--muted); margin: 0 0 8px; line-height: 1.6; }
  .meta-rule { font: 11px/1.4 ui-monospace, monospace; color: #8e8e93; }

  /* Gallery Mode Grid */
  #gallery-view {
    width: 100%; max-width: 840px;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;
  }
  .grid-card {
    border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: #ffffff;
    cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .grid-card:hover {
    transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  .grid-stage {
    width: 100%; aspect-ratio: 400 / 320; background: #fafafa;
    border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: center;
  }
  .grid-stage svg { width: 100%; height: 100%; display: block; }
  .grid-meta { padding: 12px; }
  .grid-name { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .grid-desc { font-size: 11px; color: var(--muted); line-height: 1.4; margin-bottom: 6px; }
  .grid-read { font: 10px/1.3 ui-monospace, monospace; color: #007aff; }
</style>
</head>
<body>
<header>
  <div class="top-nav-bar">
    <a href="../index.html" class="back-link">
      <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>
      <span>&larr; Trang Chủ (Overview)</span>
    </a>
    <a href="https://github.com/jangtrinh/design-os-svg-animation" class="github-link" target="_blank" rel="noopener">
      <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,16,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40h16v16a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V200a40,40,0,0,0-8-24.53A56.06,56.06,0,0,0,200,120v-8A58.14,58.14,0,0,0,208.31,75.68Z"/></svg>
      <span>GitHub Repo</span>
    </a>
  </div>
  <div class="badge">DESIGN:OS · HAIRLINE KINEMATICS</div>
  <h1>Hóa Học — 5 Mô Hình Thực Nghiệm 2:1 Axonometric</h1>
  <p class="subtitle">Bộ sưu tập 5 mô hình hóa học tương tác trục đo 2:1 minh họa các quy trình và cấu trúc thực nghiệm nền tảng: chuẩn độ axit-bazơ buret, phản ứng nhiệt phân đèn cồn, mạng tinh thể lập phương NaCl, chưng cất ngưng tụ ống sinh hàn Liebig, và thang đo nồng độ pH que thử quỳ tím.</p>
</header>

<nav class="nav-strip" id="nav-tabs" aria-label="Danh mục 5 mô hình hóa học">
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
    <label class="label" for="intensity">intensity</label>
    <input id="intensity" type="range" min="0" max="1" step="0.01" value="0.5">
    <output id="value" for="intensity">0.5</output>
  </div>
  <div class="meta-box">
    <div class="meta-title" id="meta-title"></div>
    <p class="meta-desc" id="meta-desc"></p>
    <div class="meta-rule" id="meta-rule"></div>
  </div>
</div>

<!-- All Figures Gallery Mode -->
<div id="gallery-view" hidden>
  <!-- 5 figure cards rendered here -->
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

writeFileSync(path.join(ROOT, 'playground/chemistry.html'), html);
writeFileSync(path.join(ROOT, 'docs/playground/chemistry.html'), html);
console.log('✓ Successfully generated playground/chemistry.html & docs/playground/chemistry.html');
