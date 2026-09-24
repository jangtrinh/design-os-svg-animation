import { BEATS, beatOpacity, cameraAt, clamp, composerLayoutAt, mix, progress } from './astra-law-timeline.mjs';
import { createGalaxy, renderGalaxy } from './astra-law-galaxy.mjs';
import { createLateMotionRenderer } from './astra-law-late-motion.mjs';
import { createFirmMotionRenderer } from './astra-law-firm-motion.mjs';
import { createPartnerOrbit, renderPartnerOrbit } from './astra-law-partner-orbit.mjs';
import { sampleHyperFrameStagger } from './hyperframes-engine.mjs';
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
  const skillTiles = [...document.querySelectorAll('.skill-cloud>span')];
  const earlyText = document.getElementById('early-response-text');
  const earlyCopy = earlyText.textContent;
  const renderLateMotion = createLateMotionRenderer();
  const renderFirmMotion = createFirmMotionRenderer();
  return function render(time) {
    const still = reduced.matches;
    for (const beat of scenes) {
      const visible = still ? Number(time >= beat.start && (time < beat.end || beat.end === 77.594)) : beatOpacity(beat, time);
      beat.element.style.opacity = visible.toFixed(4);
      beat.element.style.visibility = visible > 0 ? 'visible' : 'hidden';
      if (visible > 0) {
        const heading = beat.element.querySelector('h1');
        if (heading) {
          const headingDuration = beat.id === 'methods-scene' ? 0.15
            : beat.id === 'earned-scene' ? 0.18
              : beat.id === 'trust-scene' ? 0.06
                : beat.id === 'safeguards-scene' ? 0.1 : 0.24;
          const arrival = still || beat.start === 0 ? 1 : progress(time, beat.start, beat.start + headingDuration);
          heading.style.transform = 'translate(' + (beat.id === 'skills-scene' || beat.id === 'earned-scene' ? '0' : '-50%') + ',-50%) translate3d(0,' + ((1 - arrival) * 12).toFixed(2) + 'px,0)';
          heading.style.opacity = arrival.toFixed(4);
        }
      }
    }
    renderIR(time);
    document.getElementById('point-title').style.opacity = still ? '0' : progress(time, 7.58, 7.62).toFixed(3);
    const introColor = time < 0.94 ? '#f6ced8' : time < 1.72 ? '#03b74c' : '#0385fd';
    document.querySelector('#intro-title span').style.color = introColor;
    document.getElementById('frontier-title').innerHTML = still || time >= 3.35 ? 'Frontier intelligence for<br>professional legal work' : 'Frontier intelligence';
    const prefix = document.getElementById('method-prefix');
    const keyword = document.getElementById('method-keyword');
    if (still || time >= 12.12) {
      prefix.textContent = 'Build your ';
      keyword.textContent = 'methods';
      keyword.style.color = '#eeb4c8';
    } else if (time >= 11.78) {
      prefix.textContent = 'Build your ';
      keyword.textContent = 'precedents';
      keyword.style.color = '#03b74c';
    } else if (time >= 11.44) {
      prefix.textContent = 'Build your ';
      keyword.textContent = 'expertise';
      keyword.style.color = '#0d7ee9';
    } else {
      prefix.textContent = time < 10.85 ? 'B' : time < 11.14 ? 'Build' : 'Build your ';
      keyword.textContent = '';
    }
    renderFirmMotion(time, still);
    const galaxyTitle = document.querySelector('#galaxy-scene h1');
    galaxyTitle.textContent = still || time >= 7.86 ? 'Astra for Law'
      : time >= 7.73 ? 'Astra for' : 'Astra';
    galaxyTitle.style.left = '600px';
    galaxyTitle.style.transform = 'translate(0,-50%)';
    galaxyTitle.style.opacity = still ? '1' : (progress(time, 7.6, 7.65) * (1 - 0.4 * progress(time, 10.45, 10.6))).toFixed(3);
    galaxyTitle.style.filter = still ? 'none' : `blur(${(progress(time, 10.42, 10.7) * 3).toFixed(2)}px)`;
    document.getElementById('galaxy-wash').style.opacity = still ? '0' : (0.03 * progress(time, 10.53, 10.73)).toFixed(3);
    const toolHeading = document.querySelector('#tools-scene h1');
    toolHeading.innerHTML = still || time >= 43.82 ? 'Access the legal tools<br>you know and trust'
      : time >= 43.52 ? 'Access the legal tools<br>you know'
        : time >= 43.12 ? 'Access the legal tools'
          : time >= 42.82 ? 'Access the legal' : 'Access the';
    toolHeading.style.left = (still ? 50 : mix(34, 50, progress(time, 42.65, 43.82))).toFixed(2) + '%';
    renderGalaxy(galaxy, time, still);
    const typed = time < 22.2
      ? clamp((time - 19.32) / 2.88) * 0.455
      : 0.455 + clamp((time - 22.2) / 2.6) * 0.545;
    const chars = still ? composerChars.length : Math.floor(typed * composerChars.length);
    composerChars.forEach((span, index) => { span.style.opacity = index < chars ? '1' : '0'; });
    document.getElementById('composer-text').dataset.placeholder = chars === 0 ? 'Work on anything' : '';
    const [scale, cameraX, cameraY] = still ? [1, 0, 0] : cameraAt(time);
    const camera = document.getElementById('composer-camera');
    // Layout zoom keeps macro text crisp after arbitrary seeks; translation remains a transform.
    camera.style.zoom = scale.toFixed(4);
    camera.style.transform = 'translate3d(' + (cameraX / scale).toFixed(1) + 'px,' + (cameraY / scale).toFixed(1) + 'px,0)';
    const composerCard = document.querySelector('#composer-scene .composer-card');
    const [height, textHeight, subbarTop, subbarHeight, paddingTop, paddingSide] = composerLayoutAt(time);
    composerCard.style.height = `${height.toFixed(2)}px`;
    composerCard.style.padding = `${paddingTop.toFixed(2)}px ${paddingSide.toFixed(2)}px 0`;
    const introType = still ? 1 : progress(time, 18.95, 20);
    const composerText = document.getElementById('composer-text');
    composerText.style.height = `${textHeight.toFixed(2)}px`;
    const detailZoom = still ? 0 : progress(time, 20, 20.9) * (1 - progress(time, 21.2, 22.2));
    composerText.style.fontSize = `${(mix(18, 28, introType) + detailZoom * 11).toFixed(2)}px`;
    const textRise = still ? 0 : mix(-9, 2, introType) * (1 - progress(time, 21.3, 22.3));
    composerText.style.transform = `translate3d(${(detailZoom * 22).toFixed(2)}px,${textRise.toFixed(2)}px,0)`;
    document.getElementById('composer-scene').style.setProperty('--detail-zoom', detailZoom.toFixed(3));
    const modelLabel = document.querySelector('.model-label');
    modelLabel.style.fontSize = `${(mix(17, 23, introType) + detailZoom * 7).toFixed(2)}px`;
    modelLabel.style.transform = `translate3d(${(detailZoom * 55).toFixed(2)}px,${(detailZoom * 8).toFixed(2)}px,0)`;
    document.querySelector('.composer-plus').style.fontSize = `${mix(25, 34, introType).toFixed(2)}px`;
    const subbar = document.querySelector('#composer-scene .composer-subbar');
    subbar.style.top = `${subbarTop.toFixed(2)}px`;
    subbar.style.height = `${subbarHeight.toFixed(2)}px`;
    subbar.style.fontSize = `${mix(17, 20, introType).toFixed(2)}px`;
    composerCard.style.boxShadow = scale > 2 ? 'none' : '';
    composerCard.style.borderTopColor = scale > 2 ? 'transparent' : '';
    const early = document.querySelector('.early-response');
    const late = document.querySelector('.response-column');
    early.style.opacity = still ? '0' : (1 - progress(time, 32.9, 33.45)).toFixed(3);
    earlyText.textContent = still ? earlyCopy : earlyCopy.slice(0, Math.floor(clamp((time - 27.55) / 1.44) * earlyCopy.length));
    late.style.opacity = still ? '1' : progress(time, 33.1, 33.7).toFixed(3);
    const responsePan = still ? 0 : time < 35.4
      ? -290 * progress(time, 34.8, 35.4)
      : time < 36.2 ? mix(-290, -370, progress(time, 35.4, 36.2))
        : mix(-370, -580, progress(time, 36.2, 37.2));
    late.style.transform = `translate3d(${(-40 * progress(time, 35.4, 37.2)).toFixed(1)}px,${responsePan.toFixed(1)}px,0)`;
    document.getElementById('response-text').style.opacity = still ? '1' : progress(time, 33.85, 34.9).toFixed(3);
    document.querySelectorAll('.response-column p:nth-of-type(n+4),.response-column .file-card').forEach(element => { element.style.display = still || time >= 35.0 ? '' : 'none'; });
    document.querySelector('.response-column .file-card').style.opacity = still ? '1' : (1 - progress(time, 37.32, 37.43)).toFixed(3);
    const responseCursor = document.getElementById('response-cursor');
    responseCursor.style.opacity = still ? '0' : (progress(time, 36.55, 36.82) * (1 - progress(time, 37.26, 37.35))).toFixed(3);
    responseCursor.style.transform = `translate3d(${(-120 * progress(time, 36.55, 37.2)).toFixed(1)}px,${(-370 * progress(time, 36.55, 37.2)).toFixed(1)}px,0)`;
    toolLines.forEach((line, index) => {
      line.style.opacity = still ? '0.78' : (0.78 * sampleHyperFrameStagger(time, 30.45, index, 0.18, 0.16)).toFixed(3);
    });
    renderPartnerOrbit(partners, time, still);
    const skillCount = still || time >= 51.65 ? 40 : time >= 51.3 ? 39
      : time >= 50.65 ? 34 : time >= 50.15 ? 29 : time >= 49.95 ? 27 : 25;
    document.getElementById('skill-count').textContent = skillCount + '+';
    const skillPhrase = document.getElementById('skill-phrase'); skillPhrase.style.display = still || time >= 50.45 ? 'inline' : 'none';
    skillPhrase.style.opacity = still || time >= 50.45 ? '1' : '0';
    document.querySelector('#skills-scene h1').style.top = !still && time < 50.45 ? '43%' : '50%';
    document.querySelector('#skills-scene h1').style.left = !still && time < 50.45 ? '25.4%' : '24.5%';
    document.querySelector('#skills-scene h1').style.transform = 'translate(0,-50%)';
    document.getElementById('skill-suffix').textContent = still || time >= 51.4 ? 'by the community' : 'by';
    skillTiles.forEach((tile, index) => {
      const starts = [49.4, 49.55, 51.2, 50.25, 50.45, 50.55, 51.25, 50.4, 49.5, 51.3, 50.65, 50.75];
      const amount = still ? 1 : progress(time, starts[index], starts[index] + 0.46);
      const entry = { 0: [132, -154], 1: [144, -70], 8: [104, -205] }[index] || [0, 0];
      const slide = still ? 0 : 1 - progress(time, 50, 51);
      tile.style.opacity = amount.toFixed(3);
      tile.style.transform = 'translate3d(' + (entry[0] * slide).toFixed(1) + 'px,' + (entry[1] * slide + (1 - amount) * 16).toFixed(1) + 'px,0) scale(' + mix(0.84, 1, amount).toFixed(3) + ')';
    });
    const earnedHeading = document.querySelector('#earned-scene h1');
    document.getElementById('trust-second').style.opacity = still ? '1' : progress(time, 55.3, 55.5).toFixed(3);
    earnedHeading.innerHTML = still || time >= 68.1 ? 'So you can maintain the<br>trust you’ve earned <span class="document-check"><img src="astra-law-icons/file-doc.svg" alt=""><img src="astra-law-icons/check-circle.svg" alt=""></span>' : time >= 67.0 ? 'So you can maintain the<br>trust' : 'So you';
    earnedHeading.style.top = time < 67 ? '43%' : '50%';
    renderLateMotion(time, still);
  };
}
