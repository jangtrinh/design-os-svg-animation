/* Scene core: one morphing shape, camera, image layers, cursor and caption, all from seek(t). */
(function (root) {
  const D = root.DOS;
  const portrait = /aspect=portrait/.test(location.search);
  if (portrait) document.body.classList.add('portrait');
  const W = portrait ? 1080 : 1920, H = portrait ? 1920 : 1080;
  const $ = (s) => document.querySelector(s);
  const shape = $('#shape'), camera = $('#camera'), caption = $('#caption'), cursor = $('#cursor'), credit = $('#credit');
  const S = D.STATES;
  const G = S.map((s) => D.geo(s.key, portrait));
  const keysOf = (p) => S.map((s, i) => [s.t, G[i][p]]);
  const K = { w: keysOf('w'), h: keysOf('h'), r: keysOf('r'), lum: keysOf('lum'), zoom: keysOf('zoom') };

  // intervals per content key: [[tin, tout], ...]
  const intervals = {};
  S.forEach((s, i) => {
    const k = s.key.startsWith('img:') ? s.key : s.key;
    (intervals[k] = intervals[k] || []).push([s.t, i + 1 < S.length ? S[i + 1].t : null]);
  });
  D.intervals = intervals;
  // an interval that starts at t = 0 is already settled, so frame 0 equals the last frame (seamless loop)
  D.uiVis = (key, t) => Math.max(0, ...(intervals[key] || []).map(([a, z]) => D.vis(t, a <= 0 ? -1 : a + 0.1, z == null ? null : z - 0.04, 0.18, 0.1)));

  // image layers (one <img> per still) + scrub frames
  const imgs = $('#imgs');
  const imgEls = {};
  for (const s of S) if (s.key.startsWith('img:') && !imgEls[s.key]) {
    const el = document.createElement('img');
    el.src = `assets/${s.key.slice(4)}.jpg`;
    imgs.appendChild(el); imgEls[s.key] = el;
  }
  const frames = [];
  for (let i = 1; i <= 48; i++) {
    const el = document.createElement('img');
    el.src = `assets/scrub/f${String(i).padStart(3, '0')}.jpg`;
    imgs.appendChild(el); frames.push(el);
  }

  const zoomOf = (key) => D.geo(key, portrait).zoom;
  let CX, CY, calibrated = false;
  const buildCursor = () => {
    CX = D.CURSOR.map((c) => [c.t, W / 2 + c.x * zoomOf(c.key)]);
    CY = D.CURSOR.map((c) => [c.t, H / 2 + localY(c) * zoomOf(c.key)]);
  };
  // 'track' = vertical centre of the scrub track (bottom padding 44 + half of the 10 px track)
  const localY = (c) => (c.y === 'track' ? D.geo('scrub', portrait).h / 2 - 49 : c.y);
  buildCursor();
  const CO = D.CURSOR.map((c) => [c.t, c.o]);
  const cursorAt = (t) => ({ x: D.track(CX, t, 11, 0.92), y: D.track(CY, t, 11, 0.92), o: D.clamp(D.track(CO, t, 14, 1 - 1e-6)) });

  /** Scrub progress: direct manipulation while held, spring back to the end stop after release. */
  const dz = zoomOf('scrub');
  const rawP = (t) => ((cursorAt(t).x - W / 2) / dz - D.DRAG.x0) / D.DRAG.len;
  const rubber = (p) => (p <= 1 ? Math.max(0, p) : 1 + (0.3 * (p - 1)) / (1 + (p - 1)));
  D.scrubP = function (t) {
    if (t < D.DRAG.press) return 0;
    if (t < D.DRAG.release) return rubber(rawP(t));
    const pr = rubber(rawP(D.DRAG.release));
    return 1 + (pr - 1) * (1 - D.spring(t - D.DRAG.release, 20, 0.72));
  };

  /** Click targets are measured from the laid-out DOM (fonts loaded), so tips land on control centres. */
  function calibrate() {
    calibrated = true;
    for (const c of D.CURSOR) if (c.sel) {
      render(c.at);
      const r = document.querySelector(c.sel).getBoundingClientRect(), z = zoomOf(c.key);
      c.x = (r.left + r.width / 2 - W / 2) / z; c.y = (r.top + r.height / 2 - H / 2) / z;
    }
    buildCursor();
  }

  function seek(t) {
    if (!calibrated && document.fonts.status === 'loaded') calibrate();
    render(t);
  }

  function render(t) {
    t = D.clamp(t, 0, D.T);
    const w = D.track(K.w, t, 19, 0.84), h = D.track(K.h, t, 19, 0.84);
    const r = D.track(K.r, t, 19, 0.9), zoom = D.track(K.zoom, t, 13, 0.9);
    const lum = D.track(K.lum, t, 24, 1 - 1e-6);
    Object.assign(shape.style, {
      width: `${w.toFixed(2)}px`, height: `${h.toFixed(2)}px`, borderRadius: `${r.toFixed(2)}px`,
      marginLeft: `${(-w / 2).toFixed(2)}px`, marginTop: `${(-h / 2).toFixed(2)}px`, background: D.gray(lum),
    });
    camera.style.transform = `scale(${zoom.toFixed(5)})`;

    const si = D.stateAt(t), st = S[si];
    // stills crossfade with blur; slow push-in inside each still
    for (const [key, el] of Object.entries(imgEls)) {
      const v = Math.max(0, ...intervals[key].map(([a, z]) => D.vis(t, a, z, 0.22, 0.24)));
      D.applyVis(el, v, 0);
      const [a] = intervals[key][0];
      el.style.transform = `scale(${(1.0 + 0.05 * D.ramp(t, a, a + 4 * D.B)).toFixed(5)})`;
    }
    const sv = Math.max(0, ...intervals.scrub.map(([a, z]) => D.vis(t, a, z, 0.22, 0.24)));
    const fi = Math.round(D.clamp(D.scrubP(t)) * 47);
    frames.forEach((el, i) => { el.style.visibility = i === fi && sv > 0.001 ? 'visible' : 'hidden'; el.style.opacity = sv.toFixed(4); });

    for (const p of D.painters) p(t, { w, h, zoom, si, st, W, H, portrait });

    // caption under the shape, screen space
    // exit finishes before the state boundary, so swapped text never overlaps
    const next = S[si + 1];
    const cv = st.caption ? D.vis(t, st.t + 0.12, next ? next.t - 0.14 : null, 0.2, 0.12) : 0;
    caption.textContent = st.caption;
    caption.style.top = `${(H / 2 + (h * zoom) / 2 + 34).toFixed(2)}px`;
    D.applyVis(caption, cv, 8);
    D.applyVis(credit, Math.max(D.uiVis('lockup', t), D.uiVis('repo', t)), 4);

    const c = cursorAt(t);
    const held = t >= D.DRAG.press && t < D.DRAG.release ? 1 : 0;
    const dip = Math.max(...D.CLICKS.map((tc) => Math.exp(-(((t - tc) / 0.07) ** 2))));
    const sc = 1 - 0.14 * Math.max(dip, held * 0.85);
    // arrow tip sits at (32.8, 52.9) of the 256 viewBox at 46 px -> (5.9, 9.5) px
    cursor.style.transform = `translate(${(c.x - 5.9).toFixed(2)}px, ${(c.y - 9.5).toFixed(2)}px) scale(${sc.toFixed(4)})`;
    cursor.style.opacity = c.o.toFixed(4);
  }

  D.painters = D.painters || [];
  D.cursorAt = cursorAt;
  root.seek = root.__seekToTime = seek;
  root.addEventListener('load', () => { if (!/render=1/.test(location.search)) { let t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % D.T); requestAnimationFrame(loop); }; loop(); } });
})(window);
