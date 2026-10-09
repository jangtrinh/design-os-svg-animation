/*
 * 2. Math Balance Scale (Cân Thăng Bằng Số Học)
 * Crafted to Lucas Markes Hairline Standard:
 * - Tapered cast truss beam with circular end eyelets
 * - Swinging vertical indicator needle & engraved focal scale arc
 * - Turned pedestal mast with collar rings & leveling plinth
 * - Dished brass pans & calibrated cylindrical weights with spherical lifting knobs
 * - Pure 2:1 axonometric line art with Rule 04/05/09 solid & crease discipline
 */

export default {
  id: "math-balance",
  title: "2. Cân Thăng Bằng (Balance Scale)",
  concept: "So sánh lớn hơn, bé hơn, bằng nhau",
  means: "Cân thăng bằng cơ học chính xác: dầm cân hình thoi vuốt thon với kim chỉ thị trung tâm; di chuyển con trỏ để làm cân nghiêng tự nhiên, thả chuột kim hồi phục về vạch 0 thăng bằng.",
  rules: [1, 3, 4, 6, 7, 9],
  range: [-1, 0, 1],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-58, -20, 0], [58, 20, 58]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Leveling Instrument Plinth Base (Z: 0 to 5)
    const [baseO, baseI] = HL.rings(-26, -18, 26, 18, 4, 1.2);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 5));

    // Two brass leveling thumb-screws at front corners of plinth
    for (const [bx, by] of [[-20, 14], [20, 14]]) {
      const [screwO] = HL.rings(bx - 2.8, by - 2.8, bx + 2.8, by + 2.8, 2.8, 0.6);
      HL.mk("path", { class: "lo", d: HL.poly(HL.ringAt(P, screwO, 5.2)) }, svg);
      HL.mk("circle", { cx: P(bx, by, 5.2)[0], cy: P(bx, by, 5.2)[1], r: 1.2, fill: "#232327" }, svg);
    }

    // 2. Turned Mast Pillar with Base Collar & Head Bracket
    // Base collar ring (Z: 5 to 9)
    const [collarO, collarI] = HL.rings(-6, -6, 6, 6, 6, 0.8);
    const collarSol = HL.solid(svg);
    HL.put(collarSol, HL.prism(P, front, collarO, collarI, 5, 9));

    // Vertical shaft (Z: 9 to 38)
    const [mastO, mastI] = HL.rings(-3.6, -3.6, 3.6, 3.6, 3.6, 0.7);
    const mastSol = HL.solid(svg);
    HL.put(mastSol, HL.prism(P, front, mastO, mastI, 9, 38));

    // Top fulcrum housing (Z: 38 to 43)
    const [headO, headI] = HL.rings(-5.5, -4, 5.5, 4, 3, 0.8);
    const headSol = HL.solid(svg);
    HL.put(headSol, HL.prism(P, front, headO, headI, 38, 43));

    // Central Agate Bearing Pivot Pin
    const pinScr = P(0, 4.2, 40.5);
    HL.mk("circle", { cx: HL.r2(pinScr[0]), cy: HL.r2(pinScr[1]), r: 2.2, fill: "#ffffff", stroke: "#232327", "stroke-width": 1.2 }, svg);
    HL.mk("circle", { cx: HL.r2(pinScr[0]), cy: HL.r2(pinScr[1]), r: 1.0, fill: "#232327" }, svg);

    // 3. Focal Indicator Scale Arc on Mast (Z: 20 to 26)
    // Engraved scale lines on front face of pillar
    const scaleArc = [];
    for (let k = -4; k <= 4; k++) {
      const ang = (k / 16) * Math.PI;
      const rA = 17.5;
      const sx = Math.sin(ang) * rA;
      const sz = 40.5 - Math.cos(ang) * rA;
      const isCenter = k === 0;
      const pTop = P(sx, 3.7, sz);
      const pBot = P(sx * 0.9, 3.7, sz - 2.5);
      HL.mk("line", {
        x1: HL.r2(pTop[0]), y1: HL.r2(pTop[1]),
        x2: HL.r2(pBot[0]), y2: HL.r2(pBot[1]),
        stroke: isCenter ? "#111113" : "#6f6f78",
        "stroke-width": isCenter ? 1.4 : 0.8,
        class: isCenter ? "hi" : "lo"
      }, svg);
    }

    // 4. Moving Elements: Beam, Pointer Needle, Pans, Cords, Weights
    const beamSol = HL.solid(svg);
    const needleLine = HL.mk("line", { stroke: "#111113", "stroke-width": 1.4, "stroke-linecap": "round" }, svg);
    const needleTip = HL.mk("circle", { r: 1.2, fill: "#232327" }, svg);

    const leftTraySol = HL.solid(svg);
    const rightTraySol = HL.solid(svg);
    const leftRim = HL.mk("ellipse", { rx: HL.r2(11.5 * C.S), ry: HL.r2(11.5 * C.S * C.k), class: "lo nf" }, svg);
    const rightRim = HL.mk("ellipse", { rx: HL.r2(11.5 * C.S), ry: HL.r2(11.5 * C.S * C.k), class: "lo nf" }, svg);

    const cords = HL.mk("path", { class: "lo", "stroke-width": 1.0 }, svg);

    // 6 Precision Calibrated Brass Weights (3 on left, 3 on right)
    const weights = Array.from({ length: 6 }, () => ({
      bodySol: HL.solid(svg),
      collarSol: HL.solid(svg),
      knobDot: HL.mk("circle", { r: 1.3, fill: "#232327" }, svg)
    }));

    const tiltSpring = HL.spring(0, { k: 110, c: 12 });
    const beamLen = 39;
    const fulcrumZ = 40.5;
    const cordLen = 23;
    const needleLen = 17.5;

    function renderCalibratedWeight(wObj, wx, wy, baseZ) {
      // Cylindrical weight body: R=3.4, H=4.5
      const [wO, wI] = HL.rings(wx - 3.4, wy - 3.4, wx + 3.4, wy + 3.4, 3.4, 0.5);
      HL.put(wObj.bodySol, HL.prism(P, front, wO, wI, baseZ, baseZ + 4.5));

      // Stepped top neck collar: R=2.0, H=1.5
      const [cO, cI] = HL.rings(wx - 2.0, wy - 2.0, wx + 2.0, wy + 2.0, 2.0, 0.4);
      HL.put(wObj.collarSol, HL.prism(P, front, cO, cI, baseZ + 4.5, baseZ + 5.8));

      // Spherical top lifting knob
      const knobScr = P(wx, wy, baseZ + 6.8);
      wObj.knobDot.setAttribute("cx", HL.r2(knobScr[0]));
      wObj.knobDot.setAttribute("cy", HL.r2(knobScr[1]));
    }

    function draw() {
      const theta = tiltSpring.x;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      // Beam pivot positions
      const xR = beamLen * cosT;
      const zR = fulcrumZ + beamLen * sinT;
      const xL = -beamLen * cosT;
      const zL = fulcrumZ - beamLen * sinT;

      // 1. Tapered Diamond Truss Beam with Rounded Eyelet Ends
      // Beam profile sampled along X from -beamLen to +beamLen
      const numPts = 20;
      const beamUpper = [];
      const beamLower = [];

      for (let i = 0; i <= numPts; i++) {
        const u = i / numPts;
        const lx = HL.lerp(-beamLen, beamLen, u);
        // Taper: height is 5.5 at center (u=0.5), tapering to 2.4 at ends
        const h = 2.4 + 3.1 * (1 - Math.pow(Math.abs(u - 0.5) * 2, 1.4));
        const rotX = lx * cosT - (h / 2) * sinT;
        const rotZ = fulcrumZ + lx * sinT + (h / 2) * cosT;
        beamUpper.push(P(rotX, 0, rotZ));

        const rotX_b = lx * cosT - (-h / 2) * sinT;
        const rotZ_b = fulcrumZ + lx * sinT + (-h / 2) * cosT;
        beamLower.push(P(rotX_b, 0, rotZ_b));
      }

      // 3D Extrusion thickness of beam (along Y: -1.4 to 1.4)
      const beamHull = HL.hull([...beamUpper, ...beamLower]);
      HL.put(beamSol, {
        sil: HL.poly(beamHull),
        crease: HL.open(beamUpper)
      });

      // 2. Vertical Indicator Needle swinging from fulcrum
      const tipX = -Math.sin(theta) * needleLen;
      const tipZ = fulcrumZ - Math.cos(theta) * needleLen;
      const nBaseScr = P(0, 2.5, fulcrumZ);
      const nTipScr = P(tipX, 2.5, tipZ);

      needleLine.setAttribute("x1", HL.r2(nBaseScr[0]));
      needleLine.setAttribute("y1", HL.r2(nBaseScr[1]));
      needleLine.setAttribute("x2", HL.r2(nTipScr[0]));
      needleLine.setAttribute("y2", HL.r2(nTipScr[1]));

      needleTip.setAttribute("cx", HL.r2(nTipScr[0]));
      needleTip.setAttribute("cy", HL.r2(nTipScr[1]));

      // 3. Pans: Plumb suspension
      const panR = 11.5;
      const trayH = 2.0;

      // Left pan
      const trayLZ = zL - cordLen;
      const [lO, lI] = HL.rings(xL - panR, -panR, xL + panR, panR, panR, 1.0);
      HL.put(leftTraySol, HL.prism(P, front, lO, lI, trayLZ, trayLZ + trayH));
      const lRimScr = P(xL, 0, trayLZ + trayH + 0.1);
      leftRim.setAttribute("cx", HL.r2(lRimScr[0]));
      leftRim.setAttribute("cy", HL.r2(lRimScr[1]));

      // Right pan
      const trayRZ = zR - cordLen;
      const [rO, rI] = HL.rings(xR - panR, -panR, xR + panR, panR, panR, 1.0);
      HL.put(rightTraySol, HL.prism(P, front, rO, rI, trayRZ, trayRZ + trayH));
      const rRimScr = P(xR, 0, trayRZ + trayH + 0.1);
      rightRim.setAttribute("cx", HL.r2(rRimScr[0]));
      rightRim.setAttribute("cy", HL.r2(rRimScr[1]));

      // Suspension cords (3 per tray at 120-degree intervals)
      let cordD = "";
      const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

      angles.forEach(a => {
        const pxL = xL + panR * 0.88 * Math.cos(a);
        const pyL = panR * 0.88 * Math.sin(a);
        cordD += HL.seg(P(xL, 0, zL), P(pxL, pyL, trayLZ + trayH));

        const pxR = xR + panR * 0.88 * Math.cos(a);
        const pyR = panR * 0.88 * Math.sin(a);
        cordD += HL.seg(P(xR, 0, zR), P(pxR, pyR, trayRZ + trayH));
      });
      cords.setAttribute("d", cordD);

      // 4. Weights placement
      const wOffsets = [
        [-3.8, -2.4],
        [ 3.8, -2.4],
        [   0,  4.2]
      ];

      // Left pan weights
      wOffsets.forEach(([ox, oy], idx) => {
        renderCalibratedWeight(weights[idx], xL + ox, oy, trayLZ + trayH);
      });

      // Right pan weights
      wOffsets.forEach(([ox, oy], idx) => {
        renderCalibratedWeight(weights[3 + idx], xR + ox, oy, trayRZ + trayH);
      });

      // Readout
      const deg = (theta * 180) / Math.PI;
      if (Math.abs(deg) < 1.0) {
        read.textContent = "Cân thăng bằng: Hai bên bằng nhau (3 = 3)";
      } else if (deg < 0) {
        read.textContent = "Bên trái nặng hơn (Kim lệch phải)";
      } else {
        read.textContent = "Bên phải nặng hơn (Kim lệch trái)";
      }
    }

    function aim(pt) {
      if (!pt) {
        tiltSpring.t = 0;
        reg.wake();
        return;
      }
      const midScr = P(0, 0, fulcrumZ)[0];
      const norm = HL.clamp((pt[0] - midScr) / 100, -1, 1);
      tiltSpring.t = norm * HL.rad(10);
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(tiltSpring, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        tiltSpring.t = 0;
        reg.wake();
      }
    }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        tiltSpring.t = HL.clamp(v, -1, 1) * HL.rad(10);
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
