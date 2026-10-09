/*
 * 5. Number Line (Trục Số Nhảy Cung Parabol)
 * Pedagogical Goal: Jump addition on number line (0 + 4 = 4; 4 + 3 = 7)
 * Simplified Geometry: Clean beveled scale ruler with 0..10 graduation ticks & parabolic jump arcs
 * Meaningful Interaction: Moving pointer smoothly drives hopper along parabolic arcs with spring tracking
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
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-58, -14, 0], [58, 14, 42]], 200, 160);
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

      const tLine = HL.mk("line", {
        x1: HL.r2(P(x, yStart, 4.1)[0]), y1: HL.r2(P(x, yStart, 4.1)[1]),
        x2: HL.r2(P(x, 1.0, 4.1)[0]), y2: HL.r2(P(x, 1.0, 4.1)[1]),
        stroke: (isMajor || isKey ? "#111113" : "#6f6f78"),
        "stroke-width": (isMajor || isKey ? 1.4 : 0.9),
        class: (i === 4 ? "hi" : (isMajor ? "" : "lo"))
      }, svg);
      tickEls.push(tLine);
    }

    // 3. Parabolic Jump Arcs
    // Arc 1: 0 -> 4 (+4 jump)
    const arc1Pts = [];
    for (let s = 0; s <= 28; s++) {
      const t = s / 28;
      const x = HL.lerp(ticks[0], ticks[4], t);
      const z = 4.1 + 4 * 16 * t * (1 - t);
      arc1Pts.push(P(x, 0, z));
    }
    HL.mk("path", {
      d: HL.open(arc1Pts),
      stroke: "#5b5d64",
      "stroke-dasharray": "2.5 2.0",
      fill: "none",
      "stroke-width": 1.2
    }, svg);

    // Arc 2: 4 -> 7 (+3 jump)
    const arc2Pts = [];
    for (let s = 0; s <= 28; s++) {
      const t = s / 28;
      const x = HL.lerp(ticks[4], ticks[7], t);
      const z = 4.1 + 4 * 13 * t * (1 - t);
      arc2Pts.push(P(x, 0, z));
    }
    HL.mk("path", {
      d: HL.open(arc2Pts),
      stroke: "#5b5d64",
      "stroke-dasharray": "2.5 2.0",
      fill: "none",
      "stroke-width": 1.2
    }, svg);

    // 4. Faceted Origami Hopper
    const frogGroup = HL.mk("g", { id: "origami-frog" }, svg);
    const faceEls = [];
    for (let i = 0; i < 7; i++) {
      const poly = HL.mk("polygon", {
        fill: i < 2 ? "#e0e0e4" : "#ffffff",
        stroke: "#232327",
        "stroke-width": 1.1,
        "stroke-linejoin": "round"
      }, frogGroup);
      faceEls.push(poly);
    }

    const eyeDots = [
      HL.mk("circle", { r: 1.2, fill: "#232327" }, frogGroup),
      HL.mk("circle", { r: 1.2, fill: "#232327" }, frogGroup)
    ];

    const shadowEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
    const dropLineEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

    const initT = initialV != null ? HL.clamp(initialV / 7, 0, 1) : 0.57;
    const jumpProgress = HL.spring(initT, { k: 120, c: 13 });
    let active = false;

    function draw() {
      const t = HL.clamp(jumpProgress.x, 0, 1);
      let x, z, pitch;

      if (t <= 0.57) {
        const u = t / 0.57;
        x = HL.lerp(ticks[0], ticks[4], u);
        z = 4.1 + 4 * 16 * u * (1 - u);
        const slope = (4 * 16 * (1 - 2 * u)) / (ticks[4] - ticks[0]);
        pitch = Math.atan(slope) * 0.45;
      } else {
        const u = (t - 0.57) / 0.43;
        x = HL.lerp(ticks[4], ticks[7], u);
        z = 4.1 + 4 * 13 * u * (1 - u);
        const slope = (4 * 13 * (1 - 2 * u)) / (ticks[7] - ticks[4]);
        pitch = Math.atan(slope) * 0.45;
      }

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      function V(lx, ly, lz) {
        const rotX = lx * cosP - lz * sinP;
        const rotZ = lx * sinP + lz * cosP;
        return P(x + rotX, ly, z + rotZ);
      }

      const snout = V(6.5, 0, 1.5);
      const eyeL = V(3.0, -3.0, 4.2);
      const eyeR = V(3.0, 3.0, 4.2);
      const crown = V(3.5, 0, 3.8);
      const spine = V(-1.0, 0, 5.0);
      const tail = V(-5.5, 0, 1.2);
      const flankL = V(-1.0, -5.0, 1.8);
      const flankR = V(-1.0, 5.0, 1.8);
      const kneeL = V(-3.5, -6.0, 3.0);
      const kneeR = V(-3.5, 6.0, 3.0);
      const footL = V(-6.0, -6.2, 0);
      const footR = V(-6.0, 6.2, 0);

      const faces = [
        [flankL, kneeL, footL],
        [flankR, kneeR, footR],
        [spine, flankL, tail],
        [spine, tail, flankR],
        [crown, eyeL, flankL, spine],
        [crown, spine, flankR, eyeR],
        [snout, eyeR, crown, eyeL]
      ];

      faces.forEach((pts, i) => {
        faceEls[i].setAttribute("points", pts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));
      });

      eyeDots[0].setAttribute("cx", HL.r2(eyeL[0]));
      eyeDots[0].setAttribute("cy", HL.r2(eyeL[1]));
      eyeDots[1].setAttribute("cx", HL.r2(eyeR[0]));
      eyeDots[1].setAttribute("cy", HL.r2(eyeR[1]));

      // Shadow on ruler surface
      const shadowPts = [];
      const sScale = HL.clamp(1 - (z - 4.1) * 0.03, 0.4, 1);
      for (let k = 0; k <= 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        shadowPts.push(P(x + 5.0 * sScale * Math.cos(a), 3.5 * sScale * Math.sin(a), 4.1));
      }
      shadowEl.setAttribute("d", HL.poly(shadowPts));

      if (z > 5.5) {
        dropLineEl.style.display = "";
        dropLineEl.setAttribute("d", HL.seg(P(x, 0, z), P(x, 0, 4.1)));
      } else {
        dropLineEl.style.display = "none";
      }

      const curTickIdx = Math.round(t <= 0.57 ? (t / 0.57) * 4 : 4 + ((t - 0.57) / 0.43) * 3);
      tickEls.forEach((el, idx) => {
        const isHi = active ? (idx === curTickIdx) : (idx === 4);
        el.classList.toggle("hi", isHi);
      });

      read.textContent = "Trục số nhảy ếch: 0 + 4 = 4; 4 + 3 = 7 (Vị trí hiện tại: " + curTickIdx + ")";
    }

    function aim(pt) {
      if (!pt) {
        jumpProgress.t = 0.57;
        active = false;
        reg.wake();
        return;
      }
      const scr0 = P(ticks[0], 0, 4.1)[0];
      const scr7 = P(ticks[7], 0, 4.1)[0];
      const t = HL.clamp((pt[0] - scr0) / (scr7 - scr0), 0, 1);
      jumpProgress.t = t;
      active = true;
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(jumpProgress, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        jumpProgress.t = 0.57;
        active = false;
        reg.wake();
      }
    }));
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
