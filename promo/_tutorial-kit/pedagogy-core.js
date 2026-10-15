/* Pedagogy v2 core: pure functions, no DOM and no fs. The page, the audio mix, make-subtitles and validate all load this
 * same file (the page as a script, node through a vm), so the sentence timing and the budgets are defined exactly once.
 *   placeSentences  script sentences -> film times (one clip per sentence, optional silent hold after a sentence)
 *   resolve         binds elements to sentences: at: 'sent:<id>' sets t0/t1 (and predict/recap/focus windows)
 *   cardRows        the text rows of a card, with the focus flag of each, for the budgets
 * Everything is a function of its arguments; nothing here reads the clock. */
(function (root) {
  const D = (root.DOS = root.DOS || {});

  /* Provisional numbers: the research labels the reading-speed ones as assumptions to calibrate after the first viewing. */
  const BUDGETS = {
    focusTokensPerLine: 12, cardDwellS: 4, nonFocusTokens: 20, kwWords: 6,
    predictQuestionWords: 14, predictHoldS: [3, 5], predictMin: 3, predictMinFilmS: 60,
    chapterS: [15, 35], glossaryTerms: [4, 6], glossaryDefWords: 12, recapCues: [3, 4],
    leadS: 0.5, gapS: 0.3, tailS: 0.4, focusDim: 0.4,
  };

  const tokens = (s) => String(s).split(/\s+/).filter(Boolean).length;
  const SENT_REF = /^sent:(.+)$/;

  /** Rows a file card shows: prose (.md) is one paragraph, code and JSON keep their lines. Shared with the renderer. */
  const fileTexts = (spec) => {
    const prose = /\.md$/.test(spec.path) && !spec.lines[0].trim().startsWith('|');
    return { prose, texts: prose ? [spec.lines.map((l) => l.trim()).join(' ')] : spec.lines };
  };
  const jsonLines = (spec) => JSON.stringify(spec.value, null, 1).split('\n').concat(spec.extra || []);

  /** [{text, focus}] for the text-card types, null for any other type. */
  const cardRows = (spec) => {
    const foc = new Set(spec.focus || []);
    if (spec.type === 'file') return fileTexts(spec).texts.map((text, i) => ({ text, focus: foc.has(i) }));
    if (spec.type === 'json') return jsonLines(spec).map((text, i) => ({ text, focus: foc.has(i) }));
    if (spec.type === 'term') return spec.lines.map((l) => ({ text: String(l[Object.keys(l).find((k) => k !== 'at')]), focus: false }));
    if (spec.type === 'callout') return spec.lines.map((text) => ({ text, focus: false }));
    return null;
  };

  /** Silent holds the timeline asks for: predict elements bound to a sentence. {sentenceId: {hold, kind}} */
  const holdsFromElements = (EL) => {
    const out = {};
    for (const s of EL) {
      const m = s.type === 'predict' && typeof s.at === 'string' && SENT_REF.exec(s.at);
      if (m) out[m[1]] = { hold: Number(s.hold_s) || 0, kind: 'predict' };
    }
    return out;
  };

  /** Film times of every script sentence. Chapter by chapter: the first sentence starts LEAD s into the chapter, each
   *  next one starts GAP s after the previous ends, or exactly `hold` s after it when a silent hold follows it.
   *  dur(id) returns the clip length in seconds, or null when there is no clip yet (then the length is estimated from the text). */
  const placeSentences = ({ chapters, segments, dur, holds = {}, lead = BUDGETS.leadS, gap = BUDGETS.gapS, T = Infinity }) => {
    const table = {}, problems = [];
    for (const seg of segments) {
      if (!Array.isArray(seg.sentences)) continue;
      const c = chapters.find((x) => x.id === seg.id);
      if (!c) { problems.push(`segment "${seg.id}" has no chapter with that id in the timeline`); continue; }
      let cursor = Math.max(c.t0, 0) + lead;
      const limit = Math.min(c.t1, T);
      seg.sentences.forEach((s, i) => {
        if (!s || typeof s.id !== 'string' || typeof s.text !== 'string' || !s.text.trim()) { problems.push(`segment "${seg.id}" sentence ${i + 1} needs {id, text}`); return; }
        if (table[s.id]) { problems.push(`sentence id "${s.id}" is used twice; ids are unique across the script`); return; }
        const d = dur(s.id), est = d == null;
        const len = est ? Math.max(1.2, [...s.text].length / 14) : d;
        const el = holds[s.id], scriptHold = Number(s.hold_s) || 0;
        if (el && scriptHold) problems.push(`sentence "${s.id}" has hold_s in the script and a predict element; keep the hold on the predict element only`);
        const hold = el ? el.hold : scriptHold;
        table[s.id] = { id: s.id, seg: seg.id, i, t0: cursor, t1: cursor + len, hold, holdKind: hold > 0 ? (el ? 'predict' : 'pause') : null, limit, est, text: s.text, text_en: s.text_en };
        cursor += len + (hold > 0 ? hold : gap);
      });
    }
    return { table, problems };
  };

  const ref = (SENT, value, spec, field) => {
    const m = typeof value === 'string' && SENT_REF.exec(value);
    const s = m && SENT[m[1]];
    if (!s) throw new Error(`element ${spec.type} ${field} "${value}" names no sentence in the voice script`);
    return s;
  };

  /** Bind every element that has `at: 'sent:<id>'` to its sentence. Elements without `at` keep their own t0/t1. */
  const resolve = (EL, SENT) => {
    for (const spec of EL) {
      if (spec.at == null) continue;
      const s = ref(SENT, spec.at, spec, 'at'), until = spec.until != null ? ref(SENT, spec.until, spec, 'until') : s;
      spec.t0 = s.t0 + (spec.delay || 0);
      if (spec.type === 'predict') {
        if (s.holdKind !== 'predict') throw new Error(`predict bound to "${s.id}" needs hold_s on the predict element`);
        spec.h0 = s.t1; spec.h1 = s.t1 + s.hold; spec.t1 = spec.h1 + 0.3;
      } else if (spec.type === 'recap') {
        if (!(s.hold > 0)) throw new Error(`recap bound to "${s.id}" needs a silent hold: set hold_s on that sentence in the script`);
        spec.base = s.t1; spec.t1 = s.t1 + s.hold + 0.3;
      } else spec.t1 = spec.dur != null ? spec.t0 + spec.dur : until.t1 + BUDGETS.tailS;
      if (spec.focus) { spec.f0 = s.t0; spec.f1 = s.t1; }
      if (spec.type === 'glossary') spec.itemT = spec.items.map((it) => (it[2] ? ref(SENT, it[2], spec, 'item at').t0 : null));
    }
    return EL;
  };

  /** Default rect of the pedagogy elements, so a timeline need not place them; null for every other type. */
  const RECTS = {
    kw: [[72, 892, 1776, 124], [48, 1690, 984, 150]],
    predict: [[360, 170, 1200, 540], [48, 480, 984, 700]],
    recap: [[260, 150, 1400, 600], [48, 330, 984, 1100]],
    glossary: [[72, 132, 1776, 640], [48, 220, 984, 1300]],
  };
  const defaultRect = (type, portrait) => (RECTS[type] ? RECTS[type][portrait ? 1 : 0].slice() : null);

  D.pedagogy = { BUDGETS, tokens, fileTexts, jsonLines, cardRows, holdsFromElements, placeSentences, resolve, defaultRect, SENT_REF };
})(typeof window !== 'undefined' ? window : globalThis);
