export default {
  id: "math-number-line",
  title: "5. Trục Số Nhảy Ếch (Number Line Jumps)",
  concept: "Cộng nhẩm bằng bước nhảy trục số (0 + 4 = 4; 4 + 3 = 7)",
  means: "Thước đo trục số chia vạch 0 đến 10. Click để chú ếch origami bật nhảy theo cung parabol: bước 1 nhảy +4 vạch (đến 4), bước 2 nhảy +3 vạch (đến 7).",
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

    // Ticks & Number Labels 0 to 10
    const ticks = [];
    for (let i = 0; i <= 10; i++) {
      const x = -48 + i * 9.6;
      ticks.push(x);

      // Tick line on ruler surface
      HL.mk("line", {
        x1: P(x, -6.0, 4.0)[0], y1: P(x, -6.0, 4.0)[1],
        x2: P(x, -1.2, 4.0)[0], y2: P(x, -1.2, 4.0)[1],
        stroke: "#232327",
        "stroke-width": (i === 0 || i === 4 || i === 7 ? 1.5 : 1.0)
      }, svg);

      // Number Label 0, 1, 2, ..., 10 at lower half of ruler face
      const [tx, ty] = P(x, 3.6, 4.0);
      const textNode = HL.mk("text", {
        x: tx,
        y: ty + 4.0,
        "text-anchor": "middle",
        "font-family": "ui-monospace, monospace",
        "font-size": "7.5",
        "font-weight": (i === 0 || i === 4 || i === 7 ? "700" : "500"),
        fill: "#232327"
      }, svg);
      textNode.textContent = String(i);
    }

    // Parabolic Jump Arc 1: 0 -> 4 (+4)
    const arc1Pts = [];
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const x = HL.lerp(ticks[0], ticks[4], t);
      const z = 4.0 + 4 * 18 * t * (1 - t);
      arc1Pts.push(P(x, 0, z));
    }
    const arc1Path = HL.mk("path", {
      d: HL.open(arc1Pts),
      stroke: "#232327",
      "stroke-dasharray": "3 2",
      fill: "none",
      "stroke-width": 1.4
    }, svg);

    // Label "+4" above Arc 1 peak
    const apex1Scr = P((ticks[0] + ticks[4]) / 2, 0, 22.5);
    const label1 = HL.mk("text", {
      x: apex1Scr[0],
      y: apex1Scr[1] - 6,
      "text-anchor": "middle",
      "font-family": "ui-monospace, monospace",
      "font-size": "10",
      "font-weight": "700",
      fill: "#232327"
    }, svg);
    label1.textContent = "+4";

    // Parabolic Jump Arc 2: 4 -> 7 (+3)
    const arc2Pts = [];
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const x = HL.lerp(ticks[4], ticks[7], t);
      const z = 4.0 + 4 * 14 * t * (1 - t);
      arc2Pts.push(P(x, 0, z));
    }
    const arc2Path = HL.mk("path", {
      d: HL.open(arc2Pts),
      stroke: "#232327",
      "stroke-dasharray": "3 2",
      fill: "none",
      "stroke-width": 1.4
    }, svg);

    // Label "+3" above Arc 2 peak
    const apex2Scr = P((ticks[4] + ticks[7]) / 2, 0, 18.5);
    const label2 = HL.mk("text", {
      x: apex2Scr[0],
      y: apex2Scr[1] - 6,
      "text-anchor": "middle",
      "font-family": "ui-monospace, monospace",
      "font-size": "10",
      "font-weight": "700",
      fill: "#232327"
    }, svg);
    label2.textContent = "+3";

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

    // State machine:
    // step = 0: at tick 0
    // step = 1: at tick 4 (after leap 1)
    // step = 2: at tick 7 (after leap 2)
    let curStep = initialV != null ? (initialV >= 7 ? 2 : (initialV >= 4 ? 1 : 0)) : 1;

    // Continuous parameter along the route: 0 -> 0.57 (arc 1) -> 1.0 (arc 2)
    const stepTargetMap = [0, 0.57, 1.0];
    const jumpProgress = HL.spring(stepTargetMap[curStep], { k: 120, c: 13 });

    function setHopStep(nextStep) {
      curStep = nextStep % 3;
      jumpProgress.t = stepTargetMap[curStep];
      reg.wake();
    }

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

      // Key 3D points of Origami Frog
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

      if (curStep === 0) {
        read.textContent = "Vị trí 0: Chú ếch chuẩn bị nhảy! (Click để ếch nhảy bước 1)";
        arc1Path.setAttribute("stroke", "#6f6f78");
        arc2Path.setAttribute("stroke", "#6f6f78");
      } else if (curStep === 1) {
        read.textContent = "Bước 1: 0 + 4 = 4 (Ếch nhảy qua 4 vạch số · Click để nhảy tiếp)";
        arc1Path.setAttribute("stroke", "#232327");
        arc2Path.setAttribute("stroke", "#6f6f78");
      } else {
        read.textContent = "Bước 2: 4 + 3 = 7! Tổng cộng: 0 + 4 + 3 = 7 (Click để quay lại vạch 0)";
        arc1Path.setAttribute("stroke", "#232327");
        arc2Path.setAttribute("stroke", "#232327");
      }
    }

    function handleClick(pt) {
      if (!pt) {
        setHopStep(curStep + 1);
        return;
      }
      // Check if clicked near tick 0, 4, or 7
      const s0 = P(ticks[0], 0, 4)[0];
      const s4 = P(ticks[4], 0, 4)[0];
      const s7 = P(ticks[7], 0, 4)[0];

      const d0 = Math.abs(pt[0] - s0);
      const d4 = Math.abs(pt[0] - s4);
      const d7 = Math.abs(pt[0] - s7);

      if (d0 < 20) setHopStep(0);
      else if (d4 < 20) setHopStep(1);
      else if (d7 < 20) setHopStep(2);
      else setHopStep(curStep + 1);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(jumpProgress, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { down: handleClick }));
    bag.add(() => svg.replaceChildren());

    // Initialize
    draw();

    return {
      set(v) {
        if (v <= 2) setHopStep(0);
        else if (v <= 5) setHopStep(1);
        else setHopStep(2);
      },
      destroy: bag.dispose
    };
  }
};
