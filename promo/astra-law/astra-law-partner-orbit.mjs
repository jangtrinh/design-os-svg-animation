import { mix, progress } from './astra-law-timeline.mjs';
import { sampleHyperFrameStagger } from '../shared/hyperframes-engine.mjs';

// Centers and clockwise order measured from the settled 47.8s source frame.
// Unreadable source marks use owner-approved SVGL stand-ins.
const PARTNERS = [
  [950, 164, '', '#e94a00', '#fff'],
  [1126, 169, '', '#fff', '#111'],
  [1298, 184, '', '#0a488a', '#fff'],
  [1457, 212, '', '#fff', '#173eae'],
  [1596, 264, '', '#0b0b0b', '#fff'],
  [1704, 322, '', '#fff', '#6841dc'],
  [1790, 383, '', '#fa5b0e', '#fff'],
  [1822, 465, '', '#fff', '#22a87d'],
  [1850, 546, '', '#050505', '#fff'],
  [1826, 630, '', '#fff', '#f28c14'],
  [1764, 686, '', '#006bd9', '#fff'],
  [1673, 740, '', '#fff', '#e44337'],
  [1550, 815, '', '#ff315c', '#fff'],
  [1395, 854, '', '#fff', '#bd6334'],
  [1238, 904, '', '#030303', '#fff'],
  [1062, 905, '', '#fff', '#111'],
  [882, 917, 'trellis', '#204c43', '#fff'],
  [706, 909, 'box', '#086ce5', '#fff'],
  [540, 893, '', '#fff', '#111'],
  [390, 835, 'LEGALON', '#030303', '#fff'],
  [268, 796, 'COURTROOM5', '#fff', '#227f78'],
  [168, 735, 'COURT LISTENER', '#c4493b', '#fff'],
  [105, 665, '', '#080808', '#fff'],
  [73, 573, 'nd', '#176cd5', '#fff'],
  [90, 514, 'laurel', '#030303', '#fff'],
  [115, 446, 'Lz', '#fff', '#171717'],
  [198, 360, 'BW', '#050505', '#fff'],
  [305, 310, '', '#fff', '#176d73'],
  [442, 250, 'LQ', '#333', '#fff'],
  [601, 202, 'skills.law', '#1d224d', '#fff'],
  [768, 182, 'LECG', '#0b2e5b', '#fff'],
];
const SVGL_STAND_INS = {
  0: ['GitHub', 'github'], 1: ['Figma', 'figma'], 2: ['Microsoft', 'microsoft'],
  3: ['Stripe', 'stripe'], 4: ['Vercel', 'vercel'], 5: ['Linear', 'linear'],
  6: ['Apple', 'apple'], 7: ['Slack', 'slack'], 8: ['Discord', 'discord'],
  9: ['Adobe', 'adobe'], 10: ['Dropbox', 'dropbox'], 11: ['Google Drive', 'google-drive'],
  12: ['Loom', 'loom'], 13: ['Asana', 'asana'], 14: ['Spotify', 'spotify'],
  15: ['Cloudflare', 'cloudflare'], 18: ['Canva', 'canva'],
  22: ['Supabase', 'supabase'], 27: ['Zoom', 'zoom']
};

export function createPartnerOrbit() {
  const root = document.getElementById('partner-orbit');
  return PARTNERS.map(([x, y, label, background, foreground], index) => {
    const tile = document.createElement('span');
    tile.className = 'partner-tile';
    tile.dataset.partnerIndex = String(index);
    tile.dataset.assetStatus = label ? 'source-text' : 'svgl-stand-in';
    if (label) tile.textContent = label;
    else {
      const [brand, slug] = SVGL_STAND_INS[index];
      const icon = document.createElement('img');
      icon.src = `astra-law-icons/svgl-${slug}.svg`;
      icon.alt = '';
      tile.dataset.standInBrand = brand;
      tile.append(icon);
    }
    tile.style.background = background;
    tile.style.color = foreground;
    if (label.length > 10) tile.style.fontSize = '13px';
    root.append(tile);
    return { tile, index, x, y };
  });
}

export function renderPartnerOrbit(partners, time, still) {
  for (const partner of partners) {
    const entryOrder = (partner.index - 6 + partners.length) % partners.length;
    const appearance = still ? Number(time >= 44.9 && time < 49.7)
      : sampleHyperFrameStagger(time, 44.9, entryOrder, 0.08, 0.30);
    const exitStart = partner.index < 6
      ? 48.65 + partner.index * 0.06
      : 49.01 + (partner.index - 6) * 0.04;
    const departure = still ? 0 : progress(time, exitStart, exitStart + 0.19);
    const x = partner.x + (1 - appearance) * 130 + departure * (partner.x - 960) * 0.23;
    const y = partner.y + (1 - appearance) * 56 + departure * (partner.y - 540) * 0.23;
    partner.tile.style.transform = `translate3d(${(x - 50).toFixed(2)}px,${(y - 50).toFixed(2)}px,0) scale(${mix(0.56, 1, appearance * (1 - departure)).toFixed(3)})`;
    partner.tile.style.opacity = (appearance * (1 - departure)).toFixed(3);
  }
}
