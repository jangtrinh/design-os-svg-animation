/* CK-001 A→Z tutorial: beat grid, chapters, on-screen elements and bilingual captions.
 * Grid measured with numpy from "Dawn" (Alegend): 119.99 BPM, first downbeat 1.559 s, bar = 2.000 s.
 * Every excerpt comes verbatim from data/evidence.js (extract-evidence.py), never typed by hand. */
(function (root) {
  const D = root.DOS, E = root.EVIDENCE;
  const BAR = 2.0, DB0 = 1.559, B = BAR / 4;
  // Story bars (as authored below) warp onto music bars so each chapter fits its voiceover clip:
  // the title gains one bar from layout, the outro one bar from lessons. Knots are integer bars, so
  // every chapter boundary still lands on a downbeat. Pairs: [story bar, music bar].
  const WARP = [[-0.78, -0.78], [4, 5], [22, 23], [23, 24], [28, 28], [75, 75], [84, 83], [87.76, 87.76]];
  const warp = (n) => {
    let i = WARP.findIndex(([s]) => s >= n);
    i = i < 0 ? WARP.length - 1 : Math.max(1, i);
    const [s0, m0] = WARP[i - 1], [s1, m1] = WARP[i];
    return m0 + (n - s0) * (m1 - m0) / (s1 - s0);
  };
  const bar = (n) => DB0 + warp(n) * BAR;      // absolute time of a (story) bar's downbeat
  const T = 177.08;
  const ex = (k, pick, more) => ({ path: E[k].path, from: E[k].from, lines: pick ? pick.map((i) => E[k].lines[i]) : E[k].lines, more: !!more });
  const ok = (k) => E[k].lines[E[k].lines.length - 1];
  const R = { L: [72, 132, 1010, 640], R: [1120, 132, 728, 640], F: [72, 132, 1776, 640], LW: [72, 132, 1180, 640], RN: [1290, 132, 558, 640] };

  // chapters: [id, start bar, end bar, number, VI title, EN title, card image]
  const CH = [
    ['title', -0.78, 4, 0, '', '', null],
    ['input', 4, 14, 1, 'Input', 'Tài liệu đầu vào · References', 'ref/original-work-louder.png'],
    ['contract', 14, 22, 2, 'Contract', 'Hợp đồng trước · Contract first', null],
    ['layout', 22, 28, 3, 'Layout', 'Bố cục XY · Layout pass', 'assets/layout/clay/o000.jpg'],
    ['geometry', 28, 36, 4, 'Geometry', 'Hình khối · Geometry passes', 'assets/geometry/clay/o000.jpg'],
    ['gate', 36, 44, 5, 'Form gate', 'Cổng hình dạng · Form gate', null],
    ['fit', 44, 54, 6, 'Fit', 'Lắp ghép · Interfaces and fit', 'assets/stills/receiver.jpg'],
    ['present', 54, 64, 7, 'Presentation', 'Trình bày · Materials, light, motion', 'assets/stills/hero.jpg'],
    ['export', 64, 68, 8, 'Export', 'Xuất và mở lại · Export, reopen', 'assets/stills/exploded.jpg'],
    ['deliver', 68, 75, 9, 'Delivery', 'Giao hàng trung thực · Honest delivery', null],
    ['lessons', 75, 84, 10, 'Lessons', 'Bài học · What went wrong', null],
    ['outro', 84, 87.76, 0, '', '', null],
  ].map(([id, a, z, num, title, sub, img]) => ({ id, t0: bar(a), t1: bar(z), num, title, sub, img }));

  const rerun = 'chạy lại hôm nay: cùng kết quả · re-run today: same result';
  const EL = [];   // element: {type, t0, t1, rect | keys, ...}
  const CAP = [];  // caption: {t0, t1, vi, en}
  const el = (o) => EL.push(o);
  const cap = (a, z, vi, en) => CAP.push({ t0: bar(a), t1: bar(z), vi, en });

  // 0 · title
  el({ type: 'hero', t0: bar(-0.5), t1: bar(4), rect: [0, 0, 1920, 1080], kicker: 'DESIGN:OS 3D Blender', title: 'Cách chúng tôi build CK-001', sub: 'How we built the CK-001 keyboard, A → Z',
       img: 'assets/presentation/hifi/o000.jpg', note: 'AI agent điều khiển Blender 5.2 bằng Python · an AI agent drives Blender 5.2 through Python' });

  // 1 · input: one photo, then generated secondary sheets, then the roles and the conflict
  el({ type: 'img', t0: bar(5), t1: bar(14), keys: [[bar(5), ...R.F], [bar(6.6), 72, 132, 860, 640]], src: 'ref/original-work-louder.png', tag: 'ảnh gốc · visual authority' });
  ['360-product-view', 'parts-catalog-rev01', 'blueprint-rev01'].forEach((n, i) => el({ type: 'img', t0: bar(7) + i * 2 * B, t1: bar(10.5), src: `ref/${n}.png`,
    keys: [[bar(7) + i * 2 * B, 980 + i * 174, 160 + i * 190, 520, 360]], tag: ['gen · 360°', 'gen · parts catalog', 'gen · blueprint'][i], ghost: true, tilt: [-2, 1.5, -1][i],
    p: [[bar(7) + i * 2 * B, 48 + i * 170, 920 + i * 120, 644, 420]] }));
  el({ type: 'file', t0: bar(10.5), t1: bar(14), rect: [980, 132, 868, 300], ...ex('ref_roles', null, true) });
  el({ type: 'file', t0: bar(11.5), t1: bar(14), rect: [980, 462, 868, 310], ...ex('ref_conflict', [2, 3, 4]), hl: [0, 1], lead: true });
  cap(5, 7, 'Mọi thứ bắt đầu từ 1 ảnh chụp.', 'It all starts from one photo.');
  cap(7, 10.5, 'Từ 1 ảnh, gen thêm 360°, catalog, blueprint làm tham khảo.', 'From one photo, we generated 360° views, a parts catalog and a blueprint as references.');
  cap(10.5, 12, 'Ảnh quyết định hình dáng. Bản vẽ quyết định kích thước.', 'The photo rules the look; the blueprint rules the dimensions.');
  cap(12, 14, 'Bản vẽ gen tự mâu thuẫn 32 / 41 mm: ghi lại, không giấu.', 'The generated blueprint contradicts itself (32 / 41 mm): recorded, not hidden.');

  // 2 · contract
  el({ type: 'file', t0: bar(15), t1: bar(22), rect: R.L, ...ex('layout_json'), hl: [0, 1, 3] });
  el({ type: 'file', t0: bar(17), t1: bar(22), rect: R.R, ...ex('spec_base'), hl: [7, 8] });
  el({ type: 'file', t0: bar(19.5), t1: bar(22), rect: [72, 600, 1010, 172], ...ex('purpose') });
  cap(15, 17, 'Hợp đồng trước: 284 × 92 × 32 mm, 58 phím, mục đích: cả hai.', 'Contract first: 284 × 92 × 32 mm, 58 keys, purpose: both.');
  cap(17, 19.5, 'Mỗi chi tiết có kích thước, dung sai, độ dày tường tối thiểu.', 'Every part gets dimensions, a tolerance and a minimum wall.');
  cap(19.5, 22, 'Thiếu số liệu thì dừng lại hỏi, không đoán.', 'Missing numbers mean ask, never guess.');

  // 3 · layout pass
  el({ type: 'term', t0: bar(23), t1: bar(28), rect: R.LW, lines: [
    { at: bar(23.1), cmd: 'python3 scripts/native-pipeline.py run \\' },
    { at: bar(23.3), cmd: '  builds/reference-keyboard/layout-pipeline.json \\' },
    { at: bar(23.5), cmd: '  --run-dir builds/reference-keyboard/runs/layout-r01' },
    { at: bar(24.5), dim: E.pass01_doc.lines[0] },
    { at: bar(25.5), ok: ok('ok_layout') }] });
  el({ type: 'wipe', t0: bar(23.5), t1: bar(28), rect: R.RN, layers: [['assets/layout/wire/o000.jpg', 23.6, 24.4], ['assets/layout/hifi/o000.jpg', 25.5, 26.3]], fit: 'cover' });
  cap(23, 25.5, 'Bố cục trước: chỉ mặt phẳng XY, chưa chi tiết.', 'Layout pass: XY blockout only, no detail yet.');
  cap(25.5, 28, 'Kết quả đọc từ dòng cuối: AGENT_OK kèm con số.', 'The verdict is the last line: AGENT_OK with numbers.');

  // 4 · geometry passes: same camera, layout -> geometry
  el({ type: 'wipe', t0: bar(29), t1: bar(36), rect: R.F, layers: [['assets/layout/hifi/o000.jpg', 29, 29.2], ['assets/geometry/wire/o000.jpg', 29.8, 30.6], ['assets/geometry/clay/o000.jpg', 31, 31.8]], fit: 'cover',
       keys: [[bar(29), ...R.F], [bar(32.5), 72, 132, 1010, 640]], label: [[bar(29), 'layout · 73 mesh'], [bar(31), 'geometry · 556 mesh']] });
  el({ type: 'file', t0: bar(32.6), t1: bar(36), rect: [1120, 132, 728, 200], ...ex('pass02_emit') });
  el({ type: 'term', t0: bar(33.4), t1: bar(36), rect: [1120, 362, 728, 410], lines: [{ at: bar(33.6), ok: ok('ok_geometry') }, { at: bar(34.6), badge: rerun }] });
  cap(29, 32.5, 'Cùng một camera: từ bố cục sang hình khối thật.', 'Same camera: from layout to real geometry.');
  cap(32.5, 36, 'Mỗi pass một file, kết thúc bằng một dòng AGENT_OK.', 'One file per pass, ending in one AGENT_OK line.');

  // 5 · form gate
  el({ type: 'term', t0: bar(37), t1: bar(44), rect: R.LW, lines: [
    { at: bar(37.1), cmd: 'python3 scripts/native-pipeline.py run \\' },
    { at: bar(37.3), cmd: '  builds/reference-keyboard/geometry-pipeline-B01.json \\' },
    { at: bar(37.5), cmd: '  --run-dir builds/reference-keyboard/runs/geometry-B03' },
    { at: bar(38.2), dim: '# step "gate" → scripts/production-gate.py --scene … --spec spec-B.json' },
    { at: bar(39), ok: ok('ok_gate') }, { at: bar(40), badge: rerun }] });
  el({ type: 'json', t0: bar(38.5), t1: bar(44), rect: R.RN, path: E.gate_report_head.path, value: E.gate_report_head.value,
       extra: ['RK_BASE · wall_thickness_screen · min_mm 1.9957 · limit 1.2', '"load capacity": "not evaluated (no FEA, no coupon test)"'] });
  cap(37, 41, 'Cổng hình dạng: 8 họ chi tiết, 0 lỗi, đọc lại STL.', 'Form gate: 8 part families, 0 failures, STL re-imported.');
  cap(41, 44, 'Gate nói rõ cái nó KHÔNG kiểm: tải trọng, in thật.', 'The gate states what it does NOT check: load, real printing.');

  // 6 · interfaces and fit
  ['receiver', 'D-receiver', 'spacebar-guides'].forEach((n, i) => el({ type: 'img', t0: bar(45 + i * 2.2), t1: bar(47.4 + i * 2.2), keys: [[bar(45), ...R.L]], src: `assets/stills/${n}.jpg`,
    tag: ['keycap · cross receiver', 'knob · D receiver', 'spacebar · guides'][i], kb: true }));
  el({ type: 'file', t0: bar(45.4), t1: bar(54), rect: [1120, 132, 728, 300], ...ex('interfaces') });
  el({ type: 'file', t0: bar(48.5), t1: bar(54), rect: [1120, 452, 728, 320], ...ex('pass05_asserts', [1, 2, 3, 4, 5]), hl: [4] });
  el({ type: 'term', t0: bar(51.6), t1: bar(54), rect: [72, 132, 1010, 640], lines: [{ at: bar(51.8), ok: ok('ok_inspect') }, { at: bar(52.6), badge: rerun }] });
  cap(45, 48.5, 'Receiver, guide, trục D là hình khối thật, không phải ảnh.', 'Receivers, guides and D shafts are real geometry, not pictures.');
  cap(48.5, 51.6, 'Có test âm: lệch trục thì phải bắt được va chạm.', 'Negative controls: a misaligned shaft must collide.');
  cap(51.6, 54, '58 phím × 7 vị trí hành trình: không va chạm.', '58 keys × 7 travel positions: zero collisions.');

  // 7 · presentation (the musical peak)
  el({ type: 'wipe', t0: bar(55), t1: bar(58), rect: R.F, layers: [['assets/geometry/clay/o000.jpg', 55, 55.2], ['assets/presentation/hifi/o000.jpg', 56, 56.8]], fit: 'cover',
       label: [[bar(55), 'geometry · 556 mesh'], [bar(56), 'presentation · 781 mesh']] });
  el({ type: 'seq', t0: bar(58), t1: bar(60.2), rect: R.F, pattern: 'assets/anim/a%03d.jpg', n: 96, fps: 24, label: 'native Full HD · 96 frames · 24 fps' });
  el({ type: 'grid', t0: bar(60.2), t1: bar(64), rect: R.F, srcs: ['hero', 'top', 'exploded', 'key-detail', 'knob-detail', 'usb-mount'].map((n) => `assets/stills/${n}.jpg`), p: [48, 150, 984, 1190] });
  el({ type: 'file', t0: bar(61.6), t1: bar(64), rect: [72, 600, 1100, 172], p: [48, 1370, 984, 210], ...ex('pass04_bind', [1, 2]) });
  cap(55, 58, 'Vật liệu và ánh sáng chỉ thêm sau khi gate PASS.', 'Materials and light come only after the gate passes.');
  cap(58, 60.2, 'Hoạt ảnh Full HD 4 giây, render native trong Blender.', 'A 4 s native Full HD animation, rendered in Blender.');
  cap(60.2, 64, 'Presentation bị khóa vào hash của gate.', 'Presentation is locked to the gate\'s hashes.');

  // 8 · export and reopen
  el({ type: 'img', t0: bar(64.6), t1: bar(68), keys: [[bar(64.6), ...R.L]], src: 'assets/stills/exploded.jpg', tag: 'CK-001.glb · 781 mesh', kb: true });
  el({ type: 'term', t0: bar(64.8), t1: bar(68), rect: R.R, lines: [{ at: bar(65), dim: E.pass07_assert.lines[1].trim() }, { at: bar(65.8), ok: ok('ok_reopen') }, { at: bar(66.6), badge: rerun }] });
  cap(64.6, 68, 'Xuất GLB, mở lại: 781 mesh khớp, sai số mẫu 0,0 mm.', 'Export and re-import: 781 meshes match, 0.0 mm sampled error.');

  // 9 · delivery + honest limits
  el({ type: 'scroll', t0: bar(69), t1: bar(75), rect: R.L, src: 'assets/review-page-full.jpg', srcW: 1600, scrollKeys: [[bar(69), 0], [bar(70.4), 5480]] });
  el({ type: 'file', t0: bar(70), t1: bar(75), rect: [1120, 132, 728, 260], ...ex('status'), hl: [3] });
  el({ type: 'callout', t0: bar(72), t1: bar(75), rect: [1120, 422, 728, 350], title: 'physical_blockers', lines: ['Keycap/switch insertion, retention force, tolerance stack, wear and process shrinkage need physical coupons.', 'Knob D-flat fit and axial retention need physical shaft/knob testing.', 'PCB, encoder and USB footprints/netlist/ESD/power/firmware are not electrically qualified.'] });
  cap(69, 72, 'Gói giao: trang review, 62 file, có hash từng file.', 'The package: a review page and 62 files, each hashed.');
  cap(72, 75, 'Giao hàng trung thực: gia công vẫn BỊ CHẶN, kèm lý do.', 'Honest delivery: manufacture stays BLOCKED, with the reasons.');

  // 10 · lessons
  [['r01_missing', [0, 1]], ['first_gate_failed', [0, 1, 2]], ['never_run', [0]]].forEach(([k, pick], i) =>
    el({ type: 'file', t0: bar(76 + i * 1.6), t1: bar(84), rect: [72, 132 + i * 220, 1010, 196], ...ex(k, pick, true), tag: ['r01', 'gate #1', 'pass-B-rotation'][i] }));
  el({ type: 'term', t0: bar(80.6), t1: bar(84), rect: R.R, lines: [
    { at: bar(80.8), cmd: 'python3 scripts/check-pass-coverage.py builds/reference-keyboard' },
    ...E.rerun_pcov.lines.map((l, i) => ({ at: bar(81.4) + i * B, [l === 'FAIL' ? 'fail' : 'out']: l })),
    { at: bar(82.6), dim: '# chạy pass bị bỏ quên · run the forgotten pass' },
    { at: bar(83), ok: E.rerun_rot.lines[0] }] });
  cap(76, 80.6, 'Lỗi thật: thiếu receiver, gate đầu FAIL, một pass chưa từng chạy.', 'Real mistakes: missing receivers, a failed first gate, a pass that never ran.');
  cap(80.6, 84, 'Mọi check đã viết ra đều phải được chạy.', 'Every check you write must actually run.');

  // outro
  el({ type: 'repo', t0: bar(84.2), t1: T + 1, rect: [220, 200, 1480, 560], p: [48, 470, 984, 820] });
  cap(84.6, 87.6, 'Tự chạy lại toàn bộ trong repo.', 'Re-run the whole build yourself from the repo.');

  Object.assign(D, { BAR, DB0, B, T, bar, CH, EL, CAP });
})(window);
