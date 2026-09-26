/**
 * design-os-tutorial-engine.js — Virtual Clock & Scene Choreography Engine
 * 
 * Codex Light / OpenAI "Templates with ChatGPT Images 2.5" Edition:
 * - Pure Apple/Codex Light visual language (#FFFFFF, #F5F6F8, #ECEEF2, #0D0D0D)
 * - Drives 30.0s (1800 frames at 60fps) explainer video frame-by-frame with zero drift
 * - Implements window.__seekToTime(t) and window.__motionRuntime
 * - Follows 6-Beat Storyboard:
 *     Beat 1: Hook [0, 180) (0.0s – 3.0s)
 *     Beat 2: Template Discovery [180, 480) (3.0s – 8.0s)
 *     Beat 3: Interactive Walkthrough [480, 900) (8.0s – 15.0s)
 *     Beat 4: Audio Waveform Sync [900, 1200) (15.0s – 20.0s)
 *     Beat 5: Multi-Aspect Ecosystem [1200, 1560) (20.0s – 26.0s)
 *     Beat 6: Outro Conversion CTA [1560, 1800) (26.0s – 30.0s)
 */

(function() {
  'use strict';

  const TOTAL_DURATION = 30.0;
  const FPS = 60;
  const TOTAL_FRAMES = Math.round(TOTAL_DURATION * FPS); // 1800 frames

  let isPlaying = false;
  let currentTime = 0.0;
  let playbackRate = 1.0;
  let lastRafTimestamp = null;

  // DOM Elements
  const videoStage = document.getElementById('video-stage');
  const cameraWorld = document.getElementById('camera-world');
  const timecodeEl = document.getElementById('timecode');
  const scrubberEl = document.getElementById('video-scrubber');
  const playBtn = document.getElementById('btn-play-pause');
  const playIcon = document.getElementById('play-icon');
  const restartBtn = document.getElementById('btn-restart');
  const sceneNameEl = document.getElementById('scene-name');
  const speedBtns = document.querySelectorAll('.speed-btn');
  const scenePillBtns = document.querySelectorAll('.pill-btn');

  // Viewport Auto-Scaling (Fit 1920x1080 without distortion or offset)
  function updateViewportScale() {
    const wrapper = document.querySelector('.video-stage-wrapper');
    if (!wrapper || !videoStage) return;

    if (document.body.classList.contains('clean-export') || document.documentElement.classList.contains('clean-export')) {
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
  document.addEventListener('DOMContentLoaded', updateViewportScale);
  setTimeout(updateViewportScale, 50);

  // Cursor & Ripple Elements
  const cursorEl = document.getElementById('tutorial-cursor');
  const rippleEl = document.getElementById('tutorial-ripple');

  // Scene containers
  const scene1 = document.getElementById('scene-1-hook');
  const scene2 = document.getElementById('scene-2-diagram');
  const scene3 = document.getElementById('scene-3-walkthrough');
  const scene4 = document.getElementById('scene-4-audio');
  const scene5 = document.getElementById('scene-5-multiaspect');
  const scene6 = document.getElementById('scene-6-outro');

  // Smooth quintic smootherstep easing: zero velocity & zero acceleration at boundaries
  function smootherstep(u) {
    const x = Math.max(0, Math.min(1, u));
    return x * x * x * (x * (x * 6 - 15) + 10);
  }

  // Build Scene 1 Kinetic Words Dock
  const hookKaraoke = document.getElementById('hook-karaoke');
  if (hookKaraoke) {
    hookKaraoke.innerHTML = `
      <div style="display: flex; gap: 14px; font-size: 30px; font-weight: 700;">
        <span id="kword-0" style="padding: 6px 18px; border-radius: 10px; transition: all 0.2s;">Your</span>
        <span id="kword-1" style="padding: 6px 18px; border-radius: 10px; transition: all 0.2s;">ideas.</span>
        <span id="kword-2" style="padding: 6px 18px; border-radius: 10px; transition: all 0.2s;">In</span>
        <span id="kword-3" style="padding: 6px 18px; border-radius: 10px; transition: all 0.2s;">motion.</span>
      </div>
    `;
  }

  // Build Scene 3 Walkthrough App Frame
  const walkthroughWindow = document.getElementById('walkthrough-app-window');
  if (walkthroughWindow) {
    walkthroughWindow.innerHTML = `
      <svg viewBox="0 0 1400 820" style="width: 100%; height: 100%;">
        <!-- AppFrame Window Base (Codex Light) -->
        <rect x="0" y="0" width="1400" height="820" rx="16" fill="#FFFFFF" stroke="rgba(0,0,0,0.08)" stroke-width="1.5" filter="drop-shadow(0 35px 100px rgba(0,0,0,0.14))" />
        <path d="M 0,16 A 16,16 0 0,1 16,0 L 1384,0 A 16,16 0 0,1 1400,16 L 1400,52 L 0,52 Z" fill="#F5F6F8" />
        <line x1="0" y1="52" x2="1400" y2="52" stroke="rgba(0,0,0,0.06)" stroke-width="1" />
        <circle cx="26" cy="26" r="6" fill="#ff5f56" />
        <circle cx="46" cy="26" r="6" fill="#ffbd2e" />
        <circle cx="66" cy="26" r="6" fill="#27c93f" />
        <text x="700" y="33" text-anchor="middle" font-family="Inter" font-size="13" font-weight="600" fill="#52525B">Design OS Studio Runner — Template Editor</text>

        <!-- Mock Video Player Screen Inside App -->
        <rect x="60" y="80" width="880" height="580" rx="12" fill="#F8F9FA" stroke="rgba(0,0,0,0.06)" />
        <image href="assets/hero-poster.jpg" x="300" y="105" width="400" height="530" rx="10" preserveAspectRatio="xMidYMid slice" />

        <!-- Side Inspector Panel on the Right -->
        <g transform="translate(960, 80)">
          <rect width="380" height="580" rx="12" fill="#FAFAFC" stroke="rgba(0,0,0,0.06)" />
          <text x="24" y="36" font-family="Inter" font-size="14" font-weight="700" fill="#0D0D0D">TEMPLATE PARAMETERS</text>
          
          <!-- Parameter Rows -->
          <g transform="translate(24, 60)">
            <rect width="332" height="48" rx="8" fill="#FFFFFF" stroke="rgba(0,0,0,0.06)" />
            <text x="16" y="29" font-family="Inter" font-size="12" font-weight="600" fill="#52525B">Target Format</text>
            <text x="316" y="29" text-anchor="end" font-family="JetBrains Mono" font-size="12" font-weight="600" fill="#007AFF">16:9 Landscape</text>
          </g>

          <g transform="translate(24, 120)">
            <rect width="332" height="48" rx="8" fill="#FFFFFF" stroke="rgba(0,0,0,0.06)" />
            <text x="16" y="29" font-family="Inter" font-size="12" font-weight="600" fill="#52525B">Motion IR Gate</text>
            <text x="316" y="29" text-anchor="end" font-family="JetBrains Mono" font-size="12" font-weight="600" fill="#10B981">10/10 Passed</text>
          </g>

          <g transform="translate(24, 180)">
            <rect width="332" height="48" rx="8" fill="#FFFFFF" stroke="rgba(0,0,0,0.06)" />
            <text x="16" y="29" font-family="Inter" font-size="12" font-weight="600" fill="#52525B">Framerate</text>
            <text x="316" y="29" text-anchor="end" font-family="JetBrains Mono" font-size="12" font-weight="600" fill="#0D0D0D">60.000 fps</text>
          </g>

          <g transform="translate(24, 240)">
            <rect width="332" height="48" rx="8" fill="#FFFFFF" stroke="rgba(0,0,0,0.06)" />
            <text x="16" y="29" font-family="Inter" font-size="12" font-weight="600" fill="#52525B">Decoupled Camera</text>
            <text x="316" y="29" text-anchor="end" font-family="JetBrains Mono" font-size="12" font-weight="600" fill="#10B981">Settled</text>
          </g>
        </g>

        <!-- Transport Bar Dock inside App -->
        <g id="mock-transport" transform="translate(60, 690)">
          <rect width="1280" height="80" rx="10" fill="#FFFFFF" stroke="rgba(0,0,0,0.08)" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.04))" />
          <!-- Play icon circle -->
          <circle cx="50" cy="40" r="20" fill="#007AFF" />
          <polygon points="46,32 58,40 46,48" fill="#fff" />
          <!-- Timecode -->
          <text x="90" y="45" font-family="JetBrains Mono" font-size="14" font-weight="600" fill="#0D0D0D">00:11.2 / 00:30.0</text>
          <!-- Scrubber line -->
          <line x1="280" y1="40" x2="1050" y2="40" stroke="#E4E4E7" stroke-width="6" stroke-linecap="round" />
          <line x1="280" y1="40" x2="620" y2="40" stroke="#007AFF" stroke-width="6" stroke-linecap="round" />
          <circle cx="620" cy="40" r="9" fill="#007AFF" stroke="#fff" stroke-width="2" />
          <!-- 1x / 2x Speed Buttons -->
          <g id="mock-speed-group" transform="translate(1100, 24)">
            <rect id="mock-speed-1x" x="0" y="0" width="40" height="32" rx="6" fill="#F4F5F8" stroke="rgba(0,0,0,0.08)" />
            <text x="20" y="21" text-anchor="middle" font-family="JetBrains Mono" font-size="12" fill="#52525B">1x</text>
            <rect id="mock-speed-2x" x="48" y="0" width="40" height="32" rx="6" fill="#F4F5F8" stroke="rgba(0,0,0,0.08)" />
            <text id="mock-speed-2x-text" x="68" y="21" text-anchor="middle" font-family="JetBrains Mono" font-size="12" fill="#52525B">2x</text>
          </g>
        </g>

        <!-- Callout Badge (Appears at t=11.5s) -->
        <g id="walkthrough-callout" transform="translate(900, 560)" opacity="0">
          <circle cx="328" cy="170" r="14" fill="none" stroke="#007AFF" stroke-width="2" stroke-dasharray="3 3" />
          <circle cx="328" cy="170" r="3" fill="#007AFF" />
          <path d="M 328,170 L 280,80 L 120,80" fill="none" stroke="#007AFF" stroke-width="1.8" />
          <g transform="translate(0, 40)">
            <rect width="250" height="68" rx="12" fill="#FFFFFF" stroke="rgba(0,0,0,0.1)" stroke-width="1" filter="drop-shadow(0 20px 45px rgba(0,0,0,0.12))" />
            <text x="18" y="28" font-family="Inter" font-size="13" font-weight="700" fill="#0D0D0D">Playback Speed Controls</text>
            <text x="18" y="48" font-family="Inter" font-size="11" fill="#71717A">Toggle 1x/2x/4x without pitch shift</text>
          </g>
        </g>
      </svg>
    `;
  }

  // Build Scene 4 Audio Equalizer (32 bars)
  const audioContainer = document.getElementById('audio-equalizer-container');
  if (audioContainer) {
    const barsHtml = Array.from({ length: 32 }, (_, i) => {
      return `<rect id="audio-bar-${i}" x="${i * 24}" y="60" width="14" height="60" rx="4" fill="#007AFF" />`;
    }).join('');
    audioContainer.innerHTML = `
      <svg viewBox="0 0 768 130" style="width: 768px; height: 130px; overflow: visible;">
        ${barsHtml}
      </svg>
    `;
  }
  const audioKaraoke = document.getElementById('audio-karaoke-sub');
  if (audioKaraoke) {
    audioKaraoke.innerHTML = `
      <div style="font-size: 20px; font-weight: 600; color: #007AFF; font-family: JetBrains Mono;">
        PCM Wave Envelope • Exact Frame-by-Frame Sync (0.00ms Jitter)
      </div>
    `;
  }

  /**
   * Main Deterministic Frame Evaluator
   * Evaluates state at exactly time t.
   */
  function seekToTime(t) {
    currentTime = Math.max(0, Math.min(TOTAL_DURATION, t));
    const frameIndex = Math.round(currentTime * FPS);

    // Update transport bar
    if (scrubberEl) scrubberEl.value = currentTime;
    const mm = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const ss = (currentTime % 60).toFixed(1).padStart(4, '0');
    if (timecodeEl) timecodeEl.textContent = `${mm}:${ss} / 00:30.0`;

    // Reset camera world transform default
    let camTransform = 'scale(1.0) translate(0px, 0px)';
    cursorEl.style.opacity = '0';
    rippleEl.style.opacity = '0';

    // -------------------------------------------------------------
    // SCENE ROUTING (6 Storyboard Beats)
    // -------------------------------------------------------------
    scene1.classList.remove('active');
    scene2.classList.remove('active');
    scene3.classList.remove('active');
    scene4.classList.remove('active');
    scene5.classList.remove('active');
    scene6.classList.remove('active');

    if (currentTime < 3.0) {
      // -----------------------------------------------------------
      // BEAT 1: Hook [0, 180) (0.0s – 3.0s)
      // "Your ideas. In motion."
      // -----------------------------------------------------------
      scene1.classList.add('active');
      if (sceneNameEl) sceneNameEl.textContent = 'Beat 1: Instant Hook & Promise';

      // Kinetic words highlight sequence
      const w0 = document.getElementById('kword-0');
      const w1 = document.getElementById('kword-1');
      const w2 = document.getElementById('kword-2');
      const w3 = document.getElementById('kword-3');

      const setWord = (el, active, isAccent = false) => {
        if (!el) return;
        el.style.background = active ? (isAccent ? '#007AFF' : '#0D0D0D') : '#F4F5F8';
        el.style.color = active ? '#FFFFFF' : '#71717A';
        el.style.boxShadow = active ? '0 4px 14px rgba(0,0,0,0.18)' : 'none';
      };

      setWord(w0, currentTime >= 0.4 && currentTime < 0.95);
      setWord(w1, currentTime >= 0.95 && currentTime < 1.55);
      setWord(w2, currentTime >= 1.55 && currentTime < 2.15);
      setWord(w3, currentTime >= 2.15, true);

    } else if (currentTime < 8.0) {
      // -----------------------------------------------------------
      // BEAT 2: Template Discovery [180, 480) (3.0s – 8.0s)
      // "Start somewhere extraordinary."
      // -----------------------------------------------------------
      scene2.classList.add('active');
      if (sceneNameEl) sceneNameEl.textContent = 'Beat 2: Template Discovery Gallery';

      const card1 = document.getElementById('tmpl-card-1');
      const card2 = document.getElementById('tmpl-card-2');
      const card3 = document.getElementById('tmpl-card-3');
      const badge1 = document.getElementById('tmpl-badge-1');

      // Selection lift on Card 1
      if (currentTime >= 5.0) {
        if (card1) card1.classList.add('selected');
        if (badge1) {
          badge1.innerHTML = '<svg width="12" height="12" fill="currentColor"><use href="#icon-check"></use></svg> Selected';
          badge1.classList.add('active');
        }
      } else {
        if (card1) card1.classList.remove('selected');
        if (badge1) {
          badge1.innerHTML = 'Featured';
          badge1.classList.remove('active');
        }
      }

      // Pattern interrupt at t=5.5s – 6.8s (subtle 1.05x camera zoom punch)
      if (currentTime >= 5.5 && currentTime < 6.8) {
        camTransform = 'scale(1.05)';
      }

    } else if (currentTime < 15.0) {
      // -----------------------------------------------------------
      // BEAT 3: Interactive Walkthrough [480, 900) (8.0s – 15.0s)
      // "Make it yours."
      // -----------------------------------------------------------
      scene3.classList.add('active');
      if (sceneNameEl) sceneNameEl.textContent = 'Beat 3: Interactive Walkthrough & Studio Runner';

      const calloutEl = document.getElementById('walkthrough-callout');
      const speed2xBtn = document.getElementById('mock-speed-2x');
      const speed2xText = document.getElementById('mock-speed-2x-text');

      // Decoupled Camera vs Pointer Sequence (Gate 8 & Gate 6 certified):
      // 1. Overview hold: 8.0s – 9.8s
      // 2. Camera Punch: 9.8s – 10.3s (smootherstep into transport dock)
      // 3. Camera Settled hold: 10.3s – 10.6s (zero pointer movement!)
      // 4. Pointer Travel: 10.6s – 11.1s (camera 100% frozen!)
      // 5. Click Action & Ripple: 11.1s – 11.5s (Δ = 0.00px concentricity)
      // 6. Callout Badge Display: 11.5s – 14.2s
      // 7. Camera Return: 14.2s – 15.0s

      let camProgress = 0.0;
      if (currentTime >= 9.8 && currentTime < 10.3) {
        camProgress = smootherstep((currentTime - 9.8) / 0.5);
      } else if (currentTime >= 10.3 && currentTime < 14.2) {
        camProgress = 1.0;
      } else if (currentTime >= 14.2 && currentTime < 15.0) {
        camProgress = 1.0 - smootherstep((currentTime - 14.2) / 0.8);
      }

      if (camProgress > 0.001) {
        const curScale = 1.0 + 0.26 * camProgress;
        const curDy = -90 * camProgress;
        camTransform = `translate(0px, ${curDy.toFixed(2)}px) scale(${curScale.toFixed(4)})`;
      }

      // Pointer travel to 2x speed button (stage coordinates: x=1488, y=860)
      const targetX = 1488;
      const targetY = 860;

      if (currentTime >= 10.6 && currentTime < 14.5) {
        cursorEl.style.opacity = '1';

        if (currentTime < 11.1) {
          // Travel from bottom right
          const pProg = smootherstep((currentTime - 10.6) / 0.5); // 0..1
          const curX = 1600 - (1600 - targetX) * pProg;
          const curY = 960 - (960 - targetY) * pProg;
          cursorEl.style.transform = `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px)`;
        } else {
          // Locked at target
          cursorEl.style.transform = `translate(${targetX}px, ${targetY}px)`;
        }
      }

      // Click ripple at 11.1s (Δ = 0.00px concentricity)
      if (currentTime >= 11.1 && currentTime < 11.5) {
        const rProg = (currentTime - 11.1) / 0.4;
        rippleEl.style.opacity = (1.0 - rProg).toString();
        rippleEl.style.transform = `translate(${targetX}px, ${targetY}px) scale(${rProg * 35})`;
      }

      // 2x button state
      if (currentTime >= 11.1) {
        if (speed2xBtn) {
          speed2xBtn.setAttribute('fill', '#10B981');
          speed2xBtn.setAttribute('stroke', '#10B981');
        }
        if (speed2xText) speed2xText.setAttribute('fill', '#FFFFFF');
      } else {
        if (speed2xBtn) {
          speed2xBtn.setAttribute('fill', '#F4F5F8');
          speed2xBtn.setAttribute('stroke', 'rgba(0,0,0,0.08)');
        }
        if (speed2xText) speed2xText.setAttribute('fill', '#52525B');
      }

      // Callout appears
      if (calloutEl) {
        calloutEl.style.opacity = (currentTime >= 11.5 && currentTime < 14.2) ? '1' : '0';
      }

    } else if (currentTime < 20.0) {
      // -----------------------------------------------------------
      // BEAT 4: Audio Waveform Sync [900, 1200) (15.0s – 20.0s)
      // "Find your rhythm."
      // -----------------------------------------------------------
      scene4.classList.add('active');
      if (sceneNameEl) sceneNameEl.textContent = 'Beat 4: Audio-Visual Waveform Binding';

      let totalEnergy = 0;
      // Animate 32 equalizer bars mathematically by frame
      for (let i = 0; i < 32; i++) {
        const bar = document.getElementById(`audio-bar-${i}`);
        if (bar) {
          const energy = Math.abs(Math.sin((i / 32) * Math.PI + (frameIndex * 0.12))) * 0.8 + 0.2;
          totalEnergy += energy;
          const h = energy * 100;
          bar.setAttribute('height', h.toFixed(1));
          bar.setAttribute('y', (110 - h).toFixed(1));
          bar.setAttribute('fill', energy > 0.7 ? '#007AFF' : '#3B82F6');
        }
      }

      // Artwork breathing animation locked to average RMS energy
      const avgEnergy = totalEnergy / 32;
      const breathingCard = document.getElementById('audio-breathing-poster');
      if (breathingCard) {
        const breatheScale = 1.0 + (avgEnergy * 0.025);
        breathingCard.style.transform = `scale(${breatheScale.toFixed(4)})`;
      }

    } else if (currentTime < 26.0) {
      // -----------------------------------------------------------
      // BEAT 5: Multi-Aspect Ecosystem [1200, 1560) (20.0s – 26.0s)
      // "Every format. One idea."
      // -----------------------------------------------------------
      scene5.classList.add('active');
      if (sceneNameEl) sceneNameEl.textContent = 'Beat 5: Multi-Aspect Responsive Ecosystem';

      // Subtle inspection camera punch at t=23.0s – 25.0s
      if (currentTime >= 23.0 && currentTime < 25.0) {
        camTransform = 'scale(1.04)';
      }

    } else {
      // -----------------------------------------------------------
      // BEAT 6: Outro Conversion CTA [1560, 1800) (26.0s – 30.0s)
      // "Make your next move."
      // -----------------------------------------------------------
      scene6.classList.add('active');
      if (sceneNameEl) sceneNameEl.textContent = 'Beat 6: Conversion Outro & Templates CTA';
    }

    if (cameraWorld) {
      cameraWorld.style.transform = camTransform;
    }

    // Update scene pills
    scenePillBtns.forEach(btn => {
      const seek = parseFloat(btn.dataset.seek);
      const isCurrent = (currentTime >= seek) && 
        (!btn.nextElementSibling || currentTime < parseFloat(btn.nextElementSibling.dataset.seek));
      btn.classList.toggle('active', isCurrent);
    });
  }

  // Animation Loop for Interactive Studio Playback
  function tick(timestamp) {
    if (!isPlaying) return;
    if (lastRafTimestamp === null) lastRafTimestamp = timestamp;
    const deltaSeconds = (timestamp - lastRafTimestamp) / 1000.0;
    lastRafTimestamp = timestamp;

    currentTime += deltaSeconds * playbackRate;
    if (currentTime >= TOTAL_DURATION) {
      currentTime = TOTAL_DURATION;
      pause();
    }
    seekToTime(currentTime);
    if (isPlaying) requestAnimationFrame(tick);
  }

  function play() {
    isPlaying = true;
    lastRafTimestamp = null;
    if (currentTime >= TOTAL_DURATION) currentTime = 0.0;
    if (playIcon) {
      playIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    }
    requestAnimationFrame(tick);
  }

  function pause() {
    isPlaying = false;
    lastRafTimestamp = null;
    if (playIcon) {
      playIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    }
  }

  function togglePlay() {
    if (isPlaying) pause();
    else play();
  }

  // Attach Event Listeners
  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (restartBtn) restartBtn.addEventListener('click', () => {
    pause();
    seekToTime(0.0);
  });

  if (scrubberEl) {
    scrubberEl.addEventListener('input', (e) => {
      pause();
      seekToTime(parseFloat(e.target.value));
    });
  }

  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playbackRate = parseFloat(btn.dataset.speed);
    });
  });

  scenePillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pause();
      seekToTime(parseFloat(btn.dataset.seek));
    });
  });

  // Keyboard Shortcuts (Space: Play/Pause, Home: Restart, Left/Right: 1 Frame)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'Home') {
      e.preventDefault();
      pause();
      seekToTime(0.0);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      pause();
      seekToTime(currentTime + 1 / FPS);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      pause();
      seekToTime(currentTime - 1 / FPS);
    }
  });

  // Global Virtual Clock Interface for Headless Chromium / FFmpeg
  window.__seekToTime = function(t) {
    pause();
    seekToTime(t);
  };

  window.__motionRuntime = {
    ready: () => true,
    seekToFrame: (f) => {
      const t = (f * 1) / FPS;
      window.__seekToTime(t);
      return Promise.resolve({
        frameIndex: f,
        timeSeconds: t,
        status: 'settled'
      });
    },
    getManifest: () => ({
      name: 'Design OS Animation Explainer',
      fps: 60,
      totalFrames: TOTAL_FRAMES,
      durationSeconds: TOTAL_DURATION
    })
  };

  window.__motionReady = true;

  // Initial render at Frame 0
  seekToTime(0.0);

})();
