/**
 * Design Vault: a modular technical plinth holding three tiered server cassette blades
 * and an inset combination dial. Hovering over a blade slides it out on a spring with
 * distance-staggered lean; the readout displays active bus telemetry.
 */
const {
  Cam, clamp, facing, fit, hull, mk, open, place, pointer, poly,
  prism, proj, rad, register, ringAt, rings, rrect, run, solid,
  spring, stepS, tdone, tset, tval, tween, disposer, put,
} = HL;

const N = 3, W = 88, D = 26, H = 48, GAP = 10, PB = 6;
const X0 = 0, X1 = W, Y0 = 0, Y1 = (N - 1) * (D + GAP) + D;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[-12, -12, -PB], [X1 + 12, Y1 + 12, -PB], [X1 + 12, -12, -PB], [-12, Y1 + 12, -PB], [0, 0, H + 18]], 200, 166);
  const P = proj(C), front = facing(C);
  let stagger = value;

  const g = mk("g", {}, svg);

  // 1. Plinth (the base ground tray)
  const [pr, pi] = rings(-12, -12, X1 + 12, Y1 + 12, 10, 2.5);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));

  // 2. Three Cassettes (drawn back to front)
  const cassettes = [];
  for (let i = 0; i < N; i++) {
    const yb = i * (D + GAP);
    const [ring, inner] = rings(X0, yb, X1, yb + D, 5, 1.4);
    const el = solid(g);
    cassettes.push({
      i,
      yb,
      ring,
      inner,
      slide: spring(0, { k: 110, c: 18 }),
      tilt: tween(0, 700),
      el,
      drawnSlide: NaN,
      drawnTilt: NaN,
    });
  }

  let active = -1;

  function hit(p) {
    const [sx, sy] = p;
    // Test static bands along resting bounding areas to avoid flicker loops (Rule 01)
    for (let i = N - 1; i >= 0; i--) {
      const c = cassettes[i];
      const p0 = P(X0, c.yb + D / 2, H / 2);
      const dy = sy - p0[1];
      const dx = sx - p0[0];
      if (Math.abs(dy) < 22 && Math.abs(dx) < 65) return i;
    }
    return -1;
  }

  function setActive(targetIdx) {
    if (active === targetIdx) return;
    active = targetIdx;
    const now = performance.now();

    cassettes.forEach((c) => {
      const isPick = c.i === active;
      const dist = active < 0 ? 0 : Math.abs(c.i - active);
      const delay = dist * stagger;

      // Rule 08: continuous pointer tracking vs discrete pick
      c.slide.t = isPick ? 26 : 0;
      tset(c.tilt, isPick ? -3 : active < 0 ? 0 : c.i < active ? -8 : 6, now, delay);

      c.el.sil.classList.toggle("hi", isPick);
    });

    read.textContent = active < 0 ? "rest" : `bus 0${active + 1} · online`;
    B.wake();
  }

  function drawCassette(c, now) {
    const s = Math.round(c.slide.x * 10) / 10;
    const t = Math.round(tval(c.tilt, now) * 10) / 10;
    if (s === c.drawnSlide && t === c.drawnTilt) return;
    c.drawnSlide = s;
    c.drawnTilt = t;

    const radT = rad(t);
    const cosT = Math.cos(radT), sinT = Math.sin(radT);
    const localP = (u, v, w) => {
      const rotatedY = c.yb + (v - c.yb) * cosT - w * sinT + s;
      const rotatedZ = (v - c.yb) * sinT + w * cosT;
      return P(u, rotatedY, rotatedZ);
    };

    put(c.el, prism(localP, front, c.ring, c.inner, 0, H));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    const now = performance.now();
    for (const c of cassettes) {
      if (stepS(c.slide, dt)) moving = true;
      if (!tdone(c.tilt, now)) moving = true;
      drawCassette(c, now);
    }
    return moving;
  });
  bag.add(B.unregister);

  bag.add(pointer(stage, {
    move: (p) => setActive(hit(p)),
    leave: () => setActive(-1),
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stagger = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "design-vault",
  means: "Three modular server cassette blades in a technical plinth that slide out on hover.",
  rules: [1, 2, 8, 9, 10],
  range: [0, 45, 90],
  mount,
});
