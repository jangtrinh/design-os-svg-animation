/**
 * hyperframes-engine.mjs — Design OS HyperFrames Beat & Motion Draft Engine
 * 
 * Declarative motion staging and draft engine for Design OS.
 * Provides a declarative, pause-and-seek GSAP motion drafting architecture
 * with 20 atomic motion beat kinds, strict black-and-white / high-contrast
 * reduction, and zero-defect anti-flop compliance.
 */

import { EXTRA_BEAT_KINDS } from './hyperframes-extra-beats.mjs';
export { sampleHyperFrameProgress, sampleHyperFrameStagger, sampleHyperFrameCarry,
  sampleHyperFramePulse, sampleHyperFrameKeyframes } from './hyperframes-motion-presets.mjs';

const W = 640, H = 360;

function el(parent, css, text) {
  const node = document.createElement('div');
  node.style.cssText = 'position:absolute;' + css;
  if (text !== undefined) node.textContent = text;
  parent.append(node);
  return node;
}

const center = 'left:50%;top:50%;transform:translate(-50%,-50%);';
const fontFor = (text) => (text.length < 8 ? 84 : text.length < 16 ? 50 : text.length < 28 ? 36 : 28);

const bars = (parent, count, css, color) =>
  Array.from({ length: count }, (_, i) =>
    el(parent, `left:0;top:${i * 18}px;height:8px;border-radius:4px;width:${[100, 82, 64, 90, 70][i % 5]}%;background:${color};`)
  ).map((bar) => ((bar.style.position = 'absolute'), bar));

function drift(tl, target, span, amount = 0.04) {
  if (typeof gsap !== 'undefined') {
    tl.fromTo(target, { scale: 1 }, { scale: 1 + amount, duration: span, ease: 'none' }, 0);
  }
}

function words(parent, text, size, c, css = '', weight = size >= 64 ? 700 : 500) {
  const row = el(
    parent,
    `${center}width:580px;display:flex;flex-wrap:wrap;justify-content:center;gap:0 .26em;font-size:${size}px;line-height:1.1;font-weight:${weight};letter-spacing:${
      size >= 64 ? '-.03em' : '0'
    };text-align:center;${css}`
  );
  for (const word of text.split(' ')) {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.display = 'inline-block';
    row.append(span);
  }
  return row;
}

const placed = (o) => (o.x !== undefined || o.y !== undefined ? `left:${(o.x ?? 0.5) * W}px;top:${(o.y ?? 0.5) * H}px;` : '');

export const BEAT_KINDS = {
  text(b, t, o, c, tl, span) {
    const row = words(b, t, o.size || fontFor(t), c, placed(o), o.weight);
    tl.from(row.children, { y: 24, opacity: 0, stagger: 0.09, duration: 0.45, ease: 'power3.out' }, 0);
    drift(tl, row, span);
  },

  logo(b, t, o, c, tl, span) {
    const group = el(b, `${center}display:flex;align-items:center;gap:18px;white-space:nowrap`);
    const mark = o.mark
      ? el(group, `position:relative;font-size:${o.markSize || 56}px;line-height:1;font-weight:700`, o.mark)
      : el(group, `position:relative;width:48px;height:48px;border-radius:12px;background:${c.fg};flex:none`);
    const word = el(group, `position:relative;font-size:${o.size || (t.length > 10 ? 36 : 48)}px;font-weight:700;letter-spacing:-.02em`, t);
    tl.from(mark, { scale: 0, rotation: -40, duration: 0.55, ease: 'back.out(1.8)' }, 0);
    tl.fromTo(word, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power2.out' }, 0.3);
    if (o.sub) {
      const sub = el(b, `left:0;right:0;top:${H / 2 + 50}px;text-align:center;font-size:18px;color:${c.muted}`, o.sub);
      tl.from(sub, { opacity: 0, y: 8, duration: 0.4 }, 0.8);
    }
    drift(tl, group, span, 0.03);
  },

  input(b, t, o, c, tl, span) {
    if (o.h) {
      const title = el(b, `left:0;right:0;top:64px;text-align:center;font-size:32px;font-weight:700`, o.h);
      tl.from(title, { opacity: 0, y: 12, duration: 0.4 }, 0);
    }
    const box = el(b, `left:100px;top:130px;width:440px;height:100px;border-radius:18px;border:2px solid ${c.line};background:${c.card}`);
    const typed = el(box, `left:22px;top:20px;right:60px;font-size:20px;white-space:nowrap;overflow:hidden`, t);
    el(box, `left:22px;bottom:16px;font-size:22px;color:${c.muted}`, '+');
    const send = el(box, `right:16px;bottom:14px;width:30px;height:30px;border-radius:50%;background:${c.accent}`);
    tl.from(box, { opacity: 0, y: 20, duration: 0.4, ease: 'power2.out' }, 0.1);
    tl.fromTo(typed, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: Math.min(1.6, span * 0.5), ease: `steps(${Math.max(4, t.length)})` }, 0.4);
    tl.to(send, { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1 }, Math.min(2.1, span * 0.7));
  },

  chat(b, t, o, c, tl, span) {
    const bubble = el(b, `right:70px;top:70px;max-width:360px;padding:16px 20px;border-radius:18px 18px 4px 18px;background:${c.accent};color:${c.onAccent};font-size:20px;line-height:1.3`, t);
    const reply = el(b, 'left:70px;top:200px;width:380px;height:80px');
    el(reply, `left:0;top:0;width:34px;height:34px;border-radius:50%;background:${c.muted}`);
    const lines = el(reply, 'left:50px;top:6px;right:0;height:60px');
    const rows = bars(lines, 3, '', c.line);
    tl.from(bubble, { opacity: 0, y: 16, scale: 0.95, duration: 0.4, ease: 'power2.out' }, 0.1);
    tl.from(reply, { opacity: 0, duration: 0.3 }, 0.7);
    tl.from(rows, { width: 0, stagger: 0.15, duration: 0.5 }, 0.8);
  },

  window(b, t, o, c, tl, span) {
    const win = el(b, `left:90px;top:44px;width:460px;height:272px;border-radius:14px;border:2px solid ${c.line};background:${c.card};overflow:hidden`);
    [0, 1, 2].forEach((i) => el(win, `left:${14 + i * 14}px;top:12px;width:8px;height:8px;border-radius:50%;background:${c.line}`));
    el(win, 'left:0;right:0;top:32px;height:2px;background:' + c.line);
    const side = el(win, `left:14px;top:48px;width:70px;bottom:14px`);
    bars(side, 6, '', c.line);
    const title = el(win, `left:100px;top:46px;right:16px;font-size:${t.length > 24 ? 16 : 20}px;font-weight:700;white-space:nowrap;overflow:hidden`, t);
    const tiles = [0, 1, 2].map((i) => el(win, `left:${100 + i * 116}px;top:86px;width:104px;height:60px;border-radius:8px;background:${c.fill};border:1.5px solid ${c.line}`));
    const block = el(win, `left:100px;top:160px;right:16px;bottom:16px;border-radius:8px;background:${c.fill};border:1.5px solid ${c.line}`);
    const pointer = el(b, `left:470px;top:300px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:20px solid ${c.fg};transform:rotate(-25deg)`);
    tl.from(win, { opacity: 0, y: 30, scale: 0.95, duration: 0.5, ease: 'power3.out' }, 0);
    tl.from([title, ...tiles, block], { opacity: 0, y: 8, stagger: 0.08, duration: 0.3 }, 0.35);
    tl.fromTo(pointer, { x: 0, y: 0 }, { x: -260, y: -150, duration: span * 0.8, ease: 'sine.inOut' }, 0.3);
  },

  phone(b, t, o, c, tl, span) {
    const stacked = o.stack && t;
    const phone = el(b, `left:${stacked || !t ? 245 : 110}px;top:${stacked ? 96 : 34}px;width:150px;height:292px;border-radius:28px;border:3px solid ${c.fg};background:${c.card};overflow:hidden`);
    el(phone, `left:50px;top:10px;width:44px;height:10px;border-radius:5px;background:${c.fg}`);
    const rows = [0, 1, 2, 3, 4].map((i) => el(phone, `left:12px;right:12px;top:${40 + i * 48}px;height:38px;border-radius:9px;background:${i === 1 ? c.fg : c.fill}`));
    tl.from(phone, { y: 80, opacity: 0, duration: 0.55, ease: 'power3.out' }, 0);
    tl.from(rows, { opacity: 0, x: -10, stagger: 0.08, duration: 0.3 }, 0.4);
    if (stacked) {
      const caption = words(b, t, 28, c, 'top:56px', 700);
      tl.from(caption.children, { opacity: 0, y: 10, stagger: 0.08, duration: 0.35 }, 0.2);
    } else if (t) {
      const caption = words(b, t, t.length > 20 ? 28 : 36, c, 'left:300px;transform:translateY(-50%);width:300px;justify-content:flex-start;text-align:left');
      tl.from(caption.children, { opacity: 0, y: 14, stagger: 0.08, duration: 0.35 }, 0.5);
    }
    drift(tl, phone, span, 0.03);
  },

  cards(b, t, o, c, tl, span) {
    const top = t ? 104 : 70;
    if (t) {
      const title = el(b, `left:0;right:0;top:40px;text-align:center;font-size:30px;font-weight:700`, t);
      tl.from(title, { opacity: 0, y: 10, duration: 0.4 }, 0);
    }
    const tiles = Array.from({ length: 6 }, (_, i) =>
      el(b, `left:${95 + (i % 3) * 154}px;top:${top + Math.floor(i / 3) * 112}px;width:142px;height:98px;border-radius:12px;background:${i % 2 ? c.card : c.fill};border:1.5px solid ${c.line}`)
    );
    tl.from(tiles, { scale: 0, opacity: 0, stagger: 0.07, duration: 0.4, ease: 'back.out(1.6)' }, 0.2);
    drift(tl, tiles, span, 0.03);
  },

  list(b, t, o, c, tl, span) {
    const items = t.split('|');
    const box = el(b, `left:110px;top:${180 - items.length * 30}px;width:420px`);
    items.forEach((item, i) => {
      const row = el(box, `left:0;top:${i * 60}px;right:0;height:44px;display:flex;align-items:center;gap:16px;font-size:22px;font-weight:600`);
      const dot = el(row, `position:relative;width:26px;height:26px;border-radius:50%;border:3px solid ${c.fg};flex:none`);
      row.append(item);
      tl.from(row, { opacity: 0, x: -16, duration: 0.35 }, 0.15 + i * 0.15);
      tl.to(dot, { backgroundColor: c.accent, borderColor: c.accent, duration: 0.2 }, 0.9 + i * Math.min(0.6, span / 6));
    });
  },

  chart(b, t, o, c, tl, span) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.style.cssText = 'position:absolute;left:0;top:0';
    const axis = document.createElementNS(svgNS, 'path');
    axis.setAttribute('d', 'M80 60 V300 H560');
    axis.setAttribute('stroke', c.line);
    axis.setAttribute('stroke-width', '3');
    axis.setAttribute('fill', 'none');
    const line = document.createElementNS(svgNS, 'path');
    line.setAttribute('d', 'M90 270 C170 250 200 200 260 210 S360 120 420 140 S500 80 550 70');
    line.setAttribute('stroke', c.accent);
    line.setAttribute('stroke-width', '6');
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-dasharray', '700');
    line.setAttribute('stroke-dashoffset', '700');
    svg.append(axis, line);
    b.append(svg);
    tl.to(line, { attr: { 'stroke-dashoffset': 0 }, duration: Math.min(2, span * 0.7), ease: 'power2.inOut' }, 0.2);
    if (t) {
      const tag = el(b, `left:380px;top:170px;padding:10px 18px;border-radius:12px;background:${c.card};border:2px solid ${c.line};font-size:24px;font-weight:700`, t);
      tl.from(tag, { opacity: 0, scale: 0.8, duration: 0.35 }, 0.9);
    }
  },

  notify(b, t, o, c, tl, span) {
    const pill = el(b, `left:110px;top:130px;width:420px;height:84px;border-radius:22px;background:${c.card};border:2px solid ${c.line};display:flex;align-items:center;gap:16px;padding:0 18px;box-sizing:border-box`);
    el(pill, `position:relative;width:46px;height:46px;border-radius:12px;background:${c.accent};flex:none`);
    el(pill, 'position:relative;font-size:20px;font-weight:700;white-space:nowrap;overflow:hidden', t);
    tl.from(pill, { y: -160, duration: 0.6, ease: 'back.out(1.3)' }, 0.1);
    drift(tl, pill, span, 0.03);
  },

  shape(b, t, o, c, tl, span) {
    const stage = el(b, `left:${t ? 150 : 250}px;top:110px;width:140px;height:140px;perspective:600px`);
    const tile = el(stage, `left:0;top:0;width:140px;height:140px;border-radius:32px;background:${c.fill};border:2px solid ${c.fg};overflow:hidden;box-sizing:border-box`);
    el(tile, `left:36px;top:36px;width:64px;height:64px;border-radius:16px;background:${c.fg}`);
    const shine = el(tile, `left:-80px;top:-20px;width:40px;height:200px;background:${c.bg};opacity:.35;transform:rotate(20deg)`);
    const shadow = el(b, `left:${t ? 160 : 260}px;top:278px;width:120px;height:8px;border-radius:50%;background:${c.line}`);
    tl.fromTo(tile, { y: -60, opacity: 0, rotationX: 50, rotationZ: -12 }, { y: 0, opacity: 1, rotationX: 0, rotationZ: 0, duration: 0.8, ease: 'back.out(1.4)' }, 0);
    tl.from(shadow, { scaleX: 0.3, opacity: 0, duration: 0.8, ease: 'power2.out' }, 0);
    tl.to(tile, { rotationY: 28, rotationX: -8, duration: Math.max(1, span - 0.8), ease: 'sine.inOut' }, 0.8);
    tl.fromTo(shine, { x: 0 }, { x: 260, duration: 1.1, ease: 'power2.inOut' }, 0.7);
    if (t) {
      const caption = words(b, t, 40, c, 'left:340px;transform:translateY(-50%);width:270px;justify-content:flex-start;text-align:left');
      tl.from(caption.children, { opacity: 0, y: 12, stagger: 0.08, duration: 0.35 }, 0.4);
    }
  },
  ...EXTRA_BEAT_KINDS
};

export const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) / 255;
};

export function colors(palette = {}, override = {}) {
  let dark = luminance(palette.bg || '#ffffff') < 0.5;
  if (override.bg === 'accent') dark = !dark;
  else if (override.bg) dark = luminance(override.bg) < 0.5;
  return dark
    ? { bg: '#000000', fg: '#ffffff', accent: '#ffffff', onAccent: '#000000', card: '#0d0d0d', line: '#3a3a3a', muted: '#8c8c8c', fill: '#262626' }
    : { bg: '#ffffff', fg: '#000000', accent: '#000000', onAccent: '#ffffff', card: '#ffffff', line: '#d0d0d0', muted: '#7a7a7a', fill: '#ececec' };
}

export function buildHyperFramesDraft(root, beats, duration, palette = {}, starts = beats.map((_, i) => (duration * i) / beats.length)) {
  if (beats.length !== starts.length || !Number.isFinite(duration) || duration <= 0
    || starts.some((start, index) => !Number.isFinite(start) || start < 0 || start >= duration || (index && start <= starts[index - 1]))) {
    throw new RangeError('HyperFrames draft requires increasing beat starts within its duration');
  }
  const unknown = beats.find(([kind]) => !Object.hasOwn(BEAT_KINDS, kind));
  if (unknown) throw new RangeError(`Unknown HyperFrames beat kind: ${unknown[0]}`);
  if (typeof gsap === 'undefined') throw new Error('HyperFrames draft requires GSAP');
  root.replaceChildren();
  const base = colors(palette);
  root.style.cssText += `;background:${base.bg};color:${base.fg};font-family:Inter,-apple-system,system-ui,sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased`;
  const tl = gsap.timeline({ paused: true });

  beats.forEach(([kind, text = '', options = {}], index) => {
    const begin = starts[index],
      span = (starts[index + 1] ?? duration) - begin;
    const c = colors(palette, options);
    const beat = el(root, `left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;background:${c.bg};color:${c.fg}`);
    const local = gsap.timeline();
    BEAT_KINDS[kind](beat, text, options, c, local, span);
    if (local.duration() < span) local.to({}, { duration: span - local.duration() });
    tl.add(local, begin);
    if (index) {
      gsap.set(beat, { autoAlpha: 0 });
      tl.set(beat, { autoAlpha: 1 }, begin);
    }
    if (index < beats.length - 1) tl.set(beat, { autoAlpha: 0 }, begin + span);
  });

  if (tl.duration() < duration) tl.to({}, { duration: duration - tl.duration() });
  return tl;
}
