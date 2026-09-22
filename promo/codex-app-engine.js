/**
 * Codex App Promo Video — 38s High-Tempo Cinematic Virtual Camera Engine
 * Director-level Choreography: Mouse-guided camera tracking, tactile click ripples,
 * and cause-and-effect narrative transitions.
 * Compliant with Anti-Flop Gates & EaseUI Standards.
 * Duration: 38.0s
 */

(function () {
  'use strict';

  const DURATION = 38.0;
  const W = 1920, H = 1080;

  // --- DOM Elements ---
  const videoStage = document.getElementById('video-stage');
  const cameraWorld = document.getElementById('camera-world');
  const macosWallpaper = document.getElementById('macos-wallpaper');
  const virtualCursor = document.getElementById('virtual-cursor');
  const clickRipple = document.getElementById('click-ripple');
  const floatingBadge = document.getElementById('floating-chapter-badge');
  const videoScrubber = document.getElementById('video-scrubber');
  const timecodeDisplay = document.getElementById('timecode');
  const sceneNameDisplay = document.getElementById('scene-name');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const playIcon = document.getElementById('play-icon');
  const speedBtns = document.querySelectorAll('.speed-btn');
  const pillBtns = document.querySelectorAll('.pill-btn');

  // Stage Panes
  const heroStage = document.getElementById('hero-stage');
  const heroPromptText = document.getElementById('hero-prompt-text');
  const heroSubmitBtn = document.getElementById('hero-submit-btn');
  const macosAppWindow = document.getElementById('macos-app-window');
  const viewChatExecution = document.getElementById('view-chat-execution');
  const viewSplitDiff = document.getElementById('view-split-diff');
  const liveAppStage = document.getElementById('live-app-stage');
  const outroStage = document.getElementById('outro-stage');
  const outroLogoLockup = document.getElementById('outro-logo-lockup');

  // Interactive Target Elements for Tactile Feedback
  const threadPhotobooth = document.getElementById('thread-photobooth');
  const threadDragDrop = document.getElementById('thread-drag-drop');
  const mainThreadTitle = document.getElementById('main-thread-title');
  const chatThreadInitial = document.getElementById('chat-thread-initial');
  const chatThreadPhotobooth = document.getElementById('chat-thread-photobooth');
  const stepDragCode = document.getElementById('step-drag-code');
  const stepBuildPass = document.getElementById('step-build-pass');
  const chatSummaryCard = document.getElementById('chat-summary-card');
  const chatThinkingPill = document.getElementById('chat-thinking-pill');
  const chatPulseDot = document.getElementById('chat-pulse-dot');
  const chatThinkingText = document.getElementById('chat-thinking-text');
  const chatComposerBtnIcon = document.getElementById('chat-composer-btn-icon');
  const dockReviewBtn = document.getElementById('dock-review-btn');
  const btnCheckoutLocal = document.getElementById('btn-checkout-local');
  const diffCommentBubble = document.getElementById('diff-comment-bubble');
  const commentStatusChip = document.getElementById('comment-status-chip');
  const polaroidCard = document.getElementById('polaroid-card');
  const polaroidCard2 = document.getElementById('polaroid-card-2');
  const mainWindowClose = document.getElementById('main-window-close');
  const liveWindowClose = document.getElementById('live-window-close');

  // --- State ---
  let currentTime = 0;
  let isPlaying = false;
  let playbackSpeed = 1.0;
  let lastTimestamp = null;
  let animationFrameId = null;

  // --- Clean Export Mode Detection ---
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('clean') === 'true' || urlParams.get('render') === 'true') {
    document.body.classList.add('clean-export');
  }

  // --- Viewport Auto-Scaling (Fit 1920x1080 without Distortion) ---
  function updateViewportScale() {
    const wrapper = document.querySelector('.video-stage-wrapper');
    if (!wrapper || !videoStage) return;

    if (document.body.classList.contains('clean-export')) {
      videoStage.style.transform = 'none';
      return;
    }

    const availableWidth = wrapper.clientWidth;
    const availableHeight = wrapper.clientHeight;

    const scaleX = availableWidth / 1920;
    const scaleY = availableHeight / 1080;
    const scale = Math.min(scaleX, scaleY, 1.0);

    videoStage.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', updateViewportScale);
  updateViewportScale();

  // --- Kinematic Math: Quintic Smootherstep ---
  function smoothstepQuintic(q) {
    const clamped = Math.max(0, Math.min(1, q));
    return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
  }

  function bezierArc(p0, p3, t, arcHeight) {
    const dx = p3.x - p0.x;
    const dy = p3.y - p0.y;
    const dist = Math.hypot(dx, dy);

    const nx = -dy / (dist || 1);
    const ny = dx / (dist || 1);
    const h = (arcHeight !== undefined ? arcHeight : Math.min(Math.max(dist * 0.08, 10), 40));

    const c1 = { x: p0.x + dx * 0.33 + nx * h, y: p0.y + dy * 0.33 + ny * h };
    const c2 = { x: p0.x + dx * 0.66 + nx * h, y: p0.y + dy * 0.66 + ny * h };

    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;

    return {
      x: uu * u * p0.x + 3 * uu * t * c1.x + 3 * u * tt * c2.x + tt * t * p3.x,
      y: uu * u * p0.y + 3 * uu * t * c1.y + 3 * u * tt * c2.y + tt * t * p3.y
    };
  }

  // Damped harmonic oscillator (spring with gentle friction): zeta = 0.65, omega = 7.5
  // Creates an organic, subtle bounce from center: 0 -> 1.06 peak -> settles to 1.0
  function springGentle(dt) {
    if (dt <= 0) return 0;
    const omega = 7.5;
    const zeta = 0.65;
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * omega * dt);
    const val = 1 - decay * (Math.cos(omegaD * dt) + (zeta * omega / omegaD) * Math.sin(omegaD * dt));
    return val;
  }

  function formatTimecode(sec) {
    const s = Math.floor(sec);
    const ms = Math.floor((sec % 1) * 10);
    return `00:${String(s).padStart(2, '0')}.${ms} / 00:38.0`;
  }

  // --- Tactile Click Events Catalog (Exact Unscaled World Contact Centers) ---
  // Every scene transition is motivated by a mouse click with tactile shockwave feedback
  const CLICK_EVENTS = [
    { id: 'submit',   t: 0.95,  x: 1324, y: 596, el: heroSubmitBtn, color: '#10B981', label: 'Submit Prompt' },
    { id: 'thread',   t: 2.80,  x: 291,  y: 295, el: threadPhotobooth, color: '#3B82F6', label: 'Select Thread' },
    { id: 'review',   t: 13.00, x: 1651, y: 866, el: dockReviewBtn, color: '#10B981', label: 'Review Changes' },
    { id: 'resolve',  t: 17.50, x: 1696, y: 291, el: diffCommentBubble, color: '#10B981', label: 'Resolve Comment' },
    { id: 'checkout', t: 21.00, x: 1484, y: 125, el: btnCheckoutLocal, color: '#3B82F6', label: 'Checkout on Local' },
    { id: 'drag',     t: 25.80, x: 620,  y: 650, el: polaroidCard, color: '#10B981', label: 'Drag Photo 1' },
    { id: 'close',    t: 33.80, x: 219,  y: 154, el: liveWindowClose || mainWindowClose, color: '#EF4444', label: 'Close Window' }
  ];
  window.__CLICK_EVENTS = CLICK_EVENTS;

  // --- Dynamic Virtual Camera Trajectory (Cinematic Continuous Motion) ---
  // [seconds, centerX, centerY, scale]
  const cameraKeys = [
    [0.0,   960,  540, 1.00], // Beat 1: Wide establishing shot
    [0.3,   960,  540, 1.00], // Hold
    [0.95,  1120, 560, 1.25], // Smooth push-in to Submit button with full card framing
    [1.1,   1120, 560, 1.25], // Hold on click
    [1.6,   960,  540, 1.05], // Morph: ease back to overview
    [2.8,   380,  340, 1.45], // Beat 2: Smooth glide to Sidebar thread with clean context
    [3.2,   380,  340, 1.45], // Hold on selection
    [4.0,   960,  540, 1.06], // Full window overview framing (0% cut off, complete composer visible)
    [10.5,  960,  540, 1.06], // STEADY READING HOLD: Follow code edits, thinking, completion
    [13.0,  1550, 800, 1.40], // Smooth glide down to "Review changes"
    [13.4,  1550, 800, 1.40], // Hold on click
    [14.5,  1500, 340, 1.45], // Beat 3: Smooth glide into line 103 review comment
    [17.5,  1500, 340, 1.45], // STEADY READING HOLD: Read comment & click Resolve
    [18.5,  1500, 340, 1.45], // Hold on "Resolved" green badge
    [21.0,  1380, 180, 1.45], // Smooth glide to toolbar "Checkout on local"
    [21.4,  1380, 180, 1.45], // Hold on click
    [22.8,  720,  620, 1.45], // Beat 4: Smooth glide to live photobooth gallery
    [25.8,  720,  620, 1.45], // STEADY HOLD: Establish Photo 1 (Frog) & Photo 2 (Robot)
    [28.2,  780,  620, 1.45], // Camera tracks dragged photo across
    [30.5,  750,  620, 1.40], // STEADY PAYOFF HOLD: Admire swapped cards side by side
    [32.2,  960,  540, 1.05], // Smooth pull back to dual workspace overview
    [33.8,  300,  200, 1.40], // Smooth glide to red window close dot
    [34.4,  300,  200, 1.40], // Hold on click
    [35.2,  960,  540, 1.00], // Beat 5: Outro dissolve
    [38.0,  960,  540, 1.00]  // Still brand hold
  ];

  let currentCameraScale = 1.0;

  function renderCamera(seconds) {
    const t = Math.max(0, Math.min(DURATION, seconds));
    let i = 0;
    while (i < cameraKeys.length - 2 && t >= cameraKeys[i + 1][0]) i++;

    const a = cameraKeys[i], b = cameraKeys[i + 1];
    const dt = b[0] - a[0];
    const u = dt <= 0 ? 1 : smoothstepQuintic((t - a[0]) / dt);

    // Optical Zoom via Log-Scale Interpolation
    const logA = Math.log(a[3]);
    const logB = Math.log(b[3]);
    const s = Math.exp(logA + (logB - logA) * u);
    currentCameraScale = s;

    // Direct cursor-guided centering (sub-pixel precision without quantization)
    const cx = a[1] + (b[1] - a[1]) * u;
    const cy = a[2] + (b[2] - a[2]) * u;

    const tx = W / 2 - s * cx;
    const ty = H / 2 - s * cy;

    if (cameraWorld) {
      cameraWorld.style.transform = `translate3d(${tx.toFixed(3)}px, ${ty.toFixed(3)}px, 0) scale(${s.toFixed(4)})`;
    }
  }

  // --- Natural Mouse Solver (Target-Locked Kinematics with Sub-Pixel Precision) ---
  function solveCursor(t) {
    let pos = { x: 1050, y: 596 };
    let isPressed = false;
    let opacity = 1;

    if (t < 0.35) {
      pos = { x: 1050, y: 596 };
    } else if (t >= 0.35 && t < 0.90) {
      // Smooth arc travel to Submit button
      const q = (t - 0.35) / 0.55;
      pos = bezierArc({ x: 1050, y: 596 }, { x: 1324, y: 596 }, smoothstepQuintic(q), -15);
    } else if (t >= 0.90 && t < 1.20) {
      // Rests on Submit button
      pos = { x: 1324, y: 596 };
      if (t >= 0.92 && t < 1.08) isPressed = true;
    } else if (t >= 1.20 && t < 2.70) {
      // Transit from hero to sidebar thread
      const q = (t - 1.20) / 1.50;
      pos = bezierArc({ x: 1324, y: 596 }, { x: 291, y: 295 }, smoothstepQuintic(q), 35);
    } else if (t >= 2.70 && t < 3.20) {
      // Rests on Thread, click press
      pos = { x: 291, y: 295 };
      if (t >= 2.76 && t < 2.96) isPressed = true;
    } else if (t >= 3.20 && t < 8.50) {
      // Gentle floating hover while watching code execution
      const q = (t - 3.20) / 5.30;
      pos = bezierArc({ x: 291, y: 295 }, { x: 720, y: 500 }, smoothstepQuintic(q), -20);
    } else if (t >= 8.50 && t < 10.50) {
      // Rest near completion card
      const q = (t - 8.50) / 2.00;
      pos = bezierArc({ x: 720, y: 500 }, { x: 1000, y: 650 }, smoothstepQuintic(q), 12);
    } else if (t >= 10.50 && t < 12.80) {
      // Smooth travel down to "Review changes" button
      const q = (t - 10.50) / 2.30;
      pos = bezierArc({ x: 1000, y: 650 }, { x: 1651, y: 866 }, smoothstepQuintic(q), -22);
    } else if (t >= 12.80 && t < 13.40) {
      // Rests on Review changes button, click press
      pos = { x: 1651, y: 866 };
      if (t >= 12.95 && t < 13.15) isPressed = true;
    } else if (t >= 13.40 && t < 16.80) {
      // Smooth travel to line 103 review comment
      const q = (t - 13.40) / 3.40;
      pos = bezierArc({ x: 1651, y: 866 }, { x: 1696, y: 291 }, smoothstepQuintic(q), 25);
    } else if (t >= 16.80 && t < 17.80) {
      // Rests on Resolve chip, click press
      pos = { x: 1696, y: 291 };
      if (t >= 17.45 && t < 17.65) isPressed = true;
    } else if (t >= 17.80 && t < 20.80) {
      // Smooth travel up to "Checkout on local"
      const q = (t - 17.80) / 3.00;
      pos = bezierArc({ x: 1696, y: 291 }, { x: 1484, y: 125 }, smoothstepQuintic(q), -28);
    } else if (t >= 20.80 && t < 21.40) {
      // Rests on Checkout button, click press
      pos = { x: 1484, y: 125 };
      if (t >= 20.95 && t < 21.15) isPressed = true;
    } else if (t >= 21.40 && t < 25.20) {
      // Smooth travel into live app window onto Photo 1
      const q = (t - 21.40) / 3.80;
      pos = bezierArc({ x: 1484, y: 125 }, { x: 620, y: 650 }, smoothstepQuintic(q), 22);
    } else if (t >= 25.20 && t < 25.80) {
      // Steady hold on Photo 1 before drag
      pos = { x: 620, y: 650 };
    } else if (t >= 25.80 && t < 28.20) {
      // DRAGGING Photo 1 across to Slot 2!
      const q = (t - 25.80) / 2.40;
      const u = smoothstepQuintic(q);
      pos = { x: 620 + u * 213, y: 650 };
      isPressed = true;
    } else if (t >= 28.20 && t < 30.50) {
      // Rest hold at Slot 2 after drop
      pos = { x: 833, y: 650 };
    } else if (t >= 30.50 && t < 33.60) {
      // Smooth travel from photo to red traffic light close dot
      const q = (t - 30.50) / 3.10;
      pos = bezierArc({ x: 833, y: 650 }, { x: 219, y: 154 }, smoothstepQuintic(q), -30);
    } else if (t >= 33.60 && t < 34.20) {
      // Rests on Close button, click press
      pos = { x: 219, y: 154 };
      if (t >= 33.75 && t < 33.95) isPressed = true;
    } else if (t >= 34.20) {
      opacity = 0;
    }

    return { pos, isPressed, opacity };
  }

  // --- Render Click Ripple Wave & Button Compression ---
  function renderClickRipples(t) {
    let activeEvent = null;

    // Clear previous button pressed styles
    CLICK_EVENTS.forEach((evt) => {
      if (evt.el) evt.el.classList.remove('pressed');
    });

    for (let evt of CLICK_EVENTS) {
      if (t >= evt.t && t < evt.t + 0.45) {
        activeEvent = evt;
        break;
      }
      if (t >= evt.t - 0.08 && t < evt.t + 0.12 && evt.el) {
        evt.el.classList.add('pressed');
      }
    }

    if (activeEvent && clickRipple) {
      const q = (t - activeEvent.t) / 0.45;
      const progress = smoothstepQuintic(q);
      const camZoom = Math.max(0.6, currentCameraScale);
      const scale = (1.0 + 5.5 * progress) / (camZoom * 0.75);
      const opacity = Math.max(0, 0.85 * (1.0 - progress));
      const strokeWidth = (2.5 * (1.0 - progress * 0.5) / (camZoom * 0.75)).toFixed(1);

      clickRipple.style.display = 'block';
      clickRipple.style.transform = `translate3d(${activeEvent.x}px, ${activeEvent.y}px, 0) translate(-50%, -50%) scale(${scale.toFixed(2)})`;
      clickRipple.style.opacity = opacity.toFixed(2);
      clickRipple.style.borderColor = activeEvent.color;
      clickRipple.style.borderWidth = `${strokeWidth}px`;
    } else if (clickRipple) {
      clickRipple.style.display = 'none';
    }
  }

  // --- Master Frame Renderer (Pure Deterministic Virtual Time) ---
  function renderFrame(t) {
    currentTime = Math.max(0, Math.min(DURATION, t));

    // Scrubber & Timecode
    if (videoScrubber) videoScrubber.value = currentTime;
    if (timecodeDisplay) timecodeDisplay.textContent = formatTimecode(currentTime);

    // Virtual Camera Transform
    renderCamera(currentTime);

    // Cursor Solver & Positioning
    const { pos, isPressed, opacity } = solveCursor(currentTime);
    if (virtualCursor) {
      virtualCursor.style.transform = `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px, 0)`;
      virtualCursor.style.opacity = opacity;
      if (isPressed) {
        virtualCursor.classList.add('pressed');
      } else {
        virtualCursor.classList.remove('pressed');
      }
    }

    // Render Tactile Click Ripples
    renderClickRipples(currentTime);

    // --- Scene States & Pure Virtual Clock Crossfades ---
    let sceneLabel = '1. Prompt';

    // Typewriter on Hero Input (0.0s to 0.75s rapid typing)
    if (heroPromptText) {
      const fullText = "Add drag and drop to the photos in the gallery";
      if (currentTime < 0.15) {
        heroPromptText.innerHTML = '<span class="input-caret"></span>';
      } else if (currentTime >= 0.15 && currentTime < 0.75) {
        const progress = (currentTime - 0.15) / 0.60;
        const count = Math.floor(progress * fullText.length);
        heroPromptText.innerHTML = fullText.slice(0, count) + '<span class="input-caret"></span>';
      } else {
        heroPromptText.textContent = fullText;
      }
    }

    // Pure deterministic stage transitions (Zero CSS transition conflicts)
    if (currentTime < 0.95) {
      sceneLabel = '1. Prompt (0s–1.0s)';
      heroStage.style.display = 'flex';
      heroStage.style.opacity = '1';
      heroStage.style.transform = 'none';

      macosAppWindow.style.display = 'none';
      macosAppWindow.style.opacity = '0';

      macosWallpaper.style.opacity = '0';
      liveAppStage.style.display = 'none';
      liveAppStage.style.opacity = '0';
      outroStage.style.opacity = '0';
      floatingBadge.classList.remove('visible');
    } else if (currentTime >= 0.95 && currentTime < 1.50) {
      sceneLabel = '1 to 2. Expanding Workspace';
      const p = smoothstepQuintic((currentTime - 0.95) / 0.55);
      heroStage.style.display = 'flex';
      heroStage.style.opacity = (1 - p).toFixed(3);
      heroStage.style.transform = `scale(${(1 + p * 0.05).toFixed(3)})`;

      macosAppWindow.style.display = 'flex';
      macosAppWindow.style.opacity = p.toFixed(3);
      macosAppWindow.style.transform = `scale(${(0.985 + p * 0.015).toFixed(3)})`;

      macosWallpaper.style.opacity = p.toFixed(3);
      liveAppStage.style.display = 'none';
      liveAppStage.style.opacity = '0';
      outroStage.style.opacity = '0';
      floatingBadge.classList.remove('visible');
    } else if (currentTime >= 1.50 && currentTime < 21.00) {
      heroStage.style.display = 'none';
      heroStage.style.opacity = '0';

      macosAppWindow.style.display = 'flex';
      macosAppWindow.style.opacity = '1';
      macosAppWindow.style.transform = 'none';

      macosWallpaper.style.opacity = '1';
      liveAppStage.style.display = 'none';
      liveAppStage.style.opacity = '0';
      outroStage.style.opacity = '0';

      if (currentTime < 13.00) {
        sceneLabel = '2. Multi-Agent Threads (1.5s–13s)';
        floatingBadge.textContent = 'Multitask with Codex';
        floatingBadge.classList.add('visible');
        if (viewChatExecution) viewChatExecution.style.display = 'flex';
        if (viewSplitDiff) viewSplitDiff.style.display = 'none';

        // Dynamic Thread Selection & Realistic Photobooth Polish Progress
        if (currentTime < 2.80) {
          if (threadPhotobooth) threadPhotobooth.classList.remove('active');
          if (threadDragDrop) threadDragDrop.classList.add('active');
          if (mainThreadTitle) mainThreadTitle.textContent = 'Add drag and drop to gallery photos';
          if (chatThreadInitial) chatThreadInitial.style.display = 'flex';
          if (chatThreadPhotobooth) chatThreadPhotobooth.style.display = 'none';
          if (chatComposerBtnIcon) chatComposerBtnIcon.innerHTML = '<use href="#icon-arrow-up"></use>';
        } else {
          // Photobooth polish thread active
          if (threadPhotobooth) threadPhotobooth.classList.add('active');
          if (threadDragDrop) threadDragDrop.classList.remove('active');
          if (mainThreadTitle) mainThreadTitle.textContent = 'Photobooth polish';
          if (chatThreadInitial) chatThreadInitial.style.display = 'none';
          if (chatThreadPhotobooth) chatThreadPhotobooth.style.display = 'flex';

          // Progressive execution stream inside Photobooth polish
          if (currentTime < 4.50) {
            if (stepDragCode) stepDragCode.style.display = 'none';
            if (stepBuildPass) stepBuildPass.style.display = 'none';
            if (chatSummaryCard) chatSummaryCard.style.display = 'none';
            if (chatThinkingPill) chatThinkingPill.style.display = 'inline-flex';
            if (chatPulseDot) chatPulseDot.style.display = 'inline-block';
            if (chatThinkingText) chatThinkingText.textContent = 'Analyzing component structure & drag handlers...';
            if (chatComposerBtnIcon) chatComposerBtnIcon.innerHTML = '<use href="#icon-stop"></use>';
          } else if (currentTime < 6.20) {
            if (stepDragCode) stepDragCode.style.display = 'flex';
            if (stepBuildPass) stepBuildPass.style.display = 'none';
            if (chatSummaryCard) chatSummaryCard.style.display = 'none';
            if (chatThinkingPill) chatThinkingPill.style.display = 'inline-flex';
            if (chatPulseDot) chatPulseDot.style.display = 'inline-block';
            if (chatThinkingText) chatThinkingText.textContent = 'Running typecheck & build validation...';
            if (chatComposerBtnIcon) chatComposerBtnIcon.innerHTML = '<use href="#icon-stop"></use>';
          } else if (currentTime < 7.50) {
            if (stepDragCode) stepDragCode.style.display = 'flex';
            if (stepBuildPass) stepBuildPass.style.display = 'flex';
            if (chatSummaryCard) chatSummaryCard.style.display = 'none';
            if (chatThinkingPill) chatThinkingPill.style.display = 'inline-flex';
            if (chatPulseDot) chatPulseDot.style.display = 'inline-block';
            if (chatThinkingText) chatThinkingText.textContent = 'Finalizing gallery polish summary...';
            if (chatComposerBtnIcon) chatComposerBtnIcon.innerHTML = '<use href="#icon-stop"></use>';
          } else {
            // Completed & ready for review
            if (stepDragCode) stepDragCode.style.display = 'flex';
            if (stepBuildPass) stepBuildPass.style.display = 'flex';
            if (chatSummaryCard) chatSummaryCard.style.display = 'flex';
            if (chatThinkingPill) chatThinkingPill.style.display = 'inline-flex';
            if (chatPulseDot) chatPulseDot.style.display = 'none';
            if (chatThinkingText) chatThinkingText.innerHTML = '<svg width="12" height="12" viewBox="0 0 256 256" fill="#10B981" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg><span style="color: #10B981; font-weight: 600;">Ready for review</span>';
            if (chatComposerBtnIcon) chatComposerBtnIcon.innerHTML = '<use href="#icon-arrow-up"></use>';
          }
        }
      } else {
        sceneLabel = '3. Split Diff & Review (13s–21s)';
        floatingBadge.textContent = 'Review & Collaborate';
        floatingBadge.classList.add('visible');
        if (viewChatExecution) viewChatExecution.style.display = 'none';
        if (viewSplitDiff) viewSplitDiff.style.display = 'flex';
      }
    } else if (currentTime >= 21.00 && currentTime < 21.60) {
      const p = smoothstepQuintic((currentTime - 21.00) / 0.60);
      heroStage.style.display = 'none';

      macosAppWindow.style.display = 'flex';
      macosAppWindow.style.opacity = (1 - p).toFixed(3);

      liveAppStage.style.display = 'flex';
      liveAppStage.style.opacity = p.toFixed(3);

      macosWallpaper.style.opacity = '1';
      floatingBadge.classList.remove('visible');
      outroStage.style.opacity = '0';
    } else if (currentTime >= 21.60 && currentTime < 33.80) {
      sceneLabel = '4. Flash Stash Live App (21s–34s)';
      heroStage.style.display = 'none';
      macosAppWindow.style.display = 'none';
      macosAppWindow.style.opacity = '0';

      liveAppStage.style.display = 'flex';
      liveAppStage.style.opacity = '1';
      liveAppStage.style.transform = 'none';

      macosWallpaper.style.opacity = '1';
      floatingBadge.classList.remove('visible');
      outroStage.style.opacity = '0';
    } else if (currentTime >= 33.80 && currentTime < 34.50) {
      const p = smoothstepQuintic((currentTime - 33.80) / 0.70);
      heroStage.style.display = 'none';
      macosAppWindow.style.display = 'none';

      liveAppStage.style.display = 'flex';
      liveAppStage.style.opacity = (1 - p).toFixed(3);
      liveAppStage.style.transform = `scale(${(1 - p * 0.02).toFixed(3)})`;

      macosWallpaper.style.opacity = (1 - p).toFixed(3);
      outroStage.style.opacity = p.toFixed(3);
      floatingBadge.classList.remove('visible');
    } else if (currentTime >= 34.50) {
      sceneLabel = '5. OpenAI Outro (34s–38s)';
      heroStage.style.display = 'none';
      macosAppWindow.style.display = 'none';
      liveAppStage.style.display = 'none';
      macosWallpaper.style.opacity = '0';
      floatingBadge.classList.remove('visible');
      outroStage.style.opacity = '1';
    }

    // Outro Logo Lockup: Scale from 0 to 100% from center with gentle spring friction (subtle bounce)
    if (outroLogoLockup) {
      if (currentTime < 34.40) {
        outroLogoLockup.style.transform = 'scale(0)';
        outroLogoLockup.style.opacity = '0';
      } else {
        const dt = currentTime - 34.40;
        const s = springGentle(dt);
        const op = Math.min(1, dt / 0.15);
        outroLogoLockup.style.transform = `scale(${Math.max(0, s).toFixed(4)})`;
        outroLogoLockup.style.opacity = op.toFixed(3);
      }
    }

    // Inline Review Comment Resolved State
    if (commentStatusChip) {
      if (currentTime >= 17.50 && currentTime < 21.00) {
        commentStatusChip.style.display = 'inline-block';
      } else {
        commentStatusChip.style.display = 'none';
      }
    }

    // Visible Polaroid Drag and Drop Reordering (Proof fulfilling Prompt!)
    if (polaroidCard && polaroidCard2) {
      const deltaX = 213;
      if (currentTime < 25.80) {
        polaroidCard.style.transform = 'none';
        polaroidCard.style.boxShadow = '';
        polaroidCard.style.zIndex = '1';
        polaroidCard2.style.transform = 'none';
        polaroidCard2.style.boxShadow = '';
        polaroidCard2.style.zIndex = '1';
      } else if (currentTime >= 25.80 && currentTime < 28.20) {
        const q = (currentTime - 25.80) / 2.40;
        const u = smoothstepQuintic(q);
        const dragX = u * deltaX;
        const dragLift = Math.sin(q * Math.PI) * 14;
        polaroidCard.style.transform = `translate3d(${dragX.toFixed(1)}px, ${-dragLift.toFixed(1)}px, 0) scale(1.05)`;
        polaroidCard.style.boxShadow = '0 24px 48px rgba(0, 0, 0, 0.55)';
        polaroidCard.style.zIndex = '10';

        // Neighbor photo shifts left to take slot 1
        const shiftX = -u * deltaX;
        polaroidCard2.style.transform = `translate3d(${shiftX.toFixed(1)}px, 0, 0)`;
        polaroidCard2.style.zIndex = '1';
      } else if (currentTime >= 28.20 && currentTime < 34.00) {
        // Dropped & swapped!
        polaroidCard.style.transform = `translate3d(${deltaX}px, 0, 0) scale(1.0)`;
        polaroidCard.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.4)';
        polaroidCard.style.zIndex = '1';

        polaroidCard2.style.transform = `translate3d(-${deltaX}px, 0, 0) scale(1.0)`;
        polaroidCard2.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.4)';
        polaroidCard2.style.zIndex = '1';
      } else {
        polaroidCard.style.transform = 'none';
        polaroidCard.style.boxShadow = '';
        polaroidCard.style.zIndex = '1';
        polaroidCard2.style.transform = 'none';
        polaroidCard2.style.boxShadow = '';
        polaroidCard2.style.zIndex = '1';
      }
    }

    if (sceneNameDisplay) sceneNameDisplay.textContent = sceneLabel;

    // Jump Pills Active Sync
    pillBtns.forEach((btn) => {
      const seekTarget = parseFloat(btn.getAttribute('data-seek'));
      if (Math.abs(seekTarget - currentTime) < 3.5) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // --- Virtual Clock Public API ---
  window.__seekToTime = function (timestampSeconds) {
    isPlaying = false;
    if (playIcon) {
      playIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    }
    renderFrame(timestampSeconds);
  };

  window.__getVideoDuration = function () {
    return DURATION;
  };

  window.__renderFrame = function (timestampSeconds) {
    renderFrame(timestampSeconds);
  };

  // --- Animation Playback Loop ---
  function playLoop(timestamp) {
    if (!isPlaying) {
      lastTimestamp = null;
      return;
    }

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    currentTime += delta * playbackSpeed;
    if (currentTime >= DURATION) {
      currentTime = 0; // Loop seamlessly
    }

    renderFrame(currentTime);
    animationFrameId = requestAnimationFrame(playLoop);
  }

  function togglePlayPause() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      if (playIcon) {
        playIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      }
      lastTimestamp = null;
      animationFrameId = requestAnimationFrame(playLoop);
    } else {
      if (playIcon) {
        playIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }
  }

  // --- Event Listeners ---
  if (btnPlayPause) {
    btnPlayPause.addEventListener('click', togglePlayPause);
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  if (videoScrubber) {
    videoScrubber.addEventListener('input', (e) => {
      isPlaying = false;
      if (playIcon) {
        playIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      }
      renderFrame(parseFloat(e.target.value));
    });
  }

  speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      speedBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      playbackSpeed = parseFloat(btn.getAttribute('data-speed')) || 1.0;
    });
  });

  pillBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const seekTarget = parseFloat(btn.getAttribute('data-seek'));
      renderFrame(seekTarget);
    });
  });

  // URL parameter override: ?t=5.5&autoplay=false
  const params = new URLSearchParams(window.location.search);
  if (params.has('t')) {
    renderFrame(parseFloat(params.get('t')));
  } else {
    renderFrame(0);
  }

  if (params.get('autoplay') === 'true') {
    togglePlayPause();
  }
})();
