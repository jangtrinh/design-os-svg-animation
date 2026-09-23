import { BEATS, beatOpacity, cameraAt, clamp, mix, progress, randomGenerator } from './astra-law-timeline.mjs';
function createGalaxy() {
  const root = document.getElementById('spiral-stars');
  const random = randomGenerator(20260917);
  const stars = [];
  for (let index = 0; index < 2700; index++) {
    const field = index >= 2540;
    const radius = 22 + Math.pow(random(), 1.1) * 470;
    const arm = index % 3;
    const angle = arm * Math.PI * 2 / 3 + radius * 0.0128 + (random() - 0.5) * 0.27;
    const burstAngle = (index % 2 ? Math.PI / 2 : -Math.PI / 2) + (random() - 0.5) * 1.55;
    const burstRadius = 75 + random() * 640;
    const x = field ? random() * 1920 : 960 + Math.cos(angle) * radius * 0.72;
    const y = field ? random() * 1080 : 540 + Math.sin(angle) * radius * 0.97;
    const dot = document.createElement('i');
    dot.className = 'star';
    dot.style.width = (field ? 1.6 : 1.5 + random() * 3.7) + 'px';
    root.append(dot);
    stars.push({ dot, x, y, field, burstAngle, burstRadius,
      brightness: field ? 0.14 + random() * 0.55 : 0.7 + random() * 0.3 });
  }
  return stars;
}
function createPartnerOrbit() {
  const root = document.getElementById('partner-orbit');
  const labels = ['', 'LECG', 'LegalQuants', 'Skills.law', 'Harvey', 'Legora', 'iManage', 'Intapp', 'DeepJudge', 'HighQ', 'Clio', 'Relativity', 'Box', 'Trellis', 'CourtListener', 'CoCounsel', 'Thomson Reuters', 'Microsoft Word', 'Latham & Watkins', 'Sullivan & Cromwell', 'Cooley', 'Skadden', 'Ropes & Gray', '', '', '', '', '', ''];
  return labels.map((label, index) => {
    const tile = document.createElement('span');
    tile.className = 'partner-tile';
    tile.textContent = label;
    if (!label) tile.classList.add(index ? 'orbit-neutral' : 'partner-placeholder');
    if (!label && index) { const icon = document.createElement('img'); icon.src = 'astra-law-icons/' + ['scales', 'briefcase', 'eye', 'wrench', 'chart-line-up', 'file-xls'][(index - 23) % 6] + '.svg'; icon.alt = ''; tile.append(icon); }
    if (label.length > 14) tile.style.fontSize = '8px';
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
  const toolLines = [...document.querySelectorAll('#tool-status-scene .thinking-lines>div')];
  const firmTiles = [...document.querySelectorAll('.firm-tiles>div')];
  const skillTiles = [...document.querySelectorAll('.skill-cloud>span')];
  const closingArt = [...document.querySelectorAll('.closing-artifacts img')];
  const earlyText = document.getElementById('early-response-text');
  const earlyCopy = earlyText.textContent;
  return function render(time) {
    const still = reduced.matches;
    for (const beat of scenes) {
      const visible = still ? Number(time >= beat.start && (time < beat.end || beat.end === 77.594)) : beatOpacity(beat, time);
      beat.element.style.opacity = visible.toFixed(4);
      beat.element.style.visibility = visible > 0 ? 'visible' : 'hidden';
      if (visible > 0) {
        const heading = beat.element.querySelector('h1');
        if (heading) {
          const arrival = still || beat.start === 0 ? 1 : progress(time, beat.start, beat.start + (beat.id === 'earned-scene' ? 0.18 : 0.55));
          heading.style.transform = 'translate(' + (beat.id === 'skills-scene' || beat.id === 'earned-scene' ? '0' : '-50%') + ',-50%) translate3d(0,' + ((1 - arrival) * 12).toFixed(2) + 'px,0)';
          heading.style.opacity = arrival.toFixed(4);
        }
      }
    }
    renderIR(time);
    const introColor = time < 0.94 ? '#f6ced8' : time < 1.72 ? '#03b74c' : '#0385fd';
    document.querySelector('#intro-title span').style.color = introColor;
    document.getElementById('frontier-title').innerHTML = still || time >= 3.35 ? 'Frontier intelligence for<br>professional legal work' : 'Frontier intelligence';
    const prefix = document.getElementById('method-prefix');
    const keyword = document.getElementById('method-keyword');
    if (still || time >= 12.72) {
      prefix.textContent = 'Build your ';
      keyword.textContent = 'methods';
      keyword.style.color = '#eeb4c8';
    } else if (time >= 11.38) {
      prefix.textContent = 'Build your ';
      keyword.textContent = 'knowledge';
      keyword.style.color = '#d3b7ec';
    } else {
      prefix.textContent = 'Build'.slice(0, Math.max(1, Math.floor(clamp((time - 10.66) / 0.46) * 5)));
      keyword.textContent = '';
    }
    document.getElementById('firm-title').textContent = still || time >= 14.76 ? 'Into ChatGPT for Your Firm' : 'Into ChatGPT';
    const toolHeading = document.querySelector('#tools-scene h1');
    toolHeading.innerHTML = still || time >= 44.02
      ? 'Access the legal tools<br>you know and trust'
      : time >= 43.24 ? 'Access the legal tools' : 'Access the';
    toolHeading.style.left = (still ? 50 : mix(34, 50, progress(time, 42.8, 44.02))).toFixed(2) + '%';
    if (time >= 7.38 && time <= 10.65) {
      const burst = still ? 1 : progress(time, 7.48, 8.08);
      const spiral = still ? 1 : progress(time, 7.95, 8.9);
      const drift = still ? 0 : (time - 9.1) * 0.05;
      for (const star of galaxy) {
        const bx = 960 + Math.cos(star.burstAngle) * star.burstRadius * burst;
        const by = 540 + Math.sin(star.burstAngle) * star.burstRadius * burst;
        const dx = star.x - 960, dy = star.y - 540;
        const sx = 960 + dx * Math.cos(drift) - dy * Math.sin(drift);
        const sy = 540 + dx * Math.sin(drift) + dy * Math.cos(drift);
        const x = star.field ? star.x : mix(bx, sx, spiral);
        const y = star.field ? star.y : mix(by, sy, spiral);
        const length = star.field ? 1 : mix(14, 1, spiral);
        const rotation = star.field ? 0 : star.burstAngle * 180 / Math.PI;
        star.dot.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + rotation.toFixed(2) + 'deg) scaleX(' + length.toFixed(2) + ')';
        star.dot.style.opacity = (star.brightness * (star.field ? 1 : mix(0.75, 1, spiral))).toFixed(3);
      }
    }
    const chars = still ? composerChars.length : Math.floor(clamp((time - 19.32) / 5.1) * composerChars.length);
    composerChars.forEach((span, index) => { span.style.opacity = index < chars ? '1' : '0'; });
    document.getElementById('composer-text').dataset.placeholder = chars === 0 ? 'Work on anything' : '';
    const [scale, cameraX, cameraY] = still ? [1, 0, 0] : cameraAt(time);
    document.getElementById('composer-camera').style.transform = 'translate3d(' + cameraX.toFixed(1) + 'px,' + cameraY.toFixed(1) + 'px,0) scale(' + scale.toFixed(4) + ')';
    const composerCard = document.querySelector('#composer-scene .composer-card');
    composerCard.style.boxShadow = scale > 2 ? 'none' : '';
    composerCard.style.borderTopColor = scale > 2 ? 'transparent' : '';
    const early = document.querySelector('.early-response');
    const late = document.querySelector('.response-column');
    early.style.opacity = still ? '0' : (1 - progress(time, 32.9, 33.45)).toFixed(3);
    earlyText.textContent = still ? earlyCopy : earlyCopy.slice(0, Math.floor(clamp((time - 27.55) / 1.44) * earlyCopy.length));
    late.style.opacity = still ? '1' : progress(time, 33.1, 33.7).toFixed(3);
    document.getElementById('response-text').style.opacity = still ? '1' : progress(time, 33.85, 34.9).toFixed(3);
    document.querySelectorAll('.response-column p:nth-of-type(n+4),.response-column .file-card').forEach(element => { element.style.display = still || time >= 35.5 ? '' : 'none'; });
    toolLines.forEach((line, index) => {
      line.style.opacity = still || time >= 30.45 + index * 0.18 ? '0.78' : '0';
    });
    const shift = still ? -450 : 750 - 1200 * progress(time, 14.15, 17.65);
    document.querySelector('.firm-tiles').style.transform = 'translateX(calc(-50% + ' + shift.toFixed(2) + 'px))';
    firmTiles.forEach((tile, index) => {
      tile.style.opacity = still || time >= 14.7 + index * 0.13 ? '1' : '0';
    });
    for (const partner of partners) {
      const angle = -0.08 + partner.index * Math.PI * 2 / partners.length;
      const appearance = still ? 1 : progress(time, 44.84 + partner.index * 0.082, 45.24 + partner.index * 0.082);
      const x = 960 + Math.cos(angle) * mix(665, 760, appearance);
      const y = 540 + Math.sin(angle) * mix(345, 400, appearance);
      partner.tile.style.transform = 'translate3d(' + (x - 42).toFixed(2) + 'px,' + (y - 42).toFixed(2) + 'px,0) scale(' + mix(0.35, 1, appearance).toFixed(3) + ')';
      partner.tile.style.opacity = appearance.toFixed(3);
    }
    const skillCount = still || time >= 52 ? 40 : time < 50.45 ? 27 : time < 51 ? Math.round(mix(27, 36, progress(time, 50.45, 51))) : Math.round(mix(36, 40, progress(time, 51, 52)));
    document.getElementById('skill-count').textContent = skillCount + '+';
    const skillPhrase = document.getElementById('skill-phrase'); skillPhrase.style.display = still || time >= 50.45 ? 'inline' : 'none';
    skillPhrase.style.opacity = still || time >= 50.45 ? '1' : '0';
    document.querySelector('#skills-scene h1').style.top = !still && time < 50.45 ? '43%' : '50%';
    document.querySelector('#skills-scene h1').style.left = !still && time < 50.45 ? '25.4%' : '24.5%';
    document.getElementById('skill-suffix').textContent = still || time >= 51.4 ? 'by the community' : 'by';
    skillTiles.forEach((tile, index) => {
      const starts = [49.4, 49.55, 51.2, 50.25, 50.45, 50.55, 51.25, 50.4, 49.5, 51.3, 50.65, 50.75];
      const amount = still ? 1 : progress(time, starts[index], starts[index] + 0.46);
      const entry = { 0: [132, -154], 1: [144, -70], 8: [104, -205] }[index] || [0, 0];
      const slide = still ? 0 : 1 - progress(time, 50, 51);
      tile.style.opacity = amount.toFixed(3);
      tile.style.transform = 'translate3d(' + (entry[0] * slide).toFixed(1) + 'px,' + (entry[1] * slide + (1 - amount) * 16).toFixed(1) + 'px,0) scale(' + mix(0.84, 1, amount).toFixed(3) + ')';
    });
    const first = 'Your data stays private.';
    const second = 'Zero data retention.';
    document.getElementById('privacy-first').textContent = still ? first : first.slice(0, Math.floor(clamp((time - 58.05) / 1.9) * first.length));
    const secondText = still ? second : second.slice(0, Math.floor(clamp((time - 60.35) / 0.72) * second.length));
    document.getElementById('privacy-second').textContent = secondText;
    document.getElementById('privacy-break').style.display = secondText ? '' : 'none';
    document.getElementById('privacy-caret').style.opacity = still || time > 61.18 ? '0' : '1';
    const earnedHeading = document.querySelector('#earned-scene h1');
    earnedHeading.innerHTML = still || time >= 68.1 ? 'So you can maintain the<br>trust you’ve earned <span class="document-check"><img src="astra-law-icons/file-doc.svg" alt=""><img src="astra-law-icons/check-circle.svg" alt=""></span>' : time >= 67.0 ? 'So you can maintain the<br>trust' : 'So you';
    earnedHeading.style.top = time < 67 ? '43%' : '50%';
    const ambition = document.getElementById('ambition-word');
    ambition.textContent = still || time < 71.18 ? 'ambitions' : 'value';
    ambition.style.color = still || time < 71.18 ? '#03b74c' : '#d2b6eb';
    ambition.style.opacity = still || time >= 70.72 ? '1' : '0';
    document.querySelector('.word-window').style.transform = 'scale(' + (0.94 + 0.06 * (still ? 1 : progress(time, 37.3, 38.45))).toFixed(4) + ')';
    const closingPoint = document.querySelector('.closing-point');
    const closingScale = time < 72.75 ? 1 : 0.6;
    closingPoint.style.transform = 'translate(-50%,-50%) scale(' + (still ? closingScale : mix(0.25, closingScale, progress(time, 72.08, 72.42))).toFixed(3) + ')';
    closingPoint.style.backgroundColor = time < 72.75 ? '#050505' : '#ffd341';
    document.querySelector('#with-openai-scene h1 span').style.color = time < 74.5 ? '#d2b6eb' : '#0d7ee9';
    closingArt.forEach((art, index) => {
      const amount = still ? 1 : progress(time, 73.75 + index * 0.08, 74.13 + index * 0.08);
      art.style.opacity = amount.toFixed(3);
    });
    const logoAmount = still ? 1 : progress(time, 75.46, 76.02);
    const logo = document.querySelector('#outro-scene img');
    logo.style.opacity = logoAmount.toFixed(3);
    logo.style.transform = 'translate(-50%,-50%) scale(' + mix(0.12, 1, logoAmount).toFixed(4) + ')';
    const outroPoint = document.querySelector('.outro-point');
    outroPoint.style.opacity = still ? '0' : (1 - progress(time, 75.16, 75.56)).toFixed(3);
    outroPoint.style.backgroundColor = time < 75.35 ? '#d2b6eb' : '#050505';
  };
}
