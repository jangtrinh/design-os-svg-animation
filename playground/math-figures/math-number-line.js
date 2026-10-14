/*
 * 5. Number Line (Trục Số Nhảy Cung Parabol)
 * Pedagogical Goal: Jump addition on number line (0 + 4 = 4; 4 + 3 = 7)
 */

export default {
  id: "math-number-line",
  title: "5. Trục Số Nhảy Ếch (Number Line Jumps)",
  concept: "Cộng nhẩm bằng bước nhảy trục số (0 + 4 = 4; 4 + 3 = 7)",
  means: "Thước đo trục số chia vạch tinh giản: di chuột để chú ếch origami bật nhảy theo các cung parabol mượt mà dọc theo các vạch số, trực quan hóa phép cộng nhảy bước.",
  rules: [1, 3, 5, 7, 9],
  range: [0, 4, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.2);
    HL.fit(C, [[-52, -10, 0], [52, 10, 26]], 200, 165);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Graduated Scale Ruler (Z: 0 to 4.0)
    const [rO, rI] = HL.rings(-52, -8, 52, 8, 2.5, 0.8);
    const rulerSol = HL.solid(svg);
    HL.put(rulerSol, HL.prism(P, front, rO, rI, 0, 4.0));

    // 2. Graduation Station Ticks (0 to 10)
    const ticks = [];
    const tickEls = [];
    for (let i = 0; i <= 10; i++) {
      const x = -46 + i * 9.2;
      ticks.push(x);
      const isMajor = i % 5 === 0;
      const isKey = i === 4 || i === 7;
      const yStart = isMajor ? -6.5 : (isKey ? -5.5 : -4.0);
      const p0 = P(x, yStart, 4.1), p1 = P(x, 1.0, 4.1);
      const tLine = HL.mk("line", {
        x1: HL.r2(p0[0]), y1: HL.r2(p0[1]),
        x2: HL.r2(p1[0]), y2: HL.r2(p1[1]),
        class: i === 4 ? "hi" : (isMajor || isKey ? "sil" : "lo")
      }, svg);
      tickEls.push(tLine);
    }

    // 3. Parabolic Jump Arcs (0 -> 4 and 4 -> 7)
    const makeArc = (x0, x1, h) => {
      const pts = [];
      for (let s = 0; s <= 24; s++) {
        const t = s / 24;
        pts.push(P(HL.lerp(x0, x1, t), 0, 4.1 + 4 * h * t * (1 - t)));
      }
      return HL.open(pts);
    };
    HL.mk("path", { class: "nf lo dash", d: makeArc(ticks[0], ticks[4], 15) }, svg);
    HL.mk("path", { class: "nf hi dash", d: makeArc(ticks[4], ticks[7], 12) }, svg);

    // 4. Faceted Origami Hopper
    const frogGroup = HL.mk("g", {}, svg);
    const faceEls = Array.from({ length: 7 }, (_, i) =>
      HL.mk("polygon", { class: i < 2 ? "lo" : "sil" }, frogGroup)
    );
    const eyeDots = [
      HL.mk("ellipse", { rx: 1.4, ry: 1.4, class: "dot" }, frogGroup),
      HL.mk("ellipse", { rx: 1.4, ry: 1.4, class: "dot" }, frogGroup)
    ];

    const shadowEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
    const dropLineEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

    const initT = initialV != null ? HL.clamp(initialV / 7, 0, 1) : 0.57;
    const jumpProgress = HL.spring(initT, { k: 120, c: 13 });
    let active = false;
    let lastKey = "";

    function draw() {
      const t = HL.clamp(jumpProgress.x, 0, 1);
      const key = `${HL.r2(t)}:${active ? 1 : 0}`;
      if (key === lastKey) return;
      lastKey = key;

      let x, z, pitch;
      if (t <= 0.57) {
        const u = t / 0.57;
        x = HL.lerp(ticks[0], ticks[4], u);
        z = 4.1 + 4 * 15 * u * (1 - u);
        pitch = Math.atan((4 * 15 * (1 - 2 * u)) / (ticks[4] - ticks[0])) * 0.45;
      } else {
        const u = (t - 0.57) / 0.43;
        x = HL.lerp(ticks[4], ticks[7], u);
        z = 4.1 + 4 * 12 * u * (1 - u);
        pitch = Math.atan((4 * 12 * (1 - 2 * u)) / (ticks[7] - ticks[4])) * 0.45;
      }

      const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
      const V = (lx, ly, lz) => P(x + lx * cosP - lz * sinP, ly, z + lx * sinP + lz * cosP);

      const snout = V(6.5, 0, 1.5), eyeL = V(3.0, -3.0, 4.2), eyeR = V(3.0, 3.0, 4.2);
      const crown = V(3.5, 0, 3.8), spine = V(-1.0, 0, 5.0), tail = V(-5.5, 0, 1.2);
      const flankL = V(-1.0, -5.0, 1.8), flankR = V(-1.0, 5.0, 1.8);
      const kneeL = V(-3.5, -6.0, 3.0), kneeR = V(-3.5, 6.0, 3.0);
      const footL = V(-6.0, -6.2, 0), footR = V(-6.0, 6.2, 0);

      const faces = [
        [flankL, kneeL, footL], [flankR, kneeR, footR],
        [spine, flankL, tail], [spine, tail, flankR],
        [crown, eyeL, flankL, spine], [crown, spine, flankR, eyeR],
        [snout, eyeR, crown, eyeL]
      ];
      faces.forEach((pts, i) => {
        faceEls[i].setAttribute("points", pts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));
      });
      HL.place(eyeDots[0], eyeL);
      HL.place(eyeDots[1], eyeR);

      const shadowPts = [];
      const sScale = HL.clamp(1 - (z - 4.1) * 0.03, 0.4, 1);
      for (let k = 0; k <= 20; k++) {
        const a = (k / 20) * Math.PI * 2;
        shadowPts.push(P(x + 5.0 * sScale * Math.cos(a), 3.5 * sScale * Math.sin(a), 4.1));
      }
      shadowEl.setAttribute("d", HL.poly(shadowPts));
      dropLineEl.setAttribute("d", z > 5.5 ? HL.seg(P(x, 0, z), P(x, 0, 4.1)) : "");

      const curTickIdx = Math.round(t <= 0.57 ? (t / 0.57) * 4 : 4 + ((t - 0.57) / 0.43) * 3);
      tickEls.forEach((el, idx) => {
        el.classList.toggle("hi", active ? idx === curTickIdx : idx === 4);
      });

      read.textContent = `Trục số: 0+4=4, 4+3=7 (@${curTickIdx})`;
    }

    function aim(pt) {
      if (!pt) {
        jumpProgress.t = 0.57;
        active = false;
        reg.wake();
        return;
      }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 4.1);
      const axis = (wx - wy) * Math.SQRT1_2;
      jumpProgress.t = HL.clamp((axis + 32) / 52, 0, 1);
      active = true;
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(jumpProgress, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        jumpProgress.t = HL.clamp(v / 7, 0, 1);
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
