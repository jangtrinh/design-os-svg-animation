import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const kernel = readFileSync(path.join(ROOT, '../.agents/skills/hairline-create/kernel.js'), 'utf8');
const appJs = readFileSync(path.join(ROOT, 'playground/chemistry-app.js'), 'utf8');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hairline · Chemistry Suite</title>
<link rel="icon" href="data:,">
<style>
  :root { color-scheme: light !important; --ground: #ffffff; --ink: #232327; --muted: #6f6f78; --line: #e0e0e4; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px;
    background: var(--ground); color: var(--ink);
    font: 13px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased;
  }
  main { width: 100%; max-width: 640px; }
  .plate { position: relative; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
  .tag, .label, output, button { font: 11px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0.02em; }
  .tag { position: absolute; top: 12px; z-index: 1; color: var(--muted); pointer-events: none; }
  #name { left: 14px; }
  #read { right: 14px; color: var(--ink); font-variant-numeric: tabular-nums; }
  #stage {
    width: 100%; height: auto; aspect-ratio: 400 / 320;
    display: flex; align-items: center; justify-content: center;
    touch-action: none; cursor: grab;
  }
  #stage:active { cursor: grabbing; }
  #stage svg { width: 100%; height: 100%; display: block; }
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; margin-top: 14px; }
  .label { color: var(--muted); }
  input[type="range"] {
    flex: 1 1 96px; min-width: 0; height: 32px; margin: 0; background: transparent; cursor: pointer;
    -webkit-appearance: none; appearance: none;
  }
  input[type="range"]::-webkit-slider-runnable-track { height: 1px; background: var(--muted); }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 13px; height: 13px; margin-top: -6px; border-radius: 50%;
    border: 1px solid var(--ink); background: var(--ground);
  }
  input[type="range"]::-moz-range-track { height: 1px; background: var(--muted); }
  input[type="range"]::-moz-range-thumb { width: 11px; height: 11px; border-radius: 50%; border: 1px solid var(--ink); background: var(--ground); }
  input[type="range"]:focus-visible, button:focus-visible { outline: 1.5px solid var(--ink); outline-offset: 2px; }
  output { min-width: 4ch; text-align: right; font-variant-numeric: tabular-nums; }
  button {
    height: 32px; padding: 0 12px; border: 1px solid var(--line); border-radius: 8px;
    background: transparent; color: var(--ink); cursor: pointer;
  }
  button:hover { border-color: var(--muted); }
  #means { margin: 14px 0 0; text-wrap: pretty; }
  #rules { margin: 6px 0 0; line-height: 1.6; }
  #error { margin: 12px 0 0; padding-left: 10px; border-left: 1px solid var(--ink); }
  .top-nav-bar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--line);
  }
  .back-link, .github-link {
    display: inline-flex; align-items: center; gap: 6px;
    font: 11px/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; text-decoration: none;
    color: var(--muted); transition: color 0.15s ease;
  }
  .back-link:hover, .github-link:hover { color: var(--ink); }
  .nav-strip {
    display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 14px;
  }
  .nav-btn {
    height: 28px; padding: 0 10px; border: 1px solid var(--line); border-radius: 6px;
    background: transparent; color: var(--muted); font: 11px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }
  .nav-btn:hover { color: var(--ink); border-color: var(--muted); }
  .nav-btn.active { background: var(--ink); color: var(--ground); border-color: var(--ink); }
</style>
</head>
<body>
<main>
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
  <div class="nav-strip" id="nav-tabs" role="tablist" aria-label="Chemistry figures navigation"></div>
  <div class="plate">
    <span class="tag" id="name"></span>
    <span class="tag" id="read"></span>
    <div id="stage"></div>
  </div>
  <div class="controls">
    <button id="btn-prev" aria-label="Previous figure" title="Previous figure (←)">←</button>
    <label class="label" for="intensity">intensity</label>
    <input id="intensity" type="range" min="0" max="1" step="0.01" value="0.5">
    <output id="value" for="intensity"></output>
    <button id="btn-next" aria-label="Next figure" title="Next figure (→)">→</button>
  </div>
  <p id="means"></p>
  <p id="rules" class="label"></p>
  <p id="error" role="alert" hidden></p>
</main>
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
