import { mix, progress } from './astra-law-timeline.mjs';
import { sampleHyperFrameKeyframes } from './hyperframes-engine.mjs';

const ROW_X = [[14.8, 1235], [15, 1090], [15.4, 932], [15.8, 669],
  [16, 517], [16.2, 360], [16.6, 64], [17.2, -219], [17.8, -236]];
const ROW_Y = [[14.8, 930], [15, 803], [15.4, 605], [15.8, 595]];
const TILE_SPACING = 263;
const EXIT_TIMES = [[16.2, 16.68], [16.78, 17.34], [17.77, 18.17], [17.87, 18.18]];
const ENTRANCES = [[14.76, 14.92], [14.8, 14.98], [14.94, 15.2], [15.32, 15.56], [15.54, 15.84]];
const TILE_COLORS = [
  [[15, 168, 0, 8, 214, 51, 60], [16.2, 190, 0, 12, 182, 0, 8], [16.7, 255, 210, 218, 220, 220, 235]],
  [[15, 82, 102, 131, 170, 183, 201], [16, 33, 55, 88, 33, 55, 88], [16.6, 187, 197, 212, 91, 111, 140], [17.3, 249, 249, 255, 220, 225, 240]],
  [[15, 251, 178, 194, 252, 215, 221], [16, 238, 49, 48, 249, 99, 103], [16.6, 246, 75, 75, 237, 49, 52], [17.2, 254, 197, 204, 248, 139, 151]],
  [[15.4, 250, 250, 255, 225, 230, 240], [16, 84, 103, 131, 209, 215, 227], [16.6, 31, 49, 82, 31, 49, 82], [17.2, 86, 104, 135, 31, 49, 82]],
  [[15.7, 255, 245, 248, 252, 185, 200], [16.2, 255, 211, 218, 249, 131, 151], [16.6, 245, 32, 60, 244, 63, 88]]
];

function tileBackground(time, index) {
  const colors = sampleHyperFrameKeyframes(time, TILE_COLORS[index]).map(value => Math.round(value));
  return `linear-gradient(90deg,rgb(${colors.slice(0, 3).join(',')}),rgb(${colors.slice(3).join(',')}))`;
}

function continuousTrack(time, keys) {
  if (time <= keys[0][0]) return keys[0][1];
  if (time >= keys.at(-1)[0]) return keys.at(-1)[1];
  const nextIndex = keys.findIndex(key => key[0] > time);
  const previousIndex = nextIndex - 1;
  const [start, from] = keys[previousIndex];
  const [end, to] = keys[nextIndex];
  const span = end - start;
  const u = (time - start) / span;
  const incoming = previousIndex === 0 ? (to - from) / span
    : (to - keys[previousIndex - 1][1]) / (end - keys[previousIndex - 1][0]);
  const outgoing = nextIndex === keys.length - 1 ? 0
    : (keys[nextIndex + 1][1] - from) / (keys[nextIndex + 1][0] - start);
  return (2 * u ** 3 - 3 * u ** 2 + 1) * from
    + (u ** 3 - 2 * u ** 2 + u) * span * incoming
    + (-2 * u ** 3 + 3 * u ** 2) * to
    + (u ** 3 - u ** 2) * span * outgoing;
}

function firmTitle(time) {
  if (time < 14.16) return 'Into ChatGPT';
  if (time < 14.43) return 'Into ChatGPT for';
  if (time < 14.7) return 'Into ChatGPT for Your';
  return 'Into ChatGPT for Your Firm';
}

export function createFirmMotionRenderer() {
  const title = document.getElementById('firm-title');
  const tiles = [...document.querySelectorAll('.firm-tiles>div')];
  const cursor = document.getElementById('firm-cursor');
  return function renderFirmMotion(time, still) {
    title.textContent = still ? 'Into ChatGPT for Your Firm' : firmTitle(time);
    title.style.left = `${(still ? 220 : sampleHyperFrameKeyframes(time, [[14, 366], [14.42, 220]])[0]).toFixed(2)}px`;
    title.style.top = `${(still ? 386 : sampleHyperFrameKeyframes(time,
      [[14, 531], [14.8, 531], [15, 471], [15.4, 386]])[0]).toFixed(2)}px`;
    title.style.transform = 'translate3d(0,-50%,0)';
    title.style.opacity = still ? '1' : (1 - progress(time, 17.78, 18.18)).toFixed(3);

    const rowX = still ? 360 : continuousTrack(time, ROW_X);
    const rowY = still ? 595 : continuousTrack(time, ROW_Y);
    tiles.forEach((tile, index) => {
      const enter = still ? 1 : progress(time, ...ENTRANCES[index]);
      const exit = still || index === 4 ? 1 : 1 - progress(time, ...EXIT_TIMES[index]);
      const focus = still || index !== 4 ? 0 : progress(time, 17.25, 17.82);
      const x = index === 4 ? mix(rowX + index * TILE_SPACING, 816, focus) : rowX + index * TILE_SPACING;
      const y = index === 4 ? mix(rowY, 545, focus) : rowY;
      const size = index === 4 ? mix(200, 300, focus) : 200;
      tile.style.width = `${size.toFixed(2)}px`;
      tile.style.height = `${size.toFixed(2)}px`;
      tile.style.borderRadius = '40px';
      if (index === 4) tile.style.fontSize = `${(size * 0.255).toFixed(2)}px`;
      tile.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      tile.style.opacity = (enter * exit).toFixed(3);
      tile.style.filter = still ? 'none' : `blur(${((1 - enter) * 5 + (1 - exit) * 4).toFixed(2)}px)`;
      tile.style.background = tileBackground(time, index);
      tile.style.zIndex = index === 4 ? '2' : '1';
    });

    const arrive = still ? 0 : progress(time, 17.5, 17.76);
    const select = still ? 0 : progress(time, 17.76, 18.03);
    cursor.style.opacity = still ? '0' : (arrive * (1 - progress(time, 18.36, 18.68))).toFixed(3);
    cursor.style.transform = `translate3d(${mix(1180, 1030, arrive).toFixed(2)}px,${mix(915, 825, arrive).toFixed(2)}px,0) scale(${mix(1, 0.91, select).toFixed(3)})`;
  };
}
