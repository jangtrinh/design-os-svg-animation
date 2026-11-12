/* Pedagogy v2 fixture and demo film (40 s): glossary, a signaling moment, a predict beat with the music muted, a recap and a keyword
 * caption, every element bound to a voice sentence (at: 'sent:<id>'). Used by tests/tutorial-skill-pedagogy.test.mjs. */
(function (root) {
  const D = root.DOS, E = root.EVIDENCE, C = D.CONFIG;
  const BAR = 240 / C.grid.bpm, DB0 = C.grid.db0, B = BAR / 4, T = C.duration;
  const bar = (n) => DB0 + n * BAR;
  const CH = [
    ['title', 0, 8, 0, '', '', null],
    ['check', 8, 19, 1, 'Cổng kiểm tra', 'Check gate', null],
    ['outro', 19, 20, 0, '', '', null],
  ].map(([id, a, z, num, title, sub, img]) => ({ id, t0: bar(a), t1: Math.min(bar(z), T), num, title, sub, img }));
  const EL = [], CAP = [];
  const el = (o) => EL.push(o);
  const ex = (k, pick, more) => ({ path: E[k].path, from: E[k].from, lines: pick ? pick.map((i) => E[k].lines[i]) : E[k].lines, more: !!more });
  const R = { L: [72, 132, 1010, 300] };

  el({ type: 'glossary', at: 'sent:t1', dur: 15, items: [
    ['cổng', 'phép kiểm tra phải qua', 'sent:t2'], ['dấu cuối', 'dòng cuối cùng của lần chạy', 'sent:t3'],
    ['bản sửa', 'một bước đã lưu của bộ phận', 'sent:t4'], ['biên nhận', 'tệp chứng minh kết quả', 'sent:t5'] ] });
  el({ type: 'file', at: 'sent:c1', rect: R.L, ...ex('state'), tag: 'state.txt', focus: [1] });
  el({ type: 'kw', at: 'sent:c1', text: 'Thành tối thiểu 2,6 mm' });
  el({ type: 'predict', at: 'sent:c2', hold_s: 3, question: 'Dòng cuối ghi AGENT_OK. Cổng khớp qua hay trượt?' });
  el({ type: 'file', at: 'sent:c3', rect: R.L, ...ex('run'), tag: 'run.log', focus: [2] });
  el({ type: 'recap', at: 'sent:c4', lead_s: 1.2, step_s: 1, cues: [['Cổng là gì?', 'phép kiểm phải qua'], ['Dấu cuối là gì?', 'dòng cuối lần chạy'], ['AGENT_OK nghĩa là gì?', 'chưa chắc đã qua']] });
  Object.assign(D, { BAR, DB0, B, T, bar, CH, EL, CAP, CREDIT: C.music.credit });
})(window);
