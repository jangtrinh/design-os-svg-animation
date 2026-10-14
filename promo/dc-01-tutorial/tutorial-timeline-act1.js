/* DC-01 act 1: title, input, contract, blockout, the M02 → M29 ladder, the sentinel trap and controls. */
(function (root) {
  const D = root.DOS, { bar } = D, { el, cap, ex, val, line, R, ladder, E } = D.tl;

  // 0 · title
  el({ type: 'hero', t0: bar(-0.2), t1: bar(9), rect: [0, 0, 1920, 1080], kicker: 'DESIGN:OS 3D Blender · tutorial 02', title: 'DC-01 Desktop Companion, A → Z',
       sub: 'A desk robot: display, button, battery and a real PCB', img: 'assets/stills/assembled.jpg',
       note: '29 bản cơ khí, 4 lần chạy KiCad, 3 bộ kit in · 29 mechanical revisions, 4 KiCad runs, 3 print kits' });

  // 1 · input: the registry pins five images whose bytes never reached this machine
  // the owner's reference image (sent 2026-10-15) leads; its hash was checked against REF01 the same day
  el({ type: 'img', t0: bar(10), t1: bar(14.4), rect: [72, 132, 860, 640], kb: true, src: 'assets/ref/owner-reference-2026-10-15.jpg', tag: 'ảnh tham khảo · owner reference' });
  el({ type: 'callout', t0: bar(11), t1: bar(14.4), rect: [980, 132, 868, 400], title: 'sha256 check · 2026-10-15',
       lines: ['owner image: 2000×2000 WEBP · 452a414d9eedcca7…', 'registry REF01: 335×597 PNG · 647e22964fd2f490…', 'không trùng hash · not the registered bytes'] });
  el({ type: 'file', t0: bar(14.5), t1: bar(24), rect: R.LW, ...ex('reg_rows'), hl: [0, 1, 2, 3, 4] });
  el({ type: 'file', t0: bar(15.5), t1: bar(24), rect: [1290, 132, 558, 300], ...ex('reg_context'), hl: [0] });
  el({ type: 'file', t0: bar(18.5), t1: bar(24), rect: [1290, 462, 558, 310], ...ex('reg_disagree'), hl: [0] });
  cap(10, 14.5, 'Đầu vào: 1 ảnh chụp và 4 tấm gen, mỗi tấm có SHA256.', 'Input: one photo and four generated sheets, each pinned by SHA256.');
  cap(14.5, 18.5, 'Nhưng file chưa từng được chép về máy này: tên file không phải bằng chứng.', 'But the bytes never reached this Mac: a filename is not evidence.');
  cap(18.5, 24, 'Các tấm gen mâu thuẫn nhau, nên BOM cơ khí thật mới là chuẩn.', 'The generated sheets disagree, so the native BOM is authoritative.');

  // 2 · contract
  el({ type: 'file', t0: bar(25), t1: bar(36), rect: R.LW, ...ex('params'), hl: [3, 5] });
  el({ type: 'file', t0: bar(29.5), t1: bar(36), rect: R.RN, ...ex('params_duty'), hl: [0] });
  el({ type: 'img', t0: bar(32), t1: bar(36), rect: [72, 560, 600, 212], src: 'assets/stills/catalog.jpg', tag: 'R03 catalog', kb: true });
  cap(25, 29.5, 'Hợp đồng: vỏ 80 × 64 × 94 mm, tường 2,4 / tối thiểu 2,0 mm, mục đích: cả hai.', 'Contract: 80 × 64 × 94 mm shell, 2.4 mm wall, 2.0 mm minimum, purpose: both.');
  cap(29.5, 36, 'Kích thước đề xuất, không đo từ ảnh. Tải 0,35 kg, tay không động cơ.', 'Proposed dimensions, not measured from a picture. 0.35 kg payload, passive arms.');

  // 3 · blockout
  el({ type: 'grid', t0: bar(37), t1: bar(44), rect: [72, 132, 1776, 400], cols: 3, srcs: ['A01', 'A02', 'A03'].map((r) => `assets/blockout/${r}-hero.jpg`) });
  el({ type: 'term', t0: bar(39), t1: bar(44), rect: [72, 560, 1776, 212], lines: [
    { at: bar(39.2), dim: '# runs/blockout-A01/steps/blockout/attempt-0001/stdout.log' }, { at: bar(40), ok: line('ok_blockout') }] });
  cap(37, 40, 'Blockout chạy 3 lần: A01, A02, A03.', 'The blockout ran three times: A01, A02, A03.');
  cap(40, 44, '12 mesh, thân cao 94 mm, 0 cạnh hở: đọc từ dòng AGENT_OK.', '12 meshes, a 94 mm body, 0 open edges: read from the AGENT_OK line.');

  // 4 · mechanical ladder: one camera, every saved revision, each rung tagged with its own gate verdict
  const RUNGS = [['M02', 45], ['M03', 47], ['M05', 48.5], ['M17', 50], ['M19', 52], ['M25', 57], ['M26', 60], ['M27', 62], ['M28', 64.5], ['M29', 68]];
  el({ type: 'wipe', t0: bar(45), t1: bar(74), rect: R.L, fit: 'cover',
       layers: [[ladder('M02', 'wire'), 45, 45.3], ...RUNGS.map(([r, a], i) => [ladder(r), i ? a : 45.8, (i ? a : 45.8) + 0.6])],
       label: [[bar(45), 'M02 · shell gate FAIL'], [bar(47), 'M03 · shell gate FAIL'], [bar(48.5), 'M05 · face plate'], [bar(50), 'M17 · charger seats'],
               [bar(52), 'M19 · form FAIL + fit FAIL'], [bar(57), 'M25 · upper wall 0.794 mm'], [bar(60), 'M26 · upper wall 1.632 mm'],
               [bar(62), 'M27 · upper wall 1.792 mm'], [bar(64.5), 'M28 · form PASS · fit FAIL'], [bar(68), 'M29 · form PASS · fit PASS']] });
  [['gate_M02', 45.6, 51.8], ['fit_M19', 52.2, 56.8], ['gate_M27', 57.2, 64.3], ['fit_M28', 64.7, 67.8], ['fit_M29', 68.2, 74]].forEach(([k, a, z]) =>
    el({ type: 'json', t0: bar(a), t1: bar(z), rect: R.R, ...val(k) }));
  el({ type: 'json', t0: bar(70), t1: bar(74), rect: [1120, 560, 728, 212], ...val('freeze_M29') });
  cap(45, 52, 'Cùng một camera, từng bản lưu: M02 trượt, tường vỏ trên chỉ 0,046 mm.', 'One camera, every saved revision: M02 fails, upper wall only 0.046 mm.');
  cap(52, 57, 'M19 có tai, có tay, nhưng vỏ dưới đâm vào trụ đỡ 2,6 mm³.', 'M19 gains ears and arms, but the lower shell hits a standoff: 2.6 mm³.');
  cap(57, 64.5, 'M25 → M27: tường mỏng dần về 2 mm. Sửa hình, không hạ chuẩn.', 'M25 → M27: the thin wall climbs toward 2 mm. Fix the shape, never the limit.');
  cap(64.5, 68, 'M28 qua hình dạng nhưng bu lông mạch sạc chạm linh kiện.', 'M28 passes form, but the charger bolt hits a component.');
  cap(68, 74, 'M29: form PASS, fit PASS, 1.966 cặp, 0 va chạm.', 'M29: form PASS, fit PASS, 1,966 pairs, 0 collisions.');

  // 5 · the sentinel trap: a step can end AGENT_OK while the gate it feeds fails
  el({ type: 'term', t0: bar(75), t1: bar(82), rect: [72, 132, 868, 640], lines: [
    { at: bar(75.2), dim: '# mechanical/run-M19.log' }, { at: bar(76), ok: line('ok_run_M19') }] });
  el({ type: 'term', t0: bar(77), t1: bar(82), rect: [980, 132, 868, 640], lines: [
    { at: bar(77.2), dim: '# mechanical/M19/fit.log' }, { at: bar(78), fail: line('fail_fit_M19') }] });
  cap(75, 78, 'Cùng một bản M19: log chạy là AGENT_OK…', 'Same revision M19: the run log says AGENT_OK…');
  cap(78, 82, '…nhưng log lắp ghép là AGENT_FAIL. Bước xong ≠ cổng qua.', '…while the fit log says AGENT_FAIL. A finished step is not a passed gate.');

  // 6 · controls
  el({ type: 'img', t0: bar(83), t1: bar(88), keys: [[bar(83), ...R.L]], src: 'assets/stills/button.jpg', tag: 'R03 · button', kb: true });
  el({ type: 'term', t0: bar(83.5), t1: bar(88), rect: R.R, lines: [
    { at: bar(83.7), dim: '# runs/controls-C01' }, { at: bar(84.3), fail: line('fail_controls_C01') },
    { at: bar(85.5), dim: '# runs/controls-C02' }, { at: bar(86.1), ok: line('ok_controls_C02') }] });
  cap(83, 88, 'Nút bấm: C01 trượt ở miếng giữ phía sau, C02 qua với 4 chi tiết in.', 'Controls: C01 fails on the rear keeper, C02 passes with four printable parts.');
})(window);
