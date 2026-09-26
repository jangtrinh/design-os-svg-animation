import { clamp, mix, progress } from './astra-law-timeline.mjs';
import { sampleHyperFrameCarry } from '../shared/hyperframes-engine.mjs';

const visibleText = (text, fraction) => text.slice(0, Math.floor(clamp(fraction) * text.length));

export function createLateMotionRenderer() {
  const wordScene = document.getElementById('word-scene');
  const wordWindow = document.querySelector('.word-window');
  const handoff = document.getElementById('word-handoff-card');
  const handoffPanel = document.getElementById('word-handoff-panel');
  const handoffResponse = handoffPanel.querySelector('.handoff-response-lines');
  const mappingResponse = handoffResponse.querySelector('.handoff-mapping-response');
  const shellResponse = handoffResponse.querySelector('.handoff-shell-response');
  const first = document.getElementById('privacy-first');
  const second = document.getElementById('privacy-second');
  const loading = document.getElementById('privacy-loading');
  const loadingDots = [...loading.children];
  const privacyDoc = document.querySelector('.blurred-document');
  const sourceDocument = document.querySelector('.document-paper');
  privacyDoc.replaceChildren(sourceDocument.cloneNode(true));
  const privacyEye = document.querySelector('.privacy-eye');
  const privacyDots = [...document.querySelectorAll('.privacy-dot')];
  const safeguardFirst = document.getElementById('safeguards-first');
  const safeguardSecond = document.getElementById('safeguards-second');
  const ambition = document.getElementById('ambition-word');
  const closingPoint = document.querySelector('.closing-point');
  const closingHeading = document.querySelector('#with-openai-scene h1');
  const collage = document.querySelector('.closing-artifacts');
  const artifacts = [...collage.querySelectorAll(':scope > img, :scope > div')];
  const outroPoint = document.querySelector('.outro-point');
  const outroLogo = document.querySelector('#outro-scene img');

  return function renderLateMotion(time, still) {
    wordScene.style.setProperty('--word-gradient-opacity', still ? '1'
      : (progress(time, 37.43, 37.68) * (1 - progress(time, 42.12, 42.42))).toFixed(3));
    const wordExpansion = still ? 1 : progress(time, 38.42, 39.04);
    const revealedWidth = mix(0.278, 1, wordExpansion);
    const wordPush = still ? 1 : mix(1, 1.012, progress(time, 39.1, 41.8));
    const wordExit = still ? 0 : progress(time, 42.12, 42.4);
    wordWindow.style.clipPath = `inset(0 ${((1 - revealedWidth) * 100).toFixed(3)}% 0 0)`;
    wordWindow.style.transform = `translate3d(${(570 * wordExit).toFixed(1)}px,0,0) scale(${wordPush.toFixed(4)})`;
    wordWindow.style.opacity = still ? '1' : (progress(time, 37.57, 37.8) * (1 - 0.3 * wordExit)).toFixed(3);
    handoff.style.opacity = still ? '0' : sampleHyperFrameCarry(time, 37.3, 37.38, 37.72, 37.94).toFixed(3);
    const cardGrowth = still ? 1 : progress(time, 37.3, 37.4);
    handoff.style.left = `${mix(80, 70, cardGrowth).toFixed(1)}px`;
    handoff.style.top = `${mix(371, 365, cardGrowth).toFixed(1)}px`;
    handoff.style.width = `${mix(1680, 1760, cardGrowth).toFixed(1)}px`;
    handoff.style.height = `${mix(100, 225, cardGrowth).toFixed(1)}px`;
    handoff.style.padding = `${mix(12, 22, cardGrowth).toFixed(1)}px ${mix(22, 34, cardGrowth).toFixed(1)}px`;
    handoff.style.gap = `${mix(16, 54, cardGrowth).toFixed(1)}px`;
    handoff.style.fontSize = `${mix(21, 38, cardGrowth).toFixed(1)}px`;
    handoff.style.borderRadius = `${mix(22, 32, cardGrowth).toFixed(1)}px`;
    const cardIcon = handoff.querySelector(':scope > img:first-child');
    cardIcon.style.width = cardIcon.style.height = `${mix(34, 120, cardGrowth).toFixed(1)}px`;
    cardIcon.style.padding = `${mix(0, 28, cardGrowth).toFixed(1)}px`;
    cardIcon.style.borderRadius = `${mix(0, 38, cardGrowth).toFixed(1)}px`;
    handoff.querySelector('small').style.fontSize = `${mix(16, 29, cardGrowth).toFixed(1)}px`;
    handoff.querySelector('b').style.fontSize = `${mix(19, 33, cardGrowth).toFixed(1)}px`;
    handoffPanel.style.opacity = still ? '0' : (progress(time, 37.32, 37.4) * (1 - progress(time, 37.68, 38.04))).toFixed(3);
    handoffPanel.style.transform = `translate3d(${(still ? 0 : -100 * progress(time, 37.68, 38.04)).toFixed(1)}px,0,0)`;
    const responseTone = Math.round(mix(90, 170, progress(time, 37.4, 37.5)));
    handoffResponse.style.color = `rgb(${responseTone} ${responseTone} ${responseTone})`;
    handoffResponse.style.opacity = still ? '0' : (1 - progress(time, 37.47, 37.59)).toFixed(3);
    const responsePullback = still ? 1 : progress(time, 37.5, 37.68);
    handoff.style.left = `${(mix(80, 70, cardGrowth) + responsePullback * 25).toFixed(1)}px`;
    handoff.style.width = `${(mix(1680, 1760, cardGrowth) - responsePullback * 90).toFixed(1)}px`;
    handoffPanel.style.left = `${mix(20, 108, responsePullback).toFixed(1)}px`;
    handoffPanel.style.top = `${mix(15, 58, responsePullback).toFixed(1)}px`;
    handoffPanel.style.width = `${mix(1760, 1210, responsePullback).toFixed(1)}px`;
    handoffPanel.style.height = `${mix(1050, 985, responsePullback).toFixed(1)}px`;
    handoffResponse.style.transform = `translate3d(${mix(60, 350, responsePullback).toFixed(1)}px,${mix(120, 80, responsePullback).toFixed(1)}px,0) scale(${mix(1, 0.5, responsePullback).toFixed(3)})`;
    mappingResponse.style.opacity = (1 - progress(time, 37.54, 37.61)).toFixed(3);
    shellResponse.style.opacity = progress(time, 37.54, 37.61).toFixed(3);
    const handoffCursor = handoff.querySelector('.handoff-cursor');
    const cursorCarry = still ? 1 : progress(time, 37.35, 37.5);
    handoffCursor.style.right = 'auto';
    handoffCursor.style.bottom = 'auto';
    handoffCursor.style.left = `${mix(1130, 1160, cursorCarry).toFixed(1)}px`;
    handoffCursor.style.top = '160px';
    handoffCursor.style.opacity = still ? '0' : progress(time, 37.35, 37.4).toFixed(3);
    handoff.style.transform = `translate3d(${(still ? 0 : -170 * progress(time, 37.7, 38.05)).toFixed(1)}px,${(still ? 0 : -40 * progress(time, 37.7, 38.05)).toFixed(1)}px,0) scale(${(still ? 1 : mix(1, 0.84, progress(time, 37.7, 38.05))).toFixed(3)})`;

    const loadingVisible = !still && time >= 57.94 && time < 59.2;
    loading.style.display = loadingVisible ? 'inline-flex' : 'none';
    loading.style.opacity = loadingVisible ? '1' : '0';
    loadingDots.forEach((dot, index) => {
      const hop = sampleHyperFrameCarry(time, 58.0 + index * 0.12, 58.15 + index * 0.12,
        58.17 + index * 0.12, 58.35 + index * 0.12);
      dot.style.transform = `translate3d(0,${(-42 * hop).toFixed(1)}px,0) scale(${mix(0.8, 1.12, hop).toFixed(3)})`;
      dot.style.opacity = progress(time, 57.94 + index * 0.12, 58.12 + index * 0.12).toFixed(3);
    });
    first.textContent = still ? 'Your data stays private.' : time < 58.92 ? 'Your'
      : visibleText('Your data stays private.', (time - 58.92) / 1.12);
    second.textContent = still ? 'Zero data retention.'
      : visibleText('Zero data retention.', (time - 60.22) / 0.55);
    document.getElementById('privacy-break').style.display = second.textContent ? 'inline' : 'none';
    document.getElementById('privacy-caret').style.opacity = still || time < 59.2 || time > 61.18 ? '0' : '1';

    const docArrival = still ? 1 : progress(time, 62.03, 62.58);
    const docDeparture = still ? 0 : progress(time, 63.28, 63.82);
    privacyDoc.style.transform = `translate3d(0,${(520 * (1 - docArrival) - 70 * docDeparture).toFixed(1)}px,0) scale(${mix(0.78, 1.06, docArrival).toFixed(3)})`;
    privacyDoc.style.opacity = (docArrival * (1 - docDeparture)).toFixed(3);
    const privacyDefocus = still ? 0 : 32 * progress(time, 63.26, 63.6);
    privacyDoc.style.filter = `blur(${(20 + privacyDefocus).toFixed(1)}px)`;
    privacyEye.style.opacity = still ? '1' : (progress(time, 62.72, 63.04) * (1 - docDeparture)).toFixed(3);
    privacyEye.style.transform = `translate(-50%,-50%) scale(${mix(0.68, 1, docArrival).toFixed(3)})`;
    privacyEye.style.filter = `invert(34%) sepia(96%) saturate(2935%) hue-rotate(192deg) blur(${privacyDefocus.toFixed(1)}px)`;
    privacyDots.forEach((dot, index) => {
      const float = still ? 0 : Math.sin((time - 62) * 2.4 + index * 1.7) * 38;
      dot.style.opacity = (docArrival * (1 - docDeparture)).toFixed(3);
      dot.style.transform = `translate3d(${(float * 0.35).toFixed(1)}px,${float.toFixed(1)}px,0)`;
    });
    safeguardFirst.textContent = still ? 'Automated safeguards.'
      : visibleText('Automated safeguards.', (time - 63.43) / 0.17);
    safeguardSecond.textContent = still ? 'No human eyes.'
      : visibleText('No human eyes.', (time - 63.93) / 0.4);
    document.querySelector('#safeguards-scene h1').style.filter = still ? 'none'
      : `blur(${mix(30, 0, progress(time, 63.55, 64.25)).toFixed(1)}px)`;

    const ambitionWord = still || time >= 71.25 ? 'value'
      : time >= 70.82 ? 'ambitions' : time >= 70.12 ? 'expertise' : '';
    ambition.textContent = ambitionWord;
    ambition.style.color = ambitionWord === 'expertise' ? '#0d7ee9'
      : ambitionWord === 'ambitions' ? '#03b74c' : '#d2b6eb';
    ambition.style.opacity = ambitionWord ? '1' : '0';

    const pointArrival = still ? 1 : progress(time, 72.28, 72.4);
    closingPoint.style.transform = `translate(-50%,-50%) scale(${mix(0.08, 0.9, pointArrival).toFixed(3)})`;
    closingPoint.style.backgroundColor = time < 72.28 ? '#f47728'
      : time < 72.61 ? '#050505' : time < 72.98 ? '#03b74c' : '#fac9d1';

    closingHeading.innerHTML = still || time >= 73.94
      ? 'With OpenAI for <span>Law</span>' : time >= 73.73 ? 'With OpenAI' : 'With';
    closingHeading.style.color = time < 73.71 ? '#b48ce8' : time < 73.94 ? '#fac0c6' : '#080808';
    const headingAccent = closingHeading.querySelector('span');
    if (headingAccent) headingAccent.style.color = time < 74.2 ? '#0d7ee9' : time < 74.55 ? '#fac0c6' : '#080808';
    const collapse = still ? 0 : progress(time, 74.7, 75.13);
    const headingArrival = still ? 1 : progress(time, 73.23, 73.58);
    closingHeading.style.opacity = (headingArrival * (1 - collapse)).toFixed(3);
    closingHeading.style.left = `${mix(mix(457, 395, progress(time, 73.5, 73.8)), 960, collapse).toFixed(1)}px`;
    closingHeading.style.transformOrigin = 'left center';
    closingHeading.style.transform = `translate(0,-50%) scale(${mix(1, 0.08, collapse).toFixed(3)})`;
    const collageCollapse = still ? 0 : progress(time, 74.55, 75.13);
    collage.style.transform = `scale(${mix(0.05, 1, (1 - collageCollapse) ** 1.4).toFixed(3)})`;
    const artifactTravel = still ? 0 : progress(time, 74.55, 74.84);
    const artifactDestinations = [
      [280, -370, 1.8], [90, 325, 0.75], [-170, 240, 1.4],
      [0, 0, 1], [0, 0, 1], [380, -270, 1],
      [-60, -360, 1], [0, 0, 1], [-210, 180, 1]
    ];
    artifacts.forEach((art, index) => {
      const starts = [73.37, 73.60, 73.19, 73.30, 73.46, 73.29, 73.67, 73.54, 73.40];
      const amount = still ? 1 : progress(time, starts[index] ?? 73.4, (starts[index] ?? 73.4) + 0.36);
      const rise = (1 - amount) * (index % 2 ? -95 : 95);
      const [targetX, targetY, targetScale] = artifactDestinations[index] ?? [0, 0, 1];
      art.style.opacity = (amount * (1 - collapse)).toFixed(3);
      art.style.transform = `translate3d(${(targetX * artifactTravel).toFixed(1)}px,${(rise + targetY * artifactTravel).toFixed(1)}px,0) scale(${(mix(0.55, 1, amount) * mix(1, targetScale, artifactTravel)).toFixed(3)})`;
    });

    const logoAmount = still ? 1 : progress(time, 75.76, 76.0);
    const logoSettle = still ? 1 : progress(time, 75.94, 76.3);
    outroLogo.style.opacity = logoAmount.toFixed(3);
    outroLogo.style.transform = `translate(-50%,-50%) rotate(${mix(-28, 0, logoSettle).toFixed(2)}deg) scale(${(mix(0.12, 0.86, logoAmount) * mix(1, 1 / 0.86, logoSettle)).toFixed(4)})`;
    outroPoint.style.opacity = still ? '0' : (1 - progress(time, 75.72, 75.96)).toFixed(3);
    outroPoint.style.backgroundColor = time < 75.1 ? '#0d7ee9' : '#d2b6eb';
  };
}
