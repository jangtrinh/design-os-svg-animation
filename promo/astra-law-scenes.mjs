import { BEATS, beatOpacity, clamp, ease } from './astra-law-timeline.mjs';

function randomGenerator(seed) {
  let state = seed;
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
}

function createGalaxy() {
  const root = document.getElementById('spiral-stars');
  const random = randomGenerator(20260917);
  const stars = [];
  for (let index = 0; index < 1500; index++) {
    const field = index >= 1200;
    const core = index < 420;
    const radius = core ? Math.sqrt(random()) * 205 : Math.pow(random(), 0.75) * 600;
    const angle = core ? random() * Math.PI * 2 : radius * 0.018 + (index % 3) * Math.PI * 2 / 3 + (random() - 0.5) * 1.25;
    const scatter = core ? 18 : 95;
    const x = field ? random() * 1920 : 960 + Math.cos(angle) * radius + (random() - 0.5) * scatter;
    const y = field ? random() * 1080 : 555 + Math.sin(angle) * radius * 1.12 + (random() - 0.5) * scatter;
    const streak = !field && index % 5 === 0;
    const width = streak ? 2 + random() * 9 : 0.7 + random() * (index % 43 === 0 ? 4 : 1.8);
    const dot = document.createElement('i');
    dot.className = 'star';
    dot.style.width = `${width}px`;
    dot.style.height = `${streak ? 0.8 + random() * 1.6 : width}px`;
    root.append(dot);
    stars.push({ dot, x, y, rotation: Math.atan2(y - 555, x - 960) * 180 / Math.PI + 90, brightness: field ? 0.15 + random() * 0.55 : 0.2 + random() * 0.8 });
  }
  return stars;
}

function createPartnerOrbit() {
  const root = document.getElementById('partner-orbit');
  const labels = ['LECG', 'LegalQuants', 'Skills.law', 'Harvey', 'Legora', 'iManage', 'Intapp', 'DeepJudge', 'HighQ', 'Clio', 'Relativity', 'Box', 'Trellis', 'CourtListener', 'CoCounsel', 'Thomson Reuters', 'Microsoft Word', 'Latham & Watkins', 'Sullivan & Cromwell', 'Cooley', 'Skadden', 'Ropes & Gray'];
  return labels.map((label, index) => {
    const tile = document.createElement('span');
    tile.className = 'partner-tile';
    tile.textContent = label;
    if (label.length > 15) tile.style.fontSize = '14px';
    root.append(tile);
    return { tile, index };
  });
}

function splitComposerText() {
  const target = document.getElementById('composer-text');
  const text = target.textContent;
  target.textContent = '';
  target.style.whiteSpace = 'pre-wrap';
  return Array.from(text, character => {
    const span = document.createElement('span');
    span.textContent = character;
    span.style.opacity = '0';
    target.append(span);
    return span;
  });
}

export function createSceneRenderer(renderIR) {
  const galaxy = createGalaxy();
  const partners = createPartnerOrbit();
  const composerChars = splitComposerText();
  const scenes = BEATS.map(beat => ({ ...beat, element: document.getElementById(beat.id) }));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const thinking = [...document.querySelectorAll('.thinking-lines>div')];
  const response = document.getElementById('response-text');
  const firmTiles = [...document.querySelectorAll('.firm-tiles>div')];
  const firmRow = document.querySelector('.firm-tiles');

  return function render(time) {
    const still = reduced.matches;
    for (const beat of scenes) {
      const visible = still ? Number(time >= beat.start && (time < beat.end || beat.end === 77.594)) : beatOpacity(beat, time);
      beat.element.style.opacity = visible.toFixed(4);
      beat.element.style.visibility = visible > 0 ? 'visible' : 'hidden';
      if (visible > 0) {
        const heading = beat.element.querySelector('h1');
        if (heading) {
          const arrival = still || beat.start === 0 ? 1 : ease((time - beat.start) / 0.7);
          heading.style.transform = `translate(-50%,-50%) translate3d(0,${((1 - arrival) * 28).toFixed(2)}px,0)`;
          heading.style.opacity = arrival.toFixed(4);
        }
      }
    }

    renderIR(time);
    if (time >= 7.2 && time <= 10.1) {
      const drift = still ? 0 : (time - 7.3) * 0.045;
      for (const star of galaxy) {
        const dx = star.x - 960;
        const dy = star.y - 545;
        const x = 960 + dx * Math.cos(drift) - dy * Math.sin(drift);
        const y = 545 + dx * Math.sin(drift) + dy * Math.cos(drift);
        star.dot.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${star.rotation.toFixed(1)}deg)`;
        star.dot.style.opacity = star.brightness.toFixed(3);
      }
    }

    const characterCount = still ? composerChars.length : Math.floor(clamp((time - 18.15) / 3.9) * composerChars.length);
    if (time >= 17.2 && time < 24) composerChars.forEach((span, index) => { span.style.opacity = index < characterCount ? '1' : '0'; });
    thinking.forEach((line, index) => { line.style.opacity = still || time > 24.3 + index * 0.75 ? '0.65' : '0'; });
    response.style.opacity = still ? '1' : ease((time - 29.3) / 2.2).toFixed(3);
    if (time >= 12.5 && time <= 18) {
      const shift = still ? 0 : 750 - 1200 * ease((time - 14.2) / 3.5);
      firmRow.style.transform = `translateX(calc(-50% + ${shift.toFixed(2)}px))`;
      firmTiles.forEach((tile, index) => { tile.style.opacity = still || time > 14.0 + index * 0.45 ? '1' : '0'; });
    }
    document.getElementById('skill-count').textContent = time < 50.8 && !still ? '35+' : '40+';

    if (time >= 41.2 && time <= 49) {
      const expand = still ? 1 : ease((time - 42.6) / 2.0);
      for (const partner of partners) {
        const angle = partner.index * (Math.PI * 2 / partners.length) - Math.PI / 2;
        const x = 960 + Math.cos(angle) * 780 * expand;
        const y = 540 + Math.sin(angle) * 405 * expand;
        partner.tile.style.transform = `translate3d(${(x - 32).toFixed(2)}px,${(y - 32).toFixed(2)}px,0) scale(${(0.7 + 0.3 * expand).toFixed(3)})`;
        partner.tile.style.opacity = expand.toFixed(3);
      }
    }
    const word = document.querySelector('.word-window');
    if (time >= 35.5 && time <= 42) word.style.transform = `scale(${(0.94 + 0.06 * (still ? 1 : ease((time - 35.65) / 1.2))).toFixed(4)})`;
    const outro = document.querySelector('#outro-scene img');
    if (time >= 74.7) outro.style.transform = `translate(-50%,-50%) scale(${(still ? 1 : 0.25 + 0.75 * ease((time - 74.9) / 1.0)).toFixed(4)})`;
  };
}
