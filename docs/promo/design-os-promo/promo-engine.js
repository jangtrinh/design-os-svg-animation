/**
 * promo-engine.js — Virtual Clock & Master Timeline Runner
 *
 * Implements the 22-second master storyboard for Design OS SVG Animation.
 * Follows the HyperFrames deterministic time-quantization model:
 * every frame at time `t` (0 to 22000ms) can be evaluated deterministically.
 */

class PromoTimelineEngine {
  constructor(svgDoc) {
    this.svg = svgDoc;
    this.durationMs = 22000;
    this.currentTimeMs = 0;
    this.isPlaying = false;
    this.lastTimestamp = null;
    this.rafId = null;

    // Cache SVG Elements
    this.cacheElements();

    // Event listeners
    this.listeners = {
      update: [],
      sceneChange: [],
      ended: []
    };

    this.currentScene = 1;
  }

  cacheElements() {
    const get = (id) => this.svg.querySelector("#" + id) || document.getElementById(id);
    this.el = {
      // Scenes
      scene1: get("scene-1"),
      scene2: get("scene-2"),
      scene3: get("scene-3"),
      scene4: get("scene-4"),
      
      // Global titles
      mainTitle: get("main-title"),
      subTitle: get("sub-title"),

      // Scene 1 Elements
      s1Curve: get("s1-curve"),
      s1Handles: get("s1-handles"),
      s1Warning: get("s1-warning"),
      s1Prompt: get("s1-prompt"),
      s1Cursor: get("s1-cursor"),

      // Scene 2 Elements
      s2Bus: get("s2-bus"),
      s2Node1: get("s2-node-1"),
      s2Node2: get("s2-node-2"),
      s2Node3: get("s2-node-3"),
      s2Stamp: get("s2-stamp"),

      // Scene 3 Elements
      s3Stage: get("s3-center-stage"),
      s3TrimPath: get("s3-trim-path"),
      s3Circle: get("s3-spring-circle"),
      s3Particles: get("s3-particles"),
      s3FeatureText: get("s3-feature-text"),
      s3FpsVal: get("s3-fps-val"),

      // Scene 4 Elements
      s4LogoGroup: get("s4-logo-group"),
      s4LogoStroke: get("s4-logo-stroke"),
      s4LogoFill: get("s4-logo-fill"),
      s4Wordmark: get("s4-wordmark"),
      s4Tagline: get("s4-tagline"),
      s4Divider: get("s4-divider")
    };

    // Initialize Trim Path Dasharrays
    if (this.el.s3TrimPath) {
      this.s3TrimLen = 1400;
      this.el.s3TrimPath.style.strokeDasharray = `${this.s3TrimLen}px`;
    }
    if (this.el.s4LogoStroke) {
      this.s4LogoLen = 750;
      this.el.s4LogoStroke.style.strokeDasharray = `${this.s4LogoLen}px`;
    }
    if (this.el.s1Curve) {
      this.s1CurveLen = 900;
      this.el.s1Curve.style.strokeDasharray = `${this.s1CurveLen}px`;
    }
  }

  on(event, cb) {
    if (this.listeners[event]) this.listeners[event].push(cb);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  play() {
    if (this.isPlaying) return;
    if (this.currentTimeMs >= this.durationMs) {
      this.currentTimeMs = 0;
    }
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.loop();
  }

  pause() {
    this.isPlaying = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  seek(timeMs) {
    this.currentTimeMs = Math.max(0, Math.min(this.durationMs, timeMs));
    this.renderFrame(this.currentTimeMs);
    this.emit("update", this.currentTimeMs);
  }

  loop() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const delta = now - this.lastTimestamp;
    this.lastTimestamp = now;

    this.currentTimeMs += delta;

    if (this.currentTimeMs >= this.durationMs) {
      this.currentTimeMs = this.durationMs;
      this.renderFrame(this.currentTimeMs);
      this.pause();
      this.emit("update", this.currentTimeMs);
      this.emit("ended");
      return;
    }

    this.renderFrame(this.currentTimeMs);
    this.emit("update", this.currentTimeMs);

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Deterministic Frame Evaluation at virtual time `t` (milliseconds)
   */
  renderFrame(t) {
    // -------------------------------------------------------------
    // SCENE 1: 0ms - 4000ms (Broken AI Animation)
    // -------------------------------------------------------------
    if (t < 4000) {
      this.setScene(1);
      this.el.scene1.style.opacity = 1;
      this.el.scene2.style.opacity = 0;
      this.el.scene3.style.opacity = 0;
      this.el.scene4.style.opacity = 0;

      this.el.mainTitle.textContent = "AI CAN DRAW. BUT CAN IT MOVE?";
      this.el.subTitle.textContent = "Raw SVG animation breaks without deterministic engineering.";

      // 0 - 600ms: Draw ribbon path
      const drawProgress = Math.min(1, t / 600);
      this.el.s1Curve.style.strokeDashoffset = `${this.s1CurveLen * (1 - drawProgress)}px`;

      // 600ms - 1200ms: Handles fade in
      if (t > 600) {
        const handleFade = Math.min(1, (t - 600) / 400);
        this.el.s1Handles.style.opacity = handleFade * 0.8;
      } else {
        this.el.s1Handles.style.opacity = 0;
      }

      // 1200ms - 3500ms: Glitch & Distortion
      if (t > 1200) {
        const glitchFactor = Math.sin(t * 0.05) * 15;
        const distortX = Math.cos(t * 0.03) * 20;
        this.el.s1Handles.setAttribute("transform", `translate(${distortX}, ${glitchFactor})`);
        this.el.s1Warning.style.opacity = 1;
      } else {
        this.el.s1Handles.setAttribute("transform", "translate(0, 0)");
        this.el.s1Warning.style.opacity = 0;
      }

      // 3500ms - 4000ms: Collapse to flat horizontal line
      if (t > 3500) {
        const collapseProg = (t - 3500) / 500;
        const scaleY = Math.max(0.01, 1 - collapseProg);
        this.el.s1Curve.setAttribute("transform", `translate(0, ${540 * (1 - scaleY)}) scale(1, ${scaleY})`);
        this.el.s1Handles.style.opacity = 1 - collapseProg;
        this.el.s1Warning.style.opacity = 1 - collapseProg;
      } else {
        this.el.s1Curve.setAttribute("transform", "translate(0, 0) scale(1, 1)");
      }
    }

    // -------------------------------------------------------------
    // SCENE 2: 4000ms - 10000ms (Deterministic Pipeline)
    // -------------------------------------------------------------
    else if (t >= 4000 && t < 10000) {
      this.setScene(2);
      this.el.scene1.style.opacity = 0;
      this.el.scene2.style.opacity = 1;
      this.el.scene3.style.opacity = 0;
      this.el.scene4.style.opacity = 0;

      const s2Time = t - 4000;

      if (s2Time < 3000) {
        this.el.mainTitle.textContent = "INTENT ≠ GEOMETRY";
        this.el.subTitle.textContent = "Decoupling AI semantic intent from mathematical geometry calculation.";
      } else {
        this.el.mainTitle.textContent = "DESIGN OS MAKES MOTION DETERMINISTIC";
        this.el.subTitle.textContent = "Intent → Motion IR Schema → Deterministic Geometry Compiler.";
      }

      // 4000 - 5200ms: AI INTENT Node
      this.el.s2Node1.style.opacity = Math.min(1, s2Time / 600);
      // 5200 - 7000ms: MOTION IR Node
      this.el.s2Node2.style.opacity = s2Time > 1200 ? Math.min(1, (s2Time - 1200) / 600) : 0;
      // 7000 - 9000ms: GEOMETRY ENGINE Node
      this.el.s2Node3.style.opacity = s2Time > 2500 ? Math.min(1, (s2Time - 2500) / 600) : 0;

      // 8500 - 10000ms: DETERMINISTIC Stamp
      if (s2Time > 4500) {
        const stampProg = Math.min(1, (s2Time - 4500) / 300);
        this.el.s2Stamp.style.opacity = stampProg;
        this.el.s2Stamp.setAttribute("transform", `translate(960, 750) scale(${1.2 - 0.2 * stampProg})`);
      } else {
        this.el.s2Stamp.style.opacity = 0;
      }
    }

    // -------------------------------------------------------------
    // SCENE 3: 10000ms - 18000ms (Motion Superpowers)
    // -------------------------------------------------------------
    else if (t >= 10000 && t < 18000) {
      this.setScene(3);
      this.el.scene1.style.opacity = 0;
      this.el.scene2.style.opacity = 0;
      this.el.scene3.style.opacity = 1;
      this.el.scene4.style.opacity = 0;

      this.el.mainTitle.textContent = "ONE VECTOR. REAL MOTION.";
      this.el.subTitle.textContent = "Trim Path · Spring Kinematics · Topology Morphing · GPU 120 FPS";

      const s3Time = t - 10000;

      // 10.0s - 12.0s: Trim Path Feature
      if (s3Time < 2000) {
        this.el.s3FeatureText.textContent = "LOTTIE TRIM PATH";
        const trimProg = s3Time / 1800;
        this.el.s3TrimPath.style.opacity = 1;
        this.el.s3TrimPath.style.strokeDashoffset = `${this.s3TrimLen * (1 - trimProg)}px`;
        this.el.s3Circle.style.opacity = 0;
        this.el.s3Particles.style.opacity = 0;
        this.el.s3FpsVal.textContent = "60";
      }
      // 12.0s - 14.0s: Spring Physics Feature
      else if (s3Time >= 2000 && s3Time < 4000) {
        this.el.s3FeatureText.textContent = "SPRING PHYSICS (STIFFNESS 280)";
        this.el.s3TrimPath.style.opacity = 0;
        this.el.s3Circle.style.opacity = 1;
        this.el.s3Particles.style.opacity = 0;

        // Damped Spring Simulation: e^(-ct) * cos(wt)
        const springT = (s3Time - 2000) / 1000;
        const decay = Math.exp(-2.5 * springT);
        const oscillation = Math.cos(16 * springT);
        const scale = 1 + decay * oscillation * 0.45;

        this.el.s3Circle.setAttribute("transform", `scale(${scale})`);
        this.el.s3FpsVal.textContent = "90";
      }
      // 14.0s - 16.0s: Perfect Morphing
      else if (s3Time >= 4000 && s3Time < 6000) {
        this.el.s3FeatureText.textContent = "DETERMINISTIC TOPOLOGY MORPH";
        this.el.s3TrimPath.style.opacity = 0;
        this.el.s3Circle.style.opacity = 0.8;
        this.el.s3Circle.setAttribute("transform", "scale(1)");
        this.el.s3Particles.style.opacity = 0;

        const morphT = (s3Time - 4000) / 2000;
        const morphRot = morphT * 360;
        this.el.s3Stage.setAttribute("transform", `translate(960, 500) rotate(${morphRot})`);
        this.el.s3FpsVal.textContent = "120";
      }
      // 16.0s - 18.0s: GPU Composite 120 FPS
      else {
        this.el.s3FeatureText.textContent = "HARDWARE ACCELERATED GPU COMPOSITE";
        this.el.s3TrimPath.style.opacity = 0;
        this.el.s3Circle.style.opacity = 0;
        this.el.s3Particles.style.opacity = 1;

        const explodeT = (s3Time - 6000) / 2000;
        const spread = 1 + explodeT * 1.5;
        this.el.s3Particles.setAttribute("transform", `translate(960, 500) scale(${spread}) rotate(${explodeT * 90})`);
        this.el.s3FpsVal.textContent = "120";
      }
    }

    // -------------------------------------------------------------
    // SCENE 4: 18000ms - 22000ms (Brand Reveal & Lockup)
    // -------------------------------------------------------------
    else {
      this.setScene(4);
      this.el.scene1.style.opacity = 0;
      this.el.scene2.style.opacity = 0;
      this.el.scene3.style.opacity = 0;
      this.el.scene4.style.opacity = 1;

      this.el.mainTitle.textContent = "DESIGN OS SVG ANIMATION";
      this.el.subTitle.textContent = "The agent-native, deterministic vector motion engine.";

      const s4Time = t - 18000;

      // 18.0s - 19.5s: Draw Logo Stroke via Trim Path
      const strokeProg = Math.min(1, s4Time / 1400);
      this.el.s4LogoStroke.style.strokeDashoffset = `${this.s4LogoLen * (1 - strokeProg)}px`;

      // 19.5s - 20.5s: Fill Fade-in
      if (s4Time > 1200) {
        const fillProg = Math.min(1, (s4Time - 1200) / 600);
        this.el.s4LogoFill.style.opacity = fillProg * 0.35;
      } else {
        this.el.s4LogoFill.style.opacity = 0;
      }

      // 20.0s - 21.0s: Wordmark Slide-in
      if (s4Time > 1600) {
        const wordmarkProg = Math.min(1, (s4Time - 1600) / 600);
        this.el.s4Wordmark.style.opacity = wordmarkProg;
        this.el.s4Wordmark.setAttribute("transform", `translate(960, ${600 - (1 - wordmarkProg) * 15})`);
      } else {
        this.el.s4Wordmark.style.opacity = 0;
      }

      // 20.8s - 22.0s: Tagline & Divider
      if (s4Time > 2200) {
        const tagProg = Math.min(1, (s4Time - 2200) / 600);
        this.el.s4Tagline.style.opacity = tagProg;
        this.el.s4Divider.setAttribute("transform", `scale(${tagProg}, 1)`);
      } else {
        this.el.s4Tagline.style.opacity = 0;
      }
    }
  }

  setScene(sceneNum) {
    if (this.currentScene !== sceneNum) {
      this.currentScene = sceneNum;
      this.emit("sceneChange", sceneNum);
    }
  }
}

if (typeof window !== "undefined") {
  window.PromoTimelineEngine = PromoTimelineEngine;
}
