/**
 * AppFrame.mjs — macOS Glassmorphic Window Surround
 * 
 * Provides Sonoma/Sequoia style window chrome with authentic traffic lights,
 * subtle border highlight, and high-DPR content clipping.
 */

export function renderAppFrame(options = {}) {
  const {
    id = 'app-window',
    x = 100,
    y = 80,
    width = 1080,
    height = 720,
    title = 'Design OS Studio',
    theme = 'dark',
    contentHtml = '',
    rx = 14
  } = options;

  const isDark = theme === 'dark';
  const bg = isDark ? '#14161f' : '#ffffff';
  const headerBg = isDark ? 'rgba(25, 28, 40, 0.85)' : 'rgba(245, 245, 247, 0.85)';
  const border = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';
  const titleColor = isDark ? '#94a3b8' : '#475569';

  return `
    <g id="${id}" class="app-frame" transform="translate(${x}, ${y})">
      <!-- Drop Shadow Filter Base -->
      <rect 
        x="0" y="0" 
        width="${width}" height="${height}" 
        rx="${rx}" 
        fill="${bg}" 
        stroke="${border}" 
        stroke-width="1.2"
        filter="drop-shadow(0 24px 48px rgba(0,0,0,0.5))"
      />

      <!-- Titlebar Area -->
      <path 
        d="M 0,${rx} A ${rx},${rx} 0 0,1 ${rx},0 L ${width - rx},0 A ${rx},${rx} 0 0,1 ${width},${rx} L ${width},44 L 0,44 Z" 
        fill="${headerBg}" 
      />
      <line x1="0" y1="44" x2="${width}" y2="44" stroke="${border}" stroke-width="1" />

      <!-- Traffic Lights -->
      <circle cx="20" cy="22" r="5.5" fill="#ff5f56" stroke="#e0443e" stroke-width="0.5" />
      <circle cx="38" cy="22" r="5.5" fill="#ffbd2e" stroke="#dea125" stroke-width="0.5" />
      <circle cx="56" cy="22" r="5.5" fill="#27c93f" stroke="#1aab29" stroke-width="0.5" />

      <!-- Window Title -->
      <text 
        x="${width / 2}" y="27" 
        text-anchor="middle" 
        font-family="Inter, -apple-system, sans-serif" 
        font-size="12" 
        font-weight="500" 
        fill="${titleColor}"
      >${title}</text>

      <!-- Content Surface (Clipped) -->
      <g class="window-content" transform="translate(0, 44)">
        ${contentHtml}
      </g>
    </g>
  `;
}
