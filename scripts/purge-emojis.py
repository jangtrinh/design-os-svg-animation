#!/usr/bin/env python3
"""
purge-emojis.py — Replaces all raw Unicode emojis in claude-design-promo.html
with certified, lightweight Phosphor SVG icons and clean SVG symbols.
Enforces the Zero-Emoji hardrule.
"""

import re
from pathlib import Path

PROMO_HTML = Path("/Users/jang/Products/design-os-svg-animation/promo/claude-design-promo.html")
PROMO_CSS = Path("/Users/jang/Products/design-os-svg-animation/promo/claude-design.css")

REPLACEMENTS = [
    # General symbols
    ("<span>🎛 Knobs</span>", '<span><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M180,128a36,36,0,1,0-48,33.94V216a12,12,0,0,0,24,0V161.94A36.08,36.08,0,0,0,180,128Zm-36,12a12,12,0,1,1,12-12A12,12,0,0,1,144,140ZM76,94.06V40a12,12,0,0,0-24,0V94.06a36,36,0,1,0,24,0ZM64,140a12,12,0,1,1,12-12A12,12,0,0,1,64,140Zm144-12a36.08,36.08,0,0,0-24-33.94V40a12,12,0,0,0-24,0V94.06a36,36,0,1,0,48,33.94ZM184,140a12,12,0,1,1,12-12A12,12,0,0,1,184,140ZM100,40a12,12,0,0,0-24,0v4a12,12,0,0,0,24,0Zm120,120a12,12,0,0,0-12,12v44a12,12,0,0,0,24,0V172A12,12,0,0,0,220,160Z"/></svg> Knobs</span>'),
    ("<button class=\"tool-btn\">🎛 Knobs</button>", '<button class="tool-btn"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M180,128a36,36,0,1,0-48,33.94V216a12,12,0,0,0,24,0V161.94A36.08,36.08,0,0,0,180,128Zm-36,12a12,12,0,1,1,12-12A12,12,0,0,1,144,140ZM76,94.06V40a12,12,0,0,0-24,0V94.06a36,36,0,1,0,24,0ZM64,140a12,12,0,1,1,12-12A12,12,0,0,1,64,140Zm144-12a36.08,36.08,0,0,0-24-33.94V40a12,12,0,0,0-24,0V94.06a36,36,0,1,0,48,33.94ZM184,140a12,12,0,1,1,12-12A12,12,0,0,1,184,140ZM100,40a12,12,0,0,0-24,0v4a12,12,0,0,0,24,0Zm120,120a12,12,0,0,0-12,12v44a12,12,0,0,0,24,0V172A12,12,0,0,0,220,160Z"/></svg> Knobs</button>'),
    ('<button class="tool-btn highlight" id="s4-knobs-btn">🎛 Knobs</button>', '<button class="tool-btn highlight" id="s4-knobs-btn"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M180,128a36,36,0,1,0-48,33.94V216a12,12,0,0,0,24,0V161.94A36.08,36.08,0,0,0,180,128Zm-36,12a12,12,0,1,1,12-12A12,12,0,0,1,144,140ZM76,94.06V40a12,12,0,0,0-24,0V94.06a36,36,0,1,0,24,0ZM64,140a12,12,0,1,1,12-12A12,12,0,0,1,64,140Zm144-12a36.08,36.08,0,0,0-24-33.94V40a12,12,0,0,0-24,0V94.06a36,36,0,1,0,48,33.94ZM184,140a12,12,0,1,1,12-12A12,12,0,0,1,184,140ZM100,40a12,12,0,0,0-24,0v4a12,12,0,0,0,24,0Zm120,120a12,12,0,0,0-12,12v44a12,12,0,0,0,24,0V172A12,12,0,0,0,220,160Z"/></svg> Knobs</button>'),
    ("<span>✎ Draw</span>", '<span><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M227.31,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.31,64l24-24L216,84.69Z"/></svg> Draw</span>'),
    ('<button class="tool-btn">✎ Draw</button>', '<button class="tool-btn"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M227.31,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.31,64l24-24L216,84.69Z"/></svg> Draw</button>'),
    ('<button class="icon-btn">⛶</button>', '<button class="icon-btn"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M216,48V88a8,8,0,0,1-16,0V56H168a8,8,0,0,1,0-16h40A8,8,0,0,1,216,48ZM88,200H56V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H88a8,8,0,0,0,0-16Zm120-40a8,8,0,0,0-8,8v32H168a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,208,160ZM48,96a8,8,0,0,0,8-8V56H88a8,8,0,0,0,0-16H48a8,8,0,0,0-8,8V88A8,8,0,0,0,48,96Z"/></svg></button>'),
    ('<span class="capsule-icon">📖</span>', '<span class="capsule-icon"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,192V64H216v128H40Z"/></svg></span>'),
    ('<span class="capsule-icon">⛉</span>', '<span class="capsule-icon"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM192,120H64V72H192v48Z"/></svg></span>'),
    ('<span class="capsule-icon">📄</span>', '<span class="capsule-icon"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/></svg></span>'),
    ('<div class="tool-capsule"><span>📖 Read, Write ×3</span></div>', '<div class="tool-capsule"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,192V64H216v128H40Z"/></svg> <span>Read, Write ×3</span></div>'),
    ('<div class="tool-capsule"><span>⛉ Plan</span></div>', '<div class="tool-capsule"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM192,120H64V72H192v48Z"/></svg> <span>Plan</span></div>'),
    ('<div class="tool-capsule"><span>📄 write_file</span></div>', '<div class="tool-capsule"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/></svg> <span>write_file</span></div>'),
    ('<span class="pill-icon">🖼</span>', '<span class="pill-icon"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V157.38l-40.69-40.69a16,16,0,0,0-22.62,0L96,173.37l-18.69-18.68a16,16,0,0,0-22.62,0L40,169.37ZM216,200H40v-8.49l25.37-25.37,18.69,18.68a16,16,0,0,0,22.62,0L163.37,128,216,180.63V200Z"/></svg></span>'),
    ('<span class="pill-icon">⚡</span>', '<span class="pill-icon"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M215.79,118.17a8,8,0,0,0-7.79-6.17H144V40a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,5.66,13.66H104v72a8,8,0,0,0,13.66,5.66l96-96A8,8,0,0,0,215.79,118.17Z"/></svg></span>'),
    ('<div class="artifact-pill"><span>🖼 player.jsx</span></div>', '<div class="artifact-pill"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V157.38l-40.69-40.69a16,16,0,0,0-22.62,0L96,173.37l-18.69-18.68a16,16,0,0,0-22.62,0L40,169.37ZM216,200H40v-8.49l25.37-25.37,18.69,18.68a16,16,0,0,0,22.62,0L163.37,128,216,180.63V200Z"/></svg> <span>player.jsx</span></div>'),
    ('<div class="artifact-pill"><span>🖼 profile.jsx</span></div>', '<div class="artifact-pill"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V157.38l-40.69-40.69a16,16,0,0,0-22.62,0L96,173.37l-18.69-18.68a16,16,0,0,0-22.62,0L40,169.37ZM216,200H40v-8.49l25.37-25.37,18.69,18.68a16,16,0,0,0,22.62,0L163.37,128,216,180.63V200Z"/></svg> <span>profile.jsx</span></div>'),
    ('<div class="artifact-pill"><span>⚡ Verifier</span></div>', '<div class="artifact-pill"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M215.79,118.17a8,8,0,0,0-7.79-6.17H144V40a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,5.66,13.66H104v72a8,8,0,0,0,13.66,5.66l96-96A8,8,0,0,0,215.79,118.17Z"/></svg> <span>Verifier</span></div>'),
    ("<span>⚙</span><span>⸬</span><span>📎</span><span>🖊</span>", '<svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Z"/></svg> <svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M209.66,122.34a8,8,0,0,0-11.32,0L108.69,212a40,40,0,0,1-56.57-56.57L141.77,65.81a24,24,0,0,1,33.94,33.94l-89.65,89.66a8,8,0,0,1-11.32-11.32L164.39,88.43a8,8,0,0,0-11.32-11.32L63.42,166.76a24,24,0,0,0,33.94,33.94l89.65-89.66a40,40,0,0,0-56.57-56.57L40.8,144.12A56,56,0,0,0,120,223.32l89.66-89.66A8,8,0,0,0,209.66,122.34Z"/></svg>'),
    ('<button class="tool-btn" id="s3-comment-tool-btn">💬 Comment</button>', '<button class="tool-btn" id="s3-comment-tool-btn"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M216,48H40A16,16,0,0,0,24,64V192a16,16,0,0,0,16,16h40v32a8,8,0,0,0,13.66,5.66L145.66,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48Z"/></svg> Comment</button>'),
    ('<button class="tool-btn">💬 Comment</button>', '<button class="tool-btn"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M216,48H40A16,16,0,0,0,24,64V192a16,16,0,0,0,16,16h40v32a8,8,0,0,0,13.66,5.66L145.66,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48Z"/></svg> Comment</button>'),
    ('<span class="heart-sym">♡</span>', '<span class="heart-sym"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,203.44,32,150.77,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0C142.22,66.36,158.55,56,178,56a46.06,46.06,0,0,1,46,46C224,150.77,146.26,203.44,128,214.8Z"/></svg></span>'),
    ('<span class="track-type">🔊 Soundscape</span>', '<span class="track-type"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81Z"/></svg> Soundscape</span>'),
    ('<div class="photo-overlay-tag" id="s4-photo-tag">🌲 Big Sur Redwood Path</div>', '<div class="photo-overlay-tag" id="s4-photo-tag"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M229.66,165.66l-48-48A8,8,0,0,0,168,123.31V96a8,8,0,0,0-13.66-5.66L136,108.69V48a8,8,0,0,0-13.66-5.66l-80,80A8,8,0,0,0,48,136H64v24H48a8,8,0,0,0-5.66,13.66l80,80A8,8,0,0,0,136,248V200h24v24a8,8,0,0,0,13.66,5.66l56-56A8,8,0,0,0,229.66,165.66Z"/></svg> Big Sur Redwood Path</div>'),
    ('<span>🌲 hemlark</span>', '<span>hemlark</span>'),
    ('<div class="chat-bubble-user">Turn these notes into a branded deck<br>📄 launch.doc</div>', '<div class="chat-bubble-user">Turn these notes into a branded deck<br><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/></svg> launch.doc</div>'),
    ('<div class="export-item"><span class="item-icon">📄</span> Export as PDF</div>', '<div class="export-item"><span class="item-icon"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34Z"/></svg></span> Export as PDF</div>'),
    ('<div class="export-item"><span class="item-icon">📄</span> Export as PPTX</div>', '<div class="export-item"><span class="item-icon"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34Z"/></svg></span> Export as PPTX</div>'),
    ('<div class="export-item"><span class="item-icon">📄</span> Export as standalone HTML</div>', '<div class="export-item"><span class="item-icon"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Z"/></svg></span> Export as standalone HTML</div>'),
    ('<div class="cli-icon-bolt">⚡</div>', '<div class="cli-icon-bolt"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M215.79,118.17a8,8,0,0,0-7.79-6.17H144V40a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,5.66,13.66H104v72a8,8,0,0,0,13.66,5.66l96-96A8,8,0,0,0,215.79,118.17Z"/></svg></div>'),
    ('<span class="copy-btn-icon">📋</span>', '<span class="copy-btn-icon"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M216,40H88A16,16,0,0,0,72,56V72H56A16,16,0,0,0,40,88V216a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM184,216H56V88H184Zm32-32H200V88a16,16,0,0,0-16-16H88V56H216Z"/></svg></span>'),
    ('<span class="check-box">✓</span>', '<span class="check-box"><svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"/></svg></span>')
]

content = PROMO_HTML.read_text(encoding="utf-8")
for old, new in REPLACEMENTS:
    content = content.replace(old, new)
PROMO_HTML.write_text(content, encoding="utf-8")

# Add .ph-icon CSS rule to claude-design.css if not present
css_content = PROMO_CSS.read_text(encoding="utf-8")
if ".ph-icon" not in css_content:
    ph_css = """
/* Phosphor SVG Icon Universal Standard */
.ph-icon {
  width: 1.1em;
  height: 1.1em;
  vertical-align: -0.18em;
  fill: currentColor;
  display: inline-block;
}
"""
    PROMO_CSS.write_text(css_content + ph_css, encoding="utf-8")

print("Done purging emojis from claude-design-promo.html and updating claude-design.css!")
