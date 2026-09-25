/**
 * DiagramNodeFlow.mjs — Explainer Diagram Flow with Traveling Energy Pulses
 * 
 * Renders connected nodes with smooth cubic Bezier connectors and
 * animated energy pulses (stroke-dashoffset or traveling dots).
 */

export function renderDiagramNodeFlow(options = {}) {
  const {
    nodes = [
      { id: 'start', label: 'User Intent', x: 200, y: 300, icon: 'icon-sparkle' },
      { id: 'engine', label: 'Motion Compiler', x: 600, y: 300, icon: 'icon-code' },
      { id: 'output', label: '1080p 60fps MP4', x: 1000, y: 300, icon: 'icon-check' }
    ],
    activePulseT = 0.5, // 0..1 pulse travel position
    primaryColor = '#6366f1',
    nodeBg = '#14161f',
    borderColor = 'rgba(255, 255, 255, 0.15)'
  } = options;

  // Generate cubic Bezier connectors between sequential nodes
  const connectors = [];
  const pulses = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i];
    const to = nodes[i + 1];
    const dx = (to.x - from.x) * 0.5;
    const pathD = `M ${from.x},${from.y} C ${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`;

    connectors.push(`
      <path 
        d="${pathD}" 
        fill="none" 
        stroke="${borderColor}" 
        stroke-width="2" 
        stroke-dasharray="6 4"
      />
    `);

    // Interpolate pulse dot position along line
    const pulseX = from.x + (to.x - from.x) * activePulseT;
    const pulseY = from.y + (to.y - from.y) * activePulseT;

    pulses.push(`
      <circle 
        cx="${pulseX.toFixed(1)}" 
        cy="${pulseY.toFixed(1)}" 
        r="4.5" 
        fill="${primaryColor}" 
        filter="drop-shadow(0 0 8px ${primaryColor})"
      />
    `);
  }

  // Generate Node Cards
  const nodeCards = nodes.map((node) => {
    return `
      <g class="diagram-node" transform="translate(${node.x - 90}, ${node.y - 36})">
        <rect 
          x="0" y="0" 
          width="180" height="72" 
          rx="10" 
          fill="${nodeBg}" 
          stroke="${borderColor}" 
          stroke-width="1.5" 
        />
        <text 
          x="90" y="42" 
          text-anchor="middle" 
          font-family="Inter, sans-serif" 
          font-size="13" 
          font-weight="600" 
          fill="#f8fafc"
        >${node.label}</text>
      </g>
    `;
  });

  return `
    <g class="diagram-node-flow">
      ${connectors.join('')}
      ${pulses.join('')}
      ${nodeCards.join('')}
    </g>
  `;
}
