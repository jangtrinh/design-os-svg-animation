/*
 * 6. Math Dice (Cặp Xúc Xắc Chấm Đố)
 * Crafted to Lucas Markes Hairline Standard:
 * - Rounded-corner chamfered casino dice cubes with inner face creases
 * - Sunken double-ring engraved spherical pips
 * - Stitched felt tabletop mat with rounded perimeter
 * - Pure 2:1 axonometric line art with Rule 09 radius & bevel discipline
 */

export default {
  id: "math-dice",
  title: "6. Cặp Xúc Xắc (Math Dice Pips)",
  concept: "Phép cộng & nhận biết mặt xúc xắc 3D",
  means: "Hai khối xúc xắc bo góc vát mép chuẩn xác trên thảm nỉ viền chỉ. Di chuyển con trỏ để nghiêng xoay 3D khám phá các mặt chấm tròn khắc lõm.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 3.5, 7],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-48, -22, 0], [48, 22, 40]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Felt Gaming Mat with Stitched Border
    const [matO, matI] = HL.rings(-45, -18, 45, 18, 4, 1.5);
    const matSol = HL.solid(svg);
    HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2.5));

    // Stitched perimeter line on mat face (z = 2.6)
    const [stitchO] = HL.rings(-42, -15, 42, 15, 3, 0.5);
    HL.mk("path", {
      class: "lo dash",
      d: HL.poly(HL.ringAt(P, stitchO, 2.6)),
      "stroke-dasharray": "2.5 2.0"
    }, svg);

    // 2. Dice Groups
    const d1Group = HL.mk("g", { id: "die-1" }, svg);
    const d2Group = HL.mk("g", { id: "die-2" }, svg);

    // Face solids with chamfer creases for Die 1 & Die 2
    function makeDieGraphics(g) {
      return {
        faceX: HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.3; stroke-linejoin: round;" }, g),
        faceY: HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.3; stroke-linejoin: round;" }, g),
        faceZ: HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.3; stroke-linejoin: round;" }, g),
        creaseX: HL.mk("path", { class: "cr", "stroke-width": 0.9 }, g),
        creaseY: HL.mk("path", { class: "cr", "stroke-width": 0.9 }, g),
        creaseZ: HL.mk("path", { class: "cr", "stroke-width": 0.9 }, g),
        pipRims: Array.from({ length: 16 }, () => HL.mk("path", { class: "lo", "stroke-width": 0.8 }, g)),
        pipDots: Array.from({ length: 16 }, () => HL.mk("path", { style: "fill: #232327; stroke: none;" }, g))
      };
    }

    const d1Gfx = makeDieGraphics(d1Group);
    const d2Gfx = makeDieGraphics(d2Group);

    // Springs for 3D tilt
    const wobbleX1 = HL.spring(0, { k: 140, c: 14 });
    const wobbleY1 = HL.spring(0, { k: 140, c: 14 });
    const lift1 = HL.spring(0, { k: 150, c: 14 });

    const wobbleX2 = HL.spring(0, { k: 140, c: 14 });
    const wobbleY2 = HL.spring(0, { k: 140, c: 14 });
    const lift2 = HL.spring(0, { k: 150, c: 14 });

    const d = 5.2;
    const rStandard = 1.45;
    const rCenter = 1.65;

    function buildPipsForFace(axis, val) {
      const pips = [];
      if (val === 1) pips.push({ axis, u: 0, v: 0, r: rCenter });
      else if (val === 2) {
        pips.push({ axis, u: -d, v: -d, r: rStandard }, { axis, u: d, v: d, r: rStandard });
      } else if (val === 3) {
        pips.push({ axis, u: -d, v: -d, r: rStandard }, { axis, u: 0, v: 0, r: rCenter }, { axis, u: d, v: d, r: rStandard });
      } else if (val === 4) {
        pips.push({ axis, u: -d, v: -d, r: rStandard }, { axis, u: d, v: -d, r: rStandard }, { axis, u: -d, v: d, r: rStandard }, { axis, u: d, v: d, r: rStandard });
      } else if (val === 5) {
        pips.push({ axis, u: -d, v: -d, r: rStandard }, { axis, u: d, v: -d, r: rStandard }, { axis, u: 0, v: 0, r: rCenter }, { axis, u: -d, v: d, r: rStandard }, { axis, u: d, v: d, r: rStandard });
      } else if (val === 6) {
        pips.push({ axis, u: -d, v: -d, r: rStandard }, { axis, u: d, v: -d, r: rStandard }, { axis, u: -d, v: 0, r: rStandard }, { axis, u: d, v: 0, r: rStandard }, { axis, u: -d, v: d, r: rStandard }, { axis, u: d, v: d, r: rStandard });
      }
      return pips;
    }

    function rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz) {
      const rx = HL.rad(rxDeg);
      const ry = HL.rad(ryDeg);
      const x1 = lx * Math.cos(ry) + lz * Math.sin(ry);
      const y1 = ly;
      const z1 = -lx * Math.sin(ry) + lz * Math.cos(ry);
      const x2 = x1;
      const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
      return [cx + x2, cy + y2, cz + z2];
    }

    function projectPip(cu, cv, r, normalAxis, rxDeg, ryDeg, cx, cy, cz) {
      const N = 12;
      const pts = [];
      for (let i = 0; i < N; i++) {
        const theta = (i / N) * Math.PI * 2;
        const u = cu + r * Math.cos(theta);
        const v = cv + r * Math.sin(theta);
        let lx, ly, lz;
        if (normalAxis === 'z') { lx = u; ly = v; lz = 10.05; }
        else if (normalAxis === 'y') { lx = u; ly = 10.05; lz = v; }
        else { lx = 10.05; ly = u; lz = v; }
        const wPt = rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, 0, cz);
        pts.push(P(...wPt));
      }
      return HL.poly(pts);
    }

    function projectFaceCrease(normalAxis, rxDeg, ryDeg, cx, cz) {
      // Inset rounded rectangular crease on face (s = 10, inset = 1.3, r = 1.8)
      const b = 8.7;
      const pts = [];
      const corners = [[-b, -b], [b, -b], [b, b], [-b, b]];
      corners.forEach(([u, v]) => {
        let lx, ly, lz;
        if (normalAxis === 'z') { lx = u; ly = v; lz = 10.02; }
        else if (normalAxis === 'y') { lx = u; ly = 10.02; lz = v; }
        else { lx = 10.02; ly = u; lz = v; }
        pts.push(P(...rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, 0, cz)));
      });
      return HL.poly(pts);
    }

    function drawDie(cx, baseZ, rxDeg, ryDeg, gfx, pipConfig) {
      const s = 10;
      const cz = baseZ + s;

      const c_100 = rotatePoint( s, -s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_110 = rotatePoint( s,  s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_010 = rotatePoint(-s,  s, -s, rxDeg, ryDeg, cx, 0, cz);
      const c_001 = rotatePoint(-s, -s,  s, rxDeg, ryDeg, cx, 0, cz);
      const c_101 = rotatePoint( s, -s,  s, rxDeg, ryDeg, cx, 0, cz);
      const c_011 = rotatePoint(-s,  s,  s, rxDeg, ryDeg, cx, 0, cz);
      const c_111 = rotatePoint( s,  s,  s, rxDeg, ryDeg, cx, 0, cz);

      // 1. Faces
      const ptsX = [P(...c_100), P(...c_110), P(...c_111), P(...c_101)];
      gfx.faceX.setAttribute("points", ptsX.map(p => p.map(HL.r2).join(",")).join(" "));

      const ptsY = [P(...c_010), P(...c_110), P(...c_111), P(...c_011)];
      gfx.faceY.setAttribute("points", ptsY.map(p => p.map(HL.r2).join(",")).join(" "));

      const ptsZ = [P(...c_001), P(...c_101), P(...c_111), P(...c_011)];
      gfx.faceZ.setAttribute("points", ptsZ.map(p => p.map(HL.r2).join(",")).join(" "));

      // 2. Inset Chamfer Creases on visible faces
      gfx.creaseX.setAttribute("d", projectFaceCrease('x', rxDeg, ryDeg, cx, cz));
      gfx.creaseY.setAttribute("d", projectFaceCrease('y', rxDeg, ryDeg, cx, cz));
      gfx.creaseZ.setAttribute("d", projectFaceCrease('z', rxDeg, ryDeg, cx, cz));

      // 3. Pips with outer sunken rim and inner dot
      for (let i = 0; i < gfx.pipDots.length; i++) {
        if (i < pipConfig.length) {
          const cfg = pipConfig[i];
          const rimPath = projectPip(cfg.u, cfg.v, cfg.r + 0.55, cfg.axis, rxDeg, ryDeg, cx, 0, cz);
          const dotPath = projectPip(cfg.u, cfg.v, cfg.r, cfg.axis, rxDeg, ryDeg, cx, 0, cz);

          gfx.pipRims[i].style.display = "";
          gfx.pipRims[i].setAttribute("d", rimPath);

          gfx.pipDots[i].style.display = "";
          gfx.pipDots[i].setAttribute("d", dotPath);
        } else {
          gfx.pipRims[i].style.display = "none";
          gfx.pipDots[i].style.display = "none";
        }
      }
    }

    function draw() {
      // Die 1: Top 3, Left 1, Right 2
      const cfg1 = [
        ...buildPipsForFace('x', 2),
        ...buildPipsForFace('y', 1),
        ...buildPipsForFace('z', 3)
      ];

      // Die 2: Top 4, Left 5, Right 6
      const cfg2 = [
        ...buildPipsForFace('x', 6),
        ...buildPipsForFace('y', 5),
        ...buildPipsForFace('z', 4)
      ];

      const baseZ1 = 2.5 + Math.max(0, lift1.x);
      const baseZ2 = 2.5 + Math.max(0, lift2.x);

      drawDie(-22, baseZ1, wobbleX1.x, wobbleY1.x, d1Gfx, cfg1);
      drawDie( 22, baseZ2, wobbleX2.x, wobbleY2.x, d2Gfx, cfg2);

      read.textContent = "Xúc xắc 3D: Mặt trên 3 + 4 = 7 (Tổng các chấm tròn đối diện = 7)";
    }

    function aim(pt) {
      if (!pt) {
        wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
        wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
        reg.wake();
        return;
      }
      const midX = 0;
      const midY = P(0, 0, 12)[1];

      const tiltX = HL.clamp((pt[1] - midY) * 0.28, -10, 10);
      const tiltY = HL.clamp(-(pt[0] - midX) * 0.28, -10, 10);

      wobbleX1.t = tiltX; wobbleY1.t = tiltY; lift1.t = 2.2;
      wobbleX2.t = tiltX; wobbleY2.t = tiltY; lift2.t = 2.2;
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(wobbleX1, dt) || HL.stepS(wobbleY1, dt) || HL.stepS(lift1, dt);
      const m2 = HL.stepS(wobbleX2, dt) || HL.stepS(wobbleY2, dt) || HL.stepS(lift2, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
        wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
        reg.wake();
      }
    }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        const t = (v - 3.5) / 3.5;
        wobbleY1.t = t * 10;
        wobbleY2.t = -t * 10;
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
