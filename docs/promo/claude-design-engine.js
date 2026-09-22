/**
 * Claude Design — Master Promo Video Engine (00:00 – 01:22)
 * Ground-Truth 1:1 Deterministic Timeline, 3D Spherical Continents & Kinematic Parser
 */

(function() {
  'use strict';

  const TOTAL_DURATION = 82.0;
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('clean') === 'true' || urlParams.get('render') === 'true') {
    document.body.classList.add('clean-export');
  }
  let currentTime = parseFloat(urlParams.get('t') || '0');
  let isPlaying = urlParams.get('autoplay') !== 'false';
  let playbackSpeed = parseFloat(urlParams.get('speed') || '1');
  let lastTimestamp = 0;

  // DOM Elements
  const scrubber = document.getElementById('video-scrubber');
  const timecodeEl = document.getElementById('timecode');
  const sceneNameEl = document.getElementById('scene-name');
  const playBtn = document.getElementById('btn-play-pause');
  const playIcon = document.getElementById('play-icon');
  const virtualCursor = document.getElementById('virtual-cursor');

  const scenes = {
    s1: document.getElementById('scene-1'),
    s2: document.getElementById('scene-2'),
    s3: document.getElementById('scene-3'),
    s4: document.getElementById('scene-4'),
    s5: document.getElementById('scene-5'),
  };

  // Scene 1 Elements
  const s1BgGlobe = document.getElementById('s1-bg-globe-canvas');
  const s1BgCtx = s1BgGlobe.getContext('2d');
  const s1Pill = document.getElementById('s1-pill-btn');
  const s1Expanded = document.getElementById('s1-expanded-box');
  const s1Attachments = document.getElementById('s1-attachments');
  const s1TypedText = document.getElementById('s1-typed-text');
  const s1SendBtn = document.getElementById('s1-send-btn');
  const s1MorphPill = document.getElementById('s1-morph-pill');
  const s1StatusLabel = document.getElementById('s1-status-label');

  const PROMPT_PART_1 = "Let's design an interactive, dark themed";
  const PROMPT_PART_2 = " graphic showing how culture flows between cities. A rotating globe with the cities connected by glowing paths.";
  const FULL_PROMPT = PROMPT_PART_1 + PROMPT_PART_2;

  // Scene 2 Elements
  const globeCanvas = document.getElementById('globe-canvas');
  const globeCtx = globeCanvas.getContext('2d');
  const s2TweaksBtn = document.getElementById('s2-tweaks-btn');
  const s2TweaksPopover = document.getElementById('s2-tweaks-popover');
  const s2PopoverText = document.getElementById('s2-popover-text');
  const s2TweaksDrawer = document.getElementById('s2-tweaks-drawer');
  const POPOVER_QUERY = "Add controls for the globe and options to see different breakpoints";

  // Scene 3 Elements
  const s3Grid = document.getElementById('s3-infinite-grid');
  const s3MedWindow = document.getElementById('meditation-app-window');
  const s3PhoneDevice = document.getElementById('s3-phone-device');
  const s3ViewJourney = document.getElementById('s3-view-journey');
  const s3ViewPlayer = document.getElementById('s3-view-player');
  const s3SwatchMoss = document.getElementById('s3-swatch-moss');
  const s3DarkToggleRow = document.getElementById('s3-dark-toggle-row');
  const s3IosSwitch = document.getElementById('s3-ios-switch');
  const s3PinBox = document.getElementById('s3-pin-box');
  const s3EnsoCircle = document.getElementById('s3-enso-circle');
  const s3EnsoGlow = document.getElementById('s3-enso-glow');

  // Scene 4 Elements
  const s4RetreatWindow = document.getElementById('s4-retreat-window');
  const s4DeckWindow = document.getElementById('s4-deck-window');
  const s4CoverPhoto = document.getElementById('s4-cover-photo');
  const s4PhotoTag = document.getElementById('s4-photo-tag');
  const s4SwapComment = document.getElementById('s4-swap-comment');
  const s4RetreatTitle = document.getElementById('s4-retreat-title');
  const s4KnobsBtn = document.getElementById('s4-knobs-btn');
  const s4KnobTickPopover = document.getElementById('s4-knob-tick-popover');
  const s4KnobPointer = document.getElementById('s4-knob-pointer');
  const s4KnobReadout = document.getElementById('s4-knob-readout');
  const s4ChartCommentBox = document.getElementById('s4-chart-comment-box');
  const s4MorphBarsG = document.getElementById('s4-morph-bars-g');
  const s4MorphLinePath = document.getElementById('s4-morph-line-path');
  const s4MorphAreaPath = document.getElementById('s4-morph-area-path');

  // Scene 5 Elements
  const s5ExportMenu = document.getElementById('s5-export-menu');
  const s5CliModal = document.getElementById('s5-cli-modal');
  const s5BtnCopy = document.getElementById('s5-btn-copy');
  const s5CopyRipple = document.getElementById('s5-copy-ripple');
  const s5MontageGrid = document.getElementById('s5-montage-grid');
  const s5FinaleOutro = document.getElementById('s5-finale-outro');
  const s5GlobeCanvas = document.getElementById('s5-globe-canvas');
  const s5GlobeCtx = s5GlobeCanvas ? s5GlobeCanvas.getContext('2d') : null;

  // --- KINEMATIC EASING & CURSOR INTERPOLATION HELPERS ---
  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }
  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
  function smoothstepQuintic(x) {
    const p = Math.max(0, Math.min(1, x));
    return p * p * p * (p * (p * 6 - 15) + 10);
  }
  function bezierArc(start, end, progress, curvature = 0) {
    const p = Math.max(0, Math.min(1, progress));
    let x = start.x + (end.x - start.x) * p;
    let y = start.y + (end.y - start.y) * p;
    if (curvature !== 0) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;
      const arc = Math.sin(p * Math.PI) * curvature;
      x += nx * arc;
      y += ny * arc;
    }
    return { x, y };
  }
  function dampedSpring(t, t0, zeta = 0.65, omega = 7.5) {
    if (t < t0) return 0;
    const dt = t - t0;
    const alpha = zeta * omega;
    const beta = omega * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-alpha * dt) * (Math.cos(beta * dt) + (alpha / beta) * Math.sin(beta * dt));
  }

  // --- DYNAMIC SPATIAL ANCHORING HELPER ---
  function getAnchor(el, fallbackX = 960, fallbackY = 540) {
    if (!el) return { x: fallbackX, y: fallbackY };
    const stage = document.getElementById('video-stage');
    if (!stage) return { x: fallbackX, y: fallbackY };
    const r = el.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || s.width === 0 || s.height === 0) {
      return { x: fallbackX, y: fallbackY };
    }
    const scale = s.width / 1920;
    return {
      x: (r.left - s.left) / scale + (r.width / (2 * scale)),
      y: (r.top - s.top) / scale + (r.height / (2 * scale))
    };
  }

  // --- TACTILE CLICK RIPPLE HELPER ---
  let lastRippleTime = -1;
  function triggerClickRipple(x, y, t) {
    const ripple = document.getElementById('click-ripple');
    if (!ripple) return;
    if (Math.abs(t - lastRippleTime) < 0.15) return;
    lastRippleTime = t;
    ripple.style.left = `${x.toFixed(1)}px`;
    ripple.style.top = `${y.toFixed(1)}px`;
    ripple.classList.remove('active');
    void ripple.offsetWidth;
    ripple.classList.add('active');
  }

  // --- RESPONSIVE 1920x1080 STAGE FITTER ---
  function fitStageToWindow() {
    const stage = document.getElementById('video-stage');
    if (!stage) return;
    if (document.body.classList.contains('clean-export')) {
      stage.style.transform = 'none';
      return;
    }
    const wrapper = document.querySelector('.video-stage-wrapper');
    if (!wrapper) return;
    const availW = wrapper.clientWidth - 40;
    const availH = wrapper.clientHeight - 40;
    const scale = Math.min(availW / 1920, availH / 1080);
    stage.style.transform = `scale(${scale})`;
  }
  window.addEventListener('resize', fitStageToWindow);
  setTimeout(fitStageToWindow, 50);

  // --- UNIFIED HIGH-PRECISION MOUSE SOLVER ---
  function solveCursor(t) {
    let pos = { x: 1150, y: 720 };
    let isPressed = false;
    let isCrosshair = false;
    let opacity = 1;

    // --- Scene 1 (00:00 – 00:12) ---
    if (t < 0.25) {
      pos = { x: 1150, y: 720 };
    } else if (t >= 0.25 && t < 1.35) {
      const q = (t - 0.25) / 1.10;
      const target = getAnchor(s1Pill, 960, 540);
      pos = bezierArc({ x: 1150, y: 720 }, target, smoothstepQuintic(q), 32);
    } else if (t >= 1.35 && t < 1.50) {
      pos = getAnchor(s1Pill, 960, 540);
      isPressed = true;
      triggerClickRipple(pos.x, pos.y, 1.35);
    } else if (t >= 1.50 && t < 5.80) {
      pos = { x: 960, y: 540 };
      opacity = 0.85;
    } else if (t >= 5.80 && t < 6.40) {
      const q = (t - 5.80) / 0.60;
      const target = getAnchor(s1SendBtn, 1205, 628);
      pos = bezierArc({ x: 960, y: 540 }, target, smoothstepQuintic(q), -18);
    } else if (t >= 6.40 && t < 6.60) {
      pos = getAnchor(s1SendBtn, 1205, 628);
      isPressed = true;
      triggerClickRipple(pos.x, pos.y, 6.40);
    } else if (t >= 6.60 && t < 8.00) {
      const q = (t - 6.60) / 1.40;
      pos = bezierArc(getAnchor(s1SendBtn, 1205, 628), { x: 1120, y: 540 }, smoothstepQuintic(q), 10);
      opacity = 0.6;
    } else if (t >= 8.00 && t < 12.00) {
      pos = { x: 1120, y: 540 };
      opacity = 0.5;
    }

    // --- Scene 2 (00:12 – 00:27) ---
    else if (t >= 12.00 && t < 14.50) {
      const q = Math.min(1, (t - 12.00) / 2.0);
      pos = bezierArc({ x: 1120, y: 540 }, { x: 960, y: 460 }, smoothstepQuintic(q), -25);
      opacity = 0.9;
    } else if (t >= 14.50 && t < 15.20) {
      const q = (t - 14.50) / 0.70;
      const target = getAnchor(s2TweaksBtn, 1520, 138);
      pos = bezierArc({ x: 960, y: 460 }, target, smoothstepQuintic(q), -24);
    } else if (t >= 15.20 && t < 15.50) {
      pos = getAnchor(s2TweaksBtn, 1520, 138);
      isPressed = true;
      triggerClickRipple(pos.x, pos.y, 15.20);
    } else if (t >= 15.50 && t < 17.50) {
      pos = { x: 1520, y: 220 };
    } else if (t >= 17.50 && t < 19.00) {
      const q = (t - 17.50) / 1.50;
      const target = getAnchor(document.getElementById('slider-tweak-size'), 1620, 310);
      pos = bezierArc({ x: 1520, y: 220 }, target, smoothstepQuintic(q), 16);
    } else if (t >= 19.00 && t < 23.00) {
      const q = (t - 19.00) / 4.0;
      pos = { x: 1620 + q * 130, y: 310 };
      isPressed = true;
    } else if (t >= 23.00 && t < 27.00) {
      pos = { x: 1750, y: 310 };
      opacity = 0.8;
    }

    // --- Scene 3 (00:27 – 00:44) ---
    else if (t >= 27.00 && t < 30.00) {
      opacity = 0;
    } else if (t >= 30.00 && t < 33.50) {
      opacity = 1;
      const q = (t - 30.00) / 3.50;
      const target = getAnchor(s3SwatchMoss, 1080, 340);
      pos = bezierArc({ x: 1750, y: 310 }, target, smoothstepQuintic(q), 30);
    } else if (t >= 33.50 && t < 34.20) {
      pos = getAnchor(s3SwatchMoss, 1080, 340);
      isPressed = true;
      triggerClickRipple(pos.x, pos.y, 33.80);
    } else if (t >= 34.20 && t < 37.00) {
      const q = (t - 34.20) / 2.80;
      pos = bezierArc(getAnchor(s3SwatchMoss, 1080, 340), { x: 960, y: 480 }, smoothstepQuintic(q), -20);
      isCrosshair = true;
    } else if (t >= 37.00 && t < 40.50) {
      pos = { x: 960, y: 480 };
      isCrosshair = true;
      if (t >= 37.40 && t < 37.70) {
        isPressed = true;
        triggerClickRipple(960, 480, 37.50);
      }
    } else if (t >= 40.50 && t < 42.00) {
      const q = (t - 40.50) / 1.50;
      const target = getAnchor(s3IosSwitch, 1180, 560);
      pos = bezierArc({ x: 960, y: 480 }, target, smoothstepQuintic(q), 22);
    } else if (t >= 42.00 && t < 42.80) {
      pos = getAnchor(s3IosSwitch, 1180, 560);
      isPressed = true;
      triggerClickRipple(pos.x, pos.y, 42.50);
    } else if (t >= 42.80 && t < 44.00) {
      pos = { x: 1180, y: 560 };
    }

    // --- Scene 4 (00:44 – 01:03) ---
    else if (t >= 44.00 && t < 46.50) {
      const q = (t - 44.00) / 2.50;
      pos = bezierArc({ x: 1180, y: 560 }, { x: 680, y: 320 }, smoothstepQuintic(q), -35);
    } else if (t >= 46.50 && t < 47.50) {
      pos = getAnchor(s4PhotoTag, 680, 320);
      isPressed = true;
      triggerClickRipple(pos.x, pos.y, 47.00);
    } else if (t >= 47.50 && t < 50.50) {
      const q = (t - 47.50) / 3.00;
      const target = getAnchor(s4KnobsBtn, 1320, 138);
      pos = bezierArc({ x: 680, y: 320 }, target, smoothstepQuintic(q), -30);
    } else if (t >= 50.50 && t < 53.50) {
      pos = getAnchor(s4KnobsBtn, 1320, 138);
      isPressed = true;
    } else if (t >= 53.50 && t < 56.50) {
      const q = (t - 53.50) / 3.00;
      pos = bezierArc({ x: 1320, y: 138 }, { x: 980, y: 420 }, smoothstepQuintic(q), 28);
    } else if (t >= 56.50 && t < 57.50) {
      pos = { x: 980, y: 420 };
      isPressed = true;
      triggerClickRipple(980, 420, 56.80);
    } else if (t >= 57.50 && t < 63.00) {
      pos = { x: 1120, y: 420 };
      opacity = 0.8;
    }

    // --- Scene 5 (01:03 – 01:22) ---
    else if (t >= 63.00 && t < 64.50) {
      const q = (t - 63.00) / 1.50;
      const target = getAnchor(document.getElementById('s5-export-trigger'), 1620, 138);
      pos = bezierArc({ x: 1120, y: 420 }, target, smoothstepQuintic(q), -25);
    } else if (t >= 64.50 && t < 65.50) {
      pos = getAnchor(document.getElementById('s5-export-trigger'), 1620, 138);
      isPressed = true;
      triggerClickRipple(pos.x, pos.y, 64.80);
    } else if (t >= 65.50 && t < 67.00) {
      const q = (t - 65.50) / 1.50;
      const target = getAnchor(document.getElementById('s5-menu-handoff'), 1620, 360);
      pos = bezierArc(getAnchor(document.getElementById('s5-export-trigger'), 1620, 138), target, smoothstepQuintic(q), 10);
    } else if (t >= 67.00 && t < 67.80) {
      pos = getAnchor(document.getElementById('s5-menu-handoff'), 1620, 360);
      isPressed = true;
      triggerClickRipple(pos.x, pos.y, 67.20);
    } else if (t >= 67.80 && t < 69.50) {
      const q = (t - 67.80) / 1.70;
      const target = getAnchor(s5BtnCopy, 1140, 620);
      pos = bezierArc(getAnchor(document.getElementById('s5-menu-handoff'), 1620, 360), target, smoothstepQuintic(q), 25);
    } else if (t >= 69.50 && t < 71.00) {
      pos = getAnchor(s5BtnCopy, 1140, 620);
      if (t >= 69.80 && t < 70.40) {
        isPressed = true;
        triggerClickRipple(pos.x, pos.y, 70.00);
      }
    } else if (t >= 71.00 && t < 73.00) {
      pos = { x: 1140, y: 620 };
    } else {
      opacity = 0;
    }

    return { pos, isPressed, isCrosshair, opacity };
  }

  // --- 3D CONTINENT POLYGONS (Simplified Global Landmasses) ---
  const CONTINENTS = [
    // North America
    [ [70,-160], [70,-90], [60,-65], [45,-60], [30,-80], [25,-80], [15,-90], [20,-105], [32,-118], [48,-125], [60,-140], [65,-168], [70,-160] ],
    // South America
    [ [12,-75], [10,-60], [-5,-35], [-22,-40], [-45,-65], [-55,-68], [-40,-74], [-15,-76], [-2,-80], [10,-75], [12,-75] ],
    // Europe & Asia (Eurasia)
    [ [36,-6], [44,-1], [50,2], [58,5], [70,25], [72,80], [70,140], [60,165], [45,140], [38,120], [22,115], [10,105], [20,85], [25,65], [30,35], [38,28], [36,15], [36,-6] ],
    // Africa
    [ [36, -6], [37, 10], [32, 32], [12, 44], [-4, 40], [-25, 32], [-34, 18], [-15, 12], [5, 2], [15, -17], [30, -10], [36, -6] ],
    // Australia
    [ [-12, 130], [-12, 142], [-24, 153], [-37, 150], [-38, 140], [-32, 115], [-20, 115], [-12, 130] ]
  ];

  // 3D Global Cities
  const CITIES = [
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'New York', lat: 40.7128, lng: -74.006 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: 'Berlin', lat: 52.52, lng: 13.405 },
    { name: 'Seoul', lat: 37.5665, lng: 126.978 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
    { name: 'Bogotá', lat: 4.711, lng: -74.0721 },
    { name: 'Lima', lat: -12.0464, lng: -77.0428 },
    { name: 'Caracas', lat: 10.4806, lng: -66.9036 },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
    { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Atlanta', lat: 33.749, lng: -84.388 },
    { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
    { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
    { name: 'Copenhagen', lat: 55.6761, lng: 12.5683 },
    { name: 'Honolulu', lat: 21.3069, lng: -157.8583 }
  ];

  // Arcs between global hubs
  const ARCS = [
    [0, 3],  // Tokyo -> San Francisco
    [3, 2],  // SF -> New York
    [2, 1],  // New York -> London
    [1, 4],  // London -> Paris
    [4, 7],  // Paris -> Berlin
    [1, 21], // London -> Amsterdam
    [21, 22],// Amsterdam -> Copenhagen
    [0, 8],  // Tokyo -> Seoul
    [8, 6],  // Seoul -> Singapore
    [6, 5],  // Singapore -> Sydney
    [3, 23], // SF -> Honolulu
    [23, 0], // Honolulu -> Tokyo
    [2, 17], // NYC -> Chicago
    [17, 16],// Chicago -> Seattle
    [16, 3], // Seattle -> SF
    [3, 15], // SF -> Mexico City
    [15, 12],// Mexico City -> Bogota
    [12, 13],// Bogota -> Lima
    [12, 14],// Bogota -> Caracas
    [14, 10],// Caracas -> Sao Paulo
    [10, 11],// Sao Paulo -> Rio
    [11, 1], // Rio -> London
    [1, 19], // London -> Lagos
    [1, 20], // London -> Cairo
    [20, 9], // Cairo -> Dubai
    [9, 6]   // Dubai -> Singapore
  ];

  // Chart Data for Scene 4
  const CHART_DATA = [
    { label: 'Sep', val: 18 },
    { label: 'Oct', val: 42 },
    { label: 'Nov', val: 68 },
    { label: 'Dec', val: 110 },
    { label: 'Jan', val: 160 },
    { label: 'Feb', val: 220 },
    { label: 'Mar', val: 280 },
    { label: 'Apr', val: 320 }
  ];

  // Catmull-Rom to Cubic Bezier curve builder for broadcast spline rendering
  function buildSplinePath(points) {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
    let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  }

  function initDeckChart() {
    if (!s4MorphBarsG) return;
    s4MorphBarsG.innerHTML = '';
    CHART_DATA.forEach((d, i) => {
      const x = 50 + i * 48;
      const height = (d.val / 320) * 160;
      const y = 230 - height;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', 28);
      rect.setAttribute('height', height);
      rect.setAttribute('rx', 4);
      rect.setAttribute('fill', '#5B6D82');
      rect.setAttribute('id', `deck-bar-${i}`);
      s4MorphBarsG.appendChild(rect);
    });

    const points = CHART_DATA.map((d, i) => ({
      x: 50 + i * 48 + 14,
      y: 230 - (d.val / 320) * 160
    }));
    const splineD = buildSplinePath(points);
    if (s4MorphLinePath) {
      s4MorphLinePath.setAttribute('d', splineD);
    }
    if (s4MorphAreaPath) {
      const areaD = `${splineD} L ${points[points.length - 1].x},230 L ${points[0].x},230 Z`;
      s4MorphAreaPath.setAttribute('d', areaD);
    }
  }
  initDeckChart();

  // Active scene helper
  function setActiveScene(activeKey, sceneName) {
    Object.keys(scenes).forEach(k => {
      if (scenes[k]) {
        scenes[k].classList.toggle('active', k === activeKey);
      }
    });
    if (sceneNameEl) sceneNameEl.textContent = sceneName;
    document.querySelectorAll('.pill-btn').forEach(btn => {
      const seek = parseFloat(btn.dataset.seek);
      btn.classList.toggle('active', Math.abs(currentTime - seek) < 5);
    });
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- 3D ORTHOGRAPHIC GLOBE RENDERER ---
  function drawGlobe(ctx, width, height, rotY, tilt, radius, cx, cy, options = {}) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const R = radius || 360;
    const CenterX = cx || width / 2;
    const CenterY = cy || height / 2;
    const arcWidth = options.arcWidth || 2.2;
    const arcGlow = options.arcGlow !== undefined ? options.arcGlow : 80;
    const showLabels = options.showLabels !== false;

    // 1. Sphere Deep Shading
    const sphereGrad = ctx.createRadialGradient(
      CenterX - R * 0.25, CenterY - R * 0.25, R * 0.1,
      CenterX, CenterY, R
    );
    sphereGrad.addColorStop(0, '#151922');
    sphereGrad.addColorStop(0.65, '#0c0f16');
    sphereGrad.addColorStop(1, '#05070a');

    ctx.beginPath();
    ctx.arc(CenterX, CenterY, R, 0, Math.PI * 2);
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // Atmosphere Rim Glow & Fresnel Corona Bloom
    ctx.save();
    const coronaGrad = ctx.createRadialGradient(
      CenterX, CenterY, R * 0.96,
      CenterX, CenterY, R * 1.07
    );
    coronaGrad.addColorStop(0, 'rgba(52, 211, 153, 0.0)');
    coronaGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.08)');
    coronaGrad.addColorStop(0.85, 'rgba(16, 185, 129, 0.22)');
    coronaGrad.addColorStop(1, 'rgba(52, 211, 153, 0.0)');

    ctx.beginPath();
    ctx.arc(CenterX, CenterY, R * 1.07, 0, Math.PI * 2);
    ctx.fillStyle = coronaGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(CenterX, CenterY, R + 2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(52, 211, 153, 0.32)`;
    ctx.lineWidth = 3;
    ctx.shadowColor = '#34D399';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();

    // Project spherical coordinate (latDeg, lngDeg) to 2D
    function project(latDeg, lngDeg, altitudeR) {
      const lat = (latDeg * Math.PI) / 180;
      const lng = (lngDeg * Math.PI) / 180 + rotY;

      // Unrotated cartesian
      const x0 = altitudeR * Math.cos(lat) * Math.sin(lng);
      const y0 = altitudeR * Math.sin(lat);
      const z0 = altitudeR * Math.cos(lat) * Math.cos(lng);

      // Pitch tilt around X-axis
      const y1 = y0 * Math.cos(tilt) - z0 * Math.sin(tilt);
      const z1 = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);

      return {
        x: CenterX + x0,
        y: CenterY - y1,
        z: z1,
        visible: z1 > 0
      };
    }

    // 2. Continents Landmass Silhouettes
    ctx.save();
    ctx.beginPath();
    ctx.arc(CenterX, CenterY, R, 0, Math.PI * 2);
    ctx.clip(); // Keep inside sphere

    ctx.fillStyle = 'rgba(255, 255, 255, 0.055)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    CONTINENTS.forEach(poly => {
      ctx.beginPath();
      let started = false;
      poly.forEach(([lat, lng]) => {
        const pt = project(lat, lng, R);
        if (pt.visible) {
          if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
          else { ctx.lineTo(pt.x, pt.y); }
        }
      });
      if (started) {
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
    ctx.restore();

    // 3. Latitude & Longitude Wireframe Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(161, 161, 170, 0.09)';
    ctx.lineWidth = 1;

    [-60, -30, 0, 30, 60].forEach(lat => {
      ctx.beginPath();
      let started = false;
      for (let lng = -180; lng <= 180; lng += 8) {
        const pt = project(lat, lng, R);
        if (pt.visible) {
          if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
          else { ctx.lineTo(pt.x, pt.y); }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    });

    for (let lng = -180; lng < 180; lng += 30) {
      ctx.beginPath();
      let started = false;
      for (let lat = -80; lat <= 80; lat += 6) {
        const pt = project(lat, lng, R);
        if (pt.visible) {
          if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
          else { ctx.lineTo(pt.x, pt.y); }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }
    ctx.restore();

    // 4. Glowing 3D Curved Arcs
    ctx.save();
    const arcAlpha = Math.min(1.0, 0.5 + (arcGlow / 100) * 0.45);
    ctx.strokeStyle = `rgba(52, 211, 153, ${arcAlpha})`;
    ctx.lineWidth = arcWidth;
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = (arcGlow / 100) * 14;

    ARCS.forEach(([i, j]) => {
      const c1 = CITIES[i];
      const c2 = CITIES[j];
      const p1 = project(c1.lat, c1.lng, R);
      const p2 = project(c2.lat, c2.lng, R);

      if (p1.visible || p2.visible) {
        ctx.beginPath();
        const steps = 28;
        let started = false;
        for (let k = 0; k <= steps; k++) {
          const frac = k / steps;
          const lat = c1.lat + (c2.lat - c1.lat) * frac;
          const lng = c1.lng + (c2.lng - c1.lng) * frac;
          const elevation = R * (1 + 0.16 * Math.sin(frac * Math.PI));
          const pt = project(lat, lng, elevation);
          if (pt.visible) {
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
            else { ctx.lineTo(pt.x, pt.y); }
          }
        }
        ctx.stroke();

        // Traveling Light Pulse Packets along Great-Circle Arc (Comet Head + Tails)
        const pulseFrac = ((currentTime * 0.45 + (i * 0.15)) % 1.0);
        for (let s = 0; s < 3; s++) {
          const tOffset = pulseFrac - s * 0.024;
          if (tOffset >= 0 && tOffset <= 1) {
            const pLat = c1.lat + (c2.lat - c1.lat) * tOffset;
            const pLng = c1.lng + (c2.lng - c1.lng) * tOffset;
            const pElev = R * (1 + 0.16 * Math.sin(tOffset * Math.PI));
            const pPt = project(pLat, pLng, pElev);
            if (pPt.visible) {
              ctx.beginPath();
              const dotR = s === 0 ? 2.8 : s === 1 ? 2.0 : 1.4;
              ctx.arc(pPt.x, pPt.y, dotR, 0, Math.PI * 2);
              ctx.fillStyle = s === 0 ? '#FFFFFF' : s === 1 ? '#A7F3D0' : 'rgba(52, 211, 153, 0.65)';
              ctx.shadowBlur = s === 0 ? 12 : 6;
              ctx.shadowColor = '#34D399';
              ctx.fill();
            }
          }
        }
      }
    });
    ctx.restore();

    // 5. City Node Dots & Labels
    CITIES.forEach((c, idx) => {
      const pt = project(c.lat, c.lng, R);
      if (pt.visible) {
        // Glowing dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#34D399';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 8;
        ctx.fill();

        // Subtle dynamic ping ring
        const pingT = (currentTime * 0.6 + idx * 0.2) % 1.0;
        if (pingT < 0.75) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5 + pingT * 10, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(52, 211, 153, ${0.4 * (1 - pingT / 0.75)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Subtle label
        if (showLabels && pt.z > 30) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(244, 244, 245, 0.75)';
          ctx.font = '10px -apple-system, sans-serif';
          ctx.fillText(c.name, pt.x + 6, pt.y + 3);
        }
      }
    });
  }

  // --- MASTER TIMELINE FUNCTION (00:00 to 01:22) ---
  function updateTimeline(t) {
    if (timecodeEl) timecodeEl.textContent = `${formatTime(t)} / 01:22`;
    if (scrubber) scrubber.value = t;

    // ==========================================================
    // SCENE 1: INITIAL PROMPT (00:00 – 00:12)
    // ==========================================================
    if (t < 12.0) {
      setActiveScene('s1', 'Scene 1: Initial Prompt');

      if (t < 1.5) {
        if (t >= 1.35) {
          s1Pill.style.transform = 'scale(0.96)';
        } else {
          s1Pill.style.transform = 'scale(1)';
        }
        s1Pill.classList.remove('hidden');
        s1Expanded.classList.add('hidden');
        s1MorphPill.classList.add('hidden');
        scenes.s1.classList.remove('dark-bg');
        s1BgGlobe.classList.remove('revealed');
      } else if (t < 6.8) {
        // Card is expanded, typewriter typing
        s1Pill.classList.add('hidden');
        s1Expanded.classList.remove('hidden');
        s1MorphPill.classList.add('hidden');

        // Typewriter calculation
        const typingP = Math.min(1, Math.max(0, (t - 1.8) / 4.6));
        const charCount = Math.floor(typingP * FULL_PROMPT.length);
        s1TypedText.textContent = FULL_PROMPT.slice(0, charCount);

        // Dark background and attachments
        if (t >= 3.8) {
          scenes.s1.classList.add('dark-bg');
          s1BgGlobe.classList.add('revealed');
        } else {
          scenes.s1.classList.remove('dark-bg');
          s1BgGlobe.classList.remove('revealed');
        }

        if (t >= 5.0) {
          s1Attachments.classList.remove('hidden');
        } else {
          s1Attachments.classList.add('hidden');
        }

        if (t >= 5.8) {
          s1SendBtn.style.transform = (t >= 6.4 && t < 6.6) ? 'scale(0.92)' : 'scale(1)';
        } else {
          s1SendBtn.style.transform = 'scale(1)';
        }
      } else {
        // Morphing into centered pill: [Designing...] -> [Editing...]
        s1Pill.classList.add('hidden');
        s1Expanded.classList.add('hidden');
        s1MorphPill.classList.remove('hidden');
        scenes.s1.classList.add('dark-bg');
        s1BgGlobe.classList.add('revealed');

        if (t >= 9.5) {
          s1StatusLabel.textContent = "Editing...";
        } else {
          s1StatusLabel.textContent = "Designing...";
        }
      }

      // Draw background globe for Scene 1
      if (t >= 3.5) {
        const rotY = (t - 3.5) * 0.12;
        drawGlobe(s1BgCtx, 1920, 1080, rotY, 0.22, 540, 960, 540, {
          arcWidth: 2.5,
          arcGlow: 85,
          showLabels: t > 9.5
        });
      }
    }

    // ==========================================================
    // SCENE 2: 3D GLOBE WORKSPACE (00:12 – 00:27)
    // ==========================================================
    else if (t < 27.0) {
      setActiveScene('s2', 'Scene 2: 3D Globe & Tweaks');

      // Globe continuous rotation & zoom parameters
      let globeRadius = 380;
      let rotSpeed = 0.16;
      let tilt = 0.22;
      let rotY = (t - 12.0) * rotSpeed;

      // Tweaks button interaction at 14.5s
      if (t >= 14.5 && t < 17.5) {
        s2TweaksPopover.classList.remove('hidden');
        s2TweaksDrawer.classList.add('hidden');

        // Type popover query
        const queryP = Math.min(1, (t - 14.8) / 2.0);
        const chars = Math.floor(queryP * POPOVER_QUERY.length);
        s2PopoverText.textContent = POPOVER_QUERY.slice(0, chars);
      } else if (t >= 17.5) {
        s2TweaksPopover.classList.add('hidden');
        s2TweaksDrawer.classList.remove('hidden');

        // Automate drawer sliders with smooth camera damping
        if (t >= 19.0 && t < 23.0) {
          const p = (t - 19.0) / 4.0;
          const easeP = easeInOutCubic(p);
          globeRadius = 380 + easeP * 60; // zoom into 440 with smooth damping
          tilt = 0.22 + easeP * 0.15;     // tilt to South America
          document.getElementById('tweak-val-size').textContent = Math.floor(globeRadius);
          document.getElementById('slider-tweak-size').value = globeRadius;
          document.getElementById('tweak-val-tilt').textContent = `${Math.floor(tilt * 57)}°`;
          document.getElementById('slider-tweak-tilt').value = Math.floor(tilt * 57);
        } else if (t >= 23.0) {
          globeRadius = 440;
          tilt = 0.37;
          document.getElementById('tweak-val-rot').textContent = '11°/s';
          document.getElementById('slider-tweak-rot').value = 11;
        }
      } else {
        s2TweaksPopover.classList.add('hidden');
        s2TweaksDrawer.classList.add('hidden');
      }

      const gWidth = globeCanvas.clientWidth || 1310;
      const gHeight = globeCanvas.clientHeight || 928;
      if (globeCanvas.width !== gWidth || globeCanvas.height !== gHeight) {
        globeCanvas.width = gWidth;
        globeCanvas.height = gHeight;
      }
      const cx = gWidth * 0.58;
      const cy = gHeight * 0.50;
      drawGlobe(globeCtx, gWidth, gHeight, rotY, tilt, globeRadius, cx, cy, {
        arcWidth: 2.2,
        arcGlow: 88,
        showLabels: true
      });
    }

    // ==========================================================
    // SCENE 3: MEDITATION APP & COMMENT (00:27 – 00:44)
    // ==========================================================
    else if (t < 44.0) {
      setActiveScene('s3', 'Scene 3: Meditation App & Pin Comment');

      // 00:27 - 00:30: Multi-project grid zoom
      if (t < 30.0) {
        s3Grid.classList.remove('hidden');
        s3MedWindow.style.opacity = '0';
      } else {
        s3Grid.classList.add('hidden');
        s3MedWindow.style.opacity = '1';

        // 34.0s: Moss theme clicked
        if (t >= 34.0) {
          s3PhoneDevice.classList.add('moss-active');
          s3ViewJourney.classList.add('hidden');
          s3ViewPlayer.classList.remove('hidden');
          s3SwatchMoss.classList.add('active');

          // Enso breathing ring stroke animation & radial gradient sync
          if (s3EnsoCircle) {
            const breathCycle = (t % 4.0) / 4.0;
            const breathWave = 0.5 - 0.5 * Math.cos(breathCycle * Math.PI * 2);
            const dashOffset = 140 - breathWave * 45;
            s3EnsoCircle.setAttribute('stroke-dashoffset', dashOffset.toFixed(1));
          }
          const ensoTimeEl = document.getElementById('s3-enso-time');
          if (ensoTimeEl) {
            const remSec = Math.max(0, Math.floor(1036 - (t - 34.0) * 1.5));
            const m = Math.floor(remSec / 60);
            const s = remSec % 60;
            ensoTimeEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          }
        } else {
          s3PhoneDevice.classList.remove('moss-active');
          s3ViewJourney.classList.remove('hidden');
          s3ViewPlayer.classList.add('hidden');
          s3SwatchMoss.classList.remove('active');
        }

        // 37.5s: Comment Pin drops on phone
        if (t >= 37.5 && t < 41.0) {
          s3PinBox.classList.remove('hidden');
        } else {
          s3PinBox.classList.add('hidden');
        }

        // 41.0s: Dynamic Dark Mode Toggle inserted
        if (t >= 41.0) {
          s3DarkToggleRow.classList.remove('hidden');
        } else {
          s3DarkToggleRow.classList.add('hidden');
        }

        // 42.5s: Dark mode switch flipped ON
        if (t >= 42.5) {
          s3IosSwitch.classList.add('on');
          s3PhoneDevice.classList.add('dark-active');
        } else {
          s3IosSwitch.classList.remove('on');
          s3PhoneDevice.classList.remove('dark-active');
        }
      }
    }

    // ==========================================================
    // SCENE 4: INLINE EDITING & MORPHING CHARTS (00:44 – 01:03)
    // ==========================================================
    else if (t < 63.0) {
      setActiveScene('s4', 'Scene 4: Inline Editing & Morphing');

      // Sub-project 1: Hemlark Retreat '26 (44.0s to 54.0s)
      if (t < 54.0) {
        s4RetreatWindow.classList.remove('hidden');
        s4DeckWindow.classList.add('hidden');

        // 47.0s: Swap photo comment
        if (t >= 47.0 && t < 49.5) {
          s4SwapComment.classList.remove('hidden');
        } else {
          s4SwapComment.classList.add('hidden');
        }

        // 49.5s: Photo swaps to Coastline
        if (t >= 49.5) {
          s4CoverPhoto.classList.add('coastline');
          s4PhotoTag.textContent = 'Pacific Coastline Bluff';
        } else {
          s4CoverPhoto.classList.remove('coastline');
          s4PhotoTag.textContent = 'Big Sur Redwood Path';
        }

        // 51.5s: Knobs headline font resize with tactile dial feedback
        if (t >= 51.5) {
          s4KnobsBtn.classList.add('highlight');
          if (s4KnobTickPopover) s4KnobTickPopover.classList.remove('hidden');
          const p = Math.min(1, (t - 51.5) / 2.0);
          const easeP = easeInOutCubic(p);
          const fontSize = Math.floor(34 - easeP * 10); // 34px -> 24px
          s4RetreatTitle.style.fontSize = `${fontSize}px`;
          if (s4KnobPointer) s4KnobPointer.style.transform = `rotate(${-easeP * 60}deg)`;
          if (s4KnobReadout) s4KnobReadout.textContent = `${fontSize}px`;
        } else {
          s4KnobsBtn.classList.remove('highlight');
          if (s4KnobTickPopover) s4KnobTickPopover.classList.add('hidden');
          s4RetreatTitle.style.fontSize = '32px';
        }
      }
      // Sub-project 2: Feature Deck Spline Morph (54.0s to 63.0s)
      else {
        s4RetreatWindow.classList.add('hidden');
        s4DeckWindow.classList.remove('hidden');
        if (s4KnobTickPopover) s4KnobTickPopover.classList.add('hidden');

        // 56.5s: Comment "Make this a line graph instead?"
        if (t >= 56.5 && t < 58.5) {
          s4ChartCommentBox.classList.remove('hidden');
        } else {
          s4ChartCommentBox.classList.add('hidden');
        }

        // 58.5s: Smooth Bar-to-Line Spline Morphing with glowing gradient fill
        if (t >= 58.5) {
          const morphP = Math.min(1, (t - 58.5) / 2.3);
          const easeP = easeInOutCubic(morphP);
          s4MorphLinePath.style.opacity = easeP;
          if (s4MorphAreaPath) {
            s4MorphAreaPath.style.opacity = easeP * 0.9;
          }

          CHART_DATA.forEach((d, idx) => {
            const bar = document.getElementById(`deck-bar-${idx}`);
            if (bar) {
              const fullH = (d.val / 320) * 160;
              const curH = fullH * (1 - easeP) + 6 * easeP;
              const curW = 28 * (1 - easeP) + 6 * easeP;
              const curX = (50 + idx * 48) + (28 - curW) / 2;
              bar.setAttribute('height', curH);
              bar.setAttribute('width', curW);
              bar.setAttribute('x', curX);
              bar.setAttribute('fill', easeP > 0.5 ? '#2563EB' : '#5B6D82');
            }
          });
        } else {
          s4MorphLinePath.style.opacity = 0;
          if (s4MorphAreaPath) s4MorphAreaPath.style.opacity = 0;
          initDeckChart();
        }
      }
    }

    // ==========================================================
    // SCENE 5: EXPORT, CLI HANDOFF & OUTRO (01:03 – 01:22)
    // ==========================================================
    else {
      setActiveScene('s5', 'Scene 5: Export & CLI Handoff');
      if (s4KnobTickPopover) s4KnobTickPopover.classList.add('hidden');

      // Draw background globe for Scene 5
      if (s5GlobeCtx) {
        const s5Width = s5GlobeCanvas.clientWidth || 1690;
        const s5Height = s5GlobeCanvas.clientHeight || 928;
        if (s5GlobeCanvas.width !== s5Width || s5GlobeCanvas.height !== s5Height) {
          s5GlobeCanvas.width = s5Width;
          s5GlobeCanvas.height = s5Height;
        }
        const s5Cx = s5Width * 0.50;
        const s5Cy = s5Height * 0.50;
        drawGlobe(s5GlobeCtx, s5Width, s5Height, (t - 63.0) * 0.15, 0.22, 380, s5Cx, s5Cy, {
          arcWidth: 2.2,
          arcGlow: 85,
          showLabels: true
        });
      }

      // 01:03 - 01:07: Export dropdown opens
      if (t >= 64.0 && t < 73.0) {
        s5ExportMenu.classList.add('active');
      } else {
        s5ExportMenu.classList.remove('active');
      }

      // 01:07 - 01:13: CLI Modal appears with active copy ripple wave
      if (t >= 67.0 && t < 73.0) {
        s5CliModal.classList.remove('hidden');

        if (t >= 70.0) {
          const copyLabel = s5BtnCopy.querySelector('.copy-btn-label');
          if (copyLabel) copyLabel.textContent = 'Copied!';
          else s5BtnCopy.textContent = 'Copied!';
          s5BtnCopy.classList.add('copied');
          if (s5CopyRipple) s5CopyRipple.classList.add('active');
        } else {
          const copyLabel = s5BtnCopy.querySelector('.copy-btn-label');
          if (copyLabel) copyLabel.textContent = 'Copy command';
          else s5BtnCopy.textContent = 'Copy command';
          s5BtnCopy.classList.remove('copied');
          if (s5CopyRipple) s5CopyRipple.classList.remove('active');
        }
      } else {
        s5CliModal.classList.add('hidden');
        if (s5CopyRipple) s5CopyRipple.classList.remove('active');
      }

      // 01:13 - 01:16: 16-Project Grand Zoomout Montage
      if (t >= 73.0 && t < 76.5) {
        s5MontageGrid.classList.remove('hidden');
      } else {
        s5MontageGrid.classList.add('hidden');
      }

      // 01:16 - 01:22: Finale Outro Screen
      const s5Window = document.getElementById('s5-export-window');
      const finaleLockup = document.querySelector('.finale-lockup');
      if (t >= 76.5) {
        if (s5Window) s5Window.classList.add('hidden');
        if (s5MontageGrid) s5MontageGrid.classList.add('hidden');
        s5FinaleOutro.classList.remove('hidden');

        // Damped harmonic spring outro bounce: scales from 0 to 1 with overshoot & settling
        const outroScale = dampedSpring(t, 76.5, 0.65, 7.5);
        if (finaleLockup) {
          finaleLockup.style.transform = `scale(${Math.max(0, outroScale).toFixed(4)})`;
          finaleLockup.style.opacity = `${Math.min(1, (t - 76.5) / 0.35).toFixed(3)}`;
        }
      } else {
        if (s5Window) s5Window.classList.remove('hidden');
        s5FinaleOutro.classList.add('hidden');
        if (finaleLockup) {
          finaleLockup.style.transform = 'scale(0)';
          finaleLockup.style.opacity = '0';
        }
      }
    }

    // ==========================================================
    // GLOBAL KINEMATIC CURSOR & CLICK SOLVER
    // ==========================================================
    const cursorState = solveCursor(t);
    if (cursorState.opacity <= 0 || t >= 76.5) {
      virtualCursor.style.opacity = '0';
      virtualCursor.style.display = 'none';
    } else {
      virtualCursor.style.display = 'block';
      virtualCursor.style.opacity = `${cursorState.opacity}`;
      virtualCursor.style.transform = `translate3d(${cursorState.pos.x.toFixed(1)}px, ${cursorState.pos.y.toFixed(1)}px, 0)`;
      if (cursorState.isPressed) {
        virtualCursor.classList.add('pressed');
      } else {
        virtualCursor.classList.remove('pressed');
      }
      const arrowEl = virtualCursor.querySelector('.cursor-arrow');
      const crosshairEl = virtualCursor.querySelector('.cursor-crosshair');
      if (cursorState.isCrosshair) {
        if (arrowEl) arrowEl.classList.add('hidden');
        if (crosshairEl) crosshairEl.classList.remove('hidden');
      } else {
        if (arrowEl) arrowEl.classList.remove('hidden');
        if (crosshairEl) crosshairEl.classList.add('hidden');
      }
    }
  }

  const PH_PLAY_ICON = '<svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/></svg>';
  const PH_PAUSE_ICON = '<svg class="ph-icon" viewBox="0 0 256 256"><path fill="currentColor" d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"/></svg>';

  // --- ANIMATION REQUEST ANIMATION FRAME LOOP ---
  function animate(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying) {
      currentTime += delta * playbackSpeed;
      if (currentTime >= TOTAL_DURATION) {
        currentTime = 0; // seamless loop
      }
      updateTimeline(currentTime);
    }

    requestAnimationFrame(animate);
  }

  // --- EVENT LISTENERS ---
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (playIcon) playIcon.innerHTML = isPlaying ? PH_PAUSE_ICON : PH_PLAY_ICON;
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      isPlaying = !isPlaying;
      if (playIcon) playIcon.innerHTML = isPlaying ? PH_PAUSE_ICON : PH_PLAY_ICON;
    }
  });

  if (scrubber) {
    scrubber.addEventListener('input', (e) => {
      currentTime = parseFloat(e.target.value);
      updateTimeline(currentTime);
    });
  }

  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playbackSpeed = parseFloat(btn.dataset.speed);
    });
  });

  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTime = parseFloat(btn.dataset.seek);
      updateTimeline(currentTime);
    });
  });

  // --- DETERMINISTIC VIRTUAL CLOCK INTERFACE ---
  window.__seekToTime = function(sec) {
    currentTime = Math.max(0, Math.min(TOTAL_DURATION, parseFloat(sec) || 0));
    updateTimeline(currentTime);
  };

  // Initial update
  updateTimeline(currentTime);

  // Start RAF loop
  requestAnimationFrame(animate);

})();
