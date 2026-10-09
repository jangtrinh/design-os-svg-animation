export default {
  id: "math-number-line",
  title: "5. Trục Số Nhảy Ếch (Number Line Jumps)",
  concept: "Cộng nhẩm bằng bước nhảy trục số",
  means: "Thước đo trục số: vạch chia đánh số từ 0 đến 10. Chú ếch origami với đầu mũi tên nhảy dọc cung parabol 0 -> 4 -> 7 hướng về phía trước.",
  rules: [1, 3, 5, 7, 8],
  range: [0, 4, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-58, -14, 0], [58, 14, 38]], 200, 160);
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

      // Tick line on ruler surface (positioned in upper half: y = -6 to y = -1.2)
      HL.mk("line", {
        x1: P(x, -6.0, 4.0)[0], y1: P(x, -6.0, 4.0)[1],
        x2: P(x, -1.2, 4.0)[0], y2: P(x, -1.2, 4.0)[1],
        stroke: "#232327",
        "stroke-width": (i === 0 || i === 4 || i === 7 ? 1.4 : 1.0)
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
    HL.mk("path", {
      d: HL.open(arc1Pts),
      stroke: "#6f6f78",
      "stroke-dasharray": "3 2",
      fill: "none",
      "stroke-width": 1.2
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
    HL.mk("path", {
      d: HL.open(arc2Pts),
      stroke: "#6f6f78",
      "stroke-dasharray": "3 2",
      fill: "none",
      "stroke-width": 1.2
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

    // Contact shadow and vertical drop line on ruler
    const shadowEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
    const dropLineEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

    // Origami / Vector Frog Pointer Group
    const frogG = HL.mk("g", {}, svg);
    const NUM_FACES = 7;
    const faceEls = [];
    for (let f = 0; f < NUM_FACES; f++) {
      faceEls.push(
        HL.mk("polygon", {
          fill: "#ffffff",
          stroke: "#232327",
          "stroke-width": "1.2",
          "stroke-linejoin": "round"
        }, frogG)
      );
    }
    const eyeDots = [
      HL.mk("circle", { r: 1.4, fill: "#232327" }, frogG),
      HL.mk("circle", { r: 1.4, fill: "#232327" }, frogG)
    ];

    const jumpProgress = HL.spring(0.57, { k: 110, c: 14 });

    function draw() {
      const t = jumpProgress.x;
      let x, z, dz, dx;

      if (t <= 0.57) {
        const subT = t / 0.57;
        x = HL.lerp(ticks[0], ticks[4], subT);
        z = 4.0 + 4 * 18 * subT * (1 - subT);
        dz = 72 * (1 - 2 * subT);
        dx = ticks[4] - ticks[0];
      } else {
        const subT = (t - 0.57) / 0.43;
        x = HL.lerp(ticks[4], ticks[7], subT);
        z = 4.0 + 4 * 14 * subT * (1 - subT);
        dz = 56 * (1 - 2 * subT);
        dx = ticks[7] - ticks[4];
      }

      // Smooth pitch rotation along parabolic trajectory
      const pitch = Math.atan2(dz, dx) * 0.4;
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      // Vertex transform helper (local frog space -> world -> projected screen)
      function V(lx, ly, lz) {
        const rotX = lx * cosP - lz * sinP;
        const rotZ = lx * sinP + lz * cosP;
        return P(x + rotX, ly, z + rotZ);
      }

      // Key 3D points of Origami Frog (pointing forward in +X jump direction)
      const snout = V(7.0, 0, 1.6);        // Arrowhead snout pointing along direction of jump (+X)
      const eyeL = V(3.2, -3.4, 4.6);
      const eyeR = V(3.2, 3.4, 4.6);
      const crown = V(3.8, 0, 4.2);
      const spine = V(-1.0, 0, 5.6);       // Folded dorsal ridge
      const tail = V(-6.2, 0, 1.4);        // Rear crease fold
      const flankL = V(-1.0, -5.6, 2.0);
      const flankR = V(-1.0, 5.6, 2.0);
      const kneeL = V(-3.8, -6.6, 3.4);
      const kneeR = V(-3.8, 6.6, 3.4);
      const footL = V(-6.6, -7.0, 0);
      const footR = V(-6.6, 7.0, 0);

      // Faces ordered back to front for 2:1 axonometric projection
      const faces = [
        [flankL, kneeL, footL],         // Left hind leg
        [flankR, kneeR, footR],         // Right hind leg
        [spine, flankL, tail],          // Left rear flank
        [spine, tail, flankR],          // Right rear flank
        [crown, eyeL, flankL, spine],   // Left dorsal facet
        [crown, spine, flankR, eyeR],   // Right dorsal facet
        [snout, eyeR, crown, eyeL]      // Front arrow-head snout face pointing forward
      ];

      faces.forEach((pts, i) => {
        const pointsStr = pts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" ");
        faceEls[i].setAttribute("points", pointsStr);
      });

      // Eyes
      eyeDots[0].setAttribute("cx", HL.r2(eyeL[0]));
      eyeDots[0].setAttribute("cy", HL.r2(eyeL[1]));
      eyeDots[1].setAttribute("cx", HL.r2(eyeR[0]));
      eyeDots[1].setAttribute("cy", HL.r2(eyeR[1]));

      // Contact shadow on the ruler face at z = 4.0
      const shadowPts = [];
      for (let k = 0; k <= 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        shadowPts.push(P(x + 5.5 * Math.cos(a), 3.8 * Math.sin(a), 4.0));
      }
      shadowEl.setAttribute("d", HL.poly(shadowPts));

      // Dashed vertical drop line from frog down to contact shadow
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
      if (!pt) return;
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
    bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
    bag.add(() => svg.replaceChildren());

    // Initialize
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
