/**
 * saas-short-engine.js — Virtual Clock & Master Timeline Runner
 *
 * Implements the 11.5-second SaaS product demo short animation.
 * Follows the HyperFrames deterministic time-quantization model:
 * every frame at time `t` (0 to 11500ms) can be evaluated deterministically.
 *
 * Audited & Enhanced with:
 * - Analytical closed-form physical spring kinematics (Linear / Apple style damping ratio ζ).
 * - Dirty-state DOM caching (JEV System One zero-repaint optimization).
 * - Shared-element morphological interpolation (S1 Card → S2 Input Pill).
 * - Log-scale focal-point camera zoom with kinetic inertia (Scene 5).
 * - Caret smooth gliding & deterministic multi-harmonic waveform jitter.
 */

class SaasShortEngine {
  constructor(svgDoc) {
    this.svg = svgDoc;
    this.durationMs = 11500;
    this.currentTimeMs = 0;
    this.isPlaying = false;
    this.lastTimestamp = null;
    this.rafId = null;

    // Cache elements & precomputations
    this.cacheElements();

    // Event listeners
    this.listeners = {
      update: [],
      ended: []
    };
  }

  cacheElements() {
    const get = (id) => this.svg.querySelector("#" + id);

    this.scenes = {
      s1: get("scene-1"),
      s2: get("scene-2"),
      s3: get("scene-3"),
      s4: get("scene-4"),
      s5: get("scene-5"),
      s6: get("scene-6")
    };

    this.s1 = {
      cardAnchor: get("s1-card-anchor"),
      cardScale: get("s1-card-scale"),
      cardRect: this.svg.querySelector("#s1-card-scale rect"),
      title: get("s1-title"),
      subtitle: get("s1-subtitle"),
      badge: get("s1-badge")
    };

    this.s2 = {
      pillAnchor: get("s2-pill-anchor"),
      pillBorder: get("s2-pill-border"),
      promptText: get("s2-prompt-text"),
      cursor: get("s2-cursor"),
      waveIcon: get("s2-wave-icon"),
      iconPlus: get("s2-icon-plus"),
      iconMic: get("s2-icon-mic"),
      badgeWave: get("s2-badge-wave")
    };

    this.s3 = {
      textAnchor: get("s3-text-anchor"),
      wordDeeper: get("s3-word-deeper"),
      wordFaster: get("s3-word-faster")
    };

    this.s4 = {
      card1: get("s4-card-1"),
      card2: get("s4-card-2"),
      card3: get("s4-card-3"),
      sub1: get("s4-sub-1"),
      sub2: get("s4-sub-2"),
      sub3: get("s4-sub-3")
    };

    this.s5 = {
      stage: get("s5-camera-stage"),
      intro: get("s5-intro"),
      intro2: get("s5-intro-2"),
      h1: get("s5-h1"),
      p1Lines: [
        get("s5-p1-l1"), get("s5-p1-l2"), get("s5-p1-l3"),
        get("s5-p1-l4"), get("s5-p1-l5"), get("s5-p1-l6"),
        get("s5-p1-l7"), get("s5-p1-l8"), get("s5-p1-l9")
      ],
      h2: get("s5-h2"),
      h3: get("s5-h3"),
      p2Lines: [
        get("s5-p2-l1"), get("s5-p2-l2"), get("s5-p2-l3"),
        get("s5-p2-l4"), get("s5-p2-l5"), get("s5-p2-l6")
      ]
    };

    this.s6 = {
      ctaScale: get("s6-cta-scale"),
      ctaAnchor: get("s6-cta-anchor"),
      arrowGroup: this.svg.querySelector("#s6-cta-scale g")
    };

    this.fullPromptText = "Our smartest, fastest model yet";

    // Precompute character width cumulative offsets for smooth caret gliding
    this.charOffsets = [];
    const baseCharWidth = 17.55;
    for (let i = 0; i <= this.fullPromptText.length; i++) {
      this.charOffsets.push(-330 + i * baseCharWidth);
    }
  }

  /**
   * JEV Zero-Repaint Cached Attribute Setter
   * Eliminates layout thrashing by skipping DOM writes when attribute values are identical.
   */
  setAttr(elem, attr, val) {
    if (!elem) return;
    if (!elem._cachedAttrs) elem._cachedAttrs = {};
    if (elem._cachedAttrs[attr] === val) return;
    elem._cachedAttrs[attr] = val;
    elem.setAttribute(attr, val);
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
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.tick(this.lastTimestamp);
  }

  pause() {
    this.isPlaying = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.emit("update", this.currentTimeMs);
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else {
      if (this.currentTimeMs >= this.durationMs) this.currentTimeMs = 0;
      this.play();
    }
  }

  seek(timeMs) {
    this.currentTimeMs = Math.max(0, Math.min(this.durationMs, timeMs));
    this.renderAt(this.currentTimeMs);
    this.emit("update", this.currentTimeMs);
    if (this.currentTimeMs >= this.durationMs && this.isPlaying) {
      this.pause();
      this.emit("ended");
    }
  }

  tick(timestamp) {
    if (!this.isPlaying) return;
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.currentTimeMs += delta;
    if (this.currentTimeMs >= this.durationMs) {
      this.currentTimeMs = this.durationMs;
      this.renderAt(this.currentTimeMs);
      this.pause();
      this.emit("ended");
      return;
    }

    this.renderAt(this.currentTimeMs);
    this.emit("update", this.currentTimeMs);
    this.rafId = requestAnimationFrame((ts) => this.tick(ts));
  }

  /* -------------------------------------------------------------
   * Analytical Closed-Form Physical Spring Kinematics
   * Solves: m*x'' + c*x' + k*x = 0 with damping ratio ζ = c / (2*sqrt(k*m))
   * ------------------------------------------------------------- */
  dampedSpring(p, k = 380, c = 28, m = 1.0) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;

    const omega0 = Math.sqrt(k / m);
    const zeta = c / (2 * Math.sqrt(k * m)); // Damping ratio

    if (zeta < 1.0) {
      // Underdamped harmonic oscillator
      const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
      const decay = Math.exp(-zeta * omega0 * p * 0.9);
      const envelope = Math.cos(omegaD * p * 0.9) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * p * 0.9);
      return 1 - decay * envelope;
    } else {
      // Critically damped
      return 1 - (1 + omega0 * p) * Math.exp(-omega0 * p);
    }
  }

  cubicBezier(t, x1, y1, x2, y2) {
    // Fast standard cubic-bezier evaluation
    const u = 1 - t;
    return 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t;
  }

  easeOutCubic(p) {
    return 1 - Math.pow(1 - p, 3);
  }

  easeOutQuint(p) {
    return 1 - Math.pow(1 - p, 5);
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  clamp(val, min = 0, max = 1) {
    return Math.max(min, Math.min(max, val));
  }

  /* -------------------------------------------------------------
   * Deterministic Frame Renderer (HyperFrames 120fps Quantization)
   * ------------------------------------------------------------- */
  renderAt(t) {
    // Scene activation flags with smooth shared-element overlap
    const showS1 = t < 1550;
    const showS2 = t >= 1300 && t < 3500;
    const showS3 = t >= 3500 && t < 5500;
    const showS4 = t >= 5500 && t < 7500;
    const showS5 = t >= 7500 && t < 10000;
    const showS6 = t >= 10000;

    this.setAttr(this.scenes.s1, "opacity", showS1 ? "1" : "0");
    this.setAttr(this.scenes.s2, "opacity", showS2 ? "1" : "0");
    this.setAttr(this.scenes.s3, "opacity", showS3 ? "1" : "0");
    this.setAttr(this.scenes.s4, "opacity", showS4 ? "1" : "0");
    this.setAttr(this.scenes.s5, "opacity", showS5 ? "1" : "0");
    this.setAttr(this.scenes.s6, "opacity", showS6 ? "1" : "0");

    // =========================================================
    // SCENE 1 (0ms - 1500ms): Dropdown Selection Card
    // Damping: k=420, c=33, zeta=0.81 (Apple/Linear minimal bounce)
    // =========================================================
    if (showS1) {
      if (t < 1300) {
        // 0 - 520ms: Spring scale-in
        const pScale = this.clamp(t / 520);
        const s = this.dampedSpring(pScale, 420, 33, 1.0);
        this.setAttr(this.s1.cardScale, "transform", `scale(${s.toFixed(4)})`);

        // 100 - 450ms: Title "GPT- 5" clean reveal
        const pTitle = this.clamp((t - 100) / 350);
        this.setAttr(this.s1.title, "opacity", pTitle > 0.25 ? "1" : "0");

        // 350 - 750ms: Subtitle fade-in
        const pSub = this.clamp((t - 350) / 400);
        this.setAttr(this.s1.subtitle, "opacity", pSub.toFixed(3));

        // 700 - 1050ms: Checkmark badge spring pop-in (k=620, c=34, zeta=0.68)
        if (t < 700) {
          this.setAttr(this.s1.badge, "transform", "translate(245, 0) scale(0)");
          this.setAttr(this.s1.badge, "opacity", "0");
        } else {
          const pBadge = this.clamp((t - 700) / 350);
          const sBadge = this.dampedSpring(pBadge, 620, 34, 1.0);
          this.setAttr(this.s1.badge, "transform", `translate(245, 0) scale(${sBadge.toFixed(4)})`);
          this.setAttr(this.s1.badge, "opacity", "1");
        }

        // Base card geometry
        if (this.s1.cardRect) {
          this.setAttr(this.s1.cardRect, "width", "660");
          this.setAttr(this.s1.cardRect, "height", "190");
          this.setAttr(this.s1.cardRect, "rx", "42");
          this.setAttr(this.s1.cardRect, "x", "-330");
          this.setAttr(this.s1.cardRect, "y", "-95");
        }
      } else {
        // 1300ms - 1500ms: Shared-Element Morphing Shell (Card → Input Pill)
        const pMorph = this.clamp((t - 1300) / 220);
        const easeM = this.easeOutCubic(pMorph);

        // Morph dimensions: 660x190 (rx=42) -> 920x130 (rx=65)
        const curW = this.lerp(660, 920, easeM);
        const curH = this.lerp(190, 130, easeM);
        const curRx = this.lerp(42, 65, this.easeOutCubic(pMorph * 1.08));

        if (this.s1.cardRect) {
          this.setAttr(this.s1.cardRect, "width", curW.toFixed(1));
          this.setAttr(this.s1.cardRect, "height", curH.toFixed(1));
          this.setAttr(this.s1.cardRect, "rx", curRx.toFixed(1));
          this.setAttr(this.s1.cardRect, "x", (-curW / 2).toFixed(1));
          this.setAttr(this.s1.cardRect, "y", (-curH / 2).toFixed(1));
        }

        // Fade out internal card content
        const fadeContent = Math.max(0, 1 - pMorph * 2.5);
        this.setAttr(this.s1.title, "opacity", fadeContent.toFixed(3));
        this.setAttr(this.s1.subtitle, "opacity", fadeContent.toFixed(3));
        this.setAttr(this.s1.badge, "opacity", fadeContent.toFixed(3));
      }
    }

    // =========================================================
    // SCENE 2 (1500ms - 3500ms): Input Field & Caret Glide
    // =========================================================
    if (showS2) {
      const localT = t - 1500;

      // 0 - 250ms: Settle into input shell
      const pShell = this.clamp((localT + 200) / 450);
      const sShell = 0.98 + 0.02 * this.dampedSpring(pShell, 360, 34, 1.0);
      this.setAttr(this.s2.pillAnchor, "transform", `translate(540, 960) scale(${sShell.toFixed(4)})`);

      // 200 - 1700ms: Typewriter text (length 31)
      const pType = this.clamp((localT - 200) / 1400);
      const rawCharIdx = pType * this.fullPromptText.length;
      const charCount = Math.floor(rawCharIdx);
      const currentStr = this.fullPromptText.substring(0, charCount);
      if (this.s2.promptText.textContent !== currentStr) {
        this.s2.promptText.textContent = currentStr;
      }

      // Smooth Caret Glide (interpolate position instead of teleporting)
      const charFrac = rawCharIdx - charCount;
      const curCharX = this.charOffsets[charCount] || this.charOffsets[this.charOffsets.length - 1];
      const nextCharX = this.charOffsets[Math.min(charCount + 1, this.charOffsets.length - 1)];
      const smoothCaretX = this.lerp(curCharX, nextCharX, this.easeOutCubic(charFrac)) + 6;

      this.setAttr(this.s2.cursor, "x1", smoothCaretX.toFixed(1));
      this.setAttr(this.s2.cursor, "x2", smoothCaretX.toFixed(1));

      // Caret blink cadence (250ms half-cycle)
      const isBlinkOn = Math.floor(t / 250) % 2 === 0;
      this.setAttr(this.s2.cursor, "opacity", isBlinkOn ? "1" : "0");

      // Multi-harmonic deterministic waveform jitter
      // a(t) = sin(7.1t) + 0.52*sin(11.7t+1.8) + 0.23*sin(17.3t+0.4)
      if (this.s2.waveIcon) {
        const tSec = t * 0.001;
        const waveHarmonic = Math.sin(tSec * 7.1) + 0.52 * Math.sin(tSec * 11.7 + 1.8) + 0.23 * Math.sin(tSec * 17.3 + 0.4);
        const waveScale = 1.0 + (waveHarmonic * 0.08);
        this.setAttr(this.s2.waveIcon, "transform", `scale(${waveScale.toFixed(3)})`);
      }
    }

    // =========================================================
    // SCENE 3 (3500ms - 5500ms): Kinetic Typography
    // Rule: NO spring, pure cubic-bezier(0.22, 1, 0.36, 1)
    // =========================================================
    if (showS3) {
      const localT = t - 3500;

      // Optical slow drift zoom (1.0 -> 1.05)
      const pDrift = localT / 2000;
      const sDrift = 1.0 + 0.05 * pDrift;
      this.setAttr(this.s3.textAnchor, "transform", `translate(540, 960) scale(${sDrift.toFixed(4)})`);

      // 0 - 900ms: "deeper" is active
      // 900 - 1120ms: Kinetic replacement with optical baseline shift
      if (localT < 900) {
        this.setAttr(this.s3.wordDeeper, "opacity", "1");
        this.setAttr(this.s3.wordDeeper, "transform", "translate(0, 0)");
        this.setAttr(this.s3.wordFaster, "opacity", "0");
      } else if (localT < 1120) {
        const pSwap = this.clamp((localT - 900) / 220);
        const easeSwap = this.cubicBezier(pSwap, 0.22, 1, 0.36, 1);

        this.setAttr(this.s3.wordDeeper, "opacity", (1 - easeSwap).toFixed(3));
        this.setAttr(this.s3.wordDeeper, "transform", `translate(0, ${(easeSwap * 22).toFixed(1)})`);

        this.setAttr(this.s3.wordFaster, "opacity", easeSwap.toFixed(3));
        this.setAttr(this.s3.wordFaster, "transform", `translate(0, ${((1 - easeSwap) * -22).toFixed(1)})`);
      } else {
        this.setAttr(this.s3.wordDeeper, "opacity", "0");
        this.setAttr(this.s3.wordFaster, "opacity", "1");
        this.setAttr(this.s3.wordFaster, "transform", "translate(0, 0)");
      }
    }

    // =========================================================
    // SCENE 4 (5500ms - 7500ms): Processing Cards Stack
    // Progressive Stagger (+0ms, +70ms, +135ms), zeta = 0.72
    // =========================================================
    if (showS4) {
      const localT = t - 5500;

      const updateCard = (cardElem, startTime, finalY) => {
        if (localT < startTime) {
          this.setAttr(cardElem, "transform", `translate(540, ${finalY + 140})`);
          this.setAttr(cardElem, "opacity", "0");
        } else {
          const p = this.clamp((localT - startTime) / 460);
          const s = this.dampedSpring(p, 380, 28, 1.0);
          const curY = (finalY + 140) - (140 * s);
          this.setAttr(cardElem, "transform", `translate(540, ${curY.toFixed(1)})`);
          this.setAttr(cardElem, "opacity", this.clamp(p * 2.2).toFixed(3));
        }
      };

      // Codex progressive momentum stagger (+0ms, +70ms, +135ms)
      updateCard(this.s4.card1, 0, 740);
      updateCard(this.s4.card2, 70, 940);
      updateCard(this.s4.card3, 135, 1140);

      // Status text "Analyzing..." subtle glow pulse
      const pulse = 0.55 + 0.4 * Math.sin(t * 0.009);
      this.setAttr(this.s4.sub1, "opacity", pulse.toFixed(3));
      this.setAttr(this.s4.sub2, "opacity", pulse.toFixed(3));
      this.setAttr(this.s4.sub3, "opacity", pulse.toFixed(3));
    }

    // =========================================================
    // SCENE 5 (7500ms - 10000ms): Generative Text & Log-Scale Camera
    // Focal Point: C + s(world - P), Log-Scale: exp(lerp(ln 1, ln 2.4, e))
    // =========================================================
    if (showS5) {
      const localT = t - 7500;

      // Staggered text line streaming
      const showAt = (elem, revealT) => {
        if (!elem) return;
        const p = this.clamp((localT - revealT) / 90);
        this.setAttr(elem, "opacity", p.toFixed(3));
      };

      showAt(this.s5.intro, 0);
      showAt(this.s5.intro2, 60);
      showAt(this.s5.h1, 130);

      this.s5.p1Lines.forEach((line, idx) => {
        showAt(line, 200 + idx * 75);
      });

      showAt(this.s5.h2, 950);
      showAt(this.s5.h3, 1050);

      this.s5.p2Lines.forEach((line, idx) => {
        showAt(line, 1120 + idx * 70);
      });

      // Camera Motion (7.5s - 10.0s)
      // 7.50 - 8.55s: document stream
      // 8.55 - 9.05s: follow text downward
      // 9.05 - 9.70s: Go-to-market punch 1x -> 2.4x (Log-scale)
      // 9.70 - 10.00s: micro settle
      let camY = 0;
      let zoomScale = 1.0;
      let camX = 0;

      if (localT < 1050) {
        // Linear stream follow
        camY = -140 * (localT / 1050);
      } else {
        // Log-scale dynamic punch-in zoom
        const pPunch = this.clamp((localT - 1050) / 680);
        const easePunch = this.cubicBezier(pPunch, 0.22, 1, 0.36, 1);

        // log scale: exp(lerp(log(1), log(2.4), e))
        zoomScale = Math.exp(this.lerp(Math.log(1.0), Math.log(2.4), easePunch));

        // Focal point tracking toward "Go-to-market" header
        camY = -140 - (460 * easePunch);
        camX = -135 * easePunch;
      }

      this.setAttr(
        this.s5.stage,
        "transform",
        `translate(${camX.toFixed(1)}, ${camY.toFixed(1)}) scale(${zoomScale.toFixed(4)})`
      );
    }

    // =========================================================
    // SCENE 6 (10000ms - 11500ms): Call to Action Outro
    // Button pop: k=300, c=23, zeta=0.63. Arrow delayed 80ms!
    // =========================================================
    if (showS6) {
      const localT = t - 10000;

      // 0 - 520ms: Spring bounce scale-in
      const pBtn = this.clamp(localT / 520);
      const sBtn = this.dampedSpring(pBtn, 300, 23, 1.1);

      // Idle float oscillation
      let floatY = 0;
      if (localT > 520) {
        floatY = Math.sin((localT - 520) * 0.006) * 4;
      }

      this.setAttr(this.s6.ctaScale, "transform", `scale(${sBtn.toFixed(4)})`);
      this.setAttr(this.s6.ctaAnchor, "transform", `translate(540, ${(960 + floatY).toFixed(1)})`);

      // Secondary motion: Arrow follows 80ms later with subtle nudge
      if (this.s6.arrowGroup) {
        if (localT < 80) {
          this.setAttr(this.s6.arrowGroup, "transform", "translate(150, 0) scale(0.9)");
        } else {
          const pArrow = this.clamp((localT - 80) / 360);
          const sArrow = this.dampedSpring(pArrow, 480, 28, 1.0);
          const nudgeX = (1 - sArrow) * -3;
          const nudgeY = (1 - sArrow) * 3;
          this.setAttr(
            this.s6.arrowGroup,
            "transform",
            `translate(${(150 + nudgeX).toFixed(1)}, ${nudgeY.toFixed(1)}) scale(${sArrow.toFixed(3)})`
          );
        }
      }
    }
  }
}

// Export for module usage or browser global
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SaasShortEngine };
}
