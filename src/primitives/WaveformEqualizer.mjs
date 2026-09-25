/**
 * WaveformEqualizer.mjs — Deterministic PCM Amplitude Frequency Bars
 * 
 * Computes equalizer bar heights as a pure mathematical function of frame index
 * or pre-extracted PCM envelope amplitude. Never relies on real-time Web Audio API.
 */

export function renderWaveformEqualizer(options = {}) {
  const {
    barsCount = 24,
    width = 320,
    height = 64,
    x = 100,
    y = 100,
    amplitude = 0.5, // 0..1 current audio energy
    baseColor = '#6366f1',
    activeColor = '#818cf8',
    frameIndex = 0
  } = options;

  const barWidth = (width / barsCount) * 0.65;
  const barGap = (width / barsCount) * 0.35;

  const bars = Array.from({ length: barsCount }, (_, i) => {
    // Deterministic pseudo-frequency dispersion based on bar index and frame
    const freqFactor = Math.sin((i / barsCount) * Math.PI + (frameIndex * 0.1));
    const dynamicHeight = Math.max(6, Math.min(height, height * amplitude * (0.3 + 0.7 * Math.abs(freqFactor))));
    const barX = i * (barWidth + barGap);
    const barY = height - dynamicHeight;

    return `
      <rect 
        x="${barX.toFixed(1)}" 
        y="${barY.toFixed(1)}" 
        width="${barWidth.toFixed(1)}" 
        height="${dynamicHeight.toFixed(1)}" 
        rx="3" 
        fill="${amplitude > 0.6 ? activeColor : baseColor}" 
        opacity="${(0.4 + 0.6 * (dynamicHeight / height)).toFixed(2)}"
      />
    `;
  });

  return `
    <g class="waveform-equalizer" transform="translate(${x}, ${y})">
      ${bars.join('')}
    </g>
  `;
}
