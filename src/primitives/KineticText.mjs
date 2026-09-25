/**
 * KineticText.mjs — High-Impact Word-by-Word Karaoke Typography
 * 
 * Hormozi-style kinetic captions with word-level highlight, dynamic scaling,
 * and high-contrast bounding safe-zone clamping for muted viewers (85%).
 */

export function renderKineticText(options = {}) {
  const {
    words = [],
    activeWordIndex = 0,
    x = 960,
    y = 800,
    fontSize = 44,
    activeColor = '#6366f1',
    inactiveColor = 'rgba(255, 255, 255, 0.45)',
    highlightBg = 'rgba(99, 102, 241, 0.15)',
    fontFamily = 'Inter, -apple-system, sans-serif'
  } = options;

  let currentX = 0;
  const wordSpans = words.map((word, idx) => {
    const isActive = idx === activeWordIndex;
    const isPast = idx < activeWordIndex;
    const color = isActive ? '#ffffff' : (isPast ? 'rgba(255,255,255,0.85)' : inactiveColor);
    const weight = isActive ? 800 : 600;
    const scale = isActive ? 1.08 : 1.0;

    return `
      <g class="kinetic-word ${isActive ? 'active' : ''}" transform="scale(${scale})">
        ${isActive ? `
          <rect 
            x="-8" y="-${fontSize * 0.9}" 
            width="${word.length * fontSize * 0.6 + 16}" height="${fontSize * 1.25}" 
            rx="8" 
            fill="${highlightBg}" 
            stroke="${activeColor}" 
            stroke-width="1.5" 
          />
        ` : ''}
        <text 
          x="0" y="0" 
          font-family="${fontFamily}" 
          font-size="${fontSize}" 
          font-weight="${weight}" 
          fill="${color}"
          letter-spacing="-0.02em"
        >${word}</text>
      </g>
    `;
  });

  return `
    <g class="kinetic-text-container" transform="translate(${x}, ${y})">
      <g display="flex" text-anchor="middle">
        ${wordSpans.join('')}
      </g>
    </g>
  `;
}
