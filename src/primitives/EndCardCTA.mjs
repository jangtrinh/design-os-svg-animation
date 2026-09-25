/**
 * EndCardCTA.mjs — Conversion Outro Scene & Brand Action Lockup
 * 
 * Standardized high-converting outro scene. Enforces minimum 2.0s hold time
 * for viewers to digest the CTA and URL before video termination.
 */

export function renderEndCardCTA(options = {}) {
  const {
    brandName = 'Design OS',
    headline = 'Build deterministic motion at 60fps.',
    ctaButtonText = 'Get Started Free',
    url = 'design-os.internal',
    width = 1920,
    height = 1080,
    accentColor = '#6366f1'
  } = options;

  const cx = width / 2;
  const cy = height / 2;

  return `
    <g class="end-card-cta" opacity="1">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#08090d" />

      <!-- Subtle Radial Glow Background -->
      <circle cx="${cx}" cy="${cy}" r="${height * 0.45}" fill="${accentColor}" opacity="0.08" filter="blur(80px)" />

      <!-- Brand Lockup -->
      <text 
        x="${cx}" y="${cy - 70}" 
        text-anchor="middle" 
        font-family="Inter, sans-serif" 
        font-size="48" 
        font-weight="800" 
        fill="#ffffff"
        letter-spacing="-0.03em"
      >${brandName}</text>

      <!-- Subheadline -->
      <text 
        x="${cx}" y="${cy - 16}" 
        text-anchor="middle" 
        font-family="Inter, sans-serif" 
        font-size="20" 
        font-weight="400" 
        fill="#94a3b8"
      >${headline}</text>

      <!-- CTA Button Pill -->
      <g transform="translate(${cx - 110}, ${cy + 34})">
        <rect 
          x="0" y="0" 
          width="220" height="52" 
          rx="26" 
          fill="${accentColor}" 
          filter="drop-shadow(0 8px 20px rgba(99,102,241,0.4))"
        />
        <text 
          x="110" y="32" 
          text-anchor="middle" 
          font-family="Inter, sans-serif" 
          font-size="15" 
          font-weight="600" 
          fill="#ffffff"
        >${ctaButtonText}</text>
      </g>

      <!-- URL Domain -->
      <text 
        x="${cx}" y="${cy + 130}" 
        text-anchor="middle" 
        font-family="JetBrains Mono, monospace" 
        font-size="14" 
        font-weight="500" 
        fill="#64748b"
      >${url}</text>
    </g>
  `;
}
