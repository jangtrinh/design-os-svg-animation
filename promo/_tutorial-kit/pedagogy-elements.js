/* Pedagogy v2 renderers: kw, predict, recap, glossary. Same contract as tutorial-elements.js: build(node, s) creates the DOM once
 * and returns paint(t, v), a pure function of t. Times come from the sentence binding (pedagogy-core.js resolve), so each card
 * appears when the sentence that cites it starts. Labels default to Vietnamese; set `label` to change them. */
(function (root) {
  const D = root.DOS;
  const R = (D.renderers = D.renderers || {});
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  const mk = (tag, cls, parent, html = '') => { const n = document.createElement(tag); if (cls) n.className = cls; n.innerHTML = html; parent.appendChild(n); return n; };
  const fill = (n) => { n.style.cssText = 'position:absolute;inset:0;'; return n; };

  // keyword caption: the one number or term the voice is saying (at most 6 words); the full sentence ships as .srt/.vtt
  R.kw = { build(node, s) {
    mk('div', 'kw', fill(mk('div', '', node)), esc(s.text));
    return () => {};
  } };

  // predict: a question card and a hairline that runs out over the silent hold; the reveal is the next sentence
  R.predict = { build(node, s) {
    const card = fill(mk('div', 'card pred', node));
    mk('span', 'tag', card, esc(s.label || 'Đoán trước'));
    mk('div', 'q', card, esc(s.question));
    const run = mk('b', '', mk('div', 'bar', card));
    return (t) => {
      const h0 = s.h0 != null ? s.h0 : s.t0, h1 = s.h1 != null ? s.h1 : s.t1;
      run.style.width = `${(100 * (1 - D.ramp(t, h0, h1))).toFixed(3)}%`;
    };
  } };

  // recap: cues stay, answers are blank; after the sentence ends and a beat of silence they appear one by one
  R.recap = { build(node, s) {
    const card = fill(mk('div', 'card recap', node));
    mk('span', 'tag', card, esc(s.label || 'Nhắc lại'));
    const ans = s.cues.map(([cue, a]) => {
      const row = mk('div', 'row', card);
      mk('div', 'cue', row, esc(cue));
      return mk('span', '', mk('div', 'ans', row), esc(a));
    });
    return (t) => {
      const base = s.base != null ? s.base : s.t0, lead = s.lead_s != null ? s.lead_s : 1.2, step = s.step_s != null ? s.step_s : 1;
      ans.forEach((a, i) => D.applyVis(a, D.vis(t, base + lead + i * step, null, 0.3), 8));
    };
  } };

  // glossary: 4-6 terms with a one-line definition, shown near the start; a term can be tied to the sentence that explains it
  R.glossary = { build(node, s) {
    const card = fill(mk('div', 'card gloss', node));
    mk('span', 'tag', card, esc(s.label || 'Từ khóa'));
    const grid = mk('div', 'terms', card);
    const entries = s.items.map(([term, def]) => {
      const e = mk('div', 'g', grid);
      mk('div', 't', e, esc(term)); mk('div', 'd', e, esc(def));
      return e;
    });
    return (t) => entries.forEach((e, i) => {
      const at = s.itemT && s.itemT[i] != null ? s.itemT[i] : s.t0 + 0.3 + i * (D.B || 0.5);
      D.applyVis(e, D.vis(t, at, null, 0.3), 10);
    });
  } };
})(window);
