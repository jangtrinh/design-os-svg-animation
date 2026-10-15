/* DC-01 A→Z tutorial: beat grid, chapters and the shared helpers the two act files use.
 * Grid measured with numpy from the looped bed (build-music-bed.py): "Technology" by The_Mountain, 135.00 BPM,
 * first downbeat 0.654 s, bar = 1.7778 s, 0 ms drift across the loop seams.
 * Every excerpt comes verbatim from data/evidence.js (extract-evidence.py), never typed by hand. */
(function (root) {
  const D = root.DOS, E = root.EVIDENCE;
  const BAR = 4 * 60 / 135, DB0 = 0.654, B = BAR / 4;
  // Story bars (as authored in the act files) warp onto music bars so each chapter fits its voiceover clip.
  // Measured clips (voiceover/clips): the title gains 2 bars and the trap 1 bar, both taken from the ladder,
  // which had 11.7 s of slack. Knots are integer bars, so every chapter boundary stays on a downbeat.
  const WARP = [[-1, -1], [9, 11], [44, 46], [74, 73], [82, 82], [200, 200]];
  const warp = (n) => {
    let i = WARP.findIndex(([s]) => s >= n);
    i = i < 0 ? WARP.length - 1 : Math.max(1, i);
    const [s0, m0] = WARP[i - 1], [s1, m1] = WARP[i];
    return m0 + (n - s0) * (m1 - m0) / (s1 - s0);
  };
  const bar = (n) => DB0 + warp(n) * BAR;      // absolute time of a (story) bar's downbeat
  const T = 334.269;                            // length of audio/music-bed.wav (21 phrases)

  // chapters: [id, start bar, end bar, number, title, sub, card image]
  const CH = [
    ['title', -0.37, 9, 0, '', '', null],
    ['input', 9, 24, 1, 'Input', 'Đầu vào · Pinned references', null],
    ['contract', 24, 36, 2, 'Contract', 'Hợp đồng trước · Contract first', null],
    ['blockout', 36, 44, 3, 'Blockout', 'Khối thô · Blockout passes', 'assets/blockout/A03-hero.jpg'],
    ['ladder', 44, 74, 4, 'Mechanical', 'M02 → M29 · Revision ladder', 'assets/ladder/M29/clay/o000.jpg'],
    ['trap', 74, 82, 5, 'AGENT_OK ≠ PASS', 'Cái bẫy · The sentinel trap', null],
    ['controls', 82, 88, 6, 'Controls', 'Nút bấm · Button and keepers', 'assets/stills/button.jpg'],
    ['electronics', 88, 107, 7, 'Electronics', 'KiCad 10 · A01 → A04', 'assets/electronics/carrier-front.jpg'],
    ['integration', 107, 126, 8, 'Integration', 'Ghép và đi dây · Fit and harness', 'assets/ladder/H13/clay/o000.jpg'],
    ['print', 126, 138, 9, 'Print kit', 'Bộ in · P01 → P03', 'assets/stills/print-layout.jpg'],
    ['present', 138, 153, 10, 'Presentation', 'Phim · D05 → D06', 'assets/stills/exploded.jpg'],
    ['deliver', 153, 164, 11, 'Delivery', 'Giao hàng trung thực · Honest delivery', null],
    ['lessons', 164, 177, 12, 'Lessons', 'Bài học · What went wrong', null],
    ['outro', 177, 187.7, 0, '', '', null],
  ].map(([id, a, z, num, title, sub, img]) => ({ id, t0: bar(a), t1: Math.min(bar(z), T), num, title, sub, img }));

  const EL = [], CAP = [];
  const el = (o) => EL.push(o);
  const cap = (a, z, vi, en) => CAP.push({ t0: bar(a), t1: bar(z), vi, en });
  const ex = (k, pick, more) => ({ path: E[k].path, from: E[k].from, lines: pick ? pick.map((i) => E[k].lines[i]) : E[k].lines, more: !!more });
  const val = (k) => ({ path: E[k].path, value: E[k].value });
  const line = (k) => E[k].lines[E[k].lines.length - 1];
  const R = { L: [72, 132, 1010, 640], R: [1120, 132, 728, 640], F: [72, 132, 1776, 640], LW: [72, 132, 1180, 640], RN: [1290, 132, 558, 640] };
  const ladder = (rev, pass = 'clay') => `assets/ladder/${rev}/${pass}/o000.jpg`;

  Object.assign(D, { BAR, DB0, B, T, bar, CH, EL, CAP, CREDIT: 'Music: "Technology" by The_Mountain · Pixabay',
    tl: { el, cap, ex, val, line, R, ladder, E } });
})(window);
