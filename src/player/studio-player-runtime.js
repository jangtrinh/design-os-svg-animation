/**
 * studio-player-runtime.js — Design OS Canonical Universal Player Runtime
 * 
 * Standardized client-side player controller:
 * - Dynamic Viewport Auto-Scaler (zero skew, flexbox centered, aspect-ratio preserved)
 * - Virtual Clock & Integer Frame Engine (window.__motionRuntime & window.__seekToTime)
 * - Complete Transport Dock Controls (Play/Pause, Scrubber, Timecode, Scene Pills, Speed, Fullscreen)
 * - Accessible Keyboard Shortcuts (Space, Home, Arrow Keys, 1/2/4, F)
 * - Clean Export Bypass (?clean=true / ?render=true)
 */

(function() {
  'use strict';

  // --- Clean Export Mode Detection ---
  const urlParams = new URLSearchParams(window.location.search);
  const isCleanExport = urlParams.get('clean') === 'true' || urlParams.get('render') === 'true';

  if (isCleanExport) {
    document.documentElement.classList.add('clean-export');
    document.addEventListener('DOMContentLoaded', () => {
      if (document.body) document.body.classList.add('clean-export');
    });
  }

  // --- Configuration from DOM ---
  function getPlayerConfig() {
    const stage = document.getElementById('video-stage');
    const nativeWidth = parseInt(stage?.dataset?.nativeWidth || '1920', 10);
    const nativeHeight = parseInt(stage?.dataset?.nativeHeight || '1080', 10);
    const duration = parseFloat(stage?.dataset?.duration || '10.0');
    const fps = parseInt(stage?.dataset?.fps || '60', 10);

    return {
      nativeWidth,
      nativeHeight,
      duration,
      fps,
      totalFrames: Math.round(duration * fps)
    };
  }

  // --- State ---
  let isPlaying = false;
  let currentTime = 0.0;
  let playbackRate = 1.0;
  let lastRafTimestamp = null;

  // --- DOM Elements ---
  const videoStage = document.getElementById('video-stage');
  const stageWrapper = document.querySelector('.video-stage-wrapper');
  const timecodeEl = document.getElementById('studio-timecode-display');
  const scrubberEl = document.getElementById('studio-video-scrubber');
  const playBtn = document.getElementById('studio-btn-play');
  const playIcon = document.getElementById('studio-play-icon');
  const restartBtn = document.getElementById('studio-btn-restart');
  const fullscreenBtn = document.getElementById('studio-btn-fullscreen');
  const sceneNameEl = document.getElementById('studio-scene-name');
  const speedBtns = document.querySelectorAll('.studio-speed-btn');
  const scenePills = document.querySelectorAll('.studio-scene-pill');

  // --- Viewport Auto-Scaling Engine ---
  function updateViewportScale() {
    if (!stageWrapper || !videoStage) return;

    if (document.body.classList.contains('clean-export') || document.documentElement.classList.contains('clean-export')) {
      videoStage.style.transform = 'none';
      return;
    }

    const { nativeWidth, nativeHeight } = getPlayerConfig();
    const availableWidth = stageWrapper.clientWidth;
    const availableHeight = stageWrapper.clientHeight;

    const scaleX = availableWidth / nativeWidth;
    const scaleY = availableHeight / nativeHeight;
    const scale = Math.min(scaleX, scaleY, 1.0);

    videoStage.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', updateViewportScale);
  if (typeof ResizeObserver !== 'undefined' && stageWrapper) {
    const ro = new ResizeObserver(updateViewportScale);
    ro.observe(stageWrapper);
  }
  document.addEventListener('DOMContentLoaded', updateViewportScale);
  setTimeout(updateViewportScale, 50);

  // --- Timecode Formatter ---
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${tenths}`;
  }

  function updateTransportUI() {
    const { duration } = getPlayerConfig();
    if (timecodeEl) {
      timecodeEl.innerHTML = `<strong>${formatTime(currentTime)}</strong> / ${formatTime(duration)}`;
    }
    if (scrubberEl) {
      scrubberEl.value = currentTime.toFixed(2);
    }
    if (playIcon) {
      if (isPlaying) {
        // Pause icon
        playIcon.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1.5" />
            <rect x="14" y="4" width="4" height="16" rx="1.5" />
          </svg>
        `;
      } else {
        // Play icon
        playIcon.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        `;
      }
    }

    // Update active scene pill
    let currentSceneTitle = '';
    scenePills.forEach(pill => {
      const seekTime = parseFloat(pill.dataset.seek || '0');
      const nextPill = pill.nextElementSibling;
      const nextSeekTime = nextPill ? parseFloat(nextPill.dataset.seek || '9999') : 9999;

      if (currentTime >= seekTime && currentTime < nextSeekTime) {
        pill.classList.add('active');
        currentSceneTitle = pill.dataset.name || pill.textContent;
      } else {
        pill.classList.remove('active');
      }
    });

    if (sceneNameEl && currentSceneTitle) {
      sceneNameEl.textContent = currentSceneTitle;
    }
  }

  // --- Master Frame Seeking Logic ---
  function seekToTime(seconds) {
    const { duration, fps, totalFrames } = getPlayerConfig();
    currentTime = Math.max(0, Math.min(seconds, duration));
    const frameIndex = Math.min(Math.round(currentTime * fps), totalFrames - 1);

    // Call scene animation driver hook if supplied
    if (typeof window.__onRenderFrame === 'function') {
      window.__onRenderFrame(frameIndex, currentTime);
    }

    updateTransportUI();
  }

  // --- Playback RAF Loop ---
  function tick(timestamp) {
    if (!isPlaying) return;

    if (lastRafTimestamp !== null) {
      const deltaSec = ((timestamp - lastRafTimestamp) / 1000) * playbackRate;
      const { duration } = getPlayerConfig();
      currentTime += deltaSec;

      if (currentTime >= duration) {
        currentTime = duration;
        isPlaying = false;
        seekToTime(currentTime);
        lastRafTimestamp = null;
        return;
      }

      seekToTime(currentTime);
    }

    lastRafTimestamp = timestamp;
    requestAnimationFrame(tick);
  }

  function togglePlayPause() {
    const { duration } = getPlayerConfig();
    if (currentTime >= duration) {
      currentTime = 0.0;
    }
    isPlaying = !isPlaying;
    if (isPlaying) {
      lastRafTimestamp = null;
      requestAnimationFrame(tick);
    } else {
      lastRafTimestamp = null;
    }
    updateTransportUI();
  }

  // --- Event Listeners ---
  if (playBtn) playBtn.addEventListener('click', togglePlayPause);
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      isPlaying = false;
      seekToTime(0.0);
    });
  }

  if (scrubberEl) {
    scrubberEl.addEventListener('input', (e) => {
      const wasPlaying = isPlaying;
      isPlaying = false;
      seekToTime(parseFloat(e.target.value));
      if (wasPlaying) {
        isPlaying = true;
        requestAnimationFrame(tick);
      }
    });
  }

  scenePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const seekTime = parseFloat(pill.dataset.seek || '0');
      seekToTime(seekTime);
    });
  });

  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playbackRate = parseFloat(btn.dataset.speed || '1.0');
    });
  });

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const frame = document.getElementById('video-stage-frame') || stageWrapper;
      if (!document.fullscreenElement) {
        if (frame.requestFullscreen) frame.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  // --- Keyboard Shortcuts ---
  window.addEventListener('keydown', (e) => {
    if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'Home') {
      e.preventDefault();
      isPlaying = false;
      seekToTime(0.0);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      const step = e.shiftKey ? 0.5 : 0.05;
      seekToTime(currentTime - step);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      const step = e.shiftKey ? 0.5 : 0.05;
      seekToTime(currentTime + step);
    } else if (e.key === '1') {
      playbackRate = 1.0;
      speedBtns.forEach(b => b.classList.toggle('active', b.dataset.speed === '1'));
    } else if (e.key === '2') {
      playbackRate = 2.0;
      speedBtns.forEach(b => b.classList.toggle('active', b.dataset.speed === '2'));
    } else if (e.key === '4') {
      playbackRate = 4.0;
      speedBtns.forEach(b => b.classList.toggle('active', b.dataset.speed === '4'));
    } else if (e.code === 'KeyF') {
      if (fullscreenBtn) fullscreenBtn.click();
    }
  });

  // --- Expose Universal Public APIs ---
  window.__seekToTime = seekToTime;

  window.__motionRuntime = {
    ready: true,
    manifest: {
      engine: 'design-os-universal-player',
      version: '0.2.0'
    },
    seekToFrame: function(frameIndex) {
      const { fps } = getPlayerConfig();
      seekToTime(frameIndex / fps);
      return { frame: frameIndex, timeSeconds: currentTime };
    },
    getFrameReceipt: function(frameIndex) {
      return {
        frame: frameIndex,
        timeSeconds: currentTime,
        status: 'ready'
      };
    },
    getManifest: function() {
      const cfg = getPlayerConfig();
      return {
        fps: cfg.fps,
        durationSeconds: cfg.duration,
        totalFrames: cfg.totalFrames,
        width: cfg.nativeWidth,
        height: cfg.nativeHeight
      };
    }
  };

  // Initial UI Render
  document.addEventListener('DOMContentLoaded', () => {
    updateViewportScale();
    seekToTime(0.0);
  });
})();
