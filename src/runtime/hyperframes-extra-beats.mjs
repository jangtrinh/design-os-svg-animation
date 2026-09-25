// Monochrome staging primitives. These are draft geometry, never brand assets.
const node = (parent, css, text) => {
  const element = document.createElement('div');
  element.style.cssText = `position:absolute;${css}`;
  if (text !== undefined) element.textContent = text;
  parent.append(element);
  return element;
};

const heading = (parent, text, color) => node(parent,
  `left:32px;top:25px;right:32px;color:${color};font-size:26px;font-weight:700;letter-spacing:-.03em`, text);

const grid = (parent, count, columns, box, gap, style) => Array.from({ length: count }, (_, index) => {
  const column = index % columns;
  const row = Math.floor(index / columns);
  return node(parent, `left:${box.x + column * gap.x}px;top:${box.y + row * gap.y}px;${style}`);
});

export const EXTRA_BEAT_KINDS = {
  icons(beat, text, options, color, timeline) {
    heading(beat, text, color.fg);
    const items = grid(beat, 6, 3, { x: 134, y: 108 }, { x: 145, y: 108 },
      `width:76px;height:76px;border:2px solid ${color.line};border-radius:18px;background:${color.fill}`);
    timeline.from(items, { y: 28, scale: 0.75, opacity: 0, stagger: 0.08, duration: 0.42, ease: 'power3.out' }, 0.12);
  },
  hub(beat, text, options, color, timeline) {
    heading(beat, text, color.fg);
    const core = node(beat, `left:280px;top:143px;width:80px;height:80px;border-radius:24px;background:${color.fg}`);
    const satellites = Array.from({ length: 8 }, (_, index) => {
      const angle = (index / 8) * Math.PI * 2;
      return node(beat, `left:${307 + Math.cos(angle) * 205}px;top:${170 + Math.sin(angle) * 108}px;width:26px;height:26px;border-radius:50%;background:${color.muted}`);
    });
    timeline.from(core, { scale: 0.3, opacity: 0, duration: 0.5, ease: 'back.out(1.4)' }, 0);
    timeline.from(satellites, { scale: 0.3, opacity: 0, stagger: 0.055, duration: 0.4, ease: 'power2.out' }, 0.23);
  },
  cloud(beat, text, options, color, timeline) {
    heading(beat, options.h || 'Community skills', color.fg);
    const labels = text.split('|').filter(Boolean).slice(0, 8);
    const chips = labels.map((label, index) => node(beat,
      `left:${50 + (index % 3) * 190}px;top:${102 + Math.floor(index / 3) * 72}px;padding:12px 14px;border:1px solid ${color.line};border-radius:12px;background:${color.card};color:${color.fg};font-size:15px;white-space:nowrap`, label));
    timeline.from(chips, { y: 26, scale: 0.9, opacity: 0, stagger: 0.09, duration: 0.48, ease: 'power2.out' }, 0.12);
  },
  collage(beat, text, options, color, timeline) {
    heading(beat, text, color.fg);
    const positions = [[55, 105], [238, 82], [470, 118], [92, 228], [310, 215], [495, 250]];
    const pieces = positions.map(([x, y], index) => node(beat,
      `left:${x}px;top:${y}px;width:${index % 2 ? 115 : 92}px;height:${index % 2 ? 68 : 92}px;border:2px solid ${color.line};border-radius:12px;background:${index % 2 ? color.card : color.fill}`));
    timeline.from(pieces, { y: 44, scale: 0.65, opacity: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out' }, 0.12);
  },
  logos(beat, text, options, color, timeline) {
    heading(beat, text, color.fg);
    const tiles = grid(beat, 12, 4, { x: 73, y: 92 }, { x: 135, y: 78 },
      `width:100px;height:57px;border:1px solid ${color.line};border-radius:12px;background:${color.card}`);
    timeline.from(tiles, { y: 20, scale: 0.7, opacity: 0, stagger: 0.045, duration: 0.36, ease: 'back.out(1.2)' }, 0.08);
  },
  burst(beat, text, options, color, timeline) {
    const points = Array.from({ length: 28 }, (_, index) => {
      const angle = (index / 28) * Math.PI * 2;
      return node(beat, `left:${316 + Math.cos(angle) * 142}px;top:${176 + Math.sin(angle) * 142}px;width:8px;height:8px;border-radius:50%;background:${color.fg}`);
    });
    if (text) heading(beat, text, color.fg);
    timeline.from(points, { x: index => (316 - Number.parseFloat(points[index].style.left)), y: index => (176 - Number.parseFloat(points[index].style.top)), scale: 0.1, opacity: 0, stagger: 0.012, duration: 0.7, ease: 'power3.out' }, 0.05);
  },
  grid(beat, text, options, color, timeline) {
    heading(beat, text, color.fg);
    const cells = grid(beat, 15, 5, { x: 52, y: 98 }, { x: 111, y: 77 },
      `width:89px;height:53px;border:1px solid ${color.line};border-radius:8px;background:${color.fill}`);
    timeline.from(cells, { y: 16, opacity: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out' }, 0.12);
  },
  split(beat, text, options, color, timeline) {
    heading(beat, text, color.fg);
    const left = node(beat, `left:44px;top:88px;width:250px;height:238px;border:2px solid ${color.line};border-radius:13px;background:${color.card}`);
    const right = node(beat, `left:310px;top:88px;width:286px;height:238px;border:2px solid ${color.line};border-radius:13px;background:${color.fill}`);
    timeline.from(left, { x: -75, opacity: 0, duration: 0.55, ease: 'power3.out' }, 0);
    timeline.from(right, { x: 75, opacity: 0, duration: 0.55, ease: 'power3.out' }, 0.16);
  },
  face(beat, text, options, color, timeline) {
    heading(beat, text, color.fg);
    const portrait = node(beat, `left:244px;top:78px;width:152px;height:224px;border:2px solid ${color.line};border-radius:76px 76px 24px 24px;background:${color.fill}`);
    timeline.from(portrait, { y: 45, scale: 0.82, opacity: 0, duration: 0.62, ease: 'power3.out' }, 0.08);
  }
};
