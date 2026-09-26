import { DURATION, activeBeat, clamp } from './astra-law-timeline.mjs';
import { loadMotionIR } from './astra-law-motion-ir.mjs';
import { createSceneRenderer } from './astra-law-scenes.mjs';

const stage = document.getElementById('video-stage');
const frame = document.getElementById('video-stage-frame');
const playButton = document.getElementById('btn-play-pause');
const scrubber = document.getElementById('video-scrubber');
const timecode = document.getElementById('timecode');
let currentTime = 0;
let playbackSpeed = 1;
let playing = false;
let animationFrame = null;
let lastTimestamp = null;

function resizeStage() {
  if (document.documentElement.classList.contains('clean-export')) return;
  const scale = frame.clientWidth / 1920;
  stage.style.transform = `scale(${scale})`;
}

function formatTime(seconds) {
  const totalTenths = Math.round(seconds * 10);
  const minute = Math.floor(totalTenths / 600);
  const second = Math.floor(totalTenths / 10) % 60;
  const tenth = totalTenths % 10;
  return `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.${tenth}`;
}

function setPlaybackLabel() {
  playButton.textContent = playing ? 'Pause' : 'Play';
  playButton.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

function stop() {
  playing = false;
  lastTimestamp = null;
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  animationFrame = null;
  setPlaybackLabel();
}

function start() {
  if (playing) return;
  if (currentTime >= DURATION) window.__seekToTime(0);
  playing = true;
  lastTimestamp = null;
  setPlaybackLabel();
  animationFrame = requestAnimationFrame(tick);
}

function tick(timestamp) {
  if (!playing) return;
  if (lastTimestamp !== null) window.__seekToTime(currentTime + (timestamp - lastTimestamp) * playbackSpeed / 1000);
  lastTimestamp = timestamp;
  if (currentTime >= DURATION) stop();
  else animationFrame = requestAnimationFrame(tick);
}

function bindControls() {
  document.getElementById('btn-restart').addEventListener('click', () => { stop(); window.__seekToTime(0); });
  playButton.addEventListener('click', () => playing ? stop() : start());
  scrubber.addEventListener('input', event => { stop(); window.__seekToTime(Number(event.target.value)); });
  document.getElementById('btn-fullscreen').addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : frame.requestFullscreen());
  document.querySelectorAll('[data-speed]').forEach(button => button.addEventListener('click', () => {
    playbackSpeed = Number(button.dataset.speed);
    document.querySelectorAll('[data-speed]').forEach(item => item.classList.toggle('active', item === button));
  }));
  document.querySelectorAll('[data-seek]').forEach(button => button.addEventListener('click', () => { stop(); window.__seekToTime(Number(button.dataset.seek)); }));
  document.addEventListener('keydown', event => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.code === 'Space') { event.preventDefault(); playing ? stop() : start(); }
    if (event.code === 'ArrowRight') { event.preventDefault(); stop(); window.__seekToTime(currentTime + (event.shiftKey ? 2 : 0.25)); }
    if (event.code === 'ArrowLeft') { event.preventDefault(); stop(); window.__seekToTime(currentTime - (event.shiftKey ? 2 : 0.25)); }
    if (event.code === 'Home' || event.key === '0') { event.preventDefault(); stop(); window.__seekToTime(0); }
    if (event.code === 'KeyF') { event.preventDefault(); document.fullscreenElement ? document.exitFullscreen() : frame.requestFullscreen(); }
  });
  window.addEventListener('resize', resizeStage);
}

window.__readyPromise = loadMotionIR(document.getElementById('motion-ir-stage')).then(renderIR => {
  const render = createSceneRenderer(renderIR);
  window.__seekToTime = seconds => {
    currentTime = clamp(Number(seconds) || 0, 0, DURATION);
    render(currentTime);
    scrubber.value = String(currentTime);
    timecode.textContent = `${formatTime(currentTime)} / ${formatTime(DURATION)}`;
    document.getElementById('scene-name').textContent = activeBeat(currentTime).name;
    return currentTime;
  };
  bindControls();
  resizeStage();
  const params = new URLSearchParams(location.search);
  window.__seekToTime(Number(params.get('t') || 0));
  if (params.get('autoplay') === 'true') start();
  return true;
}).catch(error => {
  document.getElementById('scene-name').textContent = `Load error: ${error.message}`;
  throw error;
});
