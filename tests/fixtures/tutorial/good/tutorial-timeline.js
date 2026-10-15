/* Minimal valid timeline used by tests/tutorial-skill.test.mjs: three chapters, one element, two captions. */
(function (root) {
  const D = root.DOS, E = root.EVIDENCE, C = D.CONFIG;
  const BAR = 240 / C.grid.bpm, DB0 = C.grid.db0, B = BAR / 4, T = C.duration;
  const bar = (n) => DB0 + n * BAR;
  const CH = [
    ['title', 0, 2, 0, '', '', null],
    ['input', 2, 6, 1, 'Input', 'References', 'assets/a.png'],
    ['outro', 6, 10, 0, '', '', null],
  ].map(([id, a, z, num, title, sub, img]) => ({ id, t0: bar(a), t1: Math.min(bar(z), T), num, title, sub, img }));
  const EL = [], CAP = [];
  const el = (o) => EL.push(o);
  const cap = (a, z, vi, en) => CAP.push({ t0: bar(a), t1: bar(z), vi, en });
  const ex = (k, pick, more) => ({ path: E[k].path, from: E[k].from, lines: pick ? pick.map((i) => E[k].lines[i]) : E[k].lines, more: !!more });
  el({ type: 'file', t0: bar(2.5), t1: bar(6), rect: [72, 132, 1010, 640], ...ex('k'), tag: 'fixture' });
  cap(2.5, 4, 'Một.', 'One.');
  cap(4, 6, 'Hai.', 'Two.');
  Object.assign(D, { BAR, DB0, B, T, bar, CH, EL, CAP, CREDIT: C.music.credit });
})(window);
