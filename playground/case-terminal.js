// Payment terminal: meaningful working interaction — card inserts into the slot, keypad keys depress on touch.
const {
  Cam, circ, clamp, facing, fit, hull, mk, open, poly, prism,
  proj, put, rings, rrect, run, seg, solid, spring, stepS, unproj,
  disposer, pointer, register,
} = HL;

function mount({ stage, svg, read }, value) {
  const bag = disposer(), C = Cam(45, 0.5, 1.85);
  fit(C, [
    [-42, -44, -3], [42, -44, -3], [-42, 44, -3], [42, 44, -3],
    [-24, -46, 32], [24, 28, 32], [0, 0, 36]
  ], 200, 166);
  const P = proj(C), front = facing(C), root = mk("g", {}, svg);

  let reach = clamp(value ?? 24, 12, 32), activeKey = -1, lastSlot = NaN;
  const cardS = spring(0); // 0 = resting out, 1 = fully inserted
  const keyDep = Array.from({ length: 12 }, () => spring(0));

  const box = (g, x0, y0, x1, y1, z0, z1, r = 1.4) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, 0.65);
    const el = solid(g); put(el, prism(P, front, ring, inner, z0, z1)); return el;
  };
  const line = (g, pts, cls = "nf lo") => mk("path", { d: open(pts), class: cls }, g);

  // 1. Base Slab & Guidelines
  const ground = mk("g", {}, root);
  line(ground, [P(-44, 0, -3), P(44, 0, -3)], "nf lo dash");
  line(ground, [P(0, -44, -3), P(0, 44, -3)], "nf lo dash");
  box(ground, -34, -34, 34, 34, -3, 0, 2.5);

  // 2. Terminal Main Chassis & Seated Faceplate
  const chassis = mk("g", {}, root);
  box(chassis, -20, -22, 20, 22, 0, 16, 3);
  // Sloped keypad collar
  box(chassis, -19, -20.5, 19, 20.5, 16, 17.6, 2.4);
  // Front card slot bezel
  const slotPts = [P(-11.5, -22.1, 4.2), P(11.5, -22.1, 4.2), P(11.5, -22.1, 7.8), P(-11.5, -22.1, 7.8)];
  mk("path", { d: poly(slotPts), class: "nf crease" }, chassis);
  line(chassis, [P(-10.5, -22.1, 6), P(10.5, -22.1, 6)], "nf lo");

  // Display window on upper faceplate
  const screen = rrect(-13, 11, 13, 18, 1, 4).map(q => P(q.u, q.v, 17.7));
  mk("path", { d: poly(screen), class: "nf crease" }, chassis);
  line(chassis, [P(-11, 14.5, 17.7), P(11, 14.5, 17.7)], "nf lo dot");

  // 3. 12 Tactile Keypad Buttons (3 cols x 4 rows)
  const keyGroup = mk("g", {}, root);
  const keyEls = Array.from({ length: 12 }, () => solid(keyGroup));
  const keyCols = [-9.5, 0, 9.5], keyRows = [-14, -6, 2, 8.5];
  const keyLabels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "OK"];
  const keyCoords = [];

  let idx = 0;
  for (const ky of keyRows) {
    for (const kx of keyCols) {
      keyCoords.push([kx, ky]);
      idx++;
    }
  }

  // 4. Moving Smart Card
  const cardGroup = mk("g", {}, root);
  const cardEl = solid(cardGroup);
  const chipOutline = mk("path", { class: "nf crease" }, cardGroup);
  const chipGrid = mk("path", { class: "nf lo" }, cardGroup);

  const setPrism = (el, x0, y0, x1, y1, z0, z1, r = 1) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, 0.55);
    put(el, prism(P, front, ring, inner, z0, z1));
  };

  function draw() {
    const ins = clamp(cardS.x, 0, 1);
    
    // Animate Card Insertion along Y
    // At ins = 0: card sits out (y = -42 to -14)
    // At ins = 1: card deep in slot (y = -26 to 2)
    const cardY = -14 + ins * 16;
    setPrism(cardEl, -10.5, cardY - 28, 10.5, cardY, 4.8, 5.8, 1);
    const cRing = rrect(-3.2, cardY - 18, 3.2, cardY - 11, 0.6, 4).map(q => P(q.u, q.v, 5.9));
    chipOutline.setAttribute("d", poly(cRing));
    chipGrid.setAttribute("d", [
      seg(P(-3.2, cardY - 14.5, 5.9), P(3.2, cardY - 14.5, 5.9)),
      seg(P(0, cardY - 18, 5.9), P(0, cardY - 11, 5.9))
    ].join(""));

    // Animate Key Depressions
    for (let k = 0; k < 12; k++) {
      const [kx, ky] = keyCoords[k];
      const press = clamp(keyDep[k].x, 0, 1);
      const zTop = 19.8 - press * 1.4; // Depresses down into plate
      setPrism(keyEls[k], kx - 3.2, ky - 2.8, kx + 3.2, ky + 2.8, 17.6, zTop, 0.8);
    }
  }

  function aim(p) {
    if (!p) {
      cardS.t = 0;
      activeKey = -1;
      for (let k = 0; k < 12; k++) {
        keyDep[k].t = 0;
        keyEls[k].sil.classList.remove("hi");
      }
      cardEl.sil.classList.remove("hi");
      read.textContent = "insert card";
      B.wake();
      return;
    }

    const q = unproj(C, p[0], p[1], 18);
    // 1. Is pointer touching or near the card / card slot?
    const nearCard = q[1] < -12 && Math.abs(q[0]) < 18;
    if (nearCard) {
      // Insertion follows pointer depth
      const depthNorm = clamp((-12 - q[1]) / 28, 0, 1);
      cardS.t = 1 - depthNorm; // Pushing towards slot inserts card
      cardEl.sil.classList.add("hi");
      read.textContent = cardS.t > 0.85 ? "card seated · enter pin" : "inserting card...";
    } else {
      // Card stays inserted once approached, or smoothly seats
      cardS.t = 1;
      cardEl.sil.classList.remove("hi");
    }

    // 2. Is pointer over keypad? Find closest key
    let hitK = -1, minDist = 6;
    for (let k = 0; k < 12; k++) {
      const [kx, ky] = keyCoords[k];
      const dist = Math.hypot(q[0] - kx, q[1] - ky);
      if (dist < minDist) {
        minDist = dist;
        hitK = k;
      }
    }

    activeKey = hitK;
    for (let k = 0; k < 12; k++) {
      const isTarget = k === hitK;
      keyDep[k].t = isTarget ? 1 : 0;
      keyEls[k].sil.classList.toggle("hi", isTarget);
    }

    if (hitK >= 0) {
      read.textContent = `key [${keyLabels[hitK]}] pressed`;
    } else if (!nearCard) {
      read.textContent = "terminal active · enter pin";
    }

    B.wake();
  }

  draw();
  read.textContent = "insert card";

  const B = register(stage, dt => {
    let moving = stepS(cardS, dt, 240, 22);
    for (let k = 0; k < 12; k++) {
      if (stepS(keyDep[k], dt, 320, 26)) moving = true;
    }
    draw();
    return moving;
  });

  bag.add(B.unregister);
  bag.add(pointer(stage, { move: aim, leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = clamp(v, 12, 32); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "case-terminal",
  means: "Payment terminal: card inserts into the slot, keypad keys depress on touch.",
  rules: [1, 2, 3, 4, 6, 7, 8, 10],
  range: [12, 24, 32],
  mount,
});
