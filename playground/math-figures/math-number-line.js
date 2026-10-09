/*
 * 5. Number Line (Trục Số Nhảy Ếch)
 * Pure Hairline 2:1 Axonometric Line Art
 * Smooth continuous hopping along parabolic arcs
 * Zero SVG text - clean visual line art
 */

export default {
  id: "math-number-line",
  title: "5. Trục Số Nhảy Ếch (Number Line Jumps)",
  concept: "Cộng nhẩm bằng bước nhảy trục số (0 + 4 = 4; 4 + 3 = 7)",
  means: "Thước đo trục số chia vạch: di chuyển con trỏ để chú ếch origami bật nhảy theo các cung parabol mượt mà dọc theo các vạch số.",
  rules: [1, 3, 5, 7, 8],
  range: [0, 4, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-58, -14, 0], [58, 14, 40]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Ruler Body (z = 0 to 4.0)
    const [rO, rI] = HL.rings(-54, -8, 54, 8, 2, 1);
    const rulerSol = HL.solid(svg);
    HL.put(rulerSol, HL.prism(P, front, rO, rI, 0, 4.0));

    // Ticks on ruler surface
    const ticks = [];
    for (let i = 0; i <= 10; i++) {
      const x = -48 + i * 9.6;
      ticks.push(x);

      // Major ticks at 0, 5, 10; minor ticks at others
      const isMajor = i % 5 === 0;
      const isKey = i === 4 || i === 7;
      const yStart = isMajor ? -6.5 : (isKey ? -5.5 : -4.5);

      HL.mk("line", {
        x1: P(x, yStart, 4.0)[0], y1: P(x, yStart, 4.0)[1],
        x2: P(x, 1.0, 4.0)[0], y2: P(x, 1.0, 4.0)[1],
        stroke: "#232327",
        "stroke-width": (isMajor || isKey ? 1.4 : 1.0)
      }, svg);
    }

    // Parabolic Jump Arc 1: 0 -> 4
    const arc1Pts = [];
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const x = HL.lerp(ticks[0], ticks[4], t);
      const z = 4.0 + 4 * 18 * t * (1 - t);
      arc1Pts.push(P(x, 0, z));
    }
    const arc1Path = HL.mk("path", {
      d: HL.open(arc1Pts),
      stroke: "#6f6f78",
      "stroke-dasharray": "3 2",
      fill: "none",
      "stroke-width": 1.2
    }, svg);

    // Parabolic Jump Arc 2: 4 -> 7
    const arc2Pts = [];
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const x = HL.lerp(ticks[4], ticks[7], t);
      const z = 4.0 + 4 * 14 * t * (1 - t);
      arc2Pts.push(P(x, 0, z));
    }
    const arc2Path = HL.mk("path", {
      d: HL.open(arc2Pts),
      stroke: "#6f6f78",
      "stroke-dasharray": "3 2",
      fill: "none",
      "stroke-width": 1.2
    }, svg);

    // Origami Frog 3D Mesh
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

    // Frog Eyes
    const eyeDots = [
      HL.mk("circle", { r: 1.2, fill: "#232327" }, frogGroup),
      HL.mk("circle", { r: 1.2, fill: "#232327" }, frogGroup)
    ];

    // Contact shadow & drop line
    const shadowEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
    const dropLineEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

    // Continuous parameter along the route: 0 -> 0.57 (arc 1) -> 1.0 (arc 2)
    const initT = initialV != null ? HL.clamp(initialV / 7, 0, 1) : 0.57;
    const jumpProgress = HL.spring(initT, { k: 120, c: 13 });

    function draw() {
      const t = HL.clamp(jumpProgress.x, 0, 1);
      let x, z, pitch;

      if (t <= 0.57) {
        // Arc 1: 0 -> 4 (+4 jump)
        const u = t / 0.57;
        x = HL.lerp(ticks[0], ticks[4], u);
        z = 4.0 + 4 * 18 * u * (1 - u);
        const slope = (4 * 18 * (1 - 2 * u)) / (ticks[4] - ticks[0]);
        pitch = Math.atan(slope) * 0.45;
      } else {
        // Arc 2: 4 -> 7 (+3 jump)
        const u = (t - 0.57) / 0.43;
        x = HL.lerp(ticks[4], ticks[7], u);
        z = 4.0 + 4 * 14 * u * (1 - u);
        const slope = (4 * 14 * (1 - 2 * u)) / (ticks[7] - ticks[4]);
        pitch = Math.atan(slope) * 0.45;
      }

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      function V(lx, ly, lz) {
        const rotX = lx * cosP - lz * sinP;
        const rotZ = lx * sinP + lz * cosP;
        return P(x + rotX, ly, z + rotZ);
      }

      const snout = V(7.0, 0, 1.6);
      const eyeL = V(3.2, -3.4, 4.6);
      const eyeR = V(3.2, 3.4, 4.6);
      const crown = V(3.8, 0, 4.2);
      const spine = V(-1.0, 0, 5.6);
      const tail = V(-6.2, 0, 1.4);
      const flankL = V(-1.0, -5.6, 2.0);
      const flankR = V(-1.0, 5.6, 2.0);
      const kneeL = V(-3.8, -6.6, 3.4);
      const kneeR = V(-3.8, 6.6, 3.4);
      const footL = V(-6.6, -7.0, 0);
      const footR = V(-6.6, 7.0, 0);

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
        const pointsStr = pts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" ");
        faceEls[i].setAttribute("points", pointsStr);
      });

      eyeDots[0].setAttribute("cx", HL.r2(eyeL[0]));
      eyeDots[0].setAttribute("cy", HL.r2(eyeL[1]));
      eyeDots[1].setAttribute("cx", HL.r2(eyeR[0]));
      eyeDots[1].setAttribute("cy", HL.r2(eyeR[1]));

      // Shadow on ruler
      const shadowPts = [];
      const sScale = HL.clamp(1 - (z - 4) * 0.03, 0.4, 1);
      for (let k = 0; k <= 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        shadowPts.push(P(x + 5.5 * sScale * Math.cos(a), 3.8 * sScale * Math.sin(a), 4.0));
      }
      shadowEl.setAttribute("d", HL.poly(shadowPts));

      if (z > 5.5) {
        dropLineEl.style.display = "";
        dropLineEl.setAttribute("d", HL.seg(P(x, 0, z), P(x, 0, 4.0)));
      } else {
        dropLineEl.style.display = "none";
      }

      const curVal = Math.round(t <= 0.57 ? (t / 0.57) * 4 : 4 + ((t - 0.57) / 0.43) * 3);
      read.textContent = "Bước nhảy ếch: 0 + 4 = 4; 4 + 3 = 7 (Vị trí: " + curVal + ")";
    }

    function aim(pt) {
      if (!pt) {
        jumpProgress.t = 0.57; // Rest at 4
        reg.wake();
        return;
      }
      const scr0 = P(ticks[0], 0, 4.0)[0];
      const scr7 = P(ticks[7], 0, 4.0)[0];
      const t = HL.clamp((pt[0] - scr0) / (scr7 - scr0), 0, 1);
      jumpProgress.t = t;
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
