/*
 * 2. Math Balance Scale (Cân Thăng Bằng Số Học)
 * Pure Hairline 2:1 Axonometric Line Art
 * Smooth pointer tilt response with harmonic damping spring physics
 * Zero SVG text - clean visual line art
 */

export default {
  id: "math-balance",
  title: "2. Cân Thăng Bằng (Balance Scale)",
  concept: "So sánh lớn hơn, bé hơn, bằng nhau",
  means: "Cân thăng bằng: dầm cân nghiêng tự nhiên theo vị trí con trỏ; khi thả chuột, dầm cân dao động lò xo tắt dần rồi trở về vị trí cân bằng ngang 0°.",
  rules: [1, 3, 4, 6, 7],
  range: [-1, 0, 1],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-55, -20, 0], [55, 20, 58]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Base Pedestal (Z: 0 to 6)
    const [baseO, baseI] = HL.rings(-24, -18, 24, 18, 4, 2);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 6));

    // 2. Vertical Mast Post (Z: 6 to 40)
    const [mastO, mastI] = HL.rings(-4, -4, 4, 4, 4, 0.8);
    const mastSol = HL.solid(svg);
    HL.put(mastSol, HL.prism(P, front, mastO, mastI, 6, 40));

    // 3. Central Fulcrum Bracket & Axle Pin (Z: 39 to 42)
    const fulcrumSol = HL.solid(svg);
    const [fO, fI] = HL.rings(-5, -3, 5, 3, 2, 0.6);
    HL.put(fulcrumSol, HL.prism(P, front, fO, fI, 39, 42));

    // 4. Trays & Suspensions
    const leftTraySol = HL.solid(svg);
    const rightTraySol = HL.solid(svg);

    const leftRim = HL.mk("ellipse", { rx: HL.r2(11 * C.S), ry: HL.r2(11 * C.S * C.k), class: "lo nf" }, svg);
    const rightRim = HL.mk("ellipse", { rx: HL.r2(11 * C.S), ry: HL.r2(11 * C.S * C.k), class: "lo nf" }, svg);

    // 6 Weights total: 3 on left pan, 3 on right pan
    const weightSols = Array.from({ length: 6 }, () => HL.solid(svg));
    const weightKnobs = Array.from({ length: 6 }, () => HL.mk("circle", { r: 1.5, fill: "#232327" }, svg));

    // Dynamic Beam Solid & Cords
    const beamSol = HL.solid(svg);
    const cords = HL.mk("path", { class: "lo", "stroke-width": 1.1 }, svg);

    // Harmonic spring for beam tilt angle (in radians)
    const tiltSpring = HL.spring(0, { k: 110, c: 12 });

    const beamLen = 38;
    const fulcrumZ = 40.5;
    const cordLen = 22;

    function renderWeightPrism(sol, knobEl, wx, wy, wz) {
      const [wO, wI] = HL.rings(wx - 3.2, wy - 3.2, wx + 3.2, wy + 3.2, 3.2, 0.5);
      HL.put(sol, HL.prism(P, front, wO, wI, wz, wz + 4.5));
      const knobScr = P(wx, wy, wz + 5.5);
      knobEl.setAttribute("cx", HL.r2(knobScr[0]));
      knobEl.setAttribute("cy", HL.r2(knobScr[1]));
    }

    function draw() {
      const theta = tiltSpring.x;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      // Beam ends: (+X right, -X left)
      const xR = beamLen * cosT;
      const zR = fulcrumZ + beamLen * sinT;
      const xL = -beamLen * cosT;
      const zL = fulcrumZ - beamLen * sinT;

      // 1. Draw Beam
      const [bO, bI] = HL.rings(-beamLen, -1.8, beamLen, 1.8, 1.8, 0.5);
      const beamPtsUpper = bO.map(q => {
        const rotX = q.u * cosT - 0.9 * sinT;
        const rotZ = fulcrumZ + q.u * sinT + 0.9 * cosT;
        return P(rotX, q.v, rotZ);
      });
      const beamPtsLower = bO.map(q => {
        const rotX = q.u * cosT - (-0.9) * sinT;
        const rotZ = fulcrumZ + q.u * sinT + (-0.9) * cosT;
        return P(rotX, q.v, rotZ);
      });
      const beamHull = HL.hull([...beamPtsUpper, ...beamPtsLower]);
      HL.put(beamSol, { sil: HL.poly(beamHull), crease: HL.poly(beamPtsUpper) });

      // 2. Pans hang plumb down
      const panRadius = 11;
      const trayH = 1.6;

      // Left Pan: hangs from (xL, 0, zL)
      const trayLZ = zL - cordLen;
      const [lO, lI] = HL.rings(xL - panRadius, -panRadius, xL + panRadius, panRadius, panRadius, 0.8);
      HL.put(leftTraySol, HL.prism(P, front, lO, lI, trayLZ, trayLZ + trayH));
      const lRimScr = P(xL, 0, trayLZ + trayH + 0.1);
      leftRim.setAttribute("cx", HL.r2(lRimScr[0]));
      leftRim.setAttribute("cy", HL.r2(lRimScr[1]));

      // Right Pan: hangs from (xR, 0, zR)
      const trayRZ = zR - cordLen;
      const [rO, rI] = HL.rings(xR - panRadius, -panRadius, xR + panRadius, panRadius, panRadius, 0.8);
      HL.put(rightTraySol, HL.prism(P, front, rO, rI, trayRZ, trayRZ + trayH));
      const rRimScr = P(xR, 0, trayRZ + trayH + 0.1);
      rightRim.setAttribute("cx", HL.r2(rRimScr[0]));
      rightRim.setAttribute("cy", HL.r2(rRimScr[1]));

      // 3. Three suspension cords per tray
      let cordD = "";
      const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

      // Left cords
      angles.forEach(a => {
        const px = xL + panRadius * 0.88 * Math.cos(a);
        const py = panRadius * 0.88 * Math.sin(a);
        cordD += HL.seg(P(xL, 0, zL), P(px, py, trayLZ + trayH));
      });

      // Right cords
      angles.forEach(a => {
        const px = xR + panRadius * 0.88 * Math.cos(a);
        const py = panRadius * 0.88 * Math.sin(a);
        cordD += HL.seg(P(xR, 0, zR), P(px, py, trayRZ + trayH));
      });
      cords.setAttribute("d", cordD);

      // 4. Weights: 3 weights on left pan, 3 weights on right pan
      const wOffsets = [
        [-3.8, -2.4],
        [ 3.8, -2.4],
        [   0,  4.2]
      ];

      // Left pan weights
      wOffsets.forEach(([ox, oy], idx) => {
        renderWeightPrism(weightSols[idx], weightKnobs[idx], xL + ox, oy, trayLZ + trayH);
      });

      // Right pan weights
      wOffsets.forEach(([ox, oy], idx) => {
        renderWeightPrism(weightSols[3 + idx], weightKnobs[3 + idx], xR + ox, oy, trayRZ + trayH);
      });

      // Readout
      const deg = (theta * 180) / Math.PI;
      if (Math.abs(deg) < 1.2) {
        read.textContent = "Cân thăng bằng: Hai bên bằng nhau (3 = 3)";
      } else if (deg < 0) {
        read.textContent = "Bên trái nặng hơn: Nghiêng trái";
      } else {
        read.textContent = "Bên phải nặng hơn: Nghiêng phải";
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
      // Continuous smooth tilt response: pointer left -> tilt left (-), pointer right -> tilt right (+)
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
