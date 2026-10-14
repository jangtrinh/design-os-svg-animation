/* Beat grid, state list, shape geometry and cursor choreography.
 * Grid measured with numpy from "Edge of Motion" (Aetheric): 151.0 BPM, window = bars 32-50
 * (52.413 s .. 82.612 s of the track), 76 beats = 30.20 s. t = 0 is a downbeat. */
(function (root) {
  const D = root.DOS;
  const B = 60 / 151;
  const T = 76 * B;
  const b = (n) => n * B;

  const IMG = {
    'ck-hero': [1920, 1080], 'ck-exploded': [1920, 1080], 'dc-assembled': [1600, 700],
    'dc-exploded': [1600, 700], 'arm-overview': [1400, 1050], 'arm-motion': [960, 720],
    'ww-overview': [1400, 933], 'ww-dial': [1400, 933], 'orc-turbine': [1400, 991],
    'orc-wellhead': [1400, 1400], 'orc-separator': [1400, 1400], 'orc-exchanger': [1400, 984],
    plates: [1440, 1000], scrub: [1600, 900], 'orc-3stage': [1000, 750],
    'build:ck': [1920, 1080], 'build:dc': [1920, 1080], 'build:arm': [1920, 1080], 'build:ww': [1920, 1080],
    'clip:dc': [1600, 900],
  };

  // [key, start beat, caption]
  const STATES = [
    ['prompt', 0, ''],
    ['purpose', 4, 'purpose first'],
    ['passes', 8, 'one pass, one postcondition'],
    ['check', 12, 'AGENT_OK'],
    ['build:ck', 14, 'CK-001 · blueprint → clay → render'],
    ['scrub', 22, 'CK-001 · assembly, scrubbed'],
    ['build:dc', 30, 'DC-01 · blueprint → clay → render'],
    ['clip:dc', 38, 'DC-01 · exploded, native animation'],
    ['build:arm', 41, 'Robot arm · blueprint → clay → render'],
    ['build:ww', 47, 'Watch winder · blueprint → clay → render'],
    ['img:orc-turbine', 53, 'ORC plant · turbine generator'],
    ['img:orc-wellhead', 54, 'ORC plant · wellhead'],
    ['img:orc-separator', 55, 'ORC plant · separator'],
    ['img:orc-exchanger', 56, 'ORC plant · exchanger train'],
    ['img:orc-3stage', 57, 'ORC plant · three-stage exchanger'],
    ['gate', 58, 'production gate'],
    ['cmdk', 62, ''],
    ['toast', 66, ''],
    ['lockup', 68, ''],
    ['repo', 71, ''],
    ['prompt', 74, ''],
  ].map(([key, beat, caption]) => ({ key, t: b(beat), beat, caption }));

  function geo(key, portrait) {
    const W = portrait ? 1080 : 1920, H = portrait ? 1920 : 1080;
    const base = {
      prompt: [880, 104, 52, 255, 0.62], purpose: [660, 104, 52, 255, 0.58],
      passes: [620, 420, 28, 255, 0.62], check: [132, 132, 66, 17, 0.2],
      gate: [720, 340, 28, 255, 0.62], cmdk: [760, 430, 24, 255, 0.64],
      toast: [640, 96, 48, 17, 0.56], lockup: [1060, 380, 32, 17, 0.7],
      repo: [1120, 430, 32, 17, 0.74],
    }[key];
    let w, h, r, lum, fill;
    if (base) {
      [w, h, r, lum, fill] = base;
      if (portrait && fill >= 0.5) fill = 0.86; // narrow canvas: UI states fill the width
      if (portrait && key === 'repo') [w, h] = [880, 600]; // stacked outro on the tall canvas
    }
    else {
      const [iw, ih] = IMG[key.replace('img:', '')];
      const a = iw / ih;
      // contain: the whole model stays in frame in both aspects
      const [bw, bh] = portrait ? [980, 1240] : [1640, 920];
      [w, h] = a > bw / bh ? [bw, bw / a] : [bh * a, bh];
      // tall canvas: upright subjects fill a taller crop of their centred render (wide keyboard stays contained)
      if (portrait && ['build:dc', 'build:arm', 'build:ww', 'clip:dc'].includes(key)) [w, h] = [980, 1100];
      [r, lum, fill] = [28, key.startsWith('build') ? 244 : 221, 0.92]; // build states sit on the blueprint paper
    }
    // the caption sits 34px under the shape: keep that line (~40px) and a 24px margin on the stage
    const zoom = Math.min((fill * W) / w, (fill * H) / h, 2.4, (H - 98 - H / 2) * 2 / h);
    return { w, h, r, lum, zoom, W, H };
  }

  function stateAt(t) {
    let i = 0;
    for (let k = 0; k < STATES.length; k++) if (t >= STATES[k].t) i = k;
    return i;
  }

  // Cursor waypoints in shape-local coordinates of the state they belong to: [beat, stateKey, lx, ly, opacity]
  const CURSOR = [
    [0, 'prompt', 500, 96, 1], [2.3, 'prompt', 388, 0, 1, '.p-send', 3.9], [4.6, 'purpose', 220, 8, 1, '.c-purpose .opt:nth-child(4)', 5.9],
    [7, 'passes', 360, 250, 1], [11.5, 'passes', 380, 290, 0], [21.4, 'scrub', -300, 'track', 0],
    [22.2, 'scrub', -300, 'track', 1], [23, 'scrub', -300, 'track', 1], [27, 'scrub', 420, 'track', 1],
    [28.4, 'scrub', 360, 420, 1], [29.4, 'scrub', 380, 460, 0], [57.6, 'gate', 420, 260, 0],
    [58.4, 'gate', 420, 260, 1], [60.6, 'gate', 282, -120, 1, '.g-badge', 61.6], [62.6, 'cmdk', 120, -40, 1],
    [63.5, 'cmdk', 60, -67, 1, '.k-item', 64.9], [66.6, 'toast', 380, 120, 1], [68.6, 'lockup', 600, 260, 0],
    [71.2, 'repo', 560, 300, 0], [71.6, 'repo', 400, 220, 1], [71.9, 'repo', 400, 136, 1, '.r-star', 72.8],
    [73.3, 'prompt', 500, 96, 1],
  ].map(([beat, key, x, y, o, sel, at]) => ({ t: b(beat), key, x, y, o, sel, at: at == null ? null : b(at) }));

  const CLICKS = [b(4), b(6), b(65), b(73)];
  const DRAG = { press: b(23), release: b(28), x0: -300, len: 600 };
  // orbit sequences rendered by blender/render-orbit-passes.py at 30 poses per second;
  // wipes in beats from the state start: blueprint draws in, clay, then the Cycles render
  const BUILD = { fps: 30, n: { ck: 96, dc: 96, arm: 72, ww: 72 }, hifiFrom: 30,
    wipes: { wire: [0, 0.6], clay: [1.6, 2.3], hifi: [3.0, 3.7] } };
  const CLIP = { dc: { n: 40, fps: 33.6 } };
  const TYPE_PROMPT = { text: 'a desk companion robot, print-ready', t0: b(0.5), t1: b(3.2) };
  const TYPE_CMDK = { text: 'export stl', t0: b(62.6), t1: b(64.2) };

  function soundEvents() {
    const ev = CLICKS.map((t) => ({ t, kind: 'click' }));
    ev.push({ t: DRAG.press, kind: 'click' }, { t: DRAG.release, kind: 'release' });
    for (const ty of [TYPE_PROMPT, TYPE_CMDK]) {
      const n = ty.text.length;
      for (let i = 0; i < n; i++) if (ty.text[i] !== ' ') ev.push({ t: ty.t0 + ((ty.t1 - ty.t0) * i) / n, kind: 'key' });
    }
    ev.push({ t: b(61), kind: 'pass' }, { t: b(66), kind: 'toast' });
    return ev.sort((a, c) => a.t - c.t);
  }

  Object.assign(D, { BUILD, CLIP, B, T, b, IMG, STATES, geo, stateAt, CURSOR, CLICKS, DRAG, TYPE_PROMPT, TYPE_CMDK, soundEvents });
})(typeof window !== 'undefined' ? window : globalThis);
