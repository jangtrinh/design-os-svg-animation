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
    this.playbackRate = 1;
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
      bgMesh: get("s1-bg-mesh"),
      bgWhite: get("s1-bg-white"),
      cardAnchor: get("s1-card-anchor"),
      cardScale: get("s1-card-scale"),
      cardRect: get("s1-card-rect") || this.svg.querySelector("#s1-card-scale rect"),
      cardContent: get("s1-card-content"),
      modelIcon: get("s1-model-icon"),
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
      badge: get("s3-badge"),
      wordDeeper: get("s3-word-deeper"),
      wordFaster: get("s3-word-faster")
    };

    this.s4 = {
      header: get("s4-header"),
      card1: get("s4-card-1"),
      card2: get("s4-card-2"),
      card3: get("s4-card-3"),
      sub1: get("s4-sub-1"),
      sub2: get("s4-sub-2"),
      sub3: get("s4-sub-3"),
      exitWhite: get("s4-exit-white")
    };

    this.s5 = {
      stage: get("s5-camera-stage"),
      docContent: get("s5-doc-content"),
      badge: get("s5-doc-badge"),
      intro: get("s5-intro"),
      intro2: get("s5-intro-2"),
      h1: get("s5-h1"),
      p1Lines: [
        get("s5-p1-l1"), get("s5-p1-l2"), get("s5-p1-l3"),
        get("s5-p1-l4"), get("s5-p1-l5")
      ],
      h2: get("s5-h2"),
      h3: get("s5-h3"),
      p2Lines: [
        get("s5-p2-l1"), get("s5-p2-l2"), get("s5-p2-l3")
      ]
    };

    this.s6 = {
      centerGroup: get("s6-center-group"),
      brandLockup: get("s6-brand-lockup"),
      ctaScale: get("s6-cta-scale"),
      ctaAnchor: get("s6-cta-anchor"),
      arrowIcon: get("s6-arrow-icon")
    };

    this.fullPromptText = "Our smartest, fastest model yet";

    // Precompute character width cumulative offsets for smooth caret gliding
    this.charOffsets = [];
    const baseCharWidth = 17.55;
    for (let i = 0; i <= this.fullPromptText.length; i++) {
      this.charOffsets.push(-335 + i * baseCharWidth);
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
    const delta = (timestamp - this.lastTimestamp) * (this.playbackRate || 1);
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
   * Analytical Damped Harmonic Oscillator
   * Formula: x(t) = 1 - e^(-zeta*omega*t) * [cos(omega_d*t) + (zeta/sqrt(1-zeta^2))*sin(omega_d*t)]
   * ------------------------------------------------------------- */
  dampedSpring(t, t0, zeta = 0.65, omega = 7.5) {
    if (t < t0) return 0;
    const elapsed = (t - t0) * 0.001; // convert ms to seconds
    const beta = Math.sqrt(Math.max(0.001, 1 - zeta * zeta));
    return 1 - Math.exp(-zeta * omega * elapsed) * (
      Math.cos(omega * beta * elapsed) + (zeta / beta) * Math.sin(omega * beta * elapsed)
    );
  }

  cubicBezier(t, x1, y1, x2, y2) {
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
    // Exact timeline intervals with continuous crossfades
    const showS1 = t < 1500;
    const showS2 = t >= 1480 && t < 3500;
    const showS3 = t >= 3450 && t < 5500;
    const showS4 = t >= 5480 && t < 7550;
    const showS5 = t >= 7280 && t < 10000;
    const showS6 = t >= 9850;

    this.setAttr(this.scenes.s1, "opacity", showS1 ? "1" : "0");
    this.setAttr(this.scenes.s2, "opacity", showS2 ? "1" : "0");

    // S2 pill fade-out on exit
    if (showS2 && t >= 3350) {
      const pExit2 = this.clamp((t - 3350) / 150);
      this.setAttr(this.s2.pillAnchor, "opacity", (1 - pExit2).toFixed(3));
    } else if (showS2) {
      this.setAttr(this.s2.pillAnchor, "opacity", "1");
    }

    // S3 entrance & exit
    if (showS3) {
      const pEnter3 = this.clamp((t - 3450) / 120);
      const pExit3 = t >= 5350 ? this.clamp((t - 5350) / 150) : 0;
      this.setAttr(this.scenes.s3, "opacity", (pEnter3 * (1 - pExit3)).toFixed(3));
    } else {
      this.setAttr(this.scenes.s3, "opacity", "0");
    }

    // S4 entrance & exit
    if (showS4) {
      const pEnter4 = this.clamp((t - 5480) / 120);
      const pExit4 = t >= 7400 ? 1 - this.clamp((t - 7400) / 80) : 1;
      this.setAttr(this.scenes.s4, "opacity", (pEnter4 * pExit4).toFixed(3));
    } else {
      this.setAttr(this.scenes.s4, "opacity", "0");
    }

    // S5 entrance & exit crossfade
    if (showS5) {
      let opac5 = 1;
      if (t < 7450) {
        opac5 = this.clamp((t - 7340) / 100);
      } else if (t >= 9800) {
        opac5 = 1 - this.clamp((t - 9800) / 200);
      }
      this.setAttr(this.scenes.s5, "opacity", opac5.toFixed(3));
    } else {
      this.setAttr(this.scenes.s5, "opacity", "0");
    }

    // S6 entrance
    if (showS6) {
      const pEnter6 = this.clamp((t - 9850) / 150);
      this.setAttr(this.scenes.s6, "opacity", pEnter6.toFixed(3));
    } else {
      this.setAttr(this.scenes.s6, "opacity", "0");
    }

    // =========================================================
    // SCENE 1 (0ms - 1500ms): Dropdown Selection Card & Shared Morph
    // =========================================================
    if (showS1) {
      if (t < 1250) {
        // 0 - 600ms: Card entrance spring (zeta=0.65, omega=7.5)
        const s = this.dampedSpring(t, 0, 0.65, 7.5);
        this.setAttr(this.s1.cardScale, "transform", `scale(${Math.max(0, s).toFixed(4)})`);

        // 120 - 450ms: Model Icon & Title reveal
        const pTitle = this.clamp((t - 120) / 330);
        this.setAttr(this.s1.title, "opacity", pTitle.toFixed(3));
        this.setAttr(this.s1.modelIcon, "opacity", pTitle.toFixed(3));

        // 320 - 700ms: Subtitle fade-in
        const pSub = this.clamp((t - 320) / 380);
        this.setAttr(this.s1.subtitle, "opacity", pSub.toFixed(3));

        // 650 - 1050ms: Emerald Checkmark badge spring pop-in
        if (t < 650) {
          this.setAttr(this.s1.badge, "transform", "translate(255, 0) scale(0)");
          this.setAttr(this.s1.badge, "opacity", "0");
        } else {
          const sBadge = this.dampedSpring(t, 650, 0.68, 9.0);
          this.setAttr(this.s1.badge, "transform", `translate(255, 0) scale(${Math.max(0, sBadge).toFixed(4)})`);
          this.setAttr(this.s1.badge, "opacity", "1");
        }

        // Base card geometry: 660x190 (rx=42)
        if (this.s1.cardRect) {
          this.setAttr(this.s1.cardRect, "width", "660");
          this.setAttr(this.s1.cardRect, "height", "190");
          this.setAttr(this.s1.cardRect, "rx", "42");
          this.setAttr(this.s1.cardRect, "x", "-330");
          this.setAttr(this.s1.cardRect, "y", "-95");
        }
        if (this.s1.cardContent) {
          this.setAttr(this.s1.cardContent, "opacity", "1");
          this.setAttr(this.s1.cardContent, "transform", "translate(0, 0)");
        }
        if (this.s1.bgWhite) {
          this.setAttr(this.s1.bgWhite, "opacity", "0");
        }
      } else {
        // 1250ms - 1500ms: Shared-Element Morphing Shell (Card → Input Pill)
        const pMorph = this.clamp((t - 1250) / 230);
        const easeM = this.cubicBezier(pMorph, 0.22, 1, 0.36, 1);

        // Morph dimensions: 660x190 (rx=42) -> 920x130 (rx=65)
        const curW = this.lerp(660, 920, easeM);
        const curH = this.lerp(190, 130, easeM);
        const curRx = this.lerp(42, 65, easeM);

        if (this.s1.cardRect) {
          this.setAttr(this.s1.cardRect, "width", curW.toFixed(1));
          this.setAttr(this.s1.cardRect, "height", curH.toFixed(1));
          this.setAttr(this.s1.cardRect, "rx", curRx.toFixed(1));
          this.setAttr(this.s1.cardRect, "x", (-curW / 2).toFixed(1));
          this.setAttr(this.s1.cardRect, "y", (-curH / 2).toFixed(1));
        }

        // Dissolve card internal text and upward float
        const fadeContent = Math.max(0, 1 - pMorph * 2.2);
        if (this.s1.cardContent) {
          this.setAttr(this.s1.cardContent, "opacity", fadeContent.toFixed(3));
          this.setAttr(this.s1.cardContent, "transform", `translate(0, ${(-16 * easeM).toFixed(1)})`);
        }

        // Seamless background crossfade into white
        if (this.s1.bgWhite) {
          this.setAttr(this.s1.bgWhite, "opacity", easeM.toFixed(3));
        }
      }
    }

    // =========================================================
    // SCENE 2 (1500ms - 3500ms): Input Field & Caret Glide
    // =========================================================
    if (showS2) {
      const localT = t - 1500;

      // 0 - 350ms: Settle into input shell
      const sShell = 0.985 + 0.015 * this.dampedSpring(localT, 0, 0.75, 9.0);
      this.setAttr(this.s2.pillAnchor, "transform", `translate(540, 960) scale(${sShell.toFixed(4)})`);

      // Interior icon entries (pop/slide in after morph locks)
      // Expanded mic (x=275) and wave badge (x=395) for generous 59px breathing room
      const pIcons = this.clamp(localT / 250);
      const sPlus = this.dampedSpring(localT, 0, 0.7, 8.5);
      this.setAttr(this.s2.iconPlus, "transform", `translate(-390, 0) scale(${Math.max(0, sPlus).toFixed(3)})`);
      this.setAttr(this.s2.iconPlus, "opacity", pIcons.toFixed(3));

      const sMic = this.dampedSpring(localT, 60, 0.7, 8.5);
      this.setAttr(this.s2.iconMic, "transform", `translate(275, 0) scale(${Math.max(0, sMic).toFixed(3)})`);
      this.setAttr(this.s2.iconMic, "opacity", this.clamp((localT - 60) / 200).toFixed(3));

      const sWave = this.dampedSpring(localT, 100, 0.7, 8.5);
      this.setAttr(this.s2.badgeWave, "transform", `translate(395, 0) scale(${Math.max(0, sWave).toFixed(3)})`);
      this.setAttr(this.s2.badgeWave, "opacity", this.clamp((localT - 100) / 200).toFixed(3));

      // 250 - 1750ms: Typewriter text
      const pType = this.clamp((localT - 250) / 1400);
      const rawCharIdx = pType * this.fullPromptText.length;
      const charCount = Math.floor(rawCharIdx);
      const currentStr = this.fullPromptText.substring(0, charCount);
      if (this.s2.promptText.textContent !== currentStr) {
        this.s2.promptText.textContent = currentStr;
      }

      // Smooth Caret Glide
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
      if (this.s2.waveIcon) {
        const tSec = t * 0.001;
        const waveHarmonic = Math.sin(tSec * 7.1) + 0.52 * Math.sin(tSec * 11.7 + 1.8) + 0.23 * Math.sin(tSec * 17.3 + 0.4);
        const waveScale = 1.0 + (waveHarmonic * 0.08);
        this.setAttr(this.s2.waveIcon, "transform", `scale(${waveScale.toFixed(3)})`);
      }
    }

    // =========================================================
    // SCENE 3 (3500ms - 5500ms): Kinetic Typography
    // =========================================================
    if (showS3) {
      const localT = t - 3500;

      // Optical slow drift zoom (1.0 -> 1.04)
      const pDrift = localT / 2000;
      const sDrift = 1.0 + 0.04 * pDrift;
      this.setAttr(this.s3.textAnchor, "transform", `translate(540, 960) scale(${sDrift.toFixed(4)})`);

      // Category badge reveal (moved up to y=-125 for generous breathing room)
      const pBadge = this.clamp(localT / 350);
      if (this.s3.badge) {
        this.setAttr(this.s3.badge, "opacity", pBadge.toFixed(3));
      }

      // 0 - 900ms: "deeper" is active
      // 900 - 1140ms: Kinetic replacement with optical baseline shift
      if (localT < 900) {
        this.setAttr(this.s3.wordDeeper, "opacity", "1");
        this.setAttr(this.s3.wordDeeper, "transform", "translate(0, 0)");
        this.setAttr(this.s3.wordFaster, "opacity", "0");
      } else if (localT < 1140) {
        const pSwap = this.clamp((localT - 900) / 240);
        const easeSwap = this.cubicBezier(pSwap, 0.22, 1, 0.36, 1);

        this.setAttr(this.s3.wordDeeper, "opacity", (1 - easeSwap).toFixed(3));
        this.setAttr(this.s3.wordDeeper, "transform", `translate(0, ${(easeSwap * 24).toFixed(1)})`);

        this.setAttr(this.s3.wordFaster, "opacity", easeSwap.toFixed(3));
        this.setAttr(this.s3.wordFaster, "transform", `translate(0, ${((1 - easeSwap) * -24).toFixed(1)})`);
      } else {
        this.setAttr(this.s3.wordDeeper, "opacity", "0");
        this.setAttr(this.s3.wordFaster, "opacity", "1");
        this.setAttr(this.s3.wordFaster, "transform", "translate(0, 0)");
      }
    }

    // =========================================================
    // SCENE 4 (5500ms - 7550ms): Processing Cards Stack
    // Cascading Momentum Stagger (+0ms, +80ms, +160ms)
    // Continuous exit dissolve into Scene 5 (7150ms - 7500ms)
    // =========================================================
    if (showS4) {
      const localT = t - 5500;

      // Exit transition calculation (7150ms - 7450ms)
      const pExit = this.clamp((t - 7150) / 280);
      const easeExit = this.easeOutCubic(pExit);
      const exitFade = 1 - pExit;
      const exitLiftY = -40 * easeExit;

      // Header badge fade in & exit (fade header out swiftly by 7280ms)
      if (this.s4.header) {
        const pHead = this.clamp(localT / 250);
        const pHeadExit = 1 - this.clamp((t - 7120) / 160);
        this.setAttr(this.s4.header, "opacity", (pHead * pHeadExit).toFixed(3));
        this.setAttr(this.s4.header, "transform", `translate(540, ${(500 + exitLiftY).toFixed(1)})`);
      }

      // Exit white crossfade overlay
      if (this.s4.exitWhite) {
        this.setAttr(this.s4.exitWhite, "opacity", easeExit.toFixed(3));
      }

      const updateCard = (cardElem, startTime, finalY) => {
        if (localT < startTime) {
          this.setAttr(cardElem, "transform", `translate(540, ${finalY + 140})`);
          this.setAttr(cardElem, "opacity", "0");
        } else {
          const s = this.dampedSpring(localT, startTime, 0.72, 8.0);
          const curY = (finalY + 140) - (140 * s) + exitLiftY;
          this.setAttr(cardElem, "transform", `translate(540, ${curY.toFixed(1)})`);
          const enterFade = this.clamp((localT - startTime) / 220);
          this.setAttr(cardElem, "opacity", (enterFade * exitFade).toFixed(3));
        }
      };

      // Spaced at y = 710, 930, 1150 for generous 60px gaps
      updateCard(this.s4.card1, 0, 710);
      updateCard(this.s4.card2, 80, 930);
      updateCard(this.s4.card3, 160, 1150);

      // Status text "Analyzing..." subtle glow pulse
      const pulse = (0.65 + 0.35 * Math.sin(t * 0.009)) * exitFade;
      this.setAttr(this.s4.sub1, "opacity", pulse.toFixed(3));
      this.setAttr(this.s4.sub2, "opacity", pulse.toFixed(3));
      this.setAttr(this.s4.sub3, "opacity", pulse.toFixed(3));
    }

    // =========================================================
    // SCENE 5 (7320ms - 10000ms): Generative Text & Centered Camera
    // Seamless overlap handoff from S4 (no blank frames)
    // =========================================================
    if (showS5) {
      const s5Time = t - 7320;

      // Physical upward slide-in of the document canvas
      const sDoc = this.dampedSpring(t, 7320, 0.72, 8.5);
      const docY = 460 - 40 * sDoc;
      if (this.s5.docContent) {
        this.setAttr(this.s5.docContent, "transform", `translate(100, ${docY.toFixed(1)})`);
      }

      // Camera Motion (C^1 continuous log-scale zoom from (0,0) to target — ZERO jump)
      const targetZoom = 1.35;
      const targetCamX = 540 - targetZoom * 390; // = +13.5
      const targetCamY = 960 - targetZoom * 990; // = -376.5

      let curZoom = 1.0;
      let curCamX = 0;
      let curCamY = 0;
      let easePunch = 0;

      if (s5Time >= 1350) {
        const pPunch = this.clamp((s5Time - 1350) / 850);
        easePunch = this.cubicBezier(pPunch, 0.22, 1, 0.36, 1);
        curZoom = this.lerp(1.0, targetZoom, easePunch);
        curCamX = this.lerp(0, targetCamX, easePunch);
        curCamY = this.lerp(0, targetCamY, easePunch);
      }

      this.setAttr(
        this.s5.stage,
        "transform",
        `translate(${curCamX.toFixed(2)}, ${curCamY.toFixed(2)}) scale(${curZoom.toFixed(4)})`
      );

      // Top elements softly dissolve during zoom so they never crowd or collide with the top notch
      const topFade = Math.max(0, 1 - easePunch * 1.6);

      // Silky smooth 240ms cubic ease-out text reveal (eliminates harsh 90ms linear pop)
      const showAt = (elem, revealT, isTop = true) => {
        if (!elem) return;
        const pRaw = this.clamp((s5Time - revealT) / 240);
        const easeIn = this.easeOutCubic(pRaw);
        const finalOpac = isTop ? easeIn * topFade : easeIn;
        this.setAttr(elem, "opacity", finalOpac.toFixed(3));
      };

      // Natural, readable text cascade timing
      if (this.s5.badge) showAt(this.s5.badge, 0, true);
      showAt(this.s5.intro, 80, true);
      showAt(this.s5.intro2, 150, true);
      showAt(this.s5.h1, 240, true);

      this.s5.p1Lines.forEach((line, idx) => {
        showAt(line, 320 + idx * 80, true);
      });

      showAt(this.s5.h2, 880, false);
      showAt(this.s5.h3, 980, false);

      this.s5.p2Lines.forEach((line, idx) => {
        showAt(line, 1060 + idx * 75, false);
      });
    }

    // =========================================================
    // SCENE 6 (9850ms - 11500ms): Call to Action & OpenAI Spring Outro
    // =========================================================
    if (showS6) {
      const localT = t - 9900;

      // 0 - 650ms: OpenAI Rosette + Wordmark scale from center with damped spring
      if (this.s6.brandLockup) {
        const sBrand = this.dampedSpring(localT, 0, 0.65, 7.5);
        this.setAttr(this.s6.brandLockup, "transform", `translate(0, -120) scale(${Math.max(0, sBrand).toFixed(4)})`);
        this.setAttr(this.s6.brandLockup, "opacity", this.clamp(localT / 250).toFixed(3));
      }

      // 350 - 950ms: CTA Pill Button scale in (placed at y = 180 for generous 116px gap)
      const sBtn = this.dampedSpring(localT, 350, 0.65, 7.5);
      let floatY = 0;
      if (localT > 850) {
        floatY = Math.sin((localT - 850) * 0.006) * 4;
      }

      this.setAttr(this.s6.ctaScale, "transform", `scale(${Math.max(0, sBtn).toFixed(4)})`);
      this.setAttr(this.s6.ctaAnchor, "transform", `translate(0, ${(180 + floatY).toFixed(1)})`);

      // Secondary motion: Arrow follows with subtle bounce
      if (this.s6.arrowIcon) {
        const sArrow = this.dampedSpring(localT, 550, 0.7, 8.5);
        this.setAttr(this.s6.arrowIcon, "transform", `translate(145, 0) scale(${Math.max(0, sArrow).toFixed(3)})`);
      }
    }
  }
}

// Export for module usage or browser global
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SaasShortEngine };
}
