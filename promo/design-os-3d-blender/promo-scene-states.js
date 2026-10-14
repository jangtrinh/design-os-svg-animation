/* Per-state content painters. Each reads t and writes styles; text swaps keep their own enter/exit timing. */
(function (root) {
  const D = root.DOS, b = D.b;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const el = {
    prompt: $('.c-prompt'), purpose: $('.c-purpose'), passes: $('.c-passes'), check: $('.c-check'),
    scrub: $('.c-scrub-ui'), gate: $('.c-gate'), cmdk: $('.c-cmdk'), toast: $('.c-toast'), lockup: $('.c-lockup'),
  };
  const caretOn = (t) => ((t / D.B + 1e-6) % 1 < 0.55 ? 1 : 0.15);
  const typed = (ty, t) => ty.text.slice(0, Math.floor(ty.text.length * D.clamp((t - ty.t0) / (ty.t1 - ty.t0) + 1e-6)));
  const pop = (t, at, w = 26, z = 0.62) => D.spring(t - at, w, z);
  const tick = (row, on) => { const i = row.querySelector('i'); i.style.background = D.gray(255 - 238 * on); i.style.borderColor = on > 0.5 ? '#111' : ''; i.style.boxShadow = `inset 0 0 0 ${(5 * on).toFixed(2)}px #fff`; i.style.transform = `scale(${(0.6 + 0.4 * D.clamp(on, 0, 1.2)).toFixed(4)})`; };

  D.painters.push(function prompt(t) {
    D.applyVis(el.prompt, D.uiVis('prompt', t));
    const txt = t < b(8) ? typed(D.TYPE_PROMPT, t) : '';
    el.prompt.querySelector('.p-typed').textContent = txt;
    el.prompt.querySelector('.p-ph').style.display = txt ? 'none' : 'inline';
    el.prompt.querySelector('.caret').style.opacity = caretOn(t);
    const press = Math.exp(-(((t - b(4)) / 0.08) ** 2));
    el.prompt.querySelector('.p-send').style.transform = `scale(${(1 - 0.1 * press).toFixed(4)})`;
  });

  // knob edges ride different springs so the leading edge stretches ahead of the trailing one
  D.painters.push(function purpose(t, g) {
    D.applyVis(el.purpose, D.uiVis('purpose', t));
    if (t < b(3) || t > b(10)) return;
    const pad = 10, cw = (Math.min(g.w, 660) - 2 * pad) / 3;
    const target = t >= b(6) ? 2 : 0;
    const keysL = [[0, 0], [b(6), target * cw]], keysR = [[0, cw], [b(6), (target + 1) * cw]];
    const L = pad + D.track(keysL, t, 15, 0.86), R = pad + D.track(keysR, t, 30, 0.8);
    const k = el.purpose.querySelector('.knob');
    k.style.left = `${L.toFixed(2)}px`; k.style.width = `${(R - L).toFixed(2)}px`;
    $$('.c-purpose .opt').forEach((o, i) => {
      const c0 = pad + i * cw, c1 = c0 + cw;
      const overlap = D.clamp((Math.min(R, c1) - Math.max(L, c0)) / cw);
      o.style.color = D.gray(17 + 238 * overlap);
    });
  });

  D.painters.push(function passes(t) {
    D.applyVis(el.passes, D.uiVis('passes', t));
    $$('.ps-row').forEach((row, i) => {
      const at = b(8.6 + i * 0.85);
      tick(row, pop(t, at));
      row.querySelector('em').style.opacity = D.smooth(D.ramp(t, at + 0.05, at + 0.25)).toFixed(3);
    });
  });

  D.painters.push(function check(t) {
    D.applyVis(el.check, D.uiVis('check', t), 0);
    const pl = el.check.querySelector('polyline');
    const L = 290, k = D.smooth(D.ramp(t, b(12.3), b(13.1)));
    pl.style.strokeDasharray = L; pl.style.strokeDashoffset = (L * (1 - k)).toFixed(2);
  });

  D.painters.push(function scrub(t) {
    const v = Math.max(0, ...D.intervals.scrub.map(([a, z]) => D.vis(t, a + 0.2, z - 0.1, 0.2, 0.1)));
    D.applyVis(el.scrub, v, 10);
    if (v <= 0) return;
    const p = D.scrubP(t), len = D.DRAG.len;
    const stretch = p > 1 ? (p - 1) * len : 0;
    const track = el.scrub.querySelector('.sc-track');
    track.style.width = `${(len + stretch).toFixed(2)}px`;
    track.style.transform = `translateX(${(stretch / 2).toFixed(2)}px)`;
    el.scrub.querySelector('.sc-fill').style.width = `${(D.clamp(p, 0, 2) * len).toFixed(2)}px`;
    el.scrub.querySelector('.sc-knob').style.left = `${(D.clamp(p, 0, 2) * len).toFixed(2)}px`;
    el.scrub.querySelector('.sc-label').textContent = `frame ${String(1 + Math.round(D.clamp(p) * 47)).padStart(3, '0')} / 048`;
  });

  D.painters.push(function gate(t) {
    D.applyVis(el.gate, D.uiVis('gate', t));
    $$('.g-row').forEach((row, i) => tick(row, pop(t, b(58.6 + i * 0.6))));
    const badge = el.gate.querySelector('.g-badge'), k = pop(t, b(61), 24, 0.6);
    badge.style.opacity = D.clamp(k).toFixed(3);
    badge.style.transform = `scale(${(0.7 + 0.3 * k).toFixed(4)})`;
  });

  const items = $$('.k-item');
  D.painters.push(function cmdk(t) {
    D.applyVis(el.cmdk, D.uiVis('cmdk', t));
    if (t < b(61) || t > b(68)) return;
    const q = typed(D.TYPE_CMDK, t);
    el.cmdk.querySelector('.k-typed').textContent = q;
    el.cmdk.querySelector('.caret').style.opacity = caretOn(t);
    let rank = 0;
    items.forEach((it) => {
      const m = it.dataset.m.startsWith(q);
      const y = m ? rank++ * 66 : 132;
      it.style.top = `${(12 + y).toFixed(2)}px`;
      it.style.opacity = m ? '1' : '0';
      it.style.filter = m ? 'none' : 'blur(6px)';
      it.style.background = m && y === 0 ? '#f1f0ed' : 'transparent';
    });
    const enter = Math.exp(-(((t - b(65)) / 0.09) ** 2));
    const ke = el.cmdk.querySelector('.k-enter');
    ke.style.background = D.gray(255 - 30 * enter); ke.style.color = D.gray(154 - 137 * enter);
  });

  D.painters.push(function toast(t) {
    D.applyVis(el.toast, D.uiVis('toast', t));
    const k = pop(t, b(66.25), 24, 0.6);
    el.toast.querySelector('svg').style.transform = `scale(${(0.5 + 0.5 * k).toFixed(4)})`;
  });

  const repo = $('.c-repo');
  D.painters.push(function repoOutro(t) {
    D.applyVis(repo, D.uiVis('repo', t), 0);
    [...repo.children].forEach((c, i) => D.applyVis(c, D.vis(t, b(71.15 + i * 0.25), b(73.9), 0.2, 0.1), 10));
    const k = pop(t, b(73), 26, 0.6), press = Math.exp(-(((t - b(73)) / 0.08) ** 2));
    const star = repo.querySelector('.r-star');
    star.style.transform = `scale(${(1 - 0.06 * press).toFixed(4)})`;
    const f = repo.querySelector('.s-f');
    f.style.opacity = D.clamp(k).toFixed(3); f.style.transform = `scale(${(0.4 + 0.6 * k).toFixed(4)})`;
    repo.querySelector('.s-txt').textContent = t >= b(73) ? 'Starred' : 'Star on GitHub';
  });

  D.painters.push(function lockup(t) {
    el.lockup.style.visibility = D.uiVis('lockup', t) > 0 ? 'visible' : 'hidden';
    el.lockup.style.opacity = D.uiVis('lockup', t).toFixed(4);
    [...el.lockup.children].forEach((c, i) => D.applyVis(c, D.vis(t, b(68.3 + i * 0.45), b(70.85), 0.2, 0.1), 10));
  });
})(window);
