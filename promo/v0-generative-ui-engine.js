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
  const videoScrubber = document.getElementById('video-scrubber');
  const timecodeDisplay = document.getElementById('timecode');
  const sceneNameDisplay = document.getElementById('scene-name');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const scenePillBtns = document.querySelectorAll('.scene-pill-btn');

  // Scene Layers
  const scene1 = document.getElementById('scene-1-logo');
  const scene2 = document.getElementById('scene-2-title');
  const scene3 = document.getElementById('scene-3-prompt');
  const scene4 = document.getElementById('scene-4-app');
  const scene8 = document.getElementById('scene-8-v0dev');
  const scene9 = document.getElementById('scene-9-vercel');

  // Scene 1 Elements
  const v0StrokePath = document.getElementById('v0-stroke-path');
  const v0FillPath = document.getElementById('v0-fill-path');

  // Scene 2 Elements
  const titleHeroText = document.getElementById('title-hero-text');

  // Scene 3 Elements
  const promptActiveText = document.getElementById('prompt-active-text');
  const promptSubReflection = document.getElementById('prompt-sub-reflection');
  const btnPromptEnter = document.getElementById('btn-prompt-enter');

  // Scene 4 & 5 Elements
  const badgeStealthToggle = document.getElementById('badge-stealth-toggle');
  const badgeStealthText = document.getElementById('badge-stealth-text');
  const canvasChatText = document.getElementById('canvas-chat-text');
  const btnToggleCode = document.getElementById('btn-toggle-code');
  const btnCodeLabel = document.getElementById('btn-code-label');
  const primaryAppCard = document.getElementById('primary-app-card');
  const acmeBrandWrap = document.getElementById('acme-brand-wrap');
  const componentInspectBox = document.getElementById('component-inspect-box');
  const componentEditPopover = document.getElementById('component-edit-popover');
  const popoverTypewriterText = document.getElementById('popover-typewriter-text');
  const cardVerV1 = document.getElementById('card-ver-v1');
  const codeInspectorCard = document.getElementById('code-inspector-card');

  // Scene 7 Elements
  const stealthPopoverDialog = document.getElementById('stealth-popover-dialog');
  const optStealthPublic = document.getElementById('opt-stealth-public');
  const optStealthPrivate = document.getElementById('opt-stealth-private');

  // Scene 8 & 9 Elements
  const v0devCenterLockup = document.getElementById('v0dev-center-lockup');
  const vercelOutroLockup = document.getElementById('vercel-outro-lockup');

  // --- State ---
  let currentTime = 0;
  let isPlaying = false;
  let lastTimestamp = null;
  let animationFrameId = null;

  // --- Viewport Auto-Scaling ---
  function updateViewportScale() {
    const wrapper = document.querySelector('.video-stage-wrapper');
    if (!wrapper || !videoStage) return;

    if (document.body.classList.contains('clean-export')) {
      videoStage.style.transform = 'none';
      return;
    }

    const availableWidth = wrapper.clientWidth;
    const availableHeight = wrapper.clientHeight;

    const scaleX = availableWidth / W;
    const scaleY = availableHeight / H;
    const scale = Math.min(scaleX, scaleY, 1.0);

    videoStage.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', updateViewportScale);
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

  // --- Trigger Visual Click Ripple ---
  function setRipple(x, y, progress) {
    if (progress <= 0 || progress >= 1) {
      clickRipple.style.opacity = '0';
      clickRipple.style.transform = 'translate3d(-100px, -100px, 0) scale(0)';
      return;
    }
    const scale = lerp(0.2, 2.2, smootherstep(progress));
    const opacity = lerp(0.85, 0, progress);
    clickRipple.style.opacity = opacity.toFixed(3);
    clickRipple.style.transform = `translate3d(${x - 22}px, ${y - 22}px, 0) scale(${scale.toFixed(3)})`;
  }

  // --- Set Cursor Position ---
  function setCursor(x, y, visible = true) {
    if (!visible) {
      virtualCursor.style.opacity = '0';
      return;
    }
    virtualCursor.style.opacity = '1';
    virtualCursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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
    let rippleProgress = 0, rippleX = 0, rippleY = 0;
    let camScale = 1.0;
    let camX = 0, camY = 0;

    // -------------------------------------------------------------
    // SCENE 1: Animated v0 Wireframe Stroke Logo (0.0s – 3.0s)
    // -------------------------------------------------------------
    if (t < 3.2) {
      const s1Opacity = t < 2.6 ? clamp(t / 0.3) : clamp((3.0 - t) / 0.4);
      scene1.style.opacity = s1Opacity.toFixed(3);
      scene1.style.display = s1Opacity > 0 ? 'flex' : 'none';

      // Stroke dashoffset: 80 -> 0 over 0.0s to 1.6s
      const strokeP = clamp(t / 1.6);
      const dashoffset = lerp(80, 0, smootherstep(strokeP));
      v0StrokePath.style.strokeDashoffset = dashoffset.toFixed(1);

      // Solid block fill morph at 1.7s
      if (t >= 1.6) {
        const fillP = clamp((t - 1.6) / 0.35);
        const fillOpacity = smootherstep(fillP);
        v0FillPath.style.opacity = fillOpacity.toFixed(3);
        v0StrokePath.style.opacity = (1 - fillOpacity).toFixed(3);
      } else {
        v0FillPath.style.opacity = '0';
        v0StrokePath.style.opacity = '1';
      }

      if (sceneNameDisplay && t < 3.0) sceneNameDisplay.textContent = 'Scene 1: v0 Wireframe Logo';
    } else {
      scene1.style.opacity = '0';
      scene1.style.display = 'none';
    }

    // -------------------------------------------------------------
    // SCENE 2: "What will you ship?" Title Card (3.0s – 5.5s)
    // -------------------------------------------------------------
    if (t >= 2.8 && t < 5.8) {
      const s2In = clamp((t - 3.0) / 0.4);
      const s2Out = clamp((5.4 - t) / 0.4);
      const s2Opacity = Math.min(s2In, s2Out);
      scene2.style.opacity = s2Opacity.toFixed(3);
      scene2.style.display = s2Opacity > 0 ? 'flex' : 'none';

      const scale = lerp(0.96, 1.0, smootherstep(s2In));
      titleHeroText.style.transform = `scale(${scale.toFixed(3)})`;

      if (sceneNameDisplay && t >= 3.0 && t < 5.5) sceneNameDisplay.textContent = 'Scene 2: "What will you ship?"';
    } else {
      scene2.style.opacity = '0';
      scene2.style.display = 'none';
    }

    // -------------------------------------------------------------
    // SCENE 3: Dark Floating Prompt Bar & Vertical Reel (5.5s – 12.5s)
    // -------------------------------------------------------------
    if (t >= 5.2 && t < 13.0) {
      const s3In = clamp((t - 5.4) / 0.4);
      const s3Out = clamp((12.6 - t) / 0.4);
      const s3Opacity = Math.min(s3In, s3Out);
      scene3.style.opacity = s3Opacity.toFixed(3);
      scene3.style.display = s3Opacity > 0 ? 'flex' : 'none';

      // Typewriter & Reel transitions
      if (t < 7.2) {
        promptActiveText.textContent = 'A sleek pricing page';
        promptSubReflection.textContent = 'A flower shop';
      } else if (t >= 7.2 && t < 9.2) {
        promptActiveText.textContent = 'A flower shop';
        promptSubReflection.textContent = 'A SaaS dashboard layout';
      } else {
        promptActiveText.textContent = 'A SaaS dashboard layout';
        promptSubReflection.textContent = '';
      }

      // Cursor movement & click on Submit button
      if (t >= 10.2 && t < 12.5) {
        cursorVisible = true;
        const curP = clamp((t - 10.2) / 1.5);
        cursorX = lerp(1380, 1315, smootherstep(curP));
        cursorY = lerp(720, 540, smootherstep(curP));

        // Click at 12.0s
        if (t >= 11.95 && t <= 12.35) {
          const clickP = (t - 11.95) / 0.4;
          rippleProgress = clickP;
          rippleX = 1315;
          rippleY = 540;
          btnPromptEnter.style.transform = `scale(${lerp(0.92, 1.0, smootherstep(clickP))})`;
        } else {
          btnPromptEnter.style.transform = 'scale(1.0)';
        }
      }

      if (sceneNameDisplay && t >= 5.5 && t < 12.5) sceneNameDisplay.textContent = 'Scene 3: Prompt Reel';
    } else {
      scene3.style.opacity = '0';
      scene3.style.display = 'none';
    }

    // -------------------------------------------------------------
    // SCENE 4 & 5: Acme Inc Dashboard Canvas & Component Edit (12.5s – 26.5s)
    // -------------------------------------------------------------
    if (t >= 12.4 && t < 26.8) {
      const s4In = clamp((t - 12.5) / 0.5);
      const s4Out = clamp((26.7 - t) / 0.4);
      const s4Opacity = Math.min(s4In, s4Out);
      scene4.style.opacity = s4Opacity.toFixed(3);
      scene4.style.display = s4Opacity > 0 ? 'block' : 'none';

      // Primary app card visible
      primaryAppCard.style.opacity = '1';
      codeInspectorCard.style.opacity = '0';
      codeInspectorCard.style.pointerEvents = 'none';
      btnCodeLabel.textContent = 'Code </>';

      // --- Scene 5: Component-Level Blue Logo Edit (18.0s – 26.0s) ---
      if (t >= 17.5 && t < 26.2) {
        // Continuous $C^1$ Camera Zoom-In towards Acme Inc logo area
        if (t >= 17.8 && t < 24.2) {
          const zoomP = clamp((t - 17.8) / 1.2);
          camScale = lerp(1.0, 1.42, smootherstep(zoomP));
          camX = lerp(0, 120, smootherstep(zoomP));
          camY = lerp(0, 60, smootherstep(zoomP));
        } else if (t >= 24.2) {
          const unzoomP = clamp((t - 24.2) / 1.2);
          camScale = lerp(1.42, 1.0, smootherstep(unzoomP));
          camX = lerp(120, 0, smootherstep(unzoomP));
          camY = lerp(60, 0, smootherstep(unzoomP));
        }

        // Cursor hovers over Acme Inc logo at 18.5s
        if (t >= 18.0 && t < 23.5) {
          cursorVisible = true;
          if (t < 19.5) {
            const cp = clamp((t - 18.0) / 1.2);
            cursorX = lerp(450, 120, smootherstep(cp));
            cursorY = lerp(320, 180, smootherstep(cp));
          } else if (t >= 19.5 && t < 21.6) {
            // Move to Update button in popover at (640, 260)
            const upP = clamp((t - 19.8) / 1.0);
            cursorX = lerp(120, 640, smootherstep(upP));
            cursorY = lerp(180, 260, smootherstep(upP));
          } else {
            cursorX = 640;
            cursorY = 260;
          }
        }

        // Component Inspection Outline snaps on
        if (t >= 18.8 && t < 23.2) {
          componentInspectBox.style.opacity = '1';
          componentInspectBox.style.transform = 'scale(1.0)';
        } else {
          componentInspectBox.style.opacity = '0';
          componentInspectBox.style.transform = 'scale(0.96)';
        }

        // Click Logo at 19.5s
        if (t >= 19.45 && t <= 19.85) {
          rippleProgress = (t - 19.45) / 0.4;
          rippleX = 120;
          rippleY = 180;
        }

        // Popover Dialog Springs Open (19.6s – 23.2s)
        if (t >= 19.6 && t < 23.0) {
          const popP = clamp((t - 19.6) / 0.35);
          componentEditPopover.style.opacity = smootherstep(popP).toFixed(3);
          componentEditPopover.style.transform = `scale(${lerp(0.92, 1.0, smootherstep(popP)).toFixed(3)}) translateY(0)`;

          // Typewriting in popover
          if (t < 20.3) {
            popoverTypewriterText.textContent = 'Make this element larger, add an element, change colors';
            popoverTypewriterText.style.color = '#71717A';
          } else {
            const fullText = 'Make the company logo color blue';
            const typeP = clamp((t - 20.3) / 1.0);
            const chars = Math.round(fullText.length * typeP);
            popoverTypewriterText.textContent = fullText.slice(0, chars) + (typeP < 1 ? '|' : '');
            popoverTypewriterText.style.color = '#000000';
          }
        } else {
          componentEditPopover.style.opacity = '0';
          componentEditPopover.style.transform = 'scale(0.92) translateY(10px)';
        }

        // Click Update Button at 21.8s
        if (t >= 21.75 && t <= 22.15) {
          rippleProgress = (t - 21.75) / 0.4;
          rippleX = 640;
          rippleY = 260;
        }

        // Blue Logo Morph at 22.8s!
        if (t >= 22.8) {
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

        if (sceneNameDisplay && t >= 18.0 && t < 26.0) sceneNameDisplay.textContent = 'Scene 5: Component Blue Edit';
      } else {
        componentInspectBox.style.opacity = '0';
        componentEditPopover.style.opacity = '0';
        if (sceneNameDisplay && t >= 12.5 && t < 18.0) sceneNameDisplay.textContent = 'Scene 4: Acme Dashboard Canvas';
      }

      // Cursor movement to Header Code button at 26.0s
      if (t >= 25.8 && t < 26.8) {
        cursorVisible = true;
        const codeP = clamp((t - 25.8) / 0.8);
        cursorX = lerp(640, 1680, smootherstep(codeP));
        cursorY = lerp(260, 80, smootherstep(codeP));

        // Click Code at 26.6s
        if (t >= 26.55 && t <= 26.8) {
          rippleProgress = (t - 26.55) / 0.25;
          rippleX = 1680;
          rippleY = 80;
        }
      }
    } else {
      if (t < 26.8) scene4.style.opacity = '0';
    }

    // -------------------------------------------------------------
    // SCENE 6: Code Inspector & CLI View (3D Card Tilt) (26.8s – 33.0s)
    // -------------------------------------------------------------
    if (t >= 26.8 && t < 33.2) {
      scene4.style.opacity = '1';
      scene4.style.display = 'block';

      // 3D Card tilt entrance
      const c6In = clamp((t - 26.8) / 0.4);
      const c6Out = clamp((33.0 - t) / 0.4);
      const c6Opacity = Math.min(c6In, c6Out);
      codeInspectorCard.style.opacity = c6Opacity.toFixed(3);
      codeInspectorCard.style.pointerEvents = 'auto';

      primaryAppCard.style.opacity = '0.15';
      btnCodeLabel.textContent = 'Canvas 🖵';

      // Cursor moves across code card
      if (t >= 28.0 && t < 32.5) {
        cursorVisible = true;
        const cp = clamp((t - 28.0) / 2.0);
        cursorX = lerp(1680, 520, smootherstep(cp));
        cursorY = lerp(80, 240, smootherstep(cp));
      }

      if (sceneNameDisplay && t >= 26.8 && t < 33.0) sceneNameDisplay.textContent = 'Scene 6: Code Inspector & CLI';
    } else if (t >= 33.2) {
      codeInspectorCard.style.opacity = '0';
      primaryAppCard.style.opacity = '1';
      btnCodeLabel.textContent = 'Code </>';
    }

    // -------------------------------------------------------------
    // SCENE 7: Stealth Mode & Privacy Dialog (33.0s – 38.5s)
    // -------------------------------------------------------------
    if (t >= 32.8 && t < 38.6) {
      scene4.style.opacity = '1';
      scene4.style.display = 'block';

      // Cursor moves to Stealth/Private badge at top breadcrumb
      if (t >= 33.0 && t < 37.8) {
        cursorVisible = true;
        if (t < 34.2) {
          const spP = clamp((t - 33.0) / 1.0);
          cursorX = lerp(520, 390, smootherstep(spP));
          cursorY = lerp(240, 42, smootherstep(spP));
        } else if (t >= 34.2 && t < 36.0) {
          // Move down to Public option in stealth dialog at (550, 150)
          const pubP = clamp((t - 34.5) / 1.0);
          cursorX = lerp(390, 550, smootherstep(pubP));
          cursorY = lerp(42, 150, smootherstep(pubP));
        } else {
          cursorX = 550;
          cursorY = 150;
        }
      }

      // Click Badge at 34.0s
      if (t >= 33.95 && t <= 34.3) {
        rippleProgress = (t - 33.95) / 0.35;
        rippleX = 390;
        rippleY = 42;
      }

      // Stealth Popover Opens at 34.1s
      if (t >= 34.1 && t < 38.0) {
        const popP = clamp((t - 34.1) / 0.35);
        stealthPopoverDialog.style.opacity = smootherstep(popP).toFixed(3);
        stealthPopoverDialog.style.transform = `scale(${lerp(0.94, 1.0, smootherstep(popP)).toFixed(3)}) translateY(0)`;
      } else {
        stealthPopoverDialog.style.opacity = '0';
        stealthPopoverDialog.style.transform = 'scale(0.94) translateY(-10px)';
      }

      // Click Public Option at 36.0s
      if (t >= 35.95 && t <= 36.3) {
        rippleProgress = (t - 35.95) / 0.35;
        rippleX = 550;
        rippleY = 150;
      }

      // Selection Toggle to Public at 36.0s
      if (t >= 36.0) {
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

      if (sceneNameDisplay && t >= 33.0 && t < 38.5) sceneNameDisplay.textContent = 'Scene 7: Stealth Mode & Privacy';
    } else {
      stealthPopoverDialog.style.opacity = '0';
    }

    // -------------------------------------------------------------
    // SCENE 8: Grid Wall of Generations & "v0.dev" (38.5s – 43.0s)
    // -------------------------------------------------------------
    if (t >= 38.4 && t < 43.2) {
      scene4.style.opacity = '0';
      const s8In = clamp((t - 38.6) / 0.45);
      const s8Out = clamp((43.0 - t) / 0.45);
      const s8Opacity = Math.min(s8In, s8Out);
      scene8.style.opacity = s8Opacity.toFixed(3);
      scene8.style.display = s8Opacity > 0 ? 'flex' : 'none';

      const scale = lerp(0.92, 1.0, smootherstep(s8In));
      v0devCenterLockup.style.transform = `scale(${scale.toFixed(3)})`;

      if (sceneNameDisplay && t >= 38.5 && t < 43.0) sceneNameDisplay.textContent = 'Scene 8: Grid Wall & v0.dev';
    } else {
      scene8.style.opacity = '0';
      scene8.style.display = 'none';
    }

    // -------------------------------------------------------------
    // SCENE 9: Vercel Outro (Horizontal Lockup) (43.0s – 47.5s)
    // -------------------------------------------------------------
    if (t >= 42.8) {
      const s9In = clamp((t - 43.0) / 0.5);
      const s9Out = clamp((DURATION - t) / 0.5);
      const s9Opacity = Math.min(s9In, s9Out);
      scene9.style.opacity = s9Opacity.toFixed(3);
      scene9.style.display = s9Opacity > 0 ? 'flex' : 'none';

      // Spring Settle: 0.88 -> 1.0
      const scale = lerp(0.88, 1.0, smootherstep(s9In));
      vercelOutroLockup.style.transform = `scale(${scale.toFixed(3)})`;

      if (sceneNameDisplay && t >= 43.0) sceneNameDisplay.textContent = 'Scene 9: Vercel Outro';
    } else {
      scene9.style.opacity = '0';
      scene9.style.display = 'none';
    }

    // Apply Camera Transform
    cameraWorld.style.transform = `scale(${camScale.toFixed(4)}) translate3d(${camX.toFixed(1)}px, ${camY.toFixed(1)}px, 0)`;

    // Apply Cursor & Ripple
    setCursor(cursorX, cursorY, cursorVisible);
    setRipple(rippleX, rippleY, rippleProgress);

    // Update active scene pill button
    scenePillBtns.forEach(btn => {
      const sceneTime = parseFloat(btn.dataset.time);
      const nextTime = getNextSceneTime(sceneTime);
      if (t >= sceneTime && t < nextTime) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function getNextSceneTime(st) {
    const times = [0.0, 3.0, 5.5, 12.5, 18.0, 26.0, 33.0, 38.5, 43.0, DURATION];
    const idx = times.indexOf(st);
    return idx !== -1 && idx < times.length - 1 ? times[idx + 1] : DURATION;
  }

  // --- Public Deterministic Virtual Clock Hook ---
  window.__seekToTime = function (timestampSeconds) {
    currentTime = Math.max(0, Math.min(DURATION, timestampSeconds));
    renderAt(currentTime);
  };

  // --- Interactive Playback Loop ---
  function tick(now) {
    if (!isPlaying) return;
    if (lastTimestamp === null) lastTimestamp = now;

    const deltaSec = (now - lastTimestamp) / 1000;
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
    if (btnPlayPause) btnPlayPause.textContent = 'Pause';
    animationFrameId = requestAnimationFrame(tick);
  }

  function pause() {
    isPlaying = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (btnPlayPause) btnPlayPause.textContent = 'Play';
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

  scenePillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pause();
      window.__seekToTime(parseFloat(btn.dataset.time));
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'ArrowRight') {
      window.__seekToTime(currentTime + 1.0);
    } else if (e.code === 'ArrowLeft') {
      window.__seekToTime(currentTime - 1.0);
    }
  });

  // Initial render at t = 0
  window.__seekToTime(0.0);

})();
