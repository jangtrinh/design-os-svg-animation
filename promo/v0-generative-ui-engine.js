/**
 * Vercel v0: Generative UI — Standalone Deterministic Virtual Clock Engine
 * 47.5s High-Fidelity 60fps Recreation Engine
 * Standards: $C^1$-continuous camera trajectory, quintic cursor smoothing,
 * EaseUI tactile depth, and strict Anti-Flop compliance.
 */

(function () {
  'use strict';

  const DURATION = 47.508;
  const W = 1920, H = 1080;

  // --- DOM References ---
  const videoStage = document.getElementById('video-stage');
  const cameraWorld = document.getElementById('camera-world');
  const virtualCursor = document.getElementById('virtual-cursor');
  const clickRipple = document.getElementById('click-ripple');
  const btnFloatingEdit = document.getElementById('btn-floating-edit');
  const radioStealthPublic = document.getElementById('radio-stealth-public');
  const videoScrubber = document.getElementById('video-scrubber');
  const timecodeDisplay = document.getElementById('timecode');
  const sceneNameDisplay = document.getElementById('scene-name');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const playIcon = document.getElementById('play-icon');
  const speedBtns = document.querySelectorAll('.speed-btn');
  const pillBtns = document.querySelectorAll('.pill-btn');

  // Scene Layers
  const scene1 = document.getElementById('scene-1-logo');
  const scene2 = document.getElementById('scene-2-title');
  const scene3 = document.getElementById('scene-3-prompt');
  const scene4 = document.getElementById('scene-4-app');
  const scene8 = document.getElementById('scene-8-v0dev');
  const scene9 = document.getElementById('scene-9-vercel');

  // Scene 1 Elements
  const s1GuidelinesSvg = document.getElementById('s1-guidelines-svg');
  const v0StrokePath = document.getElementById('v0-stroke-path');
  const v0FillPath = document.getElementById('v0-fill-path');

  // Scene 2 & 3 Elements
  const titlePillMorph = document.getElementById('title-pill-morph');
  const titleHeroText = document.getElementById('title-hero-text');
  const reelTextTop = document.getElementById('reel-text-top');
  const promptActiveText = document.getElementById('prompt-active-text');
  const reelTextBottom = document.getElementById('reel-text-bottom');
  const btnPromptEnter = document.getElementById('btn-prompt-enter');

  // Scene 4 & 5 Elements
  const badgeStealthToggle = document.getElementById('badge-stealth-toggle');
  const badgeStealthText = document.getElementById('badge-stealth-text');
  const canvasChatText = document.getElementById('canvas-chat-text');
  const btnToggleCode = document.getElementById('btn-toggle-code');
  const btnCodeLabel = document.getElementById('btn-code-label');
  const btnCodeIcon = document.getElementById('btn-code-icon');
  const primaryAppCard = document.getElementById('primary-app-card');
  const acmeBrandWrap = document.getElementById('acme-brand-wrap');
  const componentInspectBox = document.getElementById('component-inspect-box');
  const componentEditPopover = document.getElementById('component-edit-popover');
  const popoverTypewriterText = document.getElementById('popover-typewriter-text');
  const btnPopoverUpdate = document.getElementById('btn-popover-update');
  const popoverUpdateIcon = document.getElementById('popover-update-icon');
  const cardVerV1 = document.getElementById('card-ver-v1');
  const codeInspectorCard = document.getElementById('code-inspector-card');
  const tooltipClickEdit = document.getElementById('tooltip-click-edit');

  // Scene 7 Elements
  const stealthPopoverDialog = document.getElementById('stealth-popover-dialog');
  const optStealthPublic = document.getElementById('opt-stealth-public');
  const optStealthPrivate = document.getElementById('opt-stealth-private');

  // Scene 8 & 9 Elements
  const gridWallContainer = document.getElementById('grid-wall-container');
  const v0devCenterLockup = document.getElementById('v0dev-center-lockup');
  const vercelOutroTriangle = document.getElementById('vercel-outro-triangle');
  const vercelOutroWordmark = document.getElementById('vercel-outro-wordmark');

  // --- Tactile Click Events Catalog (Exact Unscaled World Contact Centers) ---
  const CLICK_EVENTS = [
    { id: 'enter',    targetId: 'btn-prompt-enter',     t: 12.80, x: 1313, y: 540,  el: btnPromptEnter, color: '#0070F3', label: 'Submit Prompt' },
    { id: 'sparkle',  targetId: 'btn-floating-edit',    t: 16.70, x: 1239, y: 1028, el: btnFloatingEdit, color: '#0070F3', label: 'Click & Edit Sparkle' },
    { id: 'inspect',  targetId: 'acme-brand-wrap',      t: 19.40, x: 159,  y: 177,   el: acmeBrandWrap, color: '#0070F3', label: 'Inspect Acme Brand' },
    { id: 'update',   targetId: 'btn-popover-update',   t: 23.50, x: 667,  y: 269,   el: btnPopoverUpdate, color: '#0070F3', label: 'Update Component' },
    { id: 'code',     targetId: 'btn-toggle-code',      t: 26.50, x: 1816, y: 102,   el: btnToggleCode, color: '#0070F3', label: 'Toggle Code View' },
    { id: 'canvas',   targetId: 'btn-toggle-code',      t: 32.00, x: 1816, y: 102,   el: btnToggleCode, color: '#0070F3', label: 'Return to Canvas' },
    { id: 'stealth',  targetId: 'badge-stealth-toggle', t: 33.80, x: 465,  y: 44,    el: badgeStealthToggle, color: '#D97706', label: 'Open Stealth Dialog' },
    { id: 'public',   targetId: 'radio-stealth-public', t: 35.80, x: 694,  y: 179,   el: radioStealthPublic, color: '#059669', label: 'Select Public Mode' }
  ];
  window.__CLICK_EVENTS = CLICK_EVENTS;

  // --- State ---
  let currentTime = 0;
  let isPlaying = false;
  let playbackSpeed = 1.0;
  let lastTimestamp = null;
  let animationFrameId = null;

  // --- Viewport Auto-Scaling (Fit 1920x1080 without Distortion or Cropping) ---
  function updateViewportScale() {
    const wrapper = document.querySelector('.video-stage-wrapper');
    if (!wrapper || !videoStage) return;

    if (document.body.classList.contains('clean-export') || document.documentElement.classList.contains('clean-export')) {
      videoStage.style.transform = 'none';
      return;
    }

    const availW = wrapper.clientWidth - 40;
    const availH = wrapper.clientHeight - 40;
    const scale = Math.min(availW / W, availH / H);

    videoStage.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', updateViewportScale);
  setTimeout(updateViewportScale, 30);
  updateViewportScale();

  // --- Kinematic Utilities ---
  function clamp(val, min = 0, max = 1) {
    return Math.max(min, Math.min(max, val));
  }

  function smoothstep(t) {
    const c = clamp(t);
    return c * c * (3 - 2 * c);
  }

  function smootherstep(t) {
    const c = clamp(t);
    return c * c * c * (c * (c * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // --- Set Cursor Position & Pressed State (Tip strictly at 0,0) ---
  function setCursor(x, y, visible = true, isPressed = false) {
    if (!visible) {
      virtualCursor.style.opacity = '0';
      return;
    }
    virtualCursor.style.opacity = '1';
    virtualCursor.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    if (isPressed) {
      virtualCursor.classList.add('pressed');
    } else {
      virtualCursor.classList.remove('pressed');
    }
  }

  // --- Render Tactile Click Ripples (Concentric Hotspot Alignment) ---
  function renderClickRipples(t) {
    let activeEvent = null;
    let isPressed = false;

    CLICK_EVENTS.forEach(evt => {
      if (evt.el) evt.el.classList.remove('pressed');
    });

    for (let evt of CLICK_EVENTS) {
      if (t >= evt.t - 0.08 && t < evt.t + 0.16) {
        isPressed = true;
        if (evt.el) evt.el.classList.add('pressed');
      }
      if (t >= evt.t && t < evt.t + 0.45 && !activeEvent) {
        activeEvent = evt;
      }
    }

    if (activeEvent && clickRipple) {
      const q = (t - activeEvent.t) / 0.45;
      const progress = smootherstep(clamp(q));
      const scale = 1.0 + 4.5 * progress;
      const opacity = Math.max(0, 0.9 * (1.0 - progress));
      clickRipple.style.display = 'block';
      clickRipple.style.transform = `translate3d(${activeEvent.x}px, ${activeEvent.y}px, 0) translate(-50%, -50%) scale(${scale.toFixed(2)})`;
      clickRipple.style.opacity = opacity.toFixed(3);
      clickRipple.style.borderColor = activeEvent.color;
      clickRipple.style.boxShadow = `0 0 16px ${activeEvent.color}88, inset 0 0 6px ${activeEvent.color}66`;
    } else if (clickRipple) {
      clickRipple.style.display = 'none';
    }

    return isPressed;
  }

  // --- Master Timecode Renderer ---
  function renderAt(sec) {
    const t = Math.max(0, Math.min(DURATION, sec));

    // Update Scrubber & HUD
    if (videoScrubber && document.activeElement !== videoScrubber) {
      videoScrubber.value = t.toFixed(2);
    }
    if (timecodeDisplay) {
      const m = Math.floor(t / 60);
      const s = (t % 60).toFixed(1).padStart(4, '0');
      timecodeDisplay.textContent = `0${m}:${s} / 00:${DURATION.toFixed(1)}`;
    }

    // Default cursor & camera
    let cursorVisible = false;
    let cursorX = -100, cursorY = -100;
    let camScale = 1.0;
    let camX = 0, camY = 0;

    // -------------------------------------------------------------
    // SCENE 1: Geometric Wireframe Logo & Radial Guidelines (0.0s – 3.2s)
    // -------------------------------------------------------------
    if (t < 3.2) {
      const s1Opacity = t < 2.6 ? clamp(t / 0.3) : clamp((3.2 - t) / 0.4);
      scene1.style.opacity = s1Opacity.toFixed(3);
      scene1.style.display = s1Opacity > 0 ? 'flex' : 'none';

      // Stroke dashoffset: 80 -> 0 over 0.0s to 1.4s
      const strokeP = clamp(t / 1.4);
      const dashoffset = lerp(80, 0, smootherstep(strokeP));
      v0StrokePath.style.strokeDashoffset = dashoffset.toFixed(1);

      // Radial Guidelines emerge at 1.2s to 2.5s
      if (t >= 1.1 && t < 2.8) {
        const guideP = t < 1.8 ? clamp((t - 1.1) / 0.5) : clamp((2.8 - t) / 0.4);
        s1GuidelinesSvg.style.opacity = smootherstep(guideP).toFixed(3);
      } else {
        s1GuidelinesSvg.style.opacity = '0';
      }

      // Solid block fill morph at 1.5s - 2.5s
      if (t >= 1.5) {
        const fillP = clamp((t - 1.5) / 0.4);
        const fillOpacity = smootherstep(fillP);
        v0FillPath.style.opacity = fillOpacity.toFixed(3);
        v0StrokePath.style.opacity = (1 - fillOpacity).toFixed(3);
      } else {
        v0FillPath.style.opacity = '0';
        v0StrokePath.style.opacity = '1';
      }

      // Subtle scale contraction before transition
      if (t >= 2.6) {
        const scaleP = clamp((t - 2.6) / 0.6);
        const s = lerp(1.0, 0.96, smootherstep(scaleP));
        scene1.style.transform = `scale(${s.toFixed(3)})`;
      } else {
        scene1.style.transform = 'scale(1.0)';
      }

      if (sceneNameDisplay && t < 3.2) sceneNameDisplay.textContent = 'Scene 1: v0 Wireframe & Radial Guidelines';
    } else {
      scene1.style.opacity = '0';
      scene1.style.display = 'none';
    }

    // -------------------------------------------------------------
    // SCENE 2 & 3A: Title Morph to Pill Capsule (3.2s – 6.5s)
    // -------------------------------------------------------------
    if (t >= 3.0 && t < 6.8) {
      const s2In = clamp((t - 3.2) / 0.4);
      const s2Out = clamp((6.6 - t) / 0.4);
      const s2Opacity = Math.min(s2In, s2Out);
      scene2.style.opacity = s2Opacity.toFixed(3);
      scene2.style.display = s2Opacity > 0 ? 'flex' : 'none';

      // Pill capsule form around text at 4.6s
      if (t >= 4.6) {
        titlePillMorph.classList.add('as-pill');
      } else {
        titlePillMorph.classList.remove('as-pill');
      }

      if (sceneNameDisplay && t >= 3.2 && t < 6.5) sceneNameDisplay.textContent = 'Scene 2: "What will you ship?" Pill Morph';
    } else {
      scene2.style.opacity = '0';
      scene2.style.display = 'none';
    }

    // -------------------------------------------------------------
    // SCENE 3B: Vertical 3D Drum Reel Prompt Bar (6.5s – 13.5s)
    // -------------------------------------------------------------
    if (t >= 6.2 && t < 13.8) {
      const s3In = clamp((t - 6.4) / 0.4);
      const s3Out = clamp((13.6 - t) / 0.4);
      const s3Opacity = Math.min(s3In, s3Out);
      scene3.style.opacity = s3Opacity.toFixed(3);
      scene3.style.display = s3Opacity > 0 ? 'flex' : 'none';

      // Drum Reel Cycling
      if (t < 8.2) {
        reelTextTop.style.opacity = '0';
        promptActiveText.textContent = 'A sleek pricing page';
        reelTextBottom.textContent = 'A flower shop';
        reelTextBottom.style.opacity = '0.8';
      } else if (t >= 8.2 && t < 10.2) {
        reelTextTop.textContent = 'A sleek pricing page';
        reelTextTop.style.opacity = '0.7';
        promptActiveText.textContent = 'A flower shop';
        reelTextBottom.textContent = 'A SaaS dashboard layout';
        reelTextBottom.style.opacity = '0.8';
      } else {
        reelTextTop.textContent = 'A flower shop';
        reelTextTop.style.opacity = '0.7';
        promptActiveText.textContent = 'A SaaS dashboard layout';
        reelTextBottom.textContent = 'A newsletter form in dark mode';
        reelTextBottom.style.opacity = '0.7';
      }

      // Cursor movement & click on Submit button (11.2s - 13.5s)
      if (t >= 11.2 && t < 13.5) {
        cursorVisible = true;
        if (t < 12.8) {
          const curP = clamp((t - 11.2) / 1.4);
          cursorX = lerp(1480, 1313, smootherstep(curP));
          cursorY = lerp(780, 540, smootherstep(curP));
        } else {
          cursorX = 1313;
          cursorY = 540;
        }

        // Button click compression
        if (t >= 12.72 && t <= 13.05) {
          const clickP = (t - 12.72) / 0.33;
          btnPromptEnter.style.transform = `scale(${lerp(0.92, 1.0, smootherstep(clickP))})`;
        } else {
          btnPromptEnter.style.transform = 'scale(1.0)';
        }
      }

      if (sceneNameDisplay && t >= 6.5 && t < 13.5) sceneNameDisplay.textContent = 'Scene 3: 3D Cylindrical Drum Reel';
    } else {
      scene3.style.opacity = '0';
      scene3.style.display = 'none';
    }

    // -------------------------------------------------------------
    // SCENE 4 & 5: Acme Inc Dashboard Canvas & Component Edit (13.5s – 26.5s)
    // -------------------------------------------------------------
    if (t >= 13.4 && t < 26.8) {
      const s4In = clamp((t - 13.5) / 0.5);
      const s4Out = clamp((26.7 - t) / 0.4);
      const s4Opacity = Math.min(s4In, s4Out);
      scene4.style.opacity = s4Opacity.toFixed(3);
      scene4.style.display = s4Opacity > 0 ? 'block' : 'none';

      primaryAppCard.style.opacity = '1';
      codeInspectorCard.style.opacity = '0';
      codeInspectorCard.style.pointerEvents = 'none';
      btnCodeLabel.textContent = 'Code </>';
      btnCodeIcon.innerHTML = '<use href="#icon-code"></use>';

      // Scene 4: Hover bottom edit button & show "Click & Edit" tooltip (15.2s - 17.2s)
      if (t >= 15.2 && t < 17.2) {
        cursorVisible = true;
        if (t < 16.7) {
          const cp = clamp((t - 15.2) / 1.3);
          cursorX = lerp(1050, 1239, smootherstep(cp));
          cursorY = lerp(850, 1028, smootherstep(cp));
        } else {
          cursorX = 1239;
          cursorY = 1028;
        }

        if (t >= 16.0 && t < 17.1) {
          tooltipClickEdit.style.opacity = '1';
        } else {
          tooltipClickEdit.style.opacity = '0';
        }
      } else {
        tooltipClickEdit.style.opacity = '0';
      }

      // --- Scene 5: Component-Level Blue Logo Edit (17.0s – 26.5s) ---
      if (t >= 17.0 && t < 26.5) {
        // Continuous $C^1$ Camera Zoom-In towards Acme Inc logo area
        if (t >= 17.2 && t < 24.8) {
          const zoomP = clamp((t - 17.2) / 1.4);
          camScale = lerp(1.0, 1.65, smootherstep(zoomP));
          camX = lerp(0, 260, smootherstep(zoomP));
          camY = lerp(0, 120, smootherstep(zoomP));
        } else if (t >= 24.8) {
          const unzoomP = clamp((t - 24.8) / 1.4);
          camScale = lerp(1.65, 1.0, smootherstep(unzoomP));
          camX = lerp(260, 0, smootherstep(unzoomP));
          camY = lerp(120, 0, smootherstep(unzoomP));
        }

        // Cursor hovers over Acme Inc logo at (159, 177), clicks at 19.4s, then moves to Update button (667, 269)
        if (t >= 17.2 && t < 24.5) {
          cursorVisible = true;
          if (t < 19.4) {
            const cp = clamp((t - 17.2) / 1.6);
            cursorX = lerp(1239, 159, smootherstep(cp));
            cursorY = lerp(1028, 177, smootherstep(cp));
          } else if (t >= 19.4 && t < 23.5) {
            const upP = clamp((t - 19.8) / 1.4);
            cursorX = lerp(159, 667, smootherstep(upP));
            cursorY = lerp(177, 269, smootherstep(upP));
          } else {
            cursorX = 667;
            cursorY = 269;
          }
        }

        // Component Inspection Outline snaps on
        if (t >= 18.2 && t < 24.2) {
          componentInspectBox.style.opacity = '1';
          componentInspectBox.style.transform = 'scale(1.0)';
        } else {
          componentInspectBox.style.opacity = '0';
          componentInspectBox.style.transform = 'scale(0.96)';
        }

        // Popover Dialog Springs Open (19.5s – 24.8s)
        if (t >= 19.5 && t < 24.8) {
          const popP = clamp((t - 19.5) / 0.35);
          componentEditPopover.style.opacity = smootherstep(popP).toFixed(3);
          componentEditPopover.style.transform = `scale(${lerp(0.92, 1.0, smootherstep(popP)).toFixed(3)}) translateY(0)`;

          // Typewriting in popover
          if (t < 21.2) {
            popoverTypewriterText.textContent = 'Make this element larger, add an element, change colors';
            popoverTypewriterText.style.color = '#71717A';
          } else {
            const fullText = 'Make the company logo color blue';
            const typeP = clamp((t - 21.2) / 1.4);
            const chars = Math.round(fullText.length * typeP);
            popoverTypewriterText.textContent = fullText.slice(0, chars) + (typeP < 1 ? '|' : '');
            popoverTypewriterText.style.color = '#000000';
          }

          // Spinner on Update button upon click (23.5s - 24.8s)
          if (t >= 23.5) {
            btnPopoverUpdate.classList.add('is-loading');
            popoverUpdateIcon.innerHTML = '<use href="#icon-spinner"></use>';
          } else {
            btnPopoverUpdate.classList.remove('is-loading');
            popoverUpdateIcon.innerHTML = '<use href="#icon-return"></use>';
          }
        } else {
          componentEditPopover.style.opacity = '0';
          componentEditPopover.style.transform = 'scale(0.92) translateY(10px)';
          btnPopoverUpdate.classList.remove('is-loading');
          popoverUpdateIcon.innerHTML = '<use href="#icon-return"></use>';
        }

        // Blue Logo Morph at 24.8s!
        if (t >= 24.8) {
          acmeBrandWrap.classList.add('is-blue');
          canvasChatText.textContent = 'Make the company logo color blue';
          cardVerV1.style.opacity = '1';
          cardVerV1.style.transform = 'translateY(0)';
        } else {
          acmeBrandWrap.classList.remove('is-blue');
          canvasChatText.textContent = 'A SaaS dashboard layout';
          cardVerV1.style.opacity = '0';
          cardVerV1.style.transform = 'translateY(10px)';
        }

        if (sceneNameDisplay && t >= 17.0 && t < 26.5) sceneNameDisplay.textContent = 'Scene 5: Component Blue Edit & Spinner';
      } else {
        componentInspectBox.style.opacity = '0';
        componentEditPopover.style.opacity = '0';
        if (sceneNameDisplay && t >= 13.5 && t < 17.0) sceneNameDisplay.textContent = 'Scene 4: Acme Dashboard Canvas & Click-Edit';
      }

      // Cursor movement from Update button to Code button at 26.5s
      if (t >= 24.8 && t < 26.8) {
        cursorVisible = true;
        if (t < 26.5) {
          const codeP = clamp((t - 24.8) / 1.4);
          cursorX = lerp(667, 1816, smootherstep(codeP));
          cursorY = lerp(269, 102, smootherstep(codeP));
        } else {
          cursorX = 1816;
          cursorY = 102;
        }
      }
    } else {
      if (t < 26.8) scene4.style.opacity = '0';
    }

    // -------------------------------------------------------------
    // SCENE 6: Code View Flip & 3D Perspective Tilt (26.5s – 32.5s)
    // -------------------------------------------------------------
    if (t >= 26.5 && t < 32.8) {
      scene4.style.opacity = '1';
      scene4.style.display = 'block';

      // 3D Card tilt entrance
      const c6In = clamp((t - 26.6) / 0.4);
      const c6Out = clamp((32.5 - t) / 0.4);
      const c6Opacity = Math.min(c6In, c6Out);
      codeInspectorCard.style.opacity = c6Opacity.toFixed(3);
      codeInspectorCard.style.pointerEvents = 'auto';

      primaryAppCard.style.opacity = '0.15';
      btnCodeLabel.textContent = 'Canvas';
      btnCodeIcon.innerHTML = '<use href="#icon-canvas"></use>';

      // Cursor moves across code card then back to Canvas button
      if (t >= 27.5 && t < 32.5) {
        cursorVisible = true;
        if (t < 30.5) {
          const cp = clamp((t - 27.5) / 2.0);
          cursorX = lerp(1816, 750, smootherstep(cp));
          cursorY = lerp(102, 350, smootherstep(cp));
        } else if (t < 32.0) {
          const cp2 = clamp((t - 30.5) / 1.4);
          cursorX = lerp(750, 1816, smootherstep(cp2));
          cursorY = lerp(350, 102, smootherstep(cp2));
        } else {
          cursorX = 1816;
          cursorY = 102;
        }
      }

      if (sceneNameDisplay && t >= 26.5 && t < 32.5) sceneNameDisplay.textContent = 'Scene 6: 3D Code View Flip & CLI';
    } else if (t >= 32.8) {
      codeInspectorCard.style.opacity = '0';
      primaryAppCard.style.opacity = '1';
      btnCodeLabel.textContent = 'Code </>';
      btnCodeIcon.innerHTML = '<use href="#icon-code"></use>';
    }

    // -------------------------------------------------------------
    // SCENE 7: Breadcrumb Stealth Mode & Privacy Dialog (32.5s – 36.5s)
    // -------------------------------------------------------------
    if (t >= 32.5 && t < 36.8) {
      scene4.style.opacity = '1';
      scene4.style.display = 'block';

      // Camera zooms into breadcrumb
      if (t >= 32.6 && t < 36.4) {
        const camP = clamp((t - 32.6) / 1.0);
        camScale = lerp(1.0, 1.55, smootherstep(camP));
        camX = lerp(0, 240, smootherstep(camP));
        camY = lerp(0, 40, smootherstep(camP));
      }

      // Cursor moves to Stealth/Private badge at top breadcrumb
      if (t >= 32.6 && t < 36.5) {
        cursorVisible = true;
        if (t < 33.8) {
          const spP = clamp((t - 32.6) / 1.0);
          cursorX = lerp(1816, 465, smootherstep(spP));
          cursorY = lerp(102, 44, smootherstep(spP));
        } else if (t >= 33.8 && t < 35.8) {
          // Move down to Public option in stealth dialog at (694, 179)
          const pubP = clamp((t - 34.2) / 1.2);
          cursorX = lerp(465, 694, smootherstep(pubP));
          cursorY = lerp(44, 179, smootherstep(pubP));
        } else {
          cursorX = 694;
          cursorY = 179;
        }
      }

      // Stealth Popover Opens at 33.9s
      if (t >= 33.9 && t < 36.5) {
        const popP = clamp((t - 33.9) / 0.3);
        stealthPopoverDialog.style.opacity = smootherstep(popP).toFixed(3);
        stealthPopoverDialog.style.transform = `scale(${lerp(0.94, 1.0, smootherstep(popP)).toFixed(3)}) translateY(0)`;
      } else {
        stealthPopoverDialog.style.opacity = '0';
        stealthPopoverDialog.style.transform = 'scale(0.94) translateY(-10px)';
      }

      // Selection Toggle to Public at 35.8s
      if (t >= 35.8) {
        optStealthPublic.classList.add('selected');
        optStealthPrivate.classList.remove('selected');
        badgeStealthToggle.classList.add('status-public');
        badgeStealthText.textContent = 'Public';
      } else {
        optStealthPublic.classList.remove('selected');
        optStealthPrivate.classList.add('selected');
        badgeStealthToggle.classList.remove('status-public');
        badgeStealthText.textContent = 'Private';
      }

      if (sceneNameDisplay && t >= 32.5 && t < 36.5) sceneNameDisplay.textContent = 'Scene 7: Stealth Mode & Public Toggle';
    } else {
      stealthPopoverDialog.style.opacity = '0';
    }

    // -------------------------------------------------------------
    // SCENE 8: 12-Card Expansive Generative Grid Wall & "v0.dev" (36.5s – 43.0s)
    // -------------------------------------------------------------
    if (t >= 36.4 && t < 43.2) {
      scene4.style.opacity = '0';
      const s8In = clamp((t - 36.5) / 0.5);
      const s8Out = clamp((43.0 - t) / 0.5);
      const s8Opacity = Math.min(s8In, s8Out);
      scene8.style.opacity = s8Opacity.toFixed(3);
      scene8.style.display = s8Opacity > 0 ? 'flex' : 'none';

      // 4x3 Grid Wall zoom-out and fade
      if (t < 40.0) {
        gridWallContainer.style.opacity = '1';
        v0devCenterLockup.style.opacity = '0';
        const pullP = clamp((t - 36.5) / 2.5);
        const scale = lerp(1.2, 0.95, smootherstep(pullP));
        gridWallContainer.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      } else {
        // Grid fades out, v0.dev fades in
        const fadeP = clamp((t - 40.0) / 0.6);
        gridWallContainer.style.opacity = (1 - smootherstep(fadeP)).toFixed(3);
        v0devCenterLockup.style.opacity = smootherstep(fadeP).toFixed(3);
        const titleScale = lerp(0.94, 1.0, smootherstep(fadeP));
        v0devCenterLockup.style.transform = `scale(${titleScale.toFixed(3)})`;
      }

      if (sceneNameDisplay && t >= 36.5 && t < 43.0) sceneNameDisplay.textContent = 'Scene 8: 12-Card Generative Wall & v0.dev';
    } else {
      scene8.style.opacity = '0';
      scene8.style.display = 'none';
    }

    // -------------------------------------------------------------
    // SCENE 9: Official Vercel Outro (Center to Horizontal Lockup) (43.0s – 47.5s)
    // -------------------------------------------------------------
    if (t >= 42.8) {
      const s9In = clamp((t - 43.0) / 0.5);
      const s9Out = clamp((DURATION - t) / 0.5);
      const s9Opacity = Math.min(s9In, s9Out);
      scene9.style.opacity = s9Opacity.toFixed(3);
      scene9.style.display = s9Opacity > 0 ? 'flex' : 'none';

      // 43.0s - 44.5s: Triangle centered
      // 44.5s - 46.5s: Triangle translates left, wordmark slides & fades in
      if (t < 44.5) {
        vercelOutroTriangle.style.transform = 'translateX(0)';
        vercelOutroWordmark.style.opacity = '0';
        vercelOutroWordmark.style.transform = 'translateX(-20px)';
      } else {
        const transP = clamp((t - 44.5) / 1.0);
        const triX = lerp(0, -20, smootherstep(transP));
        vercelOutroTriangle.style.transform = `translateX(${triX.toFixed(1)}px)`;
        vercelOutroWordmark.style.opacity = smootherstep(transP).toFixed(3);
        const wordX = lerp(-20, 0, smootherstep(transP));
        vercelOutroWordmark.style.transform = `translateX(${wordX.toFixed(1)}px)`;
      }

      if (sceneNameDisplay && t >= 43.0) sceneNameDisplay.textContent = 'Scene 9: Official Vercel Outro';
    } else {
      scene9.style.opacity = '0';
      scene9.style.display = 'none';
    }

    // Apply Camera Transform
    cameraWorld.style.transform = `scale(${camScale.toFixed(4)}) translate3d(${camX.toFixed(1)}px, ${camY.toFixed(1)}px, 0)`;

    // Apply Cursor & Concentric Click Ripple
    const isPressed = renderClickRipples(t);
    setCursor(cursorX, cursorY, cursorVisible, isPressed);

    // Update active scene pill button
    pillBtns.forEach(btn => {
      const sceneTime = parseFloat(btn.dataset.seek);
      const nextTime = getNextSceneTime(sceneTime);
      if (t >= sceneTime && t < nextTime) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function getNextSceneTime(st) {
    const times = [0.0, 3.2, 6.5, 13.5, 17.0, 26.5, 32.5, 36.5, 43.0, DURATION];
    const idx = times.indexOf(st);
    return idx !== -1 && idx < times.length - 1 ? times[idx + 1] : DURATION;
  }

  // --- Public Deterministic Virtual Clock API ---
  window.__seekToTime = function (timestampSeconds) {
    currentTime = Math.max(0, Math.min(DURATION, timestampSeconds));
    renderAt(currentTime);
  };

  window.__getVideoDuration = function () {
    return DURATION;
  };

  window.__renderFrame = function (timestampSeconds) {
    window.__seekToTime(timestampSeconds);
  };

  // --- Interactive Playback Loop ---
  const playSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
  const pauseSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';

  function tick(now) {
    if (!isPlaying) return;
    if (lastTimestamp === null) lastTimestamp = now;

    const deltaSec = ((now - lastTimestamp) / 1000) * playbackSpeed;
    lastTimestamp = now;

    currentTime += deltaSec;
    if (currentTime >= DURATION) {
      currentTime = DURATION;
      pause();
    }

    renderAt(currentTime);

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(tick);
    }
  }

  function play() {
    if (currentTime >= DURATION) currentTime = 0;
    isPlaying = true;
    lastTimestamp = null;
    if (playIcon) playIcon.innerHTML = pauseSvg;
    animationFrameId = requestAnimationFrame(tick);
  }

  function pause() {
    isPlaying = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (playIcon) playIcon.innerHTML = playSvg;
  }

  function togglePlayPause() {
    if (isPlaying) pause();
    else play();
  }

  // --- Event Listeners ---
  if (btnPlayPause) {
    btnPlayPause.addEventListener('click', togglePlayPause);
  }

  if (videoScrubber) {
    videoScrubber.addEventListener('input', (e) => {
      pause();
      window.__seekToTime(parseFloat(e.target.value));
    });
  }

  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playbackSpeed = parseFloat(btn.dataset.speed) || 1.0;
    });
  });

  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pause();
      window.__seekToTime(parseFloat(btn.dataset.seek));
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      window.__seekToTime(currentTime + 1.0);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      window.__seekToTime(currentTime - 1.0);
    }
  });

  // URL parameter override: ?t=13.5&autoplay=true
  const params = new URLSearchParams(window.location.search);
  if (params.has('t')) {
    window.__seekToTime(parseFloat(params.get('t')));
  } else {
    window.__seekToTime(0.0);
  }

  if (params.get('autoplay') === 'true' || params.get('autoplay') === '1') {
    play();
  }

})();
