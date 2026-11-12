/* The seven pedagogy v2 checks of validate.mjs (rules.md R18 to R24). Only a project with config `pedagogy: "v2"` is checked; a legacy
 * project (CK-001, DC-01) passes untouched. Every number comes from the kit's pedagogy-core.js BUDGETS, which rules.md records as
 * provisional until the first viewing calibrates it. Returns [[check, message], ...]; validate.mjs prints them.
 *   card-budget       focus line <= 12 tokens, text card stays >= 4 s, <= 20 non-focus tokens on screen at once, recap 3-4 cues that fit the hold
 *   one-text-channel  no burned-in caption, keyword caption <= 6 words, bound to a sentence, never two at once
 *   predict-count     >= 3 predict beats (a film under 60 s may set predictMin), each hold 3-5 s with no voice inside, question <= 14 words
 *   chapter-length    every numbered chapter runs 15-35 s
 *   glossary-present  a glossary element with 4-6 terms, each definition <= 12 words
 *   subtitles-present every sentence has text_en; after a render, the .srt and .vtt exist, are monotonic and equal the sentences
 *   terms-defined     every config glossary term is defined in the glossary element before its first use */
import fs from 'node:fs';
import path from 'node:path';
import { kitFile } from './kit-path.mjs';

export const PEDAGOGY_CHECKS = ['card-budget', 'one-text-channel', 'predict-count', 'chapter-length', 'glossary-present', 'subtitles-present', 'terms-defined'];
const norm = (s) => String(s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
const reFor = (term) => new RegExp(`(?<![\\p{L}\\p{N}])${norm(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'iu');
const EPS = 1e-6;

export async function pedagogyProblems({ dir, cfg, tl, want }) {
  const out = [];
  const add = (check, msg) => { if (want(check)) out.push([check, msg]); };
  if (cfg.pedagogy !== 'v2' || !tl) return out;
  const P = tl.DOS.pedagogy, B = P.BUDGETS, EL = tl.EL, SENT = tl.SENT || {};
  const name = (e) => `${e.type}${e.at ? ` at ${e.at}` : ` at ${Number(e.t0).toFixed(1)} s`}`;
  const sentences = Object.values(SENT).sort((a, b) => a.t0 - b.t0);

  // ---- card-budget
  const cards = EL.filter((e) => P.cardRows(e));
  for (const e of cards) {
    const rows = P.cardRows(e), dwell = e.t1 - e.t0;
    if (dwell < B.cardDwellS - EPS) add('card-budget', `${name(e)} stays ${dwell.toFixed(2)} s; a text card stays at least ${B.cardDwellS} s (bind it to a longer sentence or add until:)`);
    if (e.focus && !e.at) add('card-budget', `${name(e)} has focus but no at: 'sent:<id>'; the highlight needs the sentence that cites the line`);
    for (const i of e.focus || []) {
      if (!rows[i]) add('card-budget', `${name(e)} focus line ${i} does not exist (the card has ${rows.length} lines)`);
      else if (P.tokens(rows[i].text) > B.focusTokensPerLine) add('card-budget', `${name(e)} focus line ${i} has ${P.tokens(rows[i].text)} tokens; at most ${B.focusTokensPerLine} (cite a shorter line or pick the number)`);
    }
  }
  let worst = { n: 0 };
  for (const at of cards.map((e) => e.t0)) {
    const live = cards.filter((e) => e.t0 <= at + EPS && at + EPS < e.t1);
    const n = live.reduce((sum, e) => sum + P.cardRows(e).filter((r) => !r.focus).reduce((a, r) => a + P.tokens(r.text), 0), 0);
    if (n > worst.n) worst = { n, at, names: live.map(name) };
  }
  if (worst.n > B.nonFocusTokens) add('card-budget', `${worst.n} non-focus text tokens are on screen at ${worst.at.toFixed(1)} s (${worst.names.join(', ')}); at most ${B.nonFocusTokens} (pick the cited lines only)`);
  for (const e of EL.filter((x) => x.type === 'recap')) {
    const n = (e.cues || []).length, [lo, hi] = B.recapCues;
    if (n < lo || n > hi) add('card-budget', `${name(e)} has ${n} cues; a recap has ${lo} to ${hi}`);
    const s = e.at && SENT[String(e.at).replace(P.SENT_REF, '$1')];
    const need = (e.lead_s != null ? e.lead_s : 1.2) + n * (e.step_s != null ? e.step_s : 1);
    if (s && need > s.hold + EPS) add('card-budget', `${name(e)} reveals its answers over ${need.toFixed(1)} s but the silent hold after its sentence is ${s.hold.toFixed(1)} s; lengthen hold_s`);
  }

  // ---- one-text-channel
  if (tl.CAP.length) add('one-text-channel', `${tl.CAP.length} caption(s) are burned in (tl.cap); in pedagogy v2 the screen carries one keyword line (kw) and the full text ships as .srt/.vtt`);
  const kws = EL.filter((e) => e.type === 'kw');
  for (const e of kws) {
    if (!e.at) add('one-text-channel', `kw "${String(e.text).slice(0, 30)}" has no at: 'sent:<id>'; a keyword shows while its sentence is spoken`);
    else if (typeof e.text !== 'string' || !e.text.trim()) add('one-text-channel', `${name(e)} needs a text string (one language, no EN/VI pair)`);
    else if (P.tokens(e.text) > B.kwWords) add('one-text-channel', `kw "${e.text}" has ${P.tokens(e.text)} words; at most ${B.kwWords} (keep the number or the term the voice is saying)`);
    else if (sentences.some((s) => norm(s.text) === norm(e.text))) add('one-text-channel', `kw "${e.text}" repeats a full voice sentence; the sentence belongs in the .srt/.vtt, the screen keeps its keyword`);
  }
  const ks = kws.filter((e) => e.t1 > e.t0).sort((a, b) => a.t0 - b.t0);
  for (let i = 1; i < ks.length; i++) if (ks[i - 1].t1 > ks[i].t0 + EPS) add('one-text-channel', `kw "${ks[i - 1].text}" is still on screen (until ${ks[i - 1].t1.toFixed(2)} s) when "${ks[i].text}" starts at ${ks[i].t0.toFixed(2)} s; one text channel at a time`);

  // ---- predict-count
  const preds = EL.filter((e) => e.type === 'predict');
  const short = cfg.duration < B.predictMinFilmS;
  if (cfg.predictMin != null && cfg.predictMin < B.predictMin && !short) add('predict-count', `predictMin ${cfg.predictMin} is below ${B.predictMin}; only a film shorter than ${B.predictMinFilmS} s may lower it`);
  const need = cfg.predictMin == null ? B.predictMin : short ? cfg.predictMin : Math.max(cfg.predictMin, B.predictMin);
  if (preds.length < need) add('predict-count', `${preds.length} predict beat(s); this film needs at least ${need} (element predict, bound to the sentence that asks)`);
  for (const e of preds) {
    const [lo, hi] = B.predictHoldS;
    if (!e.at) { add('predict-count', `predict "${String(e.question).slice(0, 30)}" has no at: 'sent:<id>'`); continue; }
    if (!(e.hold_s >= lo && e.hold_s <= hi)) add('predict-count', `${name(e)} holds ${e.hold_s} s; the silent hold is ${lo} to ${hi} s`);
    if (P.tokens(e.question || '') > B.predictQuestionWords || !e.question) add('predict-count', `${name(e)} question has ${P.tokens(e.question || '')} words; one to ${B.predictQuestionWords}`);
    const voiced = sentences.filter((s) => s.t0 < e.h1 - EPS && s.t1 > e.h0 + EPS);
    if (voiced.length) add('predict-count', `${name(e)} has voice inside its hold (${voiced.map((s) => s.id).join(', ')}); the hold is silent`);
    const asked = SENT[String(e.at).replace(P.SENT_REF, '$1')];
    if (asked && !sentences.some((s) => s.seg === asked.seg && s.i === asked.i + 1)) add('predict-count', `${name(e)} has no sentence after it in its chapter to reveal the answer`);
  }

  // ---- chapter-length
  for (const c of tl.CH.filter((x) => x.num > 0)) {
    const len = c.t1 - c.t0;
    if (len < B.chapterS[0] - EPS || len > B.chapterS[1] + EPS) add('chapter-length', `chapter "${c.id}" runs ${len.toFixed(1)} s; chapters run ${B.chapterS[0]} to ${B.chapterS[1]} s (split it or merge it)`);
  }

  // ---- glossary-present
  const gloss = EL.filter((e) => e.type === 'glossary');
  if (!gloss.length) add('glossary-present', 'no glossary element; open with 4 to 6 terms, each with a one-line definition (the viewer is a newcomer)');
  for (const g of gloss) {
    const n = (g.items || []).length, [lo, hi] = B.glossaryTerms;
    if (n < lo || n > hi) add('glossary-present', `${name(g)} has ${n} terms; a glossary has ${lo} to ${hi}`);
    for (const [term, def] of g.items || []) if (P.tokens(def || '') > B.glossaryDefWords || !def) add('glossary-present', `glossary term "${term}" has a ${P.tokens(def || '')}-word definition; one line, at most ${B.glossaryDefWords} words`);
  }

  // ---- subtitles-present
  const noEn = sentences.filter((s) => !String(s.text_en || '').trim()).map((s) => s.id);
  if (noEn.length) add('subtitles-present', `sentence(s) ${noEn.slice(0, 5).join(', ')}${noEn.length > 5 ? ` and ${noEn.length - 5} more` : ''} have no text_en; every sentence needs its English line for the .srt/.vtt`);
  const rendered = ['landscape', 'portrait'].filter((a) => fs.existsSync(path.join(dir, 'out', `${cfg.output}-${a}.mp4`)));
  if (rendered.length && !noEn.length && !sentences.some((s) => s.est)) {
    const sub = await kitFile('make-subtitles.mjs');
    const project = { dir, cfg };
    const lacking = Object.keys(sub.LANGS).flatMap((l) => sub.subtitlePaths(project, l)).filter((f) => !fs.existsSync(f)).map((f) => path.relative(dir, f));
    if (lacking.length) add('subtitles-present', `out/ has a rendered MP4 but is missing ${lacking.join(', ')}; run node promo/_tutorial-kit/make-subtitles.mjs --project ${path.relative(process.cwd(), dir) || '.'}`);
    else {
      for (const l of Object.keys(sub.LANGS)) {
        const want = sub.buildCues(SENT, l);
        for (const f of sub.subtitlePaths(project, l)) {
          let got;
          try { got = sub.parseCues(fs.readFileSync(f, 'utf8')); } catch (e) { add('subtitles-present', `${path.relative(dir, f)} is not valid: ${e.message}`); continue; }
          const rel = path.relative(dir, f), bad = (m) => add('subtitles-present', `${rel}: ${m}; regenerate it with make-subtitles.mjs`);
          if (got.length !== want.length) { bad(`${got.length} cues but the script has ${want.length} sentences`); continue; }
          got.forEach((c, i) => {
            if (c.text !== want[i].text) bad(`cue ${i + 1} text differs from sentence "${want[i].id}"`);
            else if (Math.abs(c.t0 - want[i].t0) > 0.002 || Math.abs(c.t1 - want[i].t1) > 0.002) bad(`cue ${i + 1} is timed ${c.t0.toFixed(3)} to ${c.t1.toFixed(3)} s but sentence "${want[i].id}" plays ${want[i].t0.toFixed(3)} to ${want[i].t1.toFixed(3)} s`);
            if (!(c.t1 > c.t0) || (i && c.t0 < got[i - 1].t1 - 0.0015)) bad(`cue ${i + 1} is not monotonic (starts ${c.t0.toFixed(3)} s, previous ends ${i ? got[i - 1].t1.toFixed(3) : '0'} s)`);
          });
        }
      }
    }
  }

  // ---- terms-defined
  const terms = cfg.glossary || [];
  if (terms.length && gloss.length) {
    const defined = (term) => Math.min(...gloss.flatMap((g) => (g.items || []).map(([t], i) => [t, g.itemT && g.itemT[i] != null ? g.itemT[i] : g.t0 + 0.3 + i * (tl.DOS.B || 0.5)]).filter(([t]) => norm(t) === norm(term)).map(([, at]) => at)));
    const uses = [...sentences.map((s) => [s.t0, s.text, `sentence ${s.id}`]), ...EL.filter((e) => e.type !== 'glossary').flatMap((e) => {
      const texts = e.type === 'kw' ? [e.text] : e.type === 'predict' ? [e.question] : e.type === 'recap' ? (e.cues || []).flat() : (P.cardRows(e) || []).map((r) => r.text);
      return texts.map((t) => [e.t0, t, name(e)]);
    })];
    for (const term of terms) {
      const at = defined(term);
      if (!Number.isFinite(at)) { add('terms-defined', `term "${term}" is in config glossary but no glossary element defines it`); continue; }
      const first = uses.filter(([, text]) => reFor(term).test(norm(text || ''))).sort((a, b) => a[0] - b[0])[0];
      if (first && first[0] < at - EPS) add('terms-defined', `term "${term}" is used at ${first[0].toFixed(1)} s (${first[2]}) before the glossary defines it at ${at.toFixed(1)} s`);
    }
  }
  return out;
}
