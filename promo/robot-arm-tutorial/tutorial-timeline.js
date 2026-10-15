/* ROBOT-ARM tutorial timeline (pedagogy v2): chapters on the music bar grid, every element bound to the voice sentence that
 * cites it (at: 'sent:<id>'). Excerpts come verbatim from data/evidence.js (extract-evidence.py), never typed by hand.
 * Storyboard: storyboard.md (owner gate 1, 2026-10-15). Three acts: print kit, motion without collisions, honest delivery. */
(function (root) {
  const D = root.DOS, E = root.EVIDENCE, C = D.CONFIG;
  const BAR = 240 / C.grid.bpm, DB0 = C.grid.db0, B = BAR / 4, T = C.duration;
  const bar = (n) => DB0 + n * BAR;      // chapter lengths were sized from the measured clips, so no warp is needed

  // chapters: [id = script segment id, start bar, end bar, number, title, sub]
  const CH = [
    ['title', 0, 7, 0, '', ''],
    ['glossary', 7, 26, 1, 'Sáu từ cần biết', 'Six words first'],
    ['input', 26, 36, 2, 'Đầu vào', 'The input'],
    ['contract', 36, 50, 3, 'Hợp đồng', 'The contract'],
    ['print', 50, 60, 4, 'Bộ in', 'The print kit'],
    ['recap1', 60, 73, 5, 'Nhớ lại · phần 1', 'Recap · act 1'],
    ['motion', 73, 83, 6, 'Chuyển động', 'Motion'],
    ['bug1', 83, 98, 7, 'Lỗi 1 · khớp vai', 'Bug 1 · shoulder'],
    ['bug2', 98, 111, 8, 'Lỗi 2 · chồng chi tiết', 'Bug 2 · overlap'],
    ['bug3', 111, 126, 9, 'Lỗi 3 · đường thẳng', 'Bug 3 · straight path'],
    ['checks', 126, 135, 10, 'Kiểm lại', 'Re-check'],
    ['bug4', 135, 145, 11, 'Lỗi 4 · khung hình', 'Bug 4 · framing'],
    ['recap2', 145, 158, 12, 'Nhớ lại · phần 2', 'Recap · act 2'],
    ['film', 158, 174, 13, 'Phim cuối', 'The final film'],
    ['limits', 174, 190, 14, 'Giới hạn', 'Honest limits'],
    ['recap3', 190, 205, 15, 'Ba điều đáng nhớ', 'Three lessons'],
    ['outro', 205, 211, 0, '', ''],
  ].map(([id, a, z, num, title, sub]) => ({ id, t0: bar(a), t1: Math.min(bar(z), T), num, title, sub, img: null }));

  const EL = [], CAP = [];
  const el = (o) => EL.push(o);
  const S = (id) => `sent:${id}`;
  const ex = (k, pick) => ({ path: E[k].path, from: E[k].from, lines: pick ? pick.map((i) => E[k].lines[i]) : E[k].lines, lead: !!E[k].lead, more: !!E[k].more });
  const val = (k) => ({ path: E[k].path, value: E[k].value });
  const R = { L: [72, 132, 1010, 640], R: [1120, 132, 728, 640], RT: [1120, 132, 728, 300], RB: [1120, 462, 728, 310] };
  const IN = 1.2;   // media waits for the chapter card (one bar) before it lands

  // 0 · title
  el({ type: 'hero', at: S('ti1'), until: S('ti3'), rect: [0, 0, 1920, 1080], kicker: 'DESIGN:OS 3D BLENDER · TUTORIAL 3', title: 'Cánh tay robot', sub: 'Robot arm · how we built it', note: '6 servo · 38 chi tiết in 3D', img: 'assets/stills/hero.jpg' });

  // 1 · glossary: each term lands as its sentence starts
  el({ type: 'glossary', at: S('g0'), until: 'chapter', items: [
    ['servo', 'động cơ nhỏ quay tới đúng góc được lệnh', S('g1')], ['khớp', 'chỗ hai phần cánh tay xoay quanh nhau', S('g2')],
    ['va chạm', 'hai chi tiết chiếm cùng một chỗ (mm³)', S('g3')], ['cổng', 'script tự trả lời qua hoặc trượt', S('g4')],
    ['bàn in', 'mặt bàn máy in, in một lượt', S('g5')], ['khung', 'một ảnh của phim · 24 khung/giây', S('g6')]] });

  // 2 · input: the owner's own assembly video is the baseline, one correction
  el({ type: 'seq', at: S('in1'), until: 'chapter', delay: IN, rect: R.L, pattern: 'assets/film-pr/p%03d.jpg', n: 201, fps: 12, label: 'arm-step-by-step.mp4 · 58,5 s · 24 fps' });
  el({ type: 'file', at: S('in1'), until: 'chapter', delay: IN, rect: R.RT, ...ex('in_baseline'), focus: [0] });
  el({ type: 'file', at: S('in2'), until: 'chapter', rect: R.RB, ...ex('in_correction'), focus: [0] });
  el({ type: 'kw', at: S('in1'), delay: 1.5, text: 'đầu vào = video 58 giây' });
  el({ type: 'kw', at: S('in2'), delay: 1.5, text: 'bỏ hộp nguồn đen' });

  // 3 · contract: parts, bed, and the requirement that is never lowered
  el({ type: 'img', at: S('co1'), until: 'chapter', delay: IN, rect: R.L, src: 'assets/stills/hero.jpg', tag: 'PR · 38 chi tiết', kb: true });
  el({ type: 'file', at: S('co1'), until: 'chapter', delay: IN, rect: [1120, 132, 728, 200], ...ex('co_parts'), focus: [0] });
  el({ type: 'file', at: S('co2'), until: 'chapter', rect: [1120, 352, 728, 180], ...ex('co_bed'), focus: [0] });
  el({ type: 'file', at: S('co3'), until: 'chapter', rect: [1120, 552, 728, 220], ...ex('co_load'), focus: [0] });
  el({ type: 'kw', at: S('co1'), delay: 1.5, text: '38 chi tiết, 5 bàn in' });
  el({ type: 'kw', at: S('co3'), text: '250 g · không được hạ' });

  // 4 · print kit: plates, then the gate's per-check count
  el({ type: 'img', at: S('pr1'), until: 'chapter', delay: IN, rect: R.L, src: 'assets/stills/plates.jpg', tag: '5 bàn in · PETG + TPU', kb: true });
  el({ type: 'json', at: S('pr1'), until: 'chapter', delay: IN, rect: R.RT, ...val('pr_plates'), focus: [5] });
  el({ type: 'json', at: S('pr2'), until: 'chapter', rect: R.RB, ...val('pr_gate_count'), tag: 'đếm từ checks[]', focus: [1, 2] });
  el({ type: 'kw', at: S('pr1'), delay: 1.5, text: 'cách nhau 8 mm' });
  el({ type: 'kw', at: S('pr2'), delay: 0.2, text: '836 bước · 0 trượt' });

  // R1 · recap: answers blank through the silence, then the voice confirms them
  el({ type: 'recap', at: S('r1a'), until: 'chapter', lead_s: 2.5, step_s: 0.8, cues: [['Đầu vào là gì?', 'một video lắp ráp'], ['Bao nhiêu chi tiết?', '38'], ['Yêu cầu không được hạ?', 'nâng 250 g nhiều phút']] });

  // 6 · motion: 252 rigid units, 121 timed steps
  el({ type: 'seq', at: S('mo1'), until: 'chapter', delay: IN, rect: R.L, pattern: 'assets/film-or/o%03d.jpg', n: 604, fps: 24, label: 'phim lắp ráp · tua nhanh ×5' });
  el({ type: 'json', at: S('mo1'), until: 'chapter', delay: IN, rect: R.R, ...val('mo_units'), focus: [2, 3] });
  el({ type: 'kw', at: S('mo1'), delay: 1.5, text: '252 cụm · 121 bước' });
  el({ type: 'kw', at: S('mo2'), delay: 0.2, text: 'cùng khớp = một khối' });

  // 7 · bug 1 + PREDICT 1: the output disc floats off the shoulder servo; only the motion path is repaired
  el({ type: 'img', at: S('b1a'), until: S('b1q'), delay: IN, rect: R.L, src: 'assets/bug1/before-0254.jpg', tag: 'c3861ff · khung 254 · TRƯỚC' });
  el({ type: 'file', at: S('b1a'), until: S('b1q'), delay: IN, rect: R.RT, ...ex('b1_review'), focus: [0] });
  el({ type: 'predict', at: S('b1q'), hold_s: 4, question: 'Dựng lại mô hình, hay chỉ sửa đường chuyển động?' });
  el({ type: 'img', at: S('b1b'), until: 'chapter', rect: [72, 132, 500, 640], src: 'assets/bug1/before-0540.jpg', tag: 'khung 540 · trước' });
  el({ type: 'img', at: S('b1b'), until: 'chapter', delay: 0.6, rect: [582, 132, 500, 640], src: 'assets/bug1/after-0540.jpg', tag: '20e27bc · sau' });
  el({ type: 'json', at: S('b1b'), until: 'chapter', rect: R.RT, ...val('b1_repair'), focus: [1] });
  el({ type: 'kw', at: S('b1a'), delay: 1.5, text: 'lệch tới 110 mm' });
  el({ type: 'kw', at: S('b1b'), text: '37 khung, giữ mô hình' });

  // 8 · bug 2: the owner's eye caught it; the running render was stopped
  el({ type: 'img', at: S('b2a'), until: 'chapter', delay: IN, rect: R.L, src: 'assets/stills/or-src0588.jpg', tag: '06e248 · khung 588 · sau khi sửa' });
  el({ type: 'file', at: S('b2a'), until: 'chapter', delay: IN, rect: [1120, 132, 728, 190], ...ex('b2_heading'), focus: [0] });
  el({ type: 'json', at: S('b2b'), until: 'chapter', rect: [1120, 342, 728, 200], ...val('b2_frame'), focus: [1] });
  el({ type: 'file', at: S('b2c'), until: 'chapter', rect: [1120, 562, 728, 210], ...ex('b2_stop'), focus: [0] });
  el({ type: 'kw', at: S('b2a'), delay: 1.5, text: 'giây 24 · chồng nhau' });
  el({ type: 'kw', at: S('b2c'), text: 'dừng render · bỏ khung' });

  // 9 · bug 3 + PREDICT 2: straight transfer cuts the real servo case; lift, traverse, lower
  el({ type: 'img', at: S('b3a'), until: S('b3b'), delay: IN, rect: R.L, src: 'assets/bug3/straight.jpg', tag: 'e9323 · đi thẳng' });
  el({ type: 'predict', at: S('b3q'), hold_s: 4, question: 'Bay thẳng tới đích: có an toàn không?' });
  el({ type: 'file', at: S('b3b'), until: 'chapter', rect: R.RT, ...ex('b3_straight'), focus: [0] });
  el({ type: 'img', at: S('b3c'), until: 'chapter', rect: R.L, src: 'assets/bug3/safe.jpg', tag: '11d88f · nhấc · ngang · hạ' });
  el({ type: 'seq', at: S('b3c'), until: 'chapter', delay: 0.2, rect: R.RB, pattern: 'assets/fork/f%03d.jpg', n: 91, fps: 18, label: 'phim thật · 72 khung' });
  el({ type: 'kw', at: S('b3b'), text: 'cắt ngang vỏ servo' });
  el({ type: 'kw', at: S('b3c'), delay: 1.2, text: 'nhấc 120 mm, ngang, hạ' });

  // 10 · checks: every frame, zero real servo-case collisions
  el({ type: 'seq', at: S('ch1'), until: 'chapter', delay: IN, rect: R.L, pattern: 'assets/fork/f%03d.jpg', n: 91, fps: 12, label: 'vai · đường nhấc–ngang–hạ' });
  el({ type: 'json', at: S('ch1'), until: 'chapter', delay: IN, rect: R.RT, ...val('ch_overlap'), focus: [2] });
  el({ type: 'json', at: S('ch2'), dur: 4.6, rect: R.RB, ...val('ch_clear'), focus: [1] });
  el({ type: 'kw', at: S('ch1'), delay: 1.5, text: '3.031 khung' });
  el({ type: 'kw', at: S('ch2'), delay: 0.2, text: '0 va chạm' });

  // 11 · bug 4: fingertip clipped; widen 8 %, reuse 2,931 frames, render 89
  el({ type: 'img', at: S('b4a'), until: 'chapter', delay: IN, rect: R.L, src: 'assets/stills/or-final-hero.jpg', tag: '06e248 · khung cuối · rộng hơn 8 %' });
  el({ type: 'file', at: S('b4a'), until: 'chapter', delay: IN, rect: R.RT, ...ex('b4_hero'), focus: [0] });
  el({ type: 'json', at: S('b4b'), until: 'chapter', rect: R.RB, ...val('b4_reuse'), focus: [1] });
  el({ type: 'kw', at: S('b4a'), delay: 1.5, text: 'đầu ngón tay bị cắt' });
  el({ type: 'kw', at: S('b4b'), delay: 0.2, text: 'giữ 2.931 · render lại 89' });

  // R2 · recap
  el({ type: 'recap', at: S('r2a'), until: 'chapter', lead_s: 2.5, step_s: 0.8, cues: [['Vì sao không đi thẳng?', 'cắt qua vỏ servo'], ['Đường an toàn?', 'nhấc · ngang · hạ'], ['Kiểm bao nhiêu khung?', 'toàn bộ 3.031']] });

  // 13 · the final film, decoded end to end
  el({ type: 'seq', at: S('fi1'), delay: IN, dur: 25.5, rect: R.L, pattern: 'assets/film-or/o%03d.jpg', n: 604, fps: 24, label: 'arm-step-by-step-refined.mp4 · tua nhanh ×5' });
  el({ type: 'json', at: S('fi1'), delay: IN, dur: 12, rect: R.R, ...val('fi_media'), focus: [1, 2, 3] });
  el({ type: 'kw', at: S('fi1'), delay: 1.5, text: '3.020 khung · giải mã trọn' });

  // 14 · limits + PREDICT 3: the gate ran a sample spec; manufacture stays blocked
  el({ type: 'json', at: S('li1'), until: S('liq'), delay: IN, rect: R.L, ...val('pr_gate_count'), tag: 'đếm từ checks[]', focus: [1] });
  el({ type: 'predict', at: S('liq'), hold_s: 4, question: 'Mọi bước đều qua. Vậy in và dùng được chưa?' });
  el({ type: 'file', at: S('li2'), until: 'chapter', rect: R.RT, ...ex('li_spec'), focus: [0] });
  el({ type: 'json', at: S('li2'), until: 'chapter', delay: 0.8, rect: [72, 132, 1010, 300], ...val('li_wall'), tag: 'coverage.unchecked', focus: [2] });
  el({ type: 'file', at: S('li3'), until: 'chapter', rect: R.RB, ...ex('li_blocked'), focus: [0] });
  el({ type: 'kw', at: S('li2'), text: 'spec mẫu · chưa kiểm tường' });
  el({ type: 'kw', at: S('li3'), delay: 1.2, text: 'gia công: BỊ CHẶN' });

  // R3 · three lessons, blanked, then spoken
  el({ type: 'recap', at: S('r3a'), until: 'chapter', label: 'Ba điều đáng nhớ', lead_s: 2.2, step_s: 0.8, cues: [['Sửa ở đâu?', 'đường chuyển động, không phải mô hình'], ['Đi sao cho an toàn?', 'nhấc · ngang · hạ'], ['PASS nghĩa là gì?', 'chỉ trong phạm vi spec nó kiểm']] });

  // outro
  el({ type: 'repo', t0: bar(205.3), t1: T + 1, rect: [220, 200, 1480, 560], p: [48, 470, 984, 820],
       cmd: 'open builds/robot-arm-original-refined/README.md' });

  Object.assign(D, { BAR, DB0, B, T, bar, CH, EL, CAP, CREDIT: C.music.credit, RAIL_LABEL: 'ROBOT ARM · A → Z' });
})(window);
