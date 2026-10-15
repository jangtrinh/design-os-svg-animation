/* Scene core: chapter rail, chapter cards, captions and the element lifecycle. Pure function of t. */
(function (root) {
  const D = root.DOS;
  const stage = document.querySelector('#stage');
  const mk = (tag, cls, parent = stage, html = '') => { const n = document.createElement(tag); if (cls) n.className = cls; n.innerHTML = html; parent.appendChild(n); return n; };
  D.mk = mk;
  D.setSrc = (img, src) => { if (img.dataset.src !== src) { img.dataset.src = src; img.src = src; } };
  D.renderers = D.renderers || {};

  // chapter rail: ten segments, the current one fills with chapter progress
  const rail = mk('div', '', stage); rail.id = 'rail';
  const lbl = mk('span', 'lbl', rail);
  const chapters = D.CH.filter((c) => c.num > 0);
  const segs = chapters.map(() => mk('b', '', mk('i', '', rail)));

  // chapter cards: big title left, a peek of what is coming right
  const cards = chapters.map((c) => {
    const box = mk('div', 'el chap', stage, `<div class="num">${String(c.num).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}</div><h1>${c.title}</h1><h2>${c.sub}</h2>`);
    const pic = c.img ? mk('div', 'el card chap-img', stage, `<img src="${c.img}">`) : null;
    return { c, box, pic, dur: c.id === 'export' ? 0.6 * D.BAR : D.BAR };
  });

  // captions: VI bold, EN mono; each window exits before the next begins so text never overlaps
  const cap = mk('div', '', stage, '<div class="vi"></div><div class="en"></div>'); cap.id = 'cap';
  const credit = mk('div', 'mono', stage, D.CREDIT); credit.id = 'credit';

  const els = D.EL.map((spec) => {
    const node = mk('div', 'el');
    const r = D.renderers[spec.type];
    if (!r) throw new Error(`no renderer for ${spec.type}`);
    const paint = r.build(node, spec);
    return { spec, node, paint };
  });

  const rectAt = (spec, t) => {
    if (!spec.keys) return spec.rect;
    const ks = spec.keys, out = [];
    for (let j = 1; j <= 4; j++) out.push(D.track(ks.map((k) => [k[0], k[j]]), t, 8, 0.92));
    return out;
  };
  const place = (n, [x, y, w, h]) => Object.assign(n.style, { left: `${x.toFixed(2)}px`, top: `${y.toFixed(2)}px`, width: `${w.toFixed(2)}px`, height: `${h.toFixed(2)}px` });

  function seek(t) {
    t = D.clamp(t, 0, D.T);
    const ci = chapters.findIndex((c) => t >= c.t0 && t < c.t1);
    const cur = chapters[ci];
    lbl.textContent = cur ? `${String(cur.num).padStart(2, '0')} ${cur.title}` : 'CK-001 · A → Z';
    segs.forEach((s, i) => { const c = chapters[i]; s.style.width = `${(100 * D.clamp((t - c.t0) / (c.t1 - c.t0))).toFixed(3)}%`; });
    D.applyVis(rail, D.vis(t, chapters[0].t0 - 0.4, chapters[chapters.length - 1].t1 - 0.2, 0.4, 0.4), 0);

    for (const k of cards) {
      const v = D.vis(t, k.c.t0, k.c.t0 + k.dur - 0.12, 0.3, 0.28);
      place(k.box, D.PORTRAIT ? [48, 300, 984, 300] : [72, 300, 1000, 300]); D.applyVis(k.box, v, 18);
      if (k.pic) { place(k.pic, D.PORTRAIT ? [48, 700, 984, 700] : [1120, 220, 800, 520]); D.applyVis(k.pic, D.vis(t, k.c.t0 + 0.12, k.c.t0 + k.dur - 0.12, 0.34, 0.28), 26); }
    }

    let cv = 0;
    for (const c of D.CAP) {
      const v = D.vis(t, c.t0 + 0.2, c.t1 - 0.3, 0.3, 0.22);
      if (v > cv) { cv = v; cap.firstChild.textContent = c.vi; cap.lastChild.textContent = c.en; }
    }
    D.applyVis(cap, cv, 10);
    D.applyVis(credit, Math.max(D.vis(t, 0.2, D.CH[0].t1 - 0.4, 0.5, 0.4), D.vis(t, D.CH[D.CH.length - 1].t0 + 0.4, null, 0.5)), 0);

    for (const e of els) {
      const v = D.vis(t, e.spec.t0, e.spec.t1 - 0.3, 0.32, 0.26);
      // display:none, not visibility:hidden: a child with visibility:visible would still show through
      if (v <= 0.001) { e.node.style.display = 'none'; continue; }
      e.node.style.display = '';  // '' restores the stylesheet value (grid cells need display:grid)
      place(e.node, rectAt(e.spec, t));
      D.applyVis(e.node, v, 16);
      e.paint(t, v);
    }
  }

  root.seek = root.__seekToTime = seek;
  root.__framesReady = async () => {
    await document.fonts.ready;  // Vietnamese glyph subsets load lazily; a capture must wait for them
    await Promise.all([...document.images].filter((im) => im.src && im.offsetParent !== null && getComputedStyle(im).visibility === 'visible')
      .map((im) => (im.complete && im.naturalWidth ? null : im.decode().catch(() => {}))));
  };
  root.addEventListener('load', () => { if (!/render=1/.test(location.search)) { const t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % D.T); requestAnimationFrame(loop); }; loop(); } });
})(window);
