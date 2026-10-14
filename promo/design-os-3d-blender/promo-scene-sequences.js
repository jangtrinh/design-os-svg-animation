/* Image-sequence painters: blueprint -> clay -> Cycles render on a shared camera orbit, plus native clips.
 * Frame index is a pure function of t; only the visible frame's src is set, and the renderer
 * awaits decode of every visible image before each capture (window.__framesReady). */
(function (root) {
  const D = root.DOS;
  const host = document.querySelector('#imgs');
  const seqs = {};
  const setSrc = (el, src) => { if (el.dataset.src !== src) { el.dataset.src = src; el.src = src; } };
  const pad = (i) => String(i).padStart(3, '0');

  for (const s of D.STATES) {
    const [kind, m] = s.key.split(':');
    if ((kind !== 'build' && kind !== 'clip') || seqs[s.key]) continue;
    const box = document.createElement('div');
    box.className = 'seq';
    const layers = kind === 'build' ? ['wire', 'clay', 'hifi'] : ['clip'];
    const els = {};
    for (const l of layers) { const im = document.createElement('img'); im.className = `seq-${l}`; box.appendChild(im); els[l] = im; }
    const sweep = document.createElement('i'); sweep.className = 'seq-sweep'; box.appendChild(sweep);
    host.appendChild(box);
    seqs[s.key] = { kind, m, box, els, sweep, t0: s.t };
  }

  const wipe = (t, t0, [a, z]) => D.smooth(D.ramp(t, t0 + D.b(a), t0 + D.b(z)));

  D.painters.push(function sequences(t) {
    for (const [key, q] of Object.entries(seqs)) {
      const v = Math.max(0, ...D.intervals[key].map(([a, z]) => D.vis(t, a, z, 0.2, 0.22)));
      q.box.style.visibility = v > 0.001 ? 'visible' : 'hidden';
      q.box.style.opacity = v.toFixed(4);
      q.box.style.filter = v >= 0.999 ? 'none' : `blur(${((1 - v) * 7).toFixed(2)}px)`;
      if (v <= 0.001) continue;
      if (q.kind === 'clip') {
        const c = D.CLIP[q.m];
        const i = D.clamp(Math.floor((t - q.t0) * c.fps), 0, c.n - 1);
        setSrc(q.els.clip, `assets/${q.m}-clip/c${pad(i + 1)}.jpg`);
        q.els.clip.style.visibility = 'visible';
        continue;
      }
      const n = D.BUILD.n[q.m];
      const i = D.clamp(Math.floor((t - q.t0) * D.BUILD.fps), 0, n - 1);
      let edge = -1;
      for (const layer of ['wire', 'clay', 'hifi']) {
        const k = wipe(t, q.t0, D.BUILD.wipes[layer]);
        const el = q.els[layer];
        const show = k > 0.0005 && (layer !== 'hifi' || i >= D.BUILD.hifiFrom);
        el.style.visibility = show ? 'visible' : 'hidden';
        // a layer is hidden once the next one fully covers it, so no hidden frame needs decoding
        const next = layer === 'wire' ? 'clay' : layer === 'clay' ? 'hifi' : null;
        if (next && wipe(t, q.t0, D.BUILD.wipes[next]) >= 0.9995) el.style.visibility = 'hidden';
        if (el.style.visibility === 'visible') setSrc(el, `assets/orbit-web/${q.m}/${layer}/o${pad(i)}.jpg`);
        el.style.clipPath = `inset(0 ${((1 - k) * 100).toFixed(3)}% 0 0)`;
        if (k > 0.0005 && k < 0.9995) edge = k;
      }
      q.sweep.style.visibility = edge >= 0 ? 'visible' : 'hidden';
      if (edge >= 0) q.sweep.style.left = `${(edge * 100).toFixed(3)}%`;
    }
  });

  root.__framesReady = () => Promise.all([...document.images]
    .filter((im) => im.src && getComputedStyle(im).visibility === 'visible')
    .map((im) => (im.complete && im.naturalWidth ? Promise.resolve() : im.decode().catch(() => {}))));
})(window);
