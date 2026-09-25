/**
 * virtual-clock.mjs — Design OS Core Virtual Clock Runtime & Integer Frame Quantizer
 * 
 * Strict integer-frame determinism engine (Layer 1 of Universal Motion Architecture).
 * Frame index `n` (0..N-1) is the ground truth.
 * Decouples RAF scheduling (Studio preview) from deterministic integer evaluation (Headless export).
 */

export const DEFAULT_FPS = {
  numerator: 60,
  denominator: 1
};

/**
 * Computes exact timestamp in seconds for integer frame index.
 * @param {number} frameIndex - 0-indexed frame number
 * @param {object} fps - Rational frame rate { numerator, denominator }
 * @returns {number} Time in seconds
 */
export function frameToTime(frameIndex, fps = DEFAULT_FPS) {
  return (frameIndex * fps.denominator) / fps.numerator;
}

/**
 * Computes closest integer frame index for a given time in seconds.
 * @param {number} timeSeconds - Time in seconds
 * @param {object} fps - Rational frame rate { numerator, denominator }
 * @returns {number} Integer frame index
 */
export function timeToFrame(timeSeconds, fps = DEFAULT_FPS) {
  return Math.round((timeSeconds * fps.numerator) / fps.denominator);
}

/**
 * Creates a deterministic Virtual Clock runtime instance.
 */
export class VirtualClockRuntime {
  constructor(options = {}) {
    this.fps = options.fps || DEFAULT_FPS;
    this.totalFrames = options.totalFrames || 0;
    this.currentFrame = 0;
    this.evaluators = new Set();
    this.isReady = false;
    this.receipts = new Map();
    this.manifest = {
      fps: this.fps,
      totalFrames: this.totalFrames,
      durationSeconds: frameToTime(this.totalFrames, this.fps),
      registeredEvaluators: 0,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Register a frame evaluation handler.
   * Evaluator signature: (frameContext) => Promise<void> | void
   */
  registerEvaluator(evaluator) {
    if (typeof evaluator === 'function') {
      this.evaluators.add(evaluator);
      this.manifest.registeredEvaluators = this.evaluators.size;
    }
    return () => {
      this.evaluators.delete(evaluator);
      this.manifest.registeredEvaluators = this.evaluators.size;
    };
  }

  /**
   * Mark runtime as ready for capture / playback.
   */
  markReady() {
    this.isReady = true;
    if (typeof window !== 'undefined') {
      window.__motionReady = true;
    }
  }

  /**
   * Seek to an exact integer frame.
   * @param {number} frameIndex 
   * @returns {Promise<object>} Frame receipt
   */
  async seekToFrame(frameIndex) {
    const clampedIndex = Math.max(0, Math.floor(frameIndex));
    this.currentFrame = clampedIndex;
    const timeSeconds = frameToTime(clampedIndex, this.fps);

    const context = {
      frameIndex: clampedIndex,
      fps: this.fps,
      timeSeconds: Number(timeSeconds.toFixed(6))
    };

    // Execute all registered evaluators in parallel
    const evaluations = Array.from(this.evaluators).map((fn) => {
      try {
        return Promise.resolve(fn(context));
      } catch (err) {
        console.error(`[VirtualClock] Error in frame evaluator for frame ${clampedIndex}:`, err);
        return Promise.reject(err);
      }
    });

    await Promise.all(evaluations);

    const receipt = {
      frameIndex: clampedIndex,
      timeSeconds: context.timeSeconds,
      timestamp: performance.now(),
      status: 'settled'
    };

    this.receipts.set(clampedIndex, receipt);
    return receipt;
  }

  /**
   * Retrieve receipt for specified frame index.
   */
  getFrameReceipt(frameIndex) {
    return this.receipts.get(frameIndex) || null;
  }

  /**
   * Return complete runtime manifest.
   */
  getManifest() {
    return {
      ...this.manifest,
      totalFrames: this.totalFrames,
      durationSeconds: frameToTime(this.totalFrames, this.fps),
      currentFrame: this.currentFrame,
      isReady: this.isReady
    };
  }

  /**
   * Installs global window bindings for headless Chromium and Studio runner.
   */
  installWindowBindings() {
    if (typeof window === 'undefined') return;

    window.__motionRuntime = {
      ready: () => this.isReady,
      seekToFrame: (f) => this.seekToFrame(f),
      getFrameReceipt: (f) => this.getFrameReceipt(f),
      getManifest: () => this.getManifest(),
      registerEvaluator: (fn) => this.registerEvaluator(fn),
      markReady: () => this.markReady()
    };

    // Backward compatibility binding for existing scripts/pipelines
    window.__seekToTime = (seconds) => {
      const f = timeToFrame(seconds, this.fps);
      return this.seekToFrame(f);
    };

    // Legacy flag
    window.__motionReady = this.isReady;
  }
}

// Automatically initialize a singleton on window if present
if (typeof window !== 'undefined' && !window.__motionRuntime) {
  const defaultRuntime = new VirtualClockRuntime();
  defaultRuntime.installWindowBindings();
}
