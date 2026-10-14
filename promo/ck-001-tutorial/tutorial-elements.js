/* Element renderers: build(node, spec) creates DOM once and returns paint(t, v), a pure function of t. */
(function (root) {
  const D = (root.DOS = root.DOS || {});
  const R = (D.renderers = D.renderers || {});
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  const mk = (tag, cls, parent, html = '') => { const n = document.createElement(tag); if (cls) n.className = cls; n.innerHTML = html; parent.appendChild(n); return n; };
  const setSrc = (img, src) => { if (img.dataset.src !== src) { img.dataset.src = src; img.src = src; } };
  const pop = (t, at) => D.spring(t - at, 24, 0.7);
  const bars = (n) => D.bar(n);

  R.img = { build(node, s) {
    node.className = 'el';
    const card = mk('div', 'card media', node); card.style.cssText = 'position:absolute;inset:0;';
    if (s.tilt) card.style.transform = `rotate(${s.tilt}deg)`;
    const im = mk('img', '', card); im.src = s.src;
    if (s.tag) mk('span', `tag${s.ghost ? ' ghost' : ''}`, card, esc(s.tag));
    return (t) => { im.style.transform = s.kb ? `scale(${(1 + 0.045 * D.ramp(t, s.t0, s.t1)).toFixed(5)})` : ''; };
  } };

  // stacked layers revealed left -> right with a hairline sweep (same camera, different build stage)
  R.wipe = { build(node, s) {
    const card = mk('div', 'card media', node); card.style.cssText = 'position:absolute;inset:0;';
    const ims = s.layers.map(([src]) => { const im = mk('img', '', card); im.src = src; return im; });
    const sweep = mk('i', 'sweep', card);
    const lab = s.label ? mk('span', 'lab', card) : null;
    return (t) => {
      let edge = -1;
      s.layers.forEach(([, a, z], i) => {
        const k = D.smooth(D.ramp(t, bars(a), bars(z)));
        ims[i].style.clipPath = `inset(0 ${((1 - k) * 100).toFixed(3)}% 0 0)`;
        const covered = i + 1 < s.layers.length && D.ramp(t, bars(s.layers[i + 1][1]), bars(s.layers[i + 1][2])) >= 1;
        ims[i].style.visibility = k > 0.0005 && !covered ? 'visible' : 'hidden';
        if (k > 0.0005 && k < 0.9995) edge = k;
      });
      sweep.style.visibility = edge >= 0 ? 'visible' : 'hidden';
      if (edge >= 0) sweep.style.left = `${(edge * 100).toFixed(3)}%`;
      if (lab) lab.textContent = D.step(s.label.map(([a, txt]) => [a, txt]), t);
    };
  } };

  R.seq = { build(node, s) {
    const card = mk('div', 'card media', node); card.style.cssText = 'position:absolute;inset:0;';
    const im = mk('img', '', card); const lab = mk('span', 'lab', card, esc(s.label));
    return (t) => { const i = D.clamp(Math.floor((t - s.t0) * s.fps), 0, s.n - 1); setSrc(im, s.pattern.replace('%03d', String(i + 1).padStart(3, '0'))); lab.style.opacity = 1; };
  } };

  R.grid = { build(node, s) {
    node.classList.add('grid');
    const cells = s.srcs.map((src) => { const c = mk('div', 'card', node); mk('img', '', c).src = src; return c; });
    return (t) => cells.forEach((c, i) => { const k = pop(t, s.t0 + i * D.B); c.style.opacity = D.clamp(k).toFixed(3); c.style.transform = `scale(${(0.92 + 0.08 * k).toFixed(4)})`; });
  } };

  // verbatim file excerpt: path + line numbers, lines reveal one per half beat, highlights land after
  R.file = { build(node, s) {
    const card = mk('div', 'card file', node); card.style.cssText = 'position:absolute;inset:0;';
    mk('div', 'path', card, `${esc(s.path)} <em>· L${s.from}${s.lines.length > 1 ? '–' + (s.from + s.lines.length - 1) : ''}</em>`);
    if (s.tag) mk('span', 'ftag', card, esc(s.tag));
    // prose (.md) wraps; code and JSON keep their line structure
    const prose = /\.md$/.test(s.path) && !s.lines[0].trim().startsWith('|');
    // prose is one paragraph (the file's hard wraps are not sentence breaks); code keeps its lines
    const texts = prose ? [s.lines.map((l) => l.trim()).join(' ')] : s.lines;
    const hlIdx = prose ? ((s.hl || []).length ? [0] : []) : (s.hl || []);
    const rows = texts.map((l, i) => mk('div', `ln${prose ? ' prose' : ''}`, card, (s.lead && i === 0 ? '… ' : '') + esc(l) + (s.more && i === texts.length - 1 ? ' …' : '')));
    return (t) => rows.forEach((r, i) => {
      const v = D.vis(t, s.t0 + 0.2 + i * D.B * 0.5, null, 0.2);
      r.style.opacity = v.toFixed(3);
      const hl = hlIdx.includes(i) ? D.smooth(D.ramp(t, s.t0 + D.BAR * 0.75, s.t0 + D.BAR * 0.75 + 0.3)) : 0;
      r.classList.toggle('hl', hl > 0.5); r.style.background = hl ? `rgba(17,17,17,${(0.055 * hl).toFixed(4)})` : 'transparent';
    });
  } };

  R.json = { build(node, s) {
    const lines = JSON.stringify(s.value, null, 1).split('\n').concat(s.extra || []);
    return R.file.build(node, { ...s, from: 1, lines, path: s.path, hl: [lines.length - 2, lines.length - 1] });
  } };

  // terminal: commands type in over half a beat, output appears, the AGENT_OK line lights up
  R.term = { build(node, s) {
    const card = mk('div', 'card term', node); card.style.cssText = 'position:absolute;inset:0;';
    const rows = s.lines.map((l, i) => {
      const kind = Object.keys(l).find((k) => k !== 'at');
      const r = mk('div', `ln ${kind}${kind === 'cmd' && i > 0 && s.lines[i - 1].cmd ? ' cont' : ''}`, card);
      return { r, kind, text: l[kind], at: l.at };
    });
    const caret = mk('span', 'caret', card);
    return (t) => {
      let last = null;
      for (const { r, kind, text, at } of rows) {
        const on = t >= at;
        r.style.display = on ? 'block' : 'none';
        if (!on) continue;
        if (kind === 'cmd') r.textContent = text.slice(0, Math.ceil(text.length * D.clamp((t - at) / (D.B * 1.2))));
        else if (kind === 'fail') r.innerHTML = `<span class="fail">${esc(text)}</span>`;
        else if (kind === 'badge') r.innerHTML = `<span class="badge">${esc(text)}</span>`;
        else r.textContent = text;
        if (kind === 'ok') { const g = Math.exp(-((t - at) / 0.6)); r.style.background = `rgba(255,255,255,${(0.1 + 0.18 * g).toFixed(3)})`; }
        last = r;
      }
      if (last) last.appendChild(caret);
      caret.style.opacity = (t / D.B) % 1 < 0.55 ? '1' : '0';
    };
  } };

  R.callout = { build(node, s) {
    const card = mk('div', 'card callout', node); card.style.cssText = 'position:absolute;inset:0;';
    mk('div', 't', card, esc(s.title));
    const rows = s.lines.map((l) => mk('div', 'b', card, esc(l)));
    return (t) => rows.forEach((r, i) => { r.style.opacity = D.vis(t, s.t0 + 0.3 + i * D.B, null, 0.25).toFixed(3); });
  } };

  R.scroll = { build(node, s) {
    const card = mk('div', 'card scroll', node); card.style.cssText = 'position:absolute;inset:0;';
    const im = mk('img', '', card); im.src = s.src;
    return (t) => { const y = D.track(s.scrollKeys, t, 2.6, 1 - 1e-6); const k = parseFloat(node.style.width) / s.srcW; im.style.transform = `translateY(${(-y * k).toFixed(2)}px)`; };
  } };

  R.hero = { build(node, s) {
    const P = D.PORTRAIT;  // 9:16: text block on top, render below it
    const txt = mk('div', 'hero', node); txt.style.cssText = P ? 'position:absolute;left:48px;top:230px;' : 'position:absolute;left:72px;top:250px;';
    mk('div', 'k', txt, esc(s.kicker)); mk('h1', '', txt, esc(s.title)); mk('h2', '', txt, esc(s.sub)); mk('div', 'note', txt, esc(s.note));
    const pic = mk('div', 'card', node); pic.style.cssText = P ? 'position:absolute;left:48px;top:720px;width:984px;height:820px;' : 'position:absolute;left:1000px;top:200px;width:980px;height:620px;';
    mk('img', '', pic, '').src = s.img; pic.firstChild.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    return (t) => { pic.style.transform = `translate${P ? 'Y' : 'X'}(${(60 * (1 - D.spring(t - s.t0 - 0.6, 7, 0.95))).toFixed(2)}px)`; pic.style.opacity = D.vis(t, s.t0 + 0.5, null, 0.6).toFixed(3); };
  } };

  R.repo = { build(node, s) {
    const card = mk('div', 'repo', node); card.style.cssText = 'position:absolute;inset:0;';
    card.innerHTML = `<div class="r-title">${root.GH_MARK}<span>jangtrinh / <b>design-os-3d-blender</b></span></div>
      <div class="r-url">github.com/jangtrinh/design-os-3d-blender</div>
      <div class="r-cmd"><span>$</span> git clone https://github.com/jangtrinh/design-os-3d-blender<br><span>$</span> python3 scripts/native-pipeline.py run builds/reference-keyboard/geometry-pipeline-B01.json --run-dir &lt;new dir&gt;</div>`;
    const kids = [...card.children];
    return (t) => kids.forEach((c, i) => D.applyVis(c, D.vis(t, s.t0 + 0.3 + i * D.B, null, 0.3), 10));
  } };
})(window);
