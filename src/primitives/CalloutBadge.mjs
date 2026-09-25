/**
 * CalloutBadge.mjs — Non-Occluding Feature Annotation Callout
 * 
 * Provides highlight callout badge with leader line and Phosphor vector icon,
 * ensuring target elements remain unobscured.
 */

export function renderCalloutBadge(options = {}) {
  const {
    targetX = 400,
    targetY = 300,
    badgeX = 520,
    badgeY = 240,
    title = 'Stealth Mode',
    description = 'Keeps code generation private',
    icon = 'icon-lock',
    accentColor = '#6366f1'
  } = options;

  const width = 220;
  const height = 58;

  // Path leader line connecting target to badge
  const leaderPath = `M ${targetX},${targetY} L ${targetX + 30},${badgeY + height/2} L ${badgeX},${badgeY + height/2}`;

  return `
    <g class="callout-badge-group">
      <!-- Target Highlight Ring -->
      <circle 
        cx="${targetX}" cy="${targetY}" r="12" 
        fill="none" stroke="${accentColor}" stroke-width="2" 
        stroke-dasharray="3 3"
      />
      <circle cx="${targetX}" cy="${targetY}" r="3" fill="${accentColor}" />

      <!-- Leader Line -->
      <path 
        d="${leaderPath}" 
        fill="none" 
        stroke="${accentColor}" 
        stroke-width="1.5" 
        stroke-opacity="0.8" 
      />

      <!-- Annotation Badge Card -->
      <g transform="translate(${badgeX}, ${badgeY})">
        <rect 
          x="0" y="0" 
          width="${width}" height="${height}" 
          rx="10" 
          fill="#141724" 
          stroke="rgba(255, 255, 255, 0.15)" 
          stroke-width="1"
          filter="drop-shadow(0 12px 24px rgba(0,0,0,0.6))"
        />

        <!-- Title -->
        <text 
          x="16" y="24" 
          font-family="Inter, sans-serif" 
          font-size="13" 
          font-weight="600" 
          fill="#ffffff"
        >${title}</text>

        <!-- Subtitle Description -->
        <text 
          x="16" y="42" 
          font-family="Inter, sans-serif" 
          font-size="11" 
          font-weight="400" 
          fill="#94a3b8"
        >${description}</text>
      </g>
    </g>
  `;
}
