/* 9:16 layout: the timeline is authored on the 1920x1080 stage; with ?aspect=portrait every element rect
 * (and every animated key) is mapped onto a 1080x1920 stage. Left-column content goes to the top slot,
 * right-column content to the bottom slot, full-width content sits centred. A spec's own `p` (a rect,
 * or keys) overrides the mapping where a stacked layout needs a different composition. */
(function (root) {
  const D = root.DOS;
  const portrait = /aspect=portrait/.test(location.search);
  D.PORTRAIT = portrait;
  D.W = portrait ? 1080 : 1920; D.H = portrait ? 1920 : 1080;
  // pedagogy v2 elements (kw, predict, recap, glossary) have a default rect for each aspect; an own rect, keys or `p` still wins
  for (const s of D.EL) {
    const def = !s.rect && !s.keys && !(portrait && s.p) && D.pedagogy.defaultRect(s.type, portrait);
    if (def) { s.rect = def; s.defaultRect = true; }
  }
  if (!portrait) return;
  document.documentElement.classList.add('portrait');

  const TOP = [48, 150, 984, 720], BOT = [48, 900, 984, 680], MID = [48, 400, 984, 760];
  // landscape source columns: left x 72..1082, right x 1120..1848, both y 132..772
  const map = ([x, y, w, h]) => {
    if (w > 1400) return MID.slice();
    const cx = x + w / 2;
    if (cx < 1100) {
      const sx = TOP[2] / 1010, sy = TOP[3] / 640, nx = TOP[0] + (x - 72) * sx;
      return [nx, TOP[1] + (y - 132) * sy, Math.min(w * sx, TOP[0] + TOP[2] - nx), h * sy];
    }
    const sy = BOT[3] / 640;
    return [BOT[0], BOT[1] + Math.max(0, y - 132) * sy, BOT[2], h * sy];
  };

  for (const s of D.EL) {
    if (s.defaultRect) continue;
    if (s.p) {
      if (Array.isArray(s.p[0])) { s.keys = s.p; delete s.rect; } else { s.rect = s.p; delete s.keys; }
    } else if (s.keys) {
      s.keys = s.keys.map(([t, ...r]) => [t, ...map(r)]);
    } else if (s.rect) {
      s.rect = s.type === 'hero' ? [0, 0, D.W, D.H] : map(s.rect);
    }
  }
  D.PSLOT = { TOP, BOT, MID };
})(window);
