/**
 * wave-envelope.mjs — Deterministic Audio Waveform Envelope & Beat Transient Detector
 * 
 * Pre-processes audio PCM data into deterministic per-frame energy values.
 * Identifies transient beat peaks for scene-cut anchors.
 */

export class WaveEnvelope {
  constructor(samples = [], fps = 60) {
    this.samples = samples; // Normalized 0..1 amplitude values
    this.fps = fps;
  }

  /**
   * Loads pre-computed .wave.json file contents.
   */
  static fromJSON(jsonData, fps = 60) {
    const samples = Array.isArray(jsonData) ? jsonData : (jsonData.samples || []);
    return new WaveEnvelope(samples, fps);
  }

  /**
   * Retrieves audio energy [0..1] for a specific frame index.
   */
  getEnergyAtFrame(frameIndex) {
    if (!this.samples.length) return 0.0;
    const idx = Math.max(0, Math.min(this.samples.length - 1, frameIndex));
    return this.samples[idx];
  }

  /**
   * Retrieves audio energy [0..1] for a timestamp in seconds.
   */
  getEnergyAtTime(timeSeconds) {
    const frameIndex = Math.round(timeSeconds * this.fps);
    return this.getEnergyAtFrame(frameIndex);
  }

  /**
   * Detects beat transient candidates where sudden amplitude surge occurs.
   * Useful for pattern interrupts and hard scene cuts.
   * @param {number} threshold - Min jump delta (default 0.25)
   * @returns {number[]} Array of timestamps in seconds
   */
  detectTransientBeats(threshold = 0.25) {
    const beats = [];
    let lastBeatTime = -1.0;
    const minBeatGap = 0.35; // Min 350ms between transient cuts

    for (let i = 1; i < this.samples.length; i++) {
      const delta = this.samples[i] - this.samples[i - 1];
      const timeSeconds = i / this.fps;

      if (delta >= threshold && (timeSeconds - lastBeatTime) >= minBeatGap) {
        beats.push(Number(timeSeconds.toFixed(3)));
        lastBeatTime = timeSeconds;
      }
    }

    return beats;
  }
}
