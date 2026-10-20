/* DC-01 act 2: electronics, integration and harness, print kit, presentation, delivery, lessons and outro. */
(function (root) {
  const D = root.DOS, { bar, B, T } = D, { el, cap, ex, val, line, R, ladder, E } = D.tl;

  // 7 · electronics: four native KiCad 10 runs, then injected faults; fabrication still blocked
  el({ type: 'term', t0: bar(89), t1: bar(107), rect: R.LW, lines: [
    { at: bar(89.2), dim: '# electronics/native-a01/erc.log' }, { at: bar(89.8), fail: line('erc_a01') },
    { at: bar(91), dim: '# electronics/native-a02/erc.log' }, { at: bar(91.6), out: line('erc_a02') },
    { at: bar(92.8), dim: '# electronics/native-a03/erc.log' }, { at: bar(93.4), out: line('erc_a03') },
    { at: bar(94.6), dim: '# electronics/native-a04/erc.log + drc.log' }, { at: bar(95.2), out: line('erc_a04') },
    ...E.drc_a04.lines.map((l, i) => ({ at: bar(95.8) + i * B, out: l })), { at: bar(97.5), ok: line('ok_electronics') }] });
  [['carrier-front', 'PCB · front copper', 89.5], ['carrier-back', 'PCB · back copper', 92.5], ['desktop-companion', 'schematic', 95.5]].forEach(([n, tag, a]) =>
    el({ type: 'img', t0: bar(a), t1: bar(a + 3.4), rect: R.RN, src: `assets/electronics/${n}.jpg`, tag, kb: true }));
  el({ type: 'file', t0: bar(99), t1: bar(107), rect: R.RN, ...ex('el_faults'), hl: [0] });
  el({ type: 'file', t0: bar(102.5), t1: bar(107), rect: [72, 600, 1180, 172], ...ex('el_blocked'), hl: [0] });
  cap(89, 94.6, 'KiCad 10 thật: A01 không mở được, A02 có 84 lỗi ERC, A03 sạch.', 'Native KiCad 10: A01 fails to load, A02 has 84 ERC violations, A03 is clean.');
  cap(94.6, 99, 'A04: ERC 0, DRC 0, 0 đường chưa nối, 0 lệch schematic.', 'A04: ERC 0, DRC 0, 0 unconnected items, 0 parity issues.');
  cap(99, 102.5, '5 lỗi cài cố ý, cả 5 đều bị bắt.', 'Five injected faults, all five detected.');
  cap(102.5, 107, '0 mẫu thật: chế tạo và chạy pin vẫn BỊ CHẶN.', 'Zero physical samples: fabrication and battery operation stay BLOCKED.');

  // 8 · integration + harness
  el({ type: 'wipe', t0: bar(108), t1: bar(126), rect: R.L, fit: 'cover',
       layers: [[ladder('I01', 'wire'), 108, 108.3], [ladder('I01'), 108.8, 109.4], [ladder('I06'), 111.5, 112.1], [ladder('H13'), 116, 116.6]],
       label: [[bar(108), 'I01 · M29 + E02 assembled'], [bar(111.5), 'I06 · frozen integration'], [bar(116), 'H13 · native harness']] });
  el({ type: 'json', t0: bar(109), t1: bar(115.6), rect: R.R, ...val('i06_handoff') });
  el({ type: 'term', t0: bar(116.2), t1: bar(121), rect: R.R, lines: [
    { at: bar(116.4), dim: '# integration/harness/I06-H13-preview.log' }, { at: bar(117), ok: line('ok_harness') },
    { at: bar(118.4), dim: '# integration/harness/I06-H09-combined.log' }, { at: bar(119), ok: line('ok_combined') }] });
  el({ type: 'file', t0: bar(121.2), t1: bar(126), rect: R.R, ...ex('lesson_h12'), hl: [0] });
  cap(109, 116, 'I06: form 18 chi tiết, fit trong phạm vi khai báo, tháo lắp ở mức lấy mẫu.', 'I06: form on 18 parts, fit in the declared scope, service on samples.');
  cap(116, 121, 'Dây là đường cong thật: 26 kết nối, 54 đường cong, 252 vật cản.', 'Wires are real curves: 26 connections, 54 curves, 252 obstacles.');
  cap(121, 126, 'H12 từng báo PASS sai: 2,996 mm < 3 mm. Kiểm tra độc lập đã bắt được.', 'H12 once reported a false PASS: 2.996 mm < 3 mm. An independent check caught it.');

  // 9 · print kit
  el({ type: 'img', t0: bar(127), t1: bar(138), keys: [[bar(127), ...R.L]], src: 'assets/stills/print-layout.jpg', tag: 'P03 · PETG + TPU plates', kb: true });
  el({ type: 'json', t0: bar(127.5), t1: bar(131.8), rect: R.R, ...val('gate_P01') });
  el({ type: 'json', t0: bar(132), t1: bar(138), rect: [1120, 132, 728, 260], ...val('gate_P03') });
  el({ type: 'file', t0: bar(133), t1: bar(138), rect: [1120, 422, 728, 350], path: E.p03_plates.path, from: E.p03_plates.from, lines: [...E.p03_plates.lines, ...E.p03_noslicer.lines], hl: [2] });
  cap(127.5, 132, 'P01 trượt ở khung mạch sạc và màng nút bấm.', 'P01 fails on the charger frame and the button diaphragm.');
  cap(132, 138, 'P03: 18/18 chi tiết qua, 17 PETG + 1 TPU. Chưa slicer, chưa in thật.', 'P03: 18/18 parts pass, 17 PETG + 1 TPU. No slicer, no real print yet.');

  // 10 · presentation: the film the owner rejected, and the one that replaced it
  el({ type: 'seq', t0: bar(139), t1: bar(144), rect: R.F, pattern: 'assets/anim-explode/e%03d.jpg', n: 192, fps: 24, label: 'D06 · native 30 fps · explode' });
  el({ type: 'file', t0: bar(144.2), t1: bar(148.5), rect: [72, 132, 1776, 300], ...ex('lesson_film'), hl: [0] });
  el({ type: 'seq', t0: bar(148.5), t1: bar(153), rect: R.L, pattern: 'assets/anim-assemble/r%03d.jpg', n: 192, fps: 24, label: 'D06 · reassembly' });
  el({ type: 'file', t0: bar(149), t1: bar(153), rect: R.R, ...ex('lesson_metal'), hl: [0] });
  cap(139, 144.2, 'Phim lắp ráp D06, render native trong Blender.', 'The D06 assembly film, rendered natively in Blender.');
  cap(144.2, 148.5, 'D05 bị chê: 120 tư thế ở 5 fps, nhân khung lên 30 fps.', 'D05 was rejected: 120 poses at 5 fps, repeated up to 30 fps.');
  cap(148.5, 153, 'D06: 1.170 khung, 589 trạng thái. GPU nhanh gấp 3 nhưng sai, bị loại.', 'D06: 1,170 frames, 589 states. The GPU was 3× faster but wrong, so rejected.');

  // 11 · delivery
  el({ type: 'scroll', t0: bar(154), t1: bar(164), rect: R.L, src: 'assets/review/review-page-full.jpg', srcW: 1600, scrollKeys: [[bar(154), 0], [bar(156), 900], [bar(159), 3300], [bar(162), 5000]] });
  el({ type: 'json', t0: bar(155), t1: bar(164), rect: [1120, 132, 728, 300], ...val('completion') });
  el({ type: 'file', t0: bar(158), t1: bar(164), rect: [1120, 462, 728, 310], path: E.r03_blocked.path, from: E.r03_blocked.from, lines: [...E.r03_blocked.lines], hl: [0] });
  el({ type: 'file', t0: bar(160.5), t1: bar(164), rect: [72, 600, 1010, 172], ...ex('readme_likeness'), hl: [0] });
  cap(155, 160.5, 'Trang review offline: 65 đường dẫn đều mở được. Demo số đã giao.', 'An offline review page: all 65 links resolve. Digital demo delivered.');
  cap(160.5, 164, 'Gia công BỊ CHẶN, 0 mẫu thật, độ giống ảnh gốc chưa được chấp nhận.', 'Manufacture BLOCKED, 0 physical samples, likeness not accepted.');

  // 12 · lessons
  [['ok_run_M19', 'AGENT_OK ≠ gate PASS'], ['lesson_h12', 'gates can lie'], ['lesson_i05', 'checkpoints'], ['lesson_film', 'count states, not frames']].forEach(([k, tag], i) =>
    el({ type: 'file', t0: bar(165 + i * 2), t1: bar(177), rect: [72 + (i % 2) * 908, 132 + Math.floor(i / 2) * 330, 868, 300], ...ex(k), tag, hl: [0] }));
  cap(165, 169, 'Bước xong không phải cổng qua. Và cổng cũng có thể sai.', 'A finished step is not a passed gate. And a gate can be wrong.');
  cap(169, 177, 'Checkpoint trước mọi thao tác phá huỷ. Phim: đếm trạng thái, không đếm khung.', 'Checkpoint before anything destructive. Films: count states, not frames.');

  // outro
  el({ type: 'repo', t0: bar(177.3), t1: T + 1, rect: [220, 200, 1480, 560], p: [48, 470, 984, 820],
       cmd: 'python3 scripts/native-pipeline.py run builds/desktop-companion/blockout-pipeline.json --run-dir <new dir>' });
  cap(177.6, 186, 'Toàn bộ DC-01 nằm trong repo, mã nguồn công khai.', 'All of DC-01 lives in the source-available repo.');
})(window);
