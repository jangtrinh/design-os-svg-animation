/**
 * BrowserFrame.mjs — Minimalist Web Browser Surround
 * 
 * Provides web browser frame with authentic omnibox, padlock icon,
 * URL display, and content viewport.
 */

export function renderBrowserFrame(options = {}) {
  const {
    id = 'browser-window',
    x = 100,
    y = 80,
    width = 1200,
    height = 800,
    url = 'https://app.design-os.internal',
    theme = 'dark',
    contentHtml = '',
    rx = 12
  } = options;

  const isDark = theme === 'dark';
  const bg = isDark ? '#0f1117' : '#ffffff';
  const toolbarBg = isDark ? '#1a1d27' : '#f1f3f5';
  const omniboxBg = isDark ? '#12141c' : '#ffffff';
  const border = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#cbd5e1' : '#334155';

  return `
    <g id="${id}" class="browser-frame" transform="translate(${x}, ${y})">
      <rect 
        x="0" y="0" 
        width="${width}" height="${height}" 
        rx="${rx}" 
        fill="${bg}" 
        stroke="${border}" 
        stroke-width="1.2"
        filter="drop-shadow(0 20px 40px rgba(0,0,0,0.45))"
      />

      <!-- Toolbar Chrome -->
      <path 
        d="M 0,${rx} A ${rx},${rx} 0 0,1 ${rx},0 L ${width - rx},0 A ${rx},${rx} 0 0,1 ${width},${rx} L ${width},52 L 0,52 Z" 
        fill="${toolbarBg}" 
      />
      <line x1="0" y1="52" x2="${width}" y2="52" stroke="${border}" stroke-width="1" />

      <!-- Window Dots -->
      <circle cx="22" cy="26" r="5" fill="#ff5f56" />
      <circle cx="38" cy="26" r="5" fill="#ffbd2e" />
      <circle cx="54" cy="26" r="5" fill="#27c93f" />

      <!-- Omnibox Address Bar -->
      <rect 
        x="90" y="12" 
        width="${width - 180}" height="28" 
        rx="6" 
        fill="${omniboxBg}" 
        stroke="${border}" 
        stroke-width="1" 
      />

      <!-- Security Padlock Glyph -->
      <path 
        d="M 106,23 L 106,21 C 106,19 107.5,17.5 109.5,17.5 C 111.5,17.5 113,19 113,21 L 113,23 Z M 104,23 L 115,23 C 115.5,23 116,23.5 116,24 L 116,29 C 116,29.5 115.5,30 115,30 L 104,30 C 103.5,30 103,29.5 103,29 L 103,24 C 103,23.5 103.5,23 104,23 Z" 
        fill="#10b981" 
      />

      <!-- URL Text -->
      <text 
        x="124" y="30" 
        font-family="Inter, -apple-system, sans-serif" 
        font-size="12" 
        font-weight="400" 
        fill="${textColor}"
      >${url}</text>

      <!-- Webpage Viewport -->
      <g class="browser-viewport" transform="translate(0, 52)">
        ${contentHtml}
      </g>
    </g>
  `;
}
