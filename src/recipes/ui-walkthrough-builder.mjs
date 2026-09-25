/**
 * ui-walkthrough-builder.mjs — UI Walkthrough & Product Demo Choreographer
 * 
 * Compiles UI focus, cursor travels, click actions, and annotations into
 * deterministic timeline tracks.
 * 
 * HARD-INVARIANT: Decoupled Camera vs Pointer Motion:
 * Camera moves -> Settles -> Pointer moves -> Concentric Click -> Response.
 */

import { computeCameraTransform } from '../geometry/viewport.mjs';
import { renderPlayerHTML } from '../player/StudioPlayer.mjs';

export class UIWalkthroughBuilder {
  constructor(options = {}) {
    this.aspectKey = options.aspectKey || '16:9';
    this.fps = options.fps || 60;
    this.steps = [];
    this.totalDurationSeconds = 0;
  }

  /**
   * Add an atomic walkthrough interaction step.
   */
  addStep(step) {
    const {
      id = `step_${this.steps.length + 1}`,
      target = { x: 960, y: 540 },
      zoom = 1.6,
      action = 'click', // 'click' | 'hover' | 'type'
      holdSeconds = 1.5,
      callout = null
    } = step;

    this.steps.push({
      id,
      target,
      zoom,
      action,
      holdSeconds,
      callout
    });

    return this;
  }

  /**
   * Compiles registered steps into deterministic keyframe tracks.
   * Enforces zero overlap between camera zoom/pan and cursor movement.
   */
  compile() {
    const timeline = [];
    let currentTime = 0;
    let prevCursorPos = { x: 960, y: 900 }; // Default bottom entry

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      const stepStart = currentTime;

      // 1. Camera Punch In (0.5s duration) — Pointer remains stationary
      const camStart = currentTime;
      const camDuration = 0.5;
      const camEnd = camStart + camDuration;
      currentTime = camEnd;

      // 2. Camera Settle Hold (0.2s duration) — Safety gate for visual stabilization
      const settleHold = 0.2;
      currentTime += settleHold;

      // 3. Pointer Travel (0.5s duration) — Camera is completely settled/stationary
      const pointerStart = currentTime;
      const pointerDuration = 0.5;
      const pointerEnd = pointerStart + pointerDuration;
      currentTime = pointerEnd;

      // 4. Click Action (0.3s duration) — Concentric click ripple
      const clickStart = currentTime;
      const clickDuration = 0.3;
      currentTime += clickDuration;

      // 5. Response & Callout Hold
      const holdStart = currentTime;
      currentTime += step.holdSeconds;

      timeline.push({
        stepId: step.id,
        phases: {
          cameraPunch: { start: camStart, end: camEnd, target: step.target, zoom: step.zoom },
          cameraSettled: { start: camEnd, end: currentTime },
          pointerTravel: { start: pointerStart, end: pointerEnd, from: prevCursorPos, to: step.target },
          clickAction: { start: clickStart, end: clickStart + clickDuration, at: step.target },
          calloutDisplay: step.callout ? { start: holdStart, end: currentTime, data: step.callout } : null
        }
      });

      prevCursorPos = step.target;
    }

    this.totalDurationSeconds = currentTime;

    return {
      aspectKey: this.aspectKey,
      totalDurationSeconds: Number(this.totalDurationSeconds.toFixed(3)),
      totalFrames: Math.round(this.totalDurationSeconds * this.fps),
      stepsCount: this.steps.length,
      timeline
    };
  }

  /**
   * Compiles the walkthrough into a complete, standalone deliverable HTML
   * wrapped in the canonical Design OS Universal Studio Player.
   */
  toDeliverableHTML(options = {}) {
    const compiled = this.compile();
    const scenes = this.steps.map((s, idx) => ({
      id: `S${idx + 1}`,
      name: s.id || `Step ${idx + 1}`,
      startTime: compiled.timeline[idx]?.phases?.cameraPunch?.start || 0
    }));

    return renderPlayerHTML({
      title: options.title || 'Design OS Walkthrough Deliverable',
      subtitle: options.subtitle || 'UI Walkthrough',
      aspectKey: this.aspectKey,
      durationSeconds: compiled.totalDurationSeconds,
      fps: this.fps,
      scenes,
      canvasHTML: options.canvasHTML || '',
      engineScriptContent: options.engineScriptContent || '',
      customStyles: options.customStyles || ''
    });
  }
}
