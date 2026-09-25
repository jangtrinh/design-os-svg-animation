/**
 * SyntheticCursor.mjs — Precision Vector Pointer & Concentric Click Ripple
 * 
 * Strict Anti-Flop Invariant: Pointer tip is locked at (0,0).
 * Click ripple center is located at (0,0), guaranteeing Δ = 0.00px concentricity.
 */

export function renderSyntheticCursor(options = {}) {
  const {
    x = 0,
    y = 0,
    isClicking = false,
    clickProgress = 0, // 0..1
    scale = 1.0,
    color = '#ffffff',
    borderColor = '#000000'
  } = options;

  // Concentric ripple parameters
  const rippleRadius = isClicking ? clickProgress * 28 : 0;
  const rippleOpacity = isClicking ? Math.max(0, 1.0 - clickProgress) * 0.8 : 0;

  return `
    <g class="synthetic-cursor-group" transform="translate(${x}, ${y}) scale(${scale})" pointer-events="none">
      <!-- Click Ripple (Concentric at 0,0) -->
      ${isClicking ? `
        <circle 
          cx="0" 
          cy="0" 
          r="${rippleRadius.toFixed(2)}" 
          fill="none" 
          stroke="${color}" 
          stroke-width="2.5" 
          stroke-opacity="${rippleOpacity.toFixed(3)}" 
        />
        <circle 
          cx="0" 
          cy="0" 
          r="${(rippleRadius * 0.5).toFixed(2)}" 
          fill="${color}" 
          fill-opacity="${(rippleOpacity * 0.4).toFixed(3)}" 
        />
      ` : ''}

      <!-- Authentic OS Pointer Arrow (Tip strictly at 0,0) -->
      <path 
        d="M 0,0 L 0,18.5 L 4.8,14.2 L 9.2,23.5 L 12.8,21.8 L 8.4,12.6 L 15.2,12.6 Z" 
        fill="${color}" 
        stroke="${borderColor}" 
        stroke-width="1.8" 
        stroke-linejoin="round"
        stroke-linecap="round"
        filter="drop-shadow(0 2px 5px rgba(0,0,0,0.45))"
      />
    </g>
  `;
}
